-- Access onboarding: an optional customer WhatsApp number, an automatic price
-- and terms for the fixed-price packages, and one transaction for
-- verify + confirm + activate. Every existing check and audit event stays.
begin;

alter table public.sales_requests add column customer_phone text
 check(customer_phone is null or customer_phone ~ '^\+[1-9][0-9]{7,14}$');

-- The three seller steps already exist as one command. Keep that command as a
-- private step and put a thin public entry point in front of it, so a combined
-- action runs the very same steps (and writes the very same audit events) in
-- one transaction. Any failure rolls all of it back.
alter function public.seller_command(uuid,jsonb) set schema private;
alter function private.seller_command(uuid,jsonb) rename to seller_step;
revoke all on function private.seller_step(uuid,jsonb) from public,anon,authenticated;

create function public.seller_command(p_key uuid,p_body jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare previous private.commands; o public.orders; result jsonb; rev integer;
 v_reason text := trim(coalesce(p_body->>'reason',''));
begin
 if p_body->>'kind' is distinct from 'verify-confirm-activate' then
  return private.seller_step(p_key,p_body);
 end if;
 if not private.is_staff() then raise sqlstate 'PT403' using message = 'Verified seller MFA is required.'; end if;
 if p_key is null or octet_length(p_body::text)>16384 then raise sqlstate 'PT422' using message = 'Invalid command.'; end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text||p_key::text,0));
 select * into previous from private.commands where actor_id = auth.uid() and key = p_key;
 if found then
  if previous.body <> p_body then raise sqlstate 'PT409' using message = 'This retry key belongs to another action.'; end if;
  return previous.result;
 end if;
 perform private.throttle();
 select * into o from public.orders where id = (p_body->>'orderId')::uuid for update;
 if not found then raise sqlstate 'PT404' using message = 'Order unavailable.'; end if;
 if o.revision is distinct from (p_body->>'expectedRevision')::integer then raise sqlstate 'PT409' using message = 'Order changed. Refresh before trying again.'; end if;
 if length(v_reason) not between 10 and 1000 then raise sqlstate 'PT422' using message = 'Add a reason of at least 10 characters.'; end if;
 perform private.seller_step(gen_random_uuid(),jsonb_build_object('kind','verify-payment','orderId',o.id,'expectedRevision',o.revision,
  'reason',v_reason,'method',p_body->'method','reference',p_body->'reference','amountMinor',p_body->'amountMinor'));
 select revision into rev from public.orders where id = o.id;
 perform private.seller_step(gen_random_uuid(),jsonb_build_object('kind','confirm','orderId',o.id,'expectedRevision',rev,'reason',v_reason));
 select revision into rev from public.orders where id = o.id;
 result := private.seller_step(gen_random_uuid(),jsonb_build_object('kind','activate','orderId',o.id,'expectedRevision',rev,'reason',v_reason));
 insert into public.audit_events(wedding_id,order_id,actor_id,action,reason)
 values((result->>'weddingId')::uuid,o.id,auth.uid(),'verify-confirm-activate',v_reason);
 insert into private.commands values(auth.uid(),p_key,p_body,result);
 return result;
end;
$$;
revoke all on function public.seller_command(uuid,jsonb) from public,anon;
grant execute on function public.seller_command(uuid,jsonb) to authenticated;

