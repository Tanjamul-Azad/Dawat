begin;
create table public.sales_requests (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id),
 customer_email text not null,
 customer_name text not null check(length(trim(customer_name)) between 1 and 120),
 template_id text not null default 'jamdani' check(template_id in ('jamdani','ivory','holud','garden','midnight','rose','custom')),
 event_date date,
 brief text not null check(length(trim(brief)) between 10 and 2000),
 state text not null default 'requested' check(state in ('requested','quoted','accepted','ordered','cancelled')),
 package_name text,
 amount_minor bigint check(amount_minor between 0 and 1000000000),
 term_days integer check(term_days between 1 and 3650),
 quote_notes text check(length(quote_notes) between 10 and 3000),
 order_id uuid unique references public.orders(id),
 revision integer not null default 0,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check(state not in ('quoted','accepted','ordered') or (package_name is not null and amount_minor is not null and term_days is not null and quote_notes is not null)),
 check((state = 'ordered') = (order_id is not null))
);
create index sales_requests_user on public.sales_requests(user_id,created_at desc);
create index sales_requests_queue on public.sales_requests(created_at desc,id desc);
alter table public.sales_requests enable row level security;
revoke all on public.sales_requests from anon,authenticated;
grant select on public.sales_requests to authenticated;
create policy sales_read on public.sales_requests for select to authenticated using
 (private.verified() and (user_id = (select auth.uid()) or private.is_staff()));

-- Narrow RPCs follow the existing command model: verified actor, row locks,
-- revision check and a receipt in one transaction. No direct client writes.
create function public.sales_command(p_key uuid,p_body jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare r public.sales_requests; previous private.commands; result jsonb; v_order jsonb;
 kind text := p_body->>'kind'; staff boolean; email text;
begin
 if not private.verified() then raise sqlstate 'PT401' using message='Verify your email first.'; end if;
 if p_key is null or p_body is null or jsonb_typeof(p_body) <> 'object' or octet_length(p_body::text)>12000 then
  raise sqlstate 'PT422' using message='Invalid request.'; end if;
 staff := private.is_staff();
 if kind in ('quote','convert') and not staff then raise sqlstate 'PT403' using message='Verified seller MFA is required.'; end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text||p_key::text,0));
 select * into previous from private.commands where actor_id=auth.uid() and key=p_key;
 if found then
  if previous.body <> p_body then raise sqlstate 'PT409' using message='This retry key belongs to another action.'; end if;
  return previous.result;
 end if;
 perform private.throttle();
 if kind='request' then
  perform pg_advisory_xact_lock(hashtextextended('sales:'||auth.uid()::text,0));
  if (select count(*) from public.sales_requests where user_id=auth.uid() and created_at>now()-interval '24 hours')>=3 then
   raise sqlstate 'PT429' using message='You can send up to three requests per day. Contact support for an existing request.'; end if;
  if coalesce(length(trim(p_body->>'name')),0) not between 1 and 120 or coalesce(length(trim(p_body->>'brief')),0) not between 10 and 2000 then
   raise sqlstate 'PT422' using message='Add your name and a short description (10–2000 characters).'; end if;
  select lower(u.email) into email from auth.users u where u.id=auth.uid();
  if coalesce(p_body->>'templateId','') not in ('jamdani','ivory','holud','garden','midnight','rose','custom') then raise sqlstate 'PT422' using message='Choose a design.'; end if;
  insert into public.sales_requests(user_id,customer_email,customer_name,event_date,brief,template_id)
  values(auth.uid(),email,trim(p_body->>'name'),nullif(p_body->>'eventDate','')::date,trim(p_body->>'brief'),p_body->>'templateId') returning * into r;
 else
  select * into r from public.sales_requests where id=(p_body->>'id')::uuid for update;
  if not found or (r.user_id<>auth.uid() and not staff) then raise sqlstate 'PT404' using message='Request unavailable.'; end if;
  if r.revision is distinct from (p_body->>'expectedRevision')::integer then raise sqlstate 'PT409' using message='Request changed. Refresh and review before continuing.'; end if;
  if kind='quote' then
   if r.state not in ('requested','quoted') then raise sqlstate 'PT409' using message='Only an unaccepted request can be quoted.'; end if;
   if coalesce(length(trim(p_body->>'packageName')),0) not between 1 and 160 or coalesce(length(trim(p_body->>'notes')),0) not between 10 and 3000 or
    coalesce((p_body->>'amountMinor')::bigint,-1) not between 0 and 1000000000 or coalesce((p_body->>'termDays')::integer,0) not between 1 and 3650 then
    raise sqlstate 'PT422' using message='Complete the package, amount, hosting days and terms.'; end if;
   if (p_body->>'amountMinor')::bigint <> (case when r.template_id='custom' then 150000 when r.template_id in ('garden','midnight','rose') then 75000 else 50000 end) then
    raise sqlstate 'PT422' using message='The quote must match the published package price.'; end if;
   update public.sales_requests set state='quoted',package_name=trim(p_body->>'packageName'),amount_minor=(p_body->>'amountMinor')::bigint,
    term_days=(p_body->>'termDays')::integer,quote_notes=trim(p_body->>'notes') where id=r.id;
  elsif kind='accept' then
   if r.user_id<>auth.uid() then raise sqlstate 'PT403' using message='Only the customer can accept their quote.'; end if;
   if r.state<>'quoted' then raise sqlstate 'PT409' using message='There is no quote to accept.'; end if;
   update public.sales_requests set state='accepted' where id=r.id;
  elsif kind='cancel' then
   if r.user_id<>auth.uid() or r.state not in ('requested','quoted') then raise sqlstate 'PT409' using message='Contact support to cancel an accepted order.'; end if;
   update public.sales_requests set state='cancelled' where id=r.id;
  elsif kind='convert' then
   if r.state<>'accepted' then raise sqlstate 'PT409' using message='The customer must accept this quote first.'; end if;
   v_order := public.seller_command(gen_random_uuid(),jsonb_build_object('kind','create','name',r.customer_name,'email',r.customer_email,
    'packageName',r.package_name,'amountMinor',r.amount_minor,'termDays',r.term_days));
   update public.orders set template_id=case when r.template_id='custom' then 'jamdani' else r.template_id end where id=(v_order->>'orderId')::uuid;
   update public.sales_requests set state='ordered',order_id=(v_order->>'orderId')::uuid where id=r.id;
  else raise sqlstate 'PT422' using message='Unsupported request action.';
  end if;
  update public.sales_requests set revision=revision+1,updated_at=now() where id=r.id returning * into r;
 end if;
 insert into public.audit_events(actor_id,order_id,action,reason) values(auth.uid(),r.order_id,'sales.'||kind,'Request '||r.id::text||'; revision '||r.revision::text);
 result := to_jsonb(r);
 insert into private.commands values(auth.uid(),p_key,p_body,result);
 return result;
