-- Synthetic normal-role publication/scope proof; no retained fixture or real invitation changes.
begin;
do $$
declare
  u uuid:=gen_random_uuid(); o uuid:=gen_random_uuid(); w uuid:=gen_random_uuid(); h uuid:=gen_random_uuid();
  denied boolean:=false; c jsonb; reduced jsonb; household jsonb;
begin
  c:='{"partnerOne":"পরীক্ষা","partnerTwo":"আয়োজন","hosts":"","message":"","theme":"jamdani","photos":[],"generalEventIds":["nikah"],"events":[{"id":"nikah","title":"আকদ","date":"2026-12-11","time":"16:30","venue":"ঢাকা","address":""},{"id":"reception","title":"সংবর্ধনা","date":"2026-12-12","time":"19:00","venue":"ঢাকা","address":""}]}';
  household:='{"name":"কাল্পনিক পরিবার","nameBn":"","greeting":"","greetingEn":"","message":"","messageEn":"","privateNote":"","events":[{"eventId":"reception","maxPeople":3}]}';
  insert into auth.users(id,email,email_confirmed_at) values(u,u||'@example.invalid',now());
  insert into public.orders(id,customer_email,customer_name,package_name,amount_minor,term_days,status,exception_reason)
    values(o,u||'@example.invalid','Synthetic scope proof','Rollback only',0,1,'confirmed','Synthetic rollback-only proof');
  insert into public.weddings(id,order_id,title) values(w,o,'Synthetic scope proof');
  insert into public.wedding_memberships(wedding_id,user_id) values(w,u);
  insert into public.dashboard_grants(wedding_id,state) values(w,'active');
  insert into public.entitlements(wedding_id,term_days) values(w,1);
  insert into public.invitation_drafts(wedding_id,content,revision) values(w,c,0);
  perform set_config('request.jwt.claims',jsonb_build_object('sub',u,'aal','aal1','role','authenticated')::text,true);
  execute 'set local role authenticated';
  perform public.publish_invitation(w,0,gen_random_uuid());
  perform public.save_household(w,h,0,gen_random_uuid(),household);
  reduced:=jsonb_set(c,'{events}',jsonb_build_array(c->'events'->0));
  perform public.save_draft(w,0,reduced);
  begin perform public.publish_invitation(w,1,gen_random_uuid());
    exception when sqlstate 'PT409' then denied:=sqlerrm like '%invited households%'; end;
  if not denied then raise exception 'FAIL: pending household scope became unreachable'; end if;
  household:=jsonb_set(household,'{events}','[{"eventId":"nikah","maxPeople":3}]');
  perform public.save_household(w,h,1,gen_random_uuid(),household);
  perform public.publish_invitation(w,1,gen_random_uuid());
  if has_function_privilege('authenticated','private.publication_household_guard()','execute') then
    raise exception 'FAIL: private trigger directly executable'; end if;
  execute 'reset role';
end $$;
rollback;
select 'PASS: pending households block event removal until scope reconciliation; normal-role publication succeeds afterward. All fixtures rolled back.' as hosted_event_scope_proof;
