begin;
alter table public.weddings add column rsvp_policy_revision integer not null default 0;
create table public.event_keys (
  wedding_id uuid not null references public.weddings(id),
  event_id text not null check (event_id in ('nikah','reception')),
  primary key(wedding_id,event_id)
);
create table public.rsvp_policies (
  wedding_id uuid not null,
  event_id text not null,
  is_open boolean not null default true,
  deadline timestamptz,
  primary key(wedding_id,event_id),
  foreign key(wedding_id,event_id) references public.event_keys(wedding_id,event_id)
);
create function private.initialize_events() returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.event_keys values(new.id,'nikah'),(new.id,'reception');
  insert into public.rsvp_policies(wedding_id,event_id) values(new.id,'nikah'),(new.id,'reception');
  return new;
end $$;
insert into public.event_keys select id,e from public.weddings cross join unnest(array['nikah','reception']) e;
insert into public.rsvp_policies(wedding_id,event_id) select wedding_id,event_id from public.event_keys;
create trigger initialize_events after insert on public.weddings for each row execute function private.initialize_events();

create table public.households (
  id uuid primary key,
  wedding_id uuid not null references public.weddings(id),
  name text not null check(length(trim(name)) between 1 and 120 and name !~ '[[:cntrl:]]'),
  name_bn text not null default '' check(length(name_bn)<=120),
  greeting text not null default '' check(length(greeting)<=300),
  greeting_en text not null default '' check(length(greeting_en)<=300),
  message text not null default '' check(length(message)<=500),
  message_en text not null default '' check(length(message_en)<=500),
  private_note text not null default '' check(length(private_note)<=1000),
  overlay_revision integer not null default 1,
  response_revision integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(wedding_id,id)
);
create index households_wedding_cursor on public.households(wedding_id,id);
create table public.household_events (
  wedding_id uuid not null,
  household_id uuid not null,
  event_id text not null,
  max_people integer not null check(max_people between 1 and 50),
  primary key(wedding_id,household_id,event_id),
  foreign key(wedding_id,household_id) references public.households(wedding_id,id),
  foreign key(wedding_id,event_id) references public.event_keys(wedding_id,event_id)
);
create table private.guest_links (
  wedding_id uuid not null,
  household_id uuid not null,
  digest text not null unique check(digest ~ '^[a-f0-9]{64}$'),
  ciphertext text not null check(length(ciphertext) between 50 and 1024),
  key_id text not null check(key_id ~ '^[a-zA-Z0-9_-]{1,40}$'),
  revision integer not null default 1,
  active boolean not null default true,
  primary key(wedding_id,household_id),
  foreign key(wedding_id,household_id) references public.households(wedding_id,id)
);
create table private.guest_sessions (
  digest text primary key check(digest ~ '^[a-f0-9]{64}$'),
  wedding_id uuid not null,
  household_id uuid not null,
  link_revision integer not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  foreign key(wedding_id,household_id) references private.guest_links(wedding_id,household_id)
);
create index guest_session_household on private.guest_sessions(wedding_id,household_id,expires_at);
create table public.responses (
  wedding_id uuid not null,
  household_id uuid not null,
  event_id text not null,
  attendance text not null check(attendance in ('accepted','declined')),
  adults integer not null check(adults between 0 and 50),
  children integer not null check(children between 0 and 50),
  note text not null check(length(note)<=1000),
  revision integer not null,
  updated_at timestamptz not null default now(),
  primary key(wedding_id,household_id,event_id),
  foreign key(wedding_id,household_id,event_id) references public.household_events(wedding_id,household_id,event_id),
  check((attendance='declined' and adults=0 and children=0) or (attendance='accepted' and adults+children between 1 and 50))
);
create index responses_report on public.responses(wedding_id,event_id,attendance);
create table public.response_changes (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null,
  household_id uuid not null,
  event_id text not null,
  previous jsonb,
  current_value jsonb not null,
  created_at timestamptz not null default now(),
  foreign key(wedding_id,household_id) references public.households(wedding_id,id)
);
create table public.wishes (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null,
  household_id uuid not null,
  body text not null check(length(trim(body)) between 1 and 1000),
  created_at timestamptz not null default now(),
  foreign key(wedding_id,household_id) references public.households(wedding_id,id)
);
create index wishes_cursor on public.wishes(wedding_id,created_at desc,id);
create table private.guest_commands (
  wedding_id uuid not null,
  household_id uuid not null,
  key uuid not null,
  body jsonb not null,
  result jsonb not null,
  created_at timestamptz not null default now(),
  primary key(wedding_id,household_id,key)
);
create table private.guest_limits (
  scope text primary key,
  window_at timestamptz not null,
  attempts integer not null
);
create function private.guest_throttle(p_scope text,p_limit integer) returns void language plpgsql security definer set search_path='' as $$
declare n integer;
begin
  insert into private.guest_limits values(p_scope,clock_timestamp(),1) on conflict(scope) do update set
    attempts=case when private.guest_limits.window_at<clock_timestamp()-interval '1 hour' then 1 else private.guest_limits.attempts+1 end,
    window_at=case when private.guest_limits.window_at<clock_timestamp()-interval '1 hour' then clock_timestamp() else private.guest_limits.window_at end returning attempts into n;
  if n>p_limit then raise sqlstate 'PT429' using message='Too many attempts. Please try again later.'; end if;