-- Payment review can now activate in the same click. `activate` defaults to off.
create or replace function public.payment_submission_command(p_key uuid,p_body jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare r public.sales_requests; p public.payment_submissions; o public.orders; previous private.commands; result jsonb; kind text:=p_body->>'kind';
begin
 if not private.verified() then raise sqlstate 'PT401' using message='Verify your email first.'; end if;
 if p_key is null or p_body is null or jsonb_typeof(p_body)<>'object' or octet_length(p_body::text)>4000 then raise sqlstate 'PT422' using message='Invalid submission.'; end if;
 if kind<>'submit' and not private.is_staff() then raise sqlstate 'PT403' using message='Verified seller MFA is required.'; end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text||p_key::text,0));
 select * into previous from private.commands where actor_id=auth.uid() and key=p_key;
 if found then
  if previous.body<>p_body then raise sqlstate 'PT409' using message='This retry key belongs to another action.'; end if;
  return previous.result;
 end if;
 perform private.throttle();
 if kind='submit' then
  select * into r from public.sales_requests where id=(p_body->>'requestId')::uuid and user_id=auth.uid() for update;
  if not found then raise sqlstate 'PT404' using message='Order unavailable.'; end if;
  select * into o from public.orders where id=r.order_id for update;
  if r.state<>'ordered' or o.status<>'reviewing' or o.payment_status<>'pending' then raise sqlstate 'PT409' using message='This order is not awaiting payment.'; end if;
  if exists(select 1 from public.payment_submissions where request_id=r.id and state='pending') then raise sqlstate 'PT409' using message='Your previous payment is being reviewed.'; end if;
  if (select count(*) from public.payment_submissions where request_id=r.id and created_at>now()-interval '24 hours')>=3 then raise sqlstate 'PT429' using message='Contact support before submitting another transaction.'; end if;
  if coalesce(p_body->>'method','') not in ('bKash','Nagad','Bank') or coalesce(length(trim(p_body->>'reference')),0) not between 3 and 80 or coalesce(length(trim(p_body->>'sender')),0) not between 5 and 80 then
   raise sqlstate 'PT422' using message='Add the method, sender and transaction ID.'; end if;
  insert into public.payment_submissions(request_id,user_id,method,reference,sender,amount_minor)
   values(r.id,auth.uid(),p_body->>'method',upper(trim(p_body->>'reference')),trim(p_body->>'sender'),o.amount_minor) returning * into p;
 elsif kind in ('verify','reject') then
  select * into p from public.payment_submissions where id=(p_body->>'id')::uuid for update;
  if not found then raise sqlstate 'PT404' using message='Submission unavailable.'; end if;
  if p.state<>'pending' then raise sqlstate 'PT409' using message='This submission was already reviewed.'; end if;
  if coalesce(length(trim(p_body->>'reason')),0) not between 10 and 1000 then raise sqlstate 'PT422' using message='Record the evidence reviewed (at least 10 characters).'; end if;
  select * into r from public.sales_requests where id=p.request_id;
  if kind='verify' then
   select * into o from public.orders where id=r.order_id for update;
   perform public.seller_command(gen_random_uuid(),jsonb_build_object(
    'kind',case when p_body->'activate'='true'::jsonb then 'verify-confirm-activate' else 'verify-payment' end,
    'orderId',o.id,'expectedRevision',o.revision,
    'amountMinor',p.amount_minor,'method',p.method,'reference',p.reference,'reason',trim(p_body->>'reason')));
  end if;
  update public.payment_submissions set state=case when kind='verify' then 'verified' else 'rejected' end,review_note=trim(p_body->>'reason'),reviewed_at=now(),reviewer_id=auth.uid() where id=p.id returning * into p;
 else raise sqlstate 'PT422' using message='Unsupported payment action.';
 end if;
 insert into public.audit_events(actor_id,order_id,action,reason) values(auth.uid(),r.order_id,'payment_submission.'||kind,'Submission '||p.id::text);
 result:=to_jsonb(p);
 insert into private.commands values(auth.uid(),p_key,p_body,result);
 return result;
end $$;