end;
$$;
revoke all on function public.sales_command(uuid,jsonb) from public,anon;
grant execute on function public.sales_command(uuid,jsonb) to authenticated;

-- Expose only the requesting customer's order progress, never payment evidence
-- or another customer's order. Staff still uses the existing seller endpoints.
create function public.my_sales_progress() returns jsonb
language sql stable security definer set search_path = '' as $$
 select coalesce(jsonb_agg(jsonb_build_object('requestId',r.id,'status',o.status,'paymentStatus',o.payment_status,
  'access',g.state,'weddingId',case when m.user_id=auth.uid() and m.active then w.id else null end)),'[]'::jsonb)
 from public.sales_requests r join public.orders o on o.id=r.order_id
 left join public.weddings w on w.order_id=o.id left join public.dashboard_grants g on g.wedding_id=w.id
 left join public.wedding_memberships m on m.wedding_id=w.id
 where r.user_id=auth.uid() and private.verified();
$$;
revoke all on function public.my_sales_progress() from public,anon;
grant execute on function public.my_sales_progress() to authenticated;
alter table public.orders add column template_id text not null default 'jamdani'
 check(template_id in ('jamdani','ivory','holud','garden','midnight','rose'));
alter table public.weddings add column template_id text not null default 'jamdani'
 check(template_id in ('jamdani','ivory','holud','garden','midnight','rose'));
create function private.copy_order_design() returns trigger language plpgsql security definer set search_path='' as $$
begin select template_id into new.template_id from public.orders where id=new.order_id; return new; end $$;
revoke all on function private.copy_order_design() from public,anon,authenticated;
create trigger copy_order_design before insert on public.weddings for each row execute function private.copy_order_design();
alter function private.validate_content(jsonb,boolean) rename to validate_content_before_catalog;
create function private.validate_content(c jsonb,publishing boolean) returns void language plpgsql set search_path='' as $$
begin
 if c ? 'templateId' and (jsonb_typeof(c->'templateId')<>'string' or c->>'templateId' not in ('jamdani','ivory','holud','garden','midnight','rose')) then
  raise sqlstate 'PT422' using message='Unsupported design.'; end if;
 perform private.validate_content_before_catalog(c-'templateId',publishing);
end $$;
revoke all on function private.validate_content(jsonb,boolean),private.validate_content_before_catalog(jsonb,boolean) from public,anon,authenticated;
create function private.protect_order_design() returns trigger language plpgsql security definer set search_path='' as $$
declare design text;
begin
 select o.template_id into design from public.orders o join public.weddings w on w.order_id=o.id where w.id=new.wedding_id;
 if coalesce(new.content->>'templateId',design)<>design then raise sqlstate 'PT422' using message='Use the design selected in your order.'; end if;
 if new.content<>'{}'::jsonb then new.content:=jsonb_set(new.content,'{templateId}',to_jsonb(design)); end if;
 return new;
end $$;
revoke all on function private.protect_order_design() from public,anon,authenticated;
create trigger preserve_order_design before insert or update on public.invitation_drafts for each row execute function private.protect_order_design();
commit;
