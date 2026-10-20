-- Dedicated Dawat database. Run as migration owner, never from a browser.
begin;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table public.staff_roles (
  user_id uuid primary key references auth.users(id),
  active boolean not null default true,
  granted_at timestamptz not null default now()
);
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_email text not null check (customer_email = lower(trim(customer_email)) and length(customer_email) between 3 and 254),
  customer_name text not null check (length(trim(customer_name)) between 1 and 120),
  package_name text not null check (length(trim(package_name)) between 1 and 160),
  amount_minor bigint not null check (amount_minor between 0 and 1000000000),
  currency text not null default 'BDT' check (currency = 'BDT'),
  term_days integer not null check (term_days between 1 and 3650),
  status text not null default 'reviewing' check (status in ('reviewing','confirmed','cancelled')),
  payment_status text not null default 'pending' check (payment_status in ('pending','manually_verified')),
  exception_reason text check (length(exception_reason) between 10 and 1000),
  revision integer not null default 0,
  created_at timestamptz not null default now()
);
create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  method text not null check (length(trim(method)) between 1 and 80),
  reference text not null unique check (length(trim(reference)) between 3 and 160),
  amount_minor bigint not null check (amount_minor >= 0),
  actor_id uuid not null references auth.users(id),
  reason text not null check (length(trim(reason)) between 10 and 1000),
  created_at timestamptz not null default now()
);
create table public.weddings (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id),
  title text not null check (length(trim(title)) between 1 and 160),
  slug uuid not null unique default gen_random_uuid(),
  visibility text not null default 'unpublished' check (visibility in ('unpublished','live','paused')),
  live_version_id uuid,
  publication_revision integer not null default 0,
  created_at timestamptz not null default now()
);
create table public.wedding_memberships (
  wedding_id uuid primary key references public.weddings(id),
  user_id uuid not null references auth.users(id),
  active boolean not null default true,
  unique (wedding_id,user_id)
);
create index wedding_memberships_user on public.wedding_memberships(user_id);
create table public.dashboard_grants (
  wedding_id uuid primary key references public.weddings(id),
  state text not null default 'inactive' check (state in ('inactive','active','suspended','revoked')),
  revision integer not null default 0,
  changed_at timestamptz not null default now(),
  actor_id uuid references auth.users(id),
  reason text not null default ''
);
create table public.entitlements (
  wedding_id uuid primary key references public.weddings(id),
  term_days integer not null check (term_days between 1 and 3650),
  starts_at timestamptz,
  expires_at timestamptz,
  check ((starts_at is null and expires_at is null) or expires_at > starts_at)
);
create table public.invitation_drafts (
  wedding_id uuid primary key references public.weddings(id),
  content jsonb not null default '{}'::jsonb check (octet_length(content::text) <= 65536),
  revision integer not null default 0,
  updated_at timestamptz not null default now()
);
create table public.invitation_versions (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id),
  content jsonb not null,
  draft_revision integer not null,
  template_version text not null default 'jamdani-v6.4',
  created_at timestamptz not null default now(),
  unique (wedding_id,id),
  unique (wedding_id,draft_revision)
);
alter table public.weddings add constraint live_version_same_wedding
  foreign key (id,live_version_id) references public.invitation_versions(wedding_id,id);
create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid references public.weddings(id),
  order_id uuid references public.orders(id),
  actor_id uuid not null references auth.users(id),
  action text not null,
  reason text not null default '',
  created_at timestamptz not null default now()
);
create index audit_order on public.audit_events(order_id,created_at desc);
create table private.commands (
  actor_id uuid not null,
  key uuid not null,
  body jsonb not null,
  result jsonb not null,
  primary key (actor_id,key)
);
create table private.rate_limits (
  actor_id uuid primary key,
  window_at timestamptz not null,
  attempts integer not null
);

create function private.verified() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from auth.users where id = auth.uid() and email_confirmed_at is not null and deleted_at is null and (banned_until is null or banned_until < now()));
$$;
create function private.is_staff() returns boolean
language sql stable security definer set search_path = '' as $$
  select private.verified() and coalesce(auth.jwt()->>'aal','') = 'aal2'
    and exists(select 1 from public.staff_roles where user_id = auth.uid() and active);