-- Requests for the fixed-price packages are quoted at once, from the published
-- price and the standard terms. The price comes from here, never from the
-- caller; only the term (capped at one year) and the display name are taken
-- from the request. A custom request waits for a manual quote as before.
create or replace function public.sales_command(p_key uuid,p_body jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare r public.sales_requests; previous private.commands; result jsonb; v_order jsonb; v_order_id uuid;
 kind text := p_body->>'kind'; staff boolean; email text; v_phone text; v_term integer; v_package text; v_notes text;
 premium boolean;
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
  v_phone := nullif(trim(coalesce(p_body->>'phone','')),'');
  if v_phone is not null and v_phone !~ '^\+[1-9][0-9]{7,14}$' then
   raise sqlstate 'PT422' using message='Enter a valid WhatsApp number, or leave it empty.'; end if;
  if p_body->>'templateId'='custom' then
   insert into public.sales_requests(user_id,customer_email,customer_name,event_date,brief,template_id,customer_phone)
   values(auth.uid(),email,trim(p_body->>'name'),nullif(p_body->>'eventDate','')::date,trim(p_body->>'brief'),p_body->>'templateId',v_phone) returning * into r;
  else
   premium := p_body->>'templateId' in ('garden','midnight','rose');
   v_term := coalesce((p_body->>'termDays')::integer,90);
   if v_term not between 1 and 365 then raise sqlstate 'PT422' using message='Invalid hosting term.'; end if;
   v_package := nullif(trim(coalesce(p_body->>'packageName','')),'');
   if v_package is null or length(v_package)>160 then v_package := case when premium then 'প্রিমিয়াম' else 'ক্লাসিক' end; end if;
   v_notes := format(
    E'এই দামে আপনার বেছে নেওয়া নকশায় আমন্ত্রণ তৈরি করে অতিথিদের কাছে পাঠাতে পারবেন।\n'
    'মেয়াদ: প্রথমবার অতিথিদের জন্য চালু করার দিন থেকে %1$s দিন। আবার প্রকাশ করলে মেয়াদ বাড়ে না।\n'
    'পেমেন্ট: পরের ধাপের নির্দেশনা মেনে bKash-এ টাকা পাঠিয়ে Transaction ID দিন। আমরা আসল লেনদেন মিলিয়ে আপনার আয়োজনের পাতা চালু করব।\n'
    'বাতিল ও টাকা ফেরত: পেমেন্টের আগে অনুরোধ নিজে বাতিল করতে পারবেন। পেমেন্টের পরে বাতিল বা টাকা ফেরতের জন্য অর্ডার নম্বরসহ আমাদের জানান। স্বয়ংক্রিয় টাকা ফেরত নেই।\n\n'
    'With this price you can create your invitation in the design you chose and send it to your guests.\n'
    'Term: %1$s days from the day you first publish. Publishing again does not extend it.\n'
    'Payment: follow the next step, send the amount by bKash and enter the Transaction ID. We check the actual transfer, then open your wedding page.\n'
    'Cancellation and refunds: you can cancel the request yourself before paying. After payment, contact us with your order number. Refunds are not automatic.',
    v_term);
   insert into public.sales_requests(user_id,customer_email,customer_name,event_date,brief,template_id,customer_phone,
    state,package_name,amount_minor,term_days,quote_notes)
   values(auth.uid(),email,trim(p_body->>'name'),nullif(p_body->>'eventDate','')::date,trim(p_body->>'brief'),p_body->>'templateId',v_phone,
    'quoted',v_package,case when premium then 75000 else 50000 end,v_term,v_notes) returning * into r;
   insert into public.audit_events(actor_id,order_id,action,reason) values(auth.uid(),null,'sales.auto-quote','Request '||r.id::text);
  end if;
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
   insert into public.orders(customer_email,customer_name,package_name,amount_minor,term_days,template_id)
   values(r.customer_email,r.customer_name,r.package_name,r.amount_minor,r.term_days,
    case when r.template_id='custom' then 'jamdani' else r.template_id end) returning id into v_order_id;
   insert into public.audit_events(actor_id,order_id,action,reason) values(auth.uid(),v_order_id,'create','Opened from accepted quote '||r.id::text);
   update public.sales_requests set state='ordered',order_id=v_order_id where id=r.id;
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

commit;