end $$;
create function private.lock_management(wid uuid) returns void language plpgsql security definer set search_path='' as $$
begin
  if not private.can_manage(wid) then raise sqlstate 'PT404' using message='Workspace unavailable.'; end if;
  perform 1 from public.orders where id=(select order_id from public.weddings where id=wid) for update;
  perform 1 from public.weddings where id=wid for update;
  if not private.can_manage(wid) then raise sqlstate 'PT404' using message='Workspace unavailable.'; end if;
  perform private.throttle();
end $$;
create function private.publication_guard() returns trigger language plpgsql security definer set search_path='' as $$
declare c jsonb;
begin
  if new.live_version_id is distinct from old.live_version_id then
    select content into c from public.invitation_versions where wedding_id=new.id and id=new.live_version_id;
    if exists(select 1 from public.responses r where r.wedding_id=new.id and not exists(select 1 from jsonb_array_elements(c->'events') e where e->>'id'=r.event_id)) then
      raise sqlstate 'PT409' using message='An event with replies cannot be removed. Contact support to reconcile it first.';
    end if;
  end if;
  if new.live_version_id is distinct from old.live_version_id or new.visibility is distinct from old.visibility then
    new.rsvp_policy_revision:=old.rsvp_policy_revision+1;
  end if;
  return new;
end $$;
create trigger publication_guest_guard before update on public.weddings for each row execute function private.publication_guard();