$$;
create function private.is_member(wid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.verified() and exists(select 1 from public.wedding_memberships where wedding_id = wid and user_id = auth.uid() and active);
$$;
create function private.can_manage(wid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.is_member(wid) and exists (
    select 1 from public.weddings w join public.orders o on o.id = w.order_id
    join public.dashboard_grants g on g.wedding_id = w.id
    join public.entitlements e on e.wedding_id = w.id
    where w.id = wid and o.status = 'confirmed' and g.state = 'active'
    and (o.payment_status = 'manually_verified' or o.exception_reason is not null)
    and (e.expires_at is null or e.expires_at > now())
  );
$$;
create function private.throttle() returns void
language plpgsql security definer set search_path = '' as $$
declare n integer;
begin
  insert into private.rate_limits values (auth.uid(),clock_timestamp(),1)
  on conflict (actor_id) do update set
    attempts = case when private.rate_limits.window_at < clock_timestamp()-interval '1 minute' then 1 else private.rate_limits.attempts+1 end,
    window_at = case when private.rate_limits.window_at < clock_timestamp()-interval '1 minute' then clock_timestamp() else private.rate_limits.window_at end
  returning attempts into n;
  if n > 60 then raise sqlstate 'PT429' using message = 'Please wait before trying again.'; end if;
end;
$$;

-- Column allowlist + bounds also protect direct RPC callers bypassing Next/Zod.
create function private.validate_content(c jsonb, publishing boolean) returns void
language plpgsql set search_path = '' as $$
declare e jsonb; k text; v jsonb; n integer := 0; ids text[] := '{}';
begin
  if jsonb_typeof(c) <> 'object' or octet_length(c::text) > 65536 then
    raise sqlstate 'PT422' using message = 'Invalid invitation.';
  end if;
  if not c ?& array['partnerOne','partnerTwo','hosts','message','theme','events','photos'] then
    raise sqlstate 'PT422' using message = 'Missing invitation fields. Empty text is allowed in a draft.';
  end if;
  for k,v in select * from jsonb_each(c) loop
    if k not in ('partnerOne','partnerTwo','partnerOneBn','partnerTwoBn','hosts','hostsBn','message','messageEn','theme','events','photos','rsvpClosesAt','generalEventIds') then
      raise sqlstate 'PT422' using message = 'Unsupported invitation field.';
    end if;
    if k not in ('events','photos','generalEventIds') and (jsonb_typeof(v) <> 'string' or length(v#>>'{}') > case when k in ('message','messageEn') then 2000 when k in ('hosts','hostsBn') then 300 else 120 end) then
      raise sqlstate 'PT422' using message = 'Invalid invitation field.';
    end if;
  end loop;
  if c->>'theme' is distinct from 'jamdani' then raise sqlstate 'PT422' using message = 'Only Jamdani is supported.'; end if;
  if coalesce(c->'photos','[]') <> '[]'::jsonb then raise sqlstate 'PT422' using message = 'Production photo uploads are not enabled yet.'; end if;
  if jsonb_typeof(c->'events') is distinct from 'array' or jsonb_array_length(c->'events') not between 1 and 2 then
    raise sqlstate 'PT422' using message = 'Add one or two celebrations.';
  end if;
  for e in select * from jsonb_array_elements(c->'events') loop
    if jsonb_typeof(e) <> 'object' or coalesce(e->>'id','') not in ('nikah','reception') or e->>'id' = any(ids) then
      raise sqlstate 'PT422' using message = 'Invalid celebration identity.';
    end if;
    ids := array_append(ids,e->>'id');
    for k,v in select * from jsonb_each(e) loop
      if k not in ('id','title','titleBn','date','time','venue','venueBn','address','addressBn') or jsonb_typeof(v) <> 'string' or length(v#>>'{}') > (case when k in ('title','titleBn') then 160 when k in ('venue','venueBn') then 200 when k = 'date' then 10 when k = 'time' then 5 else 500 end) then
        raise sqlstate 'PT422' using message = 'Invalid celebration field.';
      end if;
    end loop;
    if not e ?& array['id','title','date','time','venue','address'] then
      raise sqlstate 'PT422' using message = 'Missing celebration fields.';
    end if;
    if publishing then
      if coalesce(trim(e->>'title'),'') = '' or coalesce(trim(e->>'venue'),'') = '' or coalesce(e->>'date','') !~ '^\d{4}-\d{2}-\d{2}$' or coalesce(e->>'time','') !~ '^([01]\d|2[0-3]):[0-5]\d$' then
        raise sqlstate 'PT422' using message = 'Complete the celebration title, date, time and venue.';
      end if;
      begin perform (e->>'date')::date; exception when others then raise sqlstate 'PT422' using message = 'Invalid celebration date.'; end;
      n := n+1;
    end if;
  end loop;
  if c ? 'rsvpClosesAt' then
    if (c->>'rsvpClosesAt') !~ '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$' then
      raise sqlstate 'PT422' using message = 'Invalid reply deadline.';
    end if;
    begin perform (c->>'rsvpClosesAt')::timestamptz; exception when others then raise sqlstate 'PT422' using message = 'Invalid reply deadline.'; end;
  end if;
  if c ? 'generalEventIds' and (jsonb_typeof(c->'generalEventIds') <> 'array' or jsonb_array_length(c->'generalEventIds') > 2) then
    raise sqlstate 'PT422' using message = 'Invalid general invitation scope.';
  end if;
  if exists(select 1 from jsonb_array_elements_text(coalesce(c->'generalEventIds','[]')) id where not id = any(ids)) then
    raise sqlstate 'PT422' using message = 'General invitation contains an unavailable celebration.';
  end if;
  if publishing and (n = 0 or coalesce(trim(c->>'partnerOne'),'') = '' or coalesce(trim(c->>'partnerTwo'),'') = '') then
    raise sqlstate 'PT422' using message = 'Complete both names and at least one celebration.';
  end if;
end;
$$;

create function public.resolve_general_invitation(p_slug uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare c jsonb; events jsonb;
begin
  select v.content into c from public.weddings w
    join public.invitation_versions v on v.wedding_id = w.id and v.id = w.live_version_id
    join public.entitlements e on e.wedding_id = w.id
    where w.slug = p_slug and w.visibility = 'live' and e.expires_at > now();
  if c is null then raise sqlstate 'PT404' using message = 'Invitation unavailable.'; end if;
  select jsonb_agg(value) into events from jsonb_array_elements(c->'events')
    where (c->'generalEventIds') ? (value->>'id');
  if events is null then raise sqlstate 'PT404' using message = 'Invitation unavailable.'; end if;
  return jsonb_set(c-'generalEventIds'-'rsvpClosesAt','{events}',events);
end;
$$;

create function public.seller_command(p_key uuid, p_body jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare o public.orders; w public.weddings; g public.dashboard_grants; previous private.commands;
  kind text := p_body->>'kind'; oid uuid; uid uuid; result jsonb; v_reason text := trim(coalesce(p_body->>'reason',''));
begin
  if not private.is_staff() then raise sqlstate 'PT403' using message = 'Verified seller MFA is required.'; end if;
  if p_key is null or octet_length(p_body::text)>16384 then raise sqlstate 'PT422' using message = 'Invalid command.'; end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text||p_key::text,0));
  select * into previous from private.commands where actor_id = auth.uid() and key = p_key;
  if found then
    if previous.body <> p_body then raise sqlstate 'PT409' using message = 'This retry key belongs to another action.'; end if;
    return previous.result;
  end if;
  perform private.throttle();
  if kind = 'create' then
    insert into public.orders(customer_email,customer_name,package_name,amount_minor,term_days)
    values(lower(trim(p_body->>'email')),trim(p_body->>'name'),trim(p_body->>'packageName'),(p_body->>'amountMinor')::bigint,(p_body->>'termDays')::integer) returning * into o;
  else
    oid := (p_body->>'orderId')::uuid;
    select * into o from public.orders where id = oid for update;
    if not found then raise sqlstate 'PT404' using message = 'Order unavailable.'; end if;
    if o.revision is distinct from (p_body->>'expectedRevision')::integer then raise sqlstate 'PT409' using message = 'Order changed. Refresh before trying again.'; end if;
    if length(v_reason) not between 10 and 1000 then raise sqlstate 'PT422' using message = 'Add a reason of at least 10 characters.'; end if;
    if o.status = 'cancelled' then raise sqlstate 'PT409' using message = 'Cancelled order.'; end if;
    if kind = 'verify-payment' then
      if o.payment_status <> 'pending' or (p_body->>'amountMinor')::bigint is distinct from o.amount_minor then raise sqlstate 'PT422' using message = 'Payment amount must match the order exactly.'; end if;
      insert into public.payment_events(order_id,method,reference,amount_minor,actor_id,reason)
      values(o.id,trim(p_body->>'method'),trim(p_body->>'reference'),o.amount_minor,auth.uid(),v_reason);
      update public.orders set payment_status = 'manually_verified',revision = revision+1 where id = o.id returning * into o;
    elsif kind = 'confirm' then
      if o.status <> 'reviewing' then raise sqlstate 'PT409' using message = 'Order already confirmed.'; end if;
      if o.payment_status <> 'manually_verified' and coalesce(p_body->>'exception','') <> 'approved' then raise sqlstate 'PT422' using message = 'Verify payment or explicitly approve an exception.'; end if;
      update public.orders set status = 'confirmed',exception_reason = case when payment_status = 'pending' then v_reason else null end,revision = revision+1 where id = o.id returning * into o;
      insert into public.weddings(order_id,title) values(o.id,o.customer_name||' · Wedding') returning * into w;
      insert into public.dashboard_grants(wedding_id) values(w.id);
      insert into public.entitlements(wedding_id,term_days) values(w.id,o.term_days);
      insert into public.invitation_drafts(wedding_id) values(w.id);
    elsif kind in ('activate','suspend','revoke') then
      select * into w from public.weddings where order_id = o.id for update;
      if not found or o.status <> 'confirmed' then raise sqlstate 'PT409' using message = 'Confirm this order first.'; end if;
      select * into g from public.dashboard_grants where wedding_id = w.id for update;
      if kind = 'activate' then
        select id into uid from auth.users where lower(email) = o.customer_email and email_confirmed_at is not null and deleted_at is null and (banned_until is null or banned_until < now());
        if uid is null then raise sqlstate 'PT422' using message = 'The intended customer must verify their email first.'; end if;
        if exists(select 1 from public.wedding_memberships where wedding_id = w.id and user_id <> uid) then raise sqlstate 'PT409' using message = 'Owner reassignment requires a separate reviewed process.'; end if;
        insert into public.wedding_memberships(wedding_id,user_id) values(w.id,uid) on conflict (wedding_id) do nothing;
      end if;
      update public.dashboard_grants set state = case kind when 'activate' then 'active' when 'suspend' then 'suspended' else 'revoked' end,revision = revision+1,changed_at = now(),actor_id = auth.uid(),reason = v_reason where wedding_id = w.id;
      update public.orders set revision = revision+1 where id = o.id returning * into o;
    else raise sqlstate 'PT422' using message = 'Unsupported action.';
    end if;
  end if;
  insert into public.audit_events(wedding_id,order_id,actor_id,action,reason) values(w.id,o.id,auth.uid(),kind,v_reason);
  result := jsonb_build_object('orderId',o.id,'revision',o.revision,'weddingId',w.id);
  insert into private.commands values(auth.uid(),p_key,p_body,result);
  return result;
end;
$$;

create function public.save_draft(p_wedding_id uuid,p_revision integer,p_content jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare d public.invitation_drafts;
begin
  -- Same lock order as seller revocation; access is rechecked after the lock.
  if not private.can_manage(p_wedding_id) then raise sqlstate 'PT404' using message = 'Workspace unavailable.'; end if;
  perform 1 from public.orders where id = (select order_id from public.weddings where id = p_wedding_id) for update;
  perform 1 from public.weddings where id = p_wedding_id for update;
  if not private.can_manage(p_wedding_id) then raise sqlstate 'PT404' using message = 'Workspace unavailable.'; end if;
  perform private.throttle();
  perform private.validate_content(p_content,false);
  update public.invitation_drafts set content = p_content,revision = revision+1,updated_at = now()
  where wedding_id = p_wedding_id and revision = p_revision returning * into d;
  if not found then raise sqlstate 'PT409' using message = 'This invitation changed in another tab. Your edits have been kept.'; end if;
  return jsonb_build_object('revision',d.revision,'updatedAt',d.updated_at);
end;
$$;

create function public.publish_invitation(p_wedding_id uuid,p_revision integer,p_key uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare d public.invitation_drafts; v uuid; result jsonb; b jsonb; previous private.commands;
begin
  if not private.verified() or p_key is null then raise sqlstate 'PT401' using message = 'Sign in again.'; end if;
  if not private.can_manage(p_wedding_id) then raise sqlstate 'PT404' using message = 'Workspace unavailable.'; end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text||p_key::text,0));
  perform 1 from public.orders where id = (select order_id from public.weddings where id = p_wedding_id) for update;
  perform 1 from public.weddings where id = p_wedding_id for update;
  if not private.can_manage(p_wedding_id) then raise sqlstate 'PT404' using message = 'Workspace unavailable.'; end if;
  b := jsonb_build_object('kind','publish','weddingId',p_wedding_id,'revision',p_revision);
  select * into previous from private.commands where actor_id = auth.uid() and key = p_key;
  if found then
    if previous.body <> b then raise sqlstate 'PT409' using message = 'Retry key conflict.'; end if;
    return previous.result;
  end if;
  perform private.throttle();
  select * into d from public.invitation_drafts where wedding_id = p_wedding_id;
  if d.revision is distinct from p_revision then raise sqlstate 'PT409' using message = 'Draft changed. Review the saved draft again.'; end if;
  perform private.validate_content(d.content,true);
  insert into public.invitation_versions(wedding_id,content,draft_revision) values(p_wedding_id,d.content,d.revision)
    on conflict (wedding_id,draft_revision) do nothing returning id into v;
  if v is null then select id into v from public.invitation_versions where wedding_id = p_wedding_id and draft_revision = d.revision; end if;
  update public.entitlements set starts_at = now(),expires_at = now()+make_interval(days => term_days) where wedding_id = p_wedding_id and starts_at is null;
  update public.weddings set live_version_id = v,visibility = 'live',publication_revision = publication_revision+1 where id = p_wedding_id;
  insert into public.audit_events(wedding_id,actor_id,action) values(p_wedding_id,auth.uid(),'publish');
  result := jsonb_build_object('versionId',v,'revision',p_revision);
  insert into private.commands values(auth.uid(),p_key,b,result);
  return result;
end;
$$;

-- Read-only RLS; all writes are narrow transaction functions above.
do $$ declare t text; begin
  foreach t in array array['staff_roles','orders','payment_events','weddings','wedding_memberships','dashboard_grants','entitlements','invitation_drafts','invitation_versions','audit_events'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from anon, authenticated',t);
    execute format('grant select on public.%I to authenticated',t);
  end loop;
end $$;
create policy staff_self on public.staff_roles for select to authenticated using (user_id = auth.uid() and private.verified());
create policy seller_orders on public.orders for select to authenticated using (private.is_staff());
create policy seller_payments on public.payment_events for select to authenticated using (private.is_staff());
create policy scoped_weddings on public.weddings for select to authenticated using (private.is_staff() or private.is_member(id));
create policy own_membership on public.wedding_memberships for select to authenticated using (private.is_staff() or (user_id = auth.uid() and private.verified()));
create policy own_grant on public.dashboard_grants for select to authenticated using (private.is_staff() or private.is_member(wedding_id));
create policy scoped_entitlement on public.entitlements for select to authenticated using (private.can_manage(wedding_id));
create policy scoped_draft on public.invitation_drafts for select to authenticated using (private.can_manage(wedding_id));
create policy scoped_version on public.invitation_versions for select to authenticated using (private.can_manage(wedding_id));
create policy seller_audit on public.audit_events for select to authenticated using (private.is_staff());
revoke all on all functions in schema private from public,anon,authenticated;
grant execute on function private.verified(),private.is_staff(),private.is_member(uuid),private.can_manage(uuid) to authenticated;
revoke all on function public.seller_command(uuid,jsonb),public.save_draft(uuid,integer,jsonb),public.publish_invitation(uuid,integer,uuid) from public,anon;
grant execute on function public.seller_command(uuid,jsonb),public.save_draft(uuid,integer,jsonb),public.publish_invitation(uuid,integer,uuid) to authenticated;
revoke all on function public.resolve_general_invitation(uuid) from public;
grant execute on function public.resolve_general_invitation(uuid) to anon,authenticated;
commit;
