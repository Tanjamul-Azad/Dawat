begin;
create table public.payment_submissions (
 id uuid primary key default gen_random_uuid(),
 request_id uuid not null references public.sales_requests(id),
 user_id uuid not null references auth.users(id),
 method text not null check(method in ('bKash','Nagad','Bank')),
 reference text not null unique check(length(reference) between 3 and 80),
 sender text not null check(length(sender) between 5 and 80),
 amount_minor bigint not null check(amount_minor between 0 and 1000000000),
 state text not null default 'pending' check(state in ('pending','verified','rejected')),
 review_note text not null default '',
 created_at timestamptz not null default now(),
 reviewed_at timestamptz,
 reviewer_id uuid references auth.users(id)
);
create index payment_submissions_request on public.payment_submissions(request_id,created_at);
create index payment_submissions_user on public.payment_submissions(user_id);
create index payment_submissions_reviewer on public.payment_submissions(reviewer_id);
create unique index payment_submissions_one_pending on public.payment_submissions(request_id) where state='pending';
alter table public.payment_submissions enable row level security;
revoke all on public.payment_submissions from anon,authenticated;
grant select on public.payment_submissions to authenticated;
create policy payment_submission_read on public.payment_submissions for select to authenticated
 using (private.verified() and (user_id=(select auth.uid()) or private.is_staff()));

create function public.payment_submission_command(p_key uuid,p_body jsonb) returns jsonb
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
   perform public.seller_command(gen_random_uuid(),jsonb_build_object('kind','verify-payment','orderId',o.id,'expectedRevision',o.revision,
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
revoke all on function public.payment_submission_command(uuid,jsonb) from public,anon;
grant execute on function public.payment_submission_command(uuid,jsonb) to authenticated;
commit;