create function public.save_household(p_wedding_id uuid,p_household_id uuid,p_revision integer,p_key uuid,p_body jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare h public.households; prev private.commands; scope_entry jsonb; c jsonb; result jsonb; b jsonb; k text; v jsonb;
begin
  perform private.lock_management(p_wedding_id);
  if p_key is null or p_household_id is null or jsonb_typeof(p_body) is distinct from 'object' or octet_length(p_body::text)>10000 then raise sqlstate 'PT422' using message='Invalid household.'; end if;
  b:=jsonb_build_object('kind','household','wedding',p_wedding_id,'household',p_household_id,'revision',p_revision,'input',p_body);
  select * into prev from private.commands where actor_id=auth.uid() and key=p_key;
  if found then
    if prev.body<>b then raise sqlstate 'PT409' using message='This retry key belongs to another action.'; end if;
    return prev.result;
  end if;
  if not p_body ?& array['name','nameBn','greeting','greetingEn','message','messageEn','privateNote','events'] then raise sqlstate 'PT422' using message='Missing household fields.'; end if;
  for k,v in select * from jsonb_each(p_body) loop
    if k not in ('name','nameBn','greeting','greetingEn','message','messageEn','privateNote','events') then raise sqlstate 'PT422' using message='Unsupported household field.'; end if;
    if k<>'events' and (jsonb_typeof(v)<>'string' or length(v#>>'{}')>(case when k in ('name','nameBn') then 120 when k in ('greeting','greetingEn') then 300 when k='privateNote' then 1000 else 500 end)) then raise sqlstate 'PT422' using message='Invalid household text.'; end if;
  end loop;
  if length(regexp_replace(p_body->>'name','[[:space:]'||chr(8203)||chr(65279)||chr(8204)||chr(8205)||']','','g'))=0 then raise sqlstate 'PT422' using message='Enter a guest or family name.'; end if;
  if jsonb_typeof(p_body->'events') is distinct from 'array' or jsonb_array_length(p_body->'events') not between 1 and 2 then raise sqlstate 'PT422' using message='Select at least one published event.'; end if;
  if (select count(distinct value->>'eventId') from jsonb_array_elements(p_body->'events'))<>jsonb_array_length(p_body->'events') then raise sqlstate 'PT422' using message='Duplicate event scope.'; end if;
  select v.content into c from public.weddings w join public.invitation_versions v on v.id=w.live_version_id and v.wedding_id=w.id where w.id=p_wedding_id;
  for scope_entry in select * from jsonb_array_elements(p_body->'events') loop
    if jsonb_typeof(scope_entry)<>'object' or not scope_entry ?& array['eventId','maxPeople'] or (select count(*) from jsonb_object_keys(scope_entry))<>2 or
      jsonb_typeof(scope_entry->'maxPeople') is distinct from 'number' or (scope_entry->>'maxPeople')!~ '^([1-9]|[1-4][0-9]|50)$' or
      not exists(select 1 from jsonb_array_elements(c->'events') ce where ce->>'id'=scope_entry->>'eventId') then raise sqlstate 'PT422' using message='Choose a published event and allowance from 1 to 50 people.'; end if;
  end loop;
  select * into h from public.households where wedding_id=p_wedding_id and id=p_household_id for update;
  if found then
    if h.overlay_revision is distinct from p_revision then raise sqlstate 'PT409' using message='This household changed. Refresh before saving.'; end if;
    if exists(select 1 from public.responses r where r.wedding_id=p_wedding_id and r.household_id=h.id and not exists(select 1 from jsonb_array_elements(p_body->'events') e where e->>'eventId'=r.event_id and (e->>'maxPeople')::integer>=r.adults+r.children)) then raise sqlstate 'PT409' using message='A saved reply would lose its scope or exceed the allowance. Reconcile the reply before changing this invitation.'; end if;
    update public.households set name=trim(p_body->>'name'),name_bn=p_body->>'nameBn',greeting=p_body->>'greeting',greeting_en=p_body->>'greetingEn',message=p_body->>'message',message_en=p_body->>'messageEn',private_note=p_body->>'privateNote',overlay_revision=overlay_revision+1,updated_at=now() where wedding_id=p_wedding_id and id=p_household_id returning * into h;
    delete from public.household_events he where he.wedding_id=p_wedding_id and he.household_id=h.id and not exists(select 1 from jsonb_array_elements(p_body->'events') e where e->>'eventId'=he.event_id);
  else
    if p_revision is distinct from 0 then raise sqlstate 'PT404' using message='Household unavailable.'; end if;
    insert into public.households(id,wedding_id,name,name_bn,greeting,greeting_en,message,message_en,private_note) values(p_household_id,p_wedding_id,trim(p_body->>'name'),p_body->>'nameBn',p_body->>'greeting',p_body->>'greetingEn',p_body->>'message',p_body->>'messageEn',p_body->>'privateNote') returning * into h;
  end if;
  insert into public.household_events(wedding_id,household_id,event_id,max_people) select p_wedding_id,h.id,value->>'eventId',(value->>'maxPeople')::integer from jsonb_array_elements(p_body->'events') on conflict(wedding_id,household_id,event_id) do update set max_people=excluded.max_people;
  insert into public.audit_events(wedding_id,actor_id,action) values(p_wedding_id,auth.uid(),'household.save');
  result:=jsonb_build_object('id',h.id,'revision',h.overlay_revision);
  insert into private.commands values(auth.uid(),p_key,b,result);
  return result;
end $$;

create function public.household_link(p_wedding_id uuid,p_household_id uuid,p_kind text,p_revision integer,p_key uuid,p_digest text,p_ciphertext text,p_key_id text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare l private.guest_links; prev private.commands; b jsonb; result jsonb;
begin
  perform private.lock_management(p_wedding_id);
  perform 1 from public.households where wedding_id=p_wedding_id and id=p_household_id for update;
  if not found then raise sqlstate 'PT404' using message='Household unavailable.'; end if;
  if p_kind not in ('copy','rotate','revoke') or p_kind is null or p_key is null then raise sqlstate 'PT422' using message='Invalid link action.'; end if;
  select * into l from private.guest_links where wedding_id=p_wedding_id and household_id=p_household_id for update;
  if p_kind<>'revoke' and not exists(select 1 from public.weddings w join public.invitation_versions v on v.wedding_id=w.id and v.id=w.live_version_id join public.household_events he on he.wedding_id=w.id and he.household_id=p_household_id where w.id=p_wedding_id and w.visibility='live' and exists(select 1 from jsonb_array_elements(v.content->'events') e where e->>'id'=he.event_id)) then raise sqlstate 'PT409' using message='Publish an invitation with at least one event for this household before sharing.'; end if;
  b:=jsonb_build_object('kind',p_kind,'wedding',p_wedding_id,'household',p_household_id,'revision',p_revision);
  select * into prev from private.commands where actor_id=auth.uid() and key=p_key;
  if found then
    if prev.body<>b or l.revision is distinct from (prev.result->>'revision')::integer then raise sqlstate 'PT409' using message='The link changed since this action. Refresh before copying.'; end if;
  else
    if p_kind='copy' then
      if l.household_id is not null and not l.active then raise sqlstate 'PT409' using message='This link is revoked. Explicitly replace it to share again.'; end if;
      if l.household_id is null then
        insert into private.guest_links(wedding_id,household_id,digest,ciphertext,key_id) values(p_wedding_id,p_household_id,p_digest,p_ciphertext,p_key_id) returning * into l;
      end if;
    else
      if l.household_id is null then raise sqlstate 'PT409' using message='Create the personal link first.'; end if;
      if l.revision is distinct from p_revision then raise sqlstate 'PT409' using message='The link changed. Refresh before continuing.'; end if;
      if p_kind='rotate' then
        update private.guest_links set digest=p_digest,ciphertext=p_ciphertext,key_id=p_key_id,revision=revision+1,active=true where wedding_id=p_wedding_id and household_id=p_household_id returning * into l;
      else
        update private.guest_links set revision=revision+1,active=false where wedding_id=p_wedding_id and household_id=p_household_id returning * into l;
      end if;
    end if;
    insert into public.audit_events(wedding_id,actor_id,action) values(p_wedding_id,auth.uid(),'link.'||p_kind);
    insert into private.commands values(auth.uid(),p_key,b,jsonb_build_object('revision',l.revision));
  end if;
  return jsonb_build_object('revision',l.revision,'active',l.active,'ciphertext',case when l.active then l.ciphertext else null end,'keyId',case when l.active then l.key_id else null end);
end $$;

create function public.set_rsvp_policy(p_wedding_id uuid,p_event_id text,p_revision integer,p_open boolean,p_deadline timestamptz default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare rev integer;
begin
  perform private.lock_management(p_wedding_id);
  select rsvp_policy_revision into rev from public.weddings where id=p_wedding_id;
  if rev is distinct from p_revision then raise sqlstate 'PT409' using message='Reply settings changed. Refresh before saving.'; end if;
  if p_open is null or (p_deadline is not null and not isfinite(p_deadline)) then raise sqlstate 'PT422' using message='Invalid reply settings.'; end if;
  update public.rsvp_policies set is_open=p_open,deadline=p_deadline where wedding_id=p_wedding_id and event_id=p_event_id;
  if not found then raise sqlstate 'PT422' using message='Event unavailable.'; end if;
  update public.weddings set rsvp_policy_revision=rsvp_policy_revision+1 where id=p_wedding_id returning rsvp_policy_revision into rev;
  insert into public.audit_events(wedding_id,actor_id,action) values(p_wedding_id,auth.uid(),'rsvp.policy');
  return jsonb_build_object('revision',rev);
end $$;

create function private.guest_scope(p_slug uuid,p_household_id uuid,p_session_digest text) returns public.households
language plpgsql stable security definer set search_path='' as $$
declare h public.households;
begin
  select hh.* into h from public.households hh
    join public.weddings w on w.id=hh.wedding_id
    join public.entitlements e on e.wedding_id=w.id
    join private.guest_links l on l.wedding_id=hh.wedding_id and l.household_id=hh.id
    join private.guest_sessions s on s.wedding_id=hh.wedding_id and s.household_id=hh.id and s.link_revision=l.revision
    where hh.id=p_household_id and w.slug=p_slug and s.digest=p_session_digest and s.expires_at>clock_timestamp() and l.active and w.visibility='live' and e.expires_at>clock_timestamp();
  if h.id is null then raise sqlstate 'PT404' using message='This personal invitation is unavailable. Please ask the hosts for their current link.'; end if;
  if not exists(select 1 from public.weddings w join public.invitation_versions v on v.wedding_id=w.id and v.id=w.live_version_id join public.household_events he on he.wedding_id=w.id and he.household_id=h.id where w.id=h.wedding_id and exists(select 1 from jsonb_array_elements(v.content->'events') e where e->>'id'=he.event_id)) then raise sqlstate 'PT404' using message='This invitation is being updated. Please contact the hosts.'; end if;
  return h;
end $$;
create function public.exchange_guest_link(p_slug uuid,p_link_digest text,p_session_digest text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare l private.guest_links; wid uuid;
begin
  select w.id into wid from public.weddings w join public.entitlements e on e.wedding_id=w.id where w.slug=p_slug and w.visibility='live' and e.expires_at>now();
  if wid is null then raise sqlstate 'PT404' using message='Invitation unavailable.'; end if;
  perform 1 from public.weddings where id=wid for update;
  select * into l from private.guest_links where wedding_id=wid and digest=p_link_digest and active for update;
  if not found then raise sqlstate 'PT404' using message='Invitation unavailable.'; end if;
  perform private.guest_throttle('exchange:'||l.household_id,100);
  insert into private.guest_sessions(digest,wedding_id,household_id,link_revision,expires_at) values(p_session_digest,wid,l.household_id,l.revision,now()+interval '12 hours');
  perform private.guest_scope(p_slug,l.household_id,p_session_digest);
  return jsonb_build_object('householdId',l.household_id,'expiresIn',43200);
end $$;
create function private.household_payload(p_wedding_id uuid,p_household_id uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare h public.households; c jsonb; es jsonb; answers jsonb; policies jsonb; scopes jsonb; rev integer;
begin
  select * into h from public.households where wedding_id=p_wedding_id and id=p_household_id;
  if h.id is null then raise sqlstate 'PT404' using message='Invitation unavailable.'; end if;
  select v.content,w.rsvp_policy_revision into c,rev from public.weddings w join public.invitation_versions v on v.wedding_id=w.id and v.id=w.live_version_id where w.id=h.wedding_id;
  select jsonb_agg(value) into es from jsonb_array_elements(c->'events') where exists(select 1 from public.household_events he where he.wedding_id=h.wedding_id and he.household_id=h.id and he.event_id=value->>'id');
  select coalesce(jsonb_object_agg(event_id,jsonb_build_object('attendance',attendance,'adults',adults,'children',children,'note',note,'updatedAt',updated_at)),'{}') into answers from public.responses where wedding_id=h.wedding_id and household_id=h.id;
  select jsonb_agg(jsonb_build_object('eventId',he.event_id,'maxPeople',he.max_people)) into scopes from public.household_events he where he.wedding_id=h.wedding_id and he.household_id=h.id and exists(select 1 from jsonb_array_elements(es) e where e->>'id'=he.event_id);
  select jsonb_agg(jsonb_build_object('eventId',p.event_id,'isOpen',p.is_open,'deadline',p.deadline)) into policies from public.rsvp_policies p where p.wedding_id=h.wedding_id and exists(select 1 from jsonb_array_elements(es) e where e->>'id'=p.event_id);
  -- All operational/private fields are constructed explicitly; never serialize a household row.
  return jsonb_build_object('content',jsonb_set(c-'generalEventIds','{events}',es),'guest',jsonb_build_object('id',h.id,'name',h.name,'nameBn',h.name_bn,'greeting',h.greeting,'greetingEn',h.greeting_en,'message',h.message,'messageEn',h.message_en,'responses',answers),'scopes',scopes,'policies',policies,'householdRevision',h.overlay_revision,'responseRevision',h.response_revision,'policyRevision',rev);
end $$;

create function public.guest_invitation(p_slug uuid,p_household_id uuid,p_session_digest text) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare h public.households;
begin
  h:=private.guest_scope(p_slug,p_household_id,p_session_digest);
  return private.household_payload(h.wedding_id,h.id);
end $$;
create function public.household_preview(p_wedding_id uuid,p_household_id uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
  if not private.can_manage(p_wedding_id) then raise sqlstate 'PT404' using message='Workspace unavailable.'; end if;
  return private.household_payload(p_wedding_id,p_household_id);
end $$;

create function public.household_report(p_wedding_id uuid,p_event_id text,p_after uuid default null,p_search text default '',p_status text default 'all') returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare result jsonb; rows jsonb; total jsonb; next_id uuid; rev integer; policies jsonb;
begin
  if not private.can_manage(p_wedding_id) then raise sqlstate 'PT404' using message='Workspace unavailable.'; end if;
  if length(p_search)>120 or p_status not in ('all','accepted','declined','pending') or p_event_id not in ('nikah','reception') then raise sqlstate 'PT422' using message='Invalid report filter.'; end if;
  if exists(select 1 from public.weddings w join public.invitation_versions v on v.wedding_id=w.id and v.id=w.live_version_id where w.id=p_wedding_id and not exists(select 1 from jsonb_array_elements(v.content->'events') e where e->>'id'=p_event_id)) then raise sqlstate 'PT422' using message='This celebration is no longer published.'; end if;
  select rsvp_policy_revision into rev from public.weddings where id=p_wedding_id;
  select jsonb_agg(jsonb_build_object('eventId',event_id,'isOpen',is_open,'deadline',deadline)) into policies from public.rsvp_policies where wedding_id=p_wedding_id;
  select jsonb_build_object('invited',count(*),'accepted',count(*) filter(where r.attendance='accepted'),'declined',count(*) filter(where r.attendance='declined'),'pending',count(*) filter(where r.household_id is null),'adults',coalesce(sum(r.adults) filter(where r.attendance='accepted'),0),'children',coalesce(sum(r.children) filter(where r.attendance='accepted'),0)) into total from public.household_events he left join public.responses r using(wedding_id,household_id,event_id) where he.wedding_id=p_wedding_id and he.event_id=p_event_id;
  with candidates as (
    select h.id,h.wedding_id,h.name,h.name_bn,h.greeting,h.greeting_en,h.message,h.message_en,h.private_note,h.overlay_revision,h.response_revision
    from public.households h join public.household_events he on he.wedding_id=h.wedding_id and he.household_id=h.id and he.event_id=p_event_id
    left join public.responses r on r.wedding_id=h.wedding_id and r.household_id=h.id and r.event_id=p_event_id
    where h.wedding_id=p_wedding_id and (p_after is null or h.id>p_after) and position(lower(p_search) in lower(h.name||' '||h.name_bn))>0 and (p_status='all' or coalesce(r.attendance,'pending')=p_status)
    order by h.id limit 26
  ), page as (select * from candidates order by id limit 25)
  select coalesce(jsonb_agg(jsonb_build_object('id',h.id,'name',h.name,'nameBn',h.name_bn,'greeting',h.greeting,'greetingEn',h.greeting_en,'message',h.message,'messageEn',h.message_en,'privateNote',h.private_note,'revision',h.overlay_revision,'responseRevision',h.response_revision,
    'linkRevision',coalesce(l.revision,0),'linkState',case when l.household_id is null then 'missing' when l.active then 'active' else 'revoked' end,
    'events',(select jsonb_agg(jsonb_build_object('eventId',he.event_id,'maxPeople',he.max_people)) from public.household_events he where he.wedding_id=h.wedding_id and he.household_id=h.id),
    'responses',coalesce((select jsonb_object_agg(r.event_id,jsonb_build_object('attendance',r.attendance,'adults',r.adults,'children',r.children,'note',r.note,'updatedAt',r.updated_at)) from public.responses r where r.wedding_id=h.wedding_id and r.household_id=h.id),'{}')
  ) order by h.id),'[]'),case when (select count(*) from candidates)>25 then (select id from page order by id desc limit 1) else null end into rows,next_id from page h left join private.guest_links l on l.wedding_id=h.wedding_id and l.household_id=h.id;
  result:=jsonb_build_object('rows',rows,'summary',total,'nextCursor',next_id,'asOf',now(),'policyRevision',rev,'policies',coalesce(policies,'[]'));
  return result;
end $$;

create function public.guest_command(p_slug uuid,p_household_id uuid,p_session_digest text,p_key uuid,p_body jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare h public.households; w public.weddings; prev private.guest_commands; kind text; a jsonb; p public.rsvp_policies; limit_people integer; old public.responses; c jsonb; result jsonb;
begin
  h:=private.guest_scope(p_slug,p_household_id,p_session_digest);
  perform 1 from public.weddings where id=h.wedding_id for update;
  h:=private.guest_scope(p_slug,p_household_id,p_session_digest);
  select * into h from public.households where wedding_id=h.wedding_id and id=p_household_id for update;
  select * into w from public.weddings where id=h.wedding_id;
  if p_key is null or jsonb_typeof(p_body) is distinct from 'object' or octet_length(p_body::text)>10000 then raise sqlstate 'PT422' using message='Invalid reply.'; end if;
  kind:=p_body->>'kind';
  select * into prev from private.guest_commands where wedding_id=h.wedding_id and household_id=h.id and key=p_key;
  if found then
    if prev.body<>p_body then raise sqlstate 'PT409' using message='This retry key belongs to another reply.'; end if;
    return prev.result;
  end if;
  perform private.guest_throttle('write:'||h.id,120);
  if kind='response' then
    if not p_body ?& array['kind','expectedPolicyRevision','expectedHouseholdRevision','expectedResponseRevision','answers'] or (select count(*) from jsonb_object_keys(p_body))<>5 then raise sqlstate 'PT422' using message='Invalid response fields.'; end if;
    if w.rsvp_policy_revision is distinct from (p_body->>'expectedPolicyRevision')::integer or h.overlay_revision is distinct from (p_body->>'expectedHouseholdRevision')::integer or h.response_revision is distinct from (p_body->>'expectedResponseRevision')::integer then raise sqlstate 'PT409' using message='The invitation or reply changed. Refresh and review before submitting again.'; end if;
    if jsonb_typeof(p_body->'answers') is distinct from 'array' or jsonb_array_length(p_body->'answers') not between 1 and 2 or (select count(distinct value->>'eventId') from jsonb_array_elements(p_body->'answers'))<>jsonb_array_length(p_body->'answers') then raise sqlstate 'PT422' using message='Choose distinct invited events.'; end if;
    select content into c from public.invitation_versions where wedding_id=h.wedding_id and id=w.live_version_id;
    for a in select * from jsonb_array_elements(p_body->'answers') loop
      if jsonb_typeof(a) is distinct from 'object' or not a ?& array['eventId','attendance','adults','children','note'] or (select count(*) from jsonb_object_keys(a))<>5 or a->>'attendance' not in ('accepted','declined') or jsonb_typeof(a->'attendance') is distinct from 'string' or
        jsonb_typeof(a->'adults') is distinct from 'number' or jsonb_typeof(a->'children') is distinct from 'number' or (a->>'adults')!~ '^(0|[1-9][0-9]?)$' or (a->>'children')!~ '^(0|[1-9][0-9]?)$' or jsonb_typeof(a->'note') is distinct from 'string' or length(a->>'note')>1000 then raise sqlstate 'PT422' using message='Use whole, non-negative counts and a plain-text note.'; end if;
      select max_people into limit_people from public.household_events where wedding_id=h.wedding_id and household_id=h.id and event_id=a->>'eventId';
      if limit_people is null or not exists(select 1 from jsonb_array_elements(c->'events') e where e->>'id'=a->>'eventId') then raise sqlstate 'PT422' using message='This event is not included in your invitation.'; end if;
      select * into p from public.rsvp_policies where wedding_id=h.wedding_id and event_id=a->>'eventId';
      if not p.is_open or (p.deadline is not null and clock_timestamp()>=p.deadline) or (c ? 'rsvpClosesAt' and clock_timestamp()>=(c->>'rsvpClosesAt')::timestamptz) then raise sqlstate 'PT409' using message='Replies for this event are closed. Please contact the hosts.'; end if;
      if (a->>'attendance'='declined' and ((a->>'adults')::integer<>0 or (a->>'children')::integer<>0)) or (a->>'attendance'='accepted' and (a->>'adults')::integer+(a->>'children')::integer not between 1 and limit_people) then raise sqlstate 'PT422' using message='Acceptance must include at least one person within your total allowance. Decline requires zero people.'; end if;
      select * into old from public.responses where wedding_id=h.wedding_id and household_id=h.id and event_id=a->>'eventId';
      insert into public.response_changes(wedding_id,household_id,event_id,previous,current_value) values(h.wedding_id,h.id,a->>'eventId',case when old.household_id is null then null else to_jsonb(old)-'wedding_id'-'household_id' end,a);
      insert into public.responses(wedding_id,household_id,event_id,attendance,adults,children,note,revision) values(h.wedding_id,h.id,a->>'eventId',a->>'attendance',(a->>'adults')::integer,(a->>'children')::integer,a->>'note',h.response_revision+1)
      on conflict(wedding_id,household_id,event_id) do update set attendance=excluded.attendance,adults=excluded.adults,children=excluded.children,note=excluded.note,revision=excluded.revision,updated_at=now();
    end loop;
    update public.households set response_revision=response_revision+1 where wedding_id=h.wedding_id and id=h.id returning * into h;
    result:=jsonb_build_object('responseRevision',h.response_revision,'confirmedAt',now());
  elsif kind='wish' then
    if (select count(*) from jsonb_object_keys(p_body))<>2 or jsonb_typeof(p_body->'body') is distinct from 'string' or length(trim(p_body->>'body')) not between 1 and 1000 or length(regexp_replace(p_body->>'body','[[:space:][:cntrl:]'||chr(8203)||chr(65279)||chr(8204)||chr(8205)||']','','g'))=0 then raise sqlstate 'PT422' using message='Write a wish of 1 to 1000 characters.'; end if;
    insert into public.wishes(wedding_id,household_id,body) values(h.wedding_id,h.id,trim(p_body->>'body')) returning jsonb_build_object('id',id,'confirmedAt',created_at) into result;
  else raise sqlstate 'PT422' using message='Unsupported guest action.';
  end if;
  insert into private.guest_commands(wedding_id,household_id,key,body,result) values(h.wedding_id,h.id,p_key,p_body,result);
  return result;
end $$;

do $$ declare t text; begin
  foreach t in array array['event_keys','rsvp_policies','households','household_events','responses','response_changes','wishes'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from anon,authenticated',t);
    execute format('grant select on public.%I to authenticated',t);
    execute format('create policy customer_scope on public.%I for select to authenticated using(private.can_manage(wedding_id))',t);
  end loop;
end $$;
revoke all on all tables in schema private from public,anon,authenticated;
revoke all on function private.initialize_events(),private.guest_throttle(text,integer),private.lock_management(uuid),private.publication_guard(),private.guest_scope(uuid,uuid,text),private.household_payload(uuid,uuid) from public,anon,authenticated;
revoke all on function public.save_household(uuid,uuid,integer,uuid,jsonb),public.household_link(uuid,uuid,text,integer,uuid,text,text,text),public.set_rsvp_policy(uuid,text,integer,boolean,timestamptz) from public,anon;
grant execute on function public.save_household(uuid,uuid,integer,uuid,jsonb),public.household_link(uuid,uuid,text,integer,uuid,text,text,text),public.set_rsvp_policy(uuid,text,integer,boolean,timestamptz) to authenticated;
revoke all on function public.household_preview(uuid,uuid),public.household_report(uuid,text,uuid,text,text) from public,anon;
grant execute on function public.household_preview(uuid,uuid),public.household_report(uuid,text,uuid,text,text) to authenticated;
revoke all on function public.exchange_guest_link(uuid,text,text),public.guest_invitation(uuid,uuid,text),public.guest_command(uuid,uuid,text,uuid,jsonb) from public;
grant execute on function public.exchange_guest_link(uuid,text,text),public.guest_invitation(uuid,uuid,text),public.guest_command(uuid,uuid,text,uuid,jsonb) to anon,authenticated;
commit;
