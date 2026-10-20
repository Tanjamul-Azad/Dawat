-- Database proof only: synthetic object metadata, not actual image bytes. Everything rolls back.
-- Actual decoding and private object delivery are verified separately against the offline Storage API.
begin;
do $$
declare
  ua uuid:=gen_random_uuid(); ub uuid:=gen_random_uuid(); ox uuid:=gen_random_uuid(); oy uuid:=gen_random_uuid();
  wx uuid:=gen_random_uuid(); wy uuid:=gen_random_uuid(); a uuid; h uuid:=gen_random_uuid(); lease uuid:=gen_random_uuid(); slug uuid;
  payload jsonb; job jsonb; objects jsonb:='{}'; p jsonb; n integer; denied boolean; size text;
  content jsonb:='{"partnerOne":"পরীক্ষা","partnerTwo":"আয়োজন","hosts":"","message":"","theme":"jamdani","photos":[],"generalEventIds":["reception"],"events":[{"id":"reception","title":"সংবর্ধনা","date":"2026-12-12","time":"19:00","venue":"Synthetic Garden","address":""}]}';
begin
  insert into auth.users(id,email,email_confirmed_at) values(ua,ua||'@example.invalid',now()),(ub,ub||'@example.invalid',now());
  insert into public.orders(id,customer_email,customer_name,package_name,amount_minor,term_days,status,exception_reason)
    values(ox,ua||'@example.invalid','Synthetic media X','Rollback only',0,1,'confirmed','Synthetic rollback-only proof'),
    (oy,ub||'@example.invalid','Synthetic media Y','Rollback only',0,1,'confirmed','Synthetic rollback-only proof');
  insert into public.weddings(id,order_id,title) values(wx,ox,'Synthetic media X'),(wy,oy,'Synthetic media Y');
  insert into public.wedding_memberships(wedding_id,user_id) values(wx,ua),(wy,ub);
  insert into public.dashboard_grants(wedding_id,state) values(wx,'active'),(wy,'active');
  insert into public.entitlements(wedding_id,term_days,starts_at,expires_at) values(wx,1,now(),now()+interval '1 day'),(wy,1,now(),now()+interval '1 day');
  insert into public.invitation_drafts(wedding_id,content,revision) values(wx,content,0),(wy,content,0);
  perform set_config('request.jwt.claims',jsonb_build_object('sub',ua,'aal','aal1','role','authenticated')::text,true);
  execute 'set local role authenticated';
  payload:=public.reserve_media(wx,gen_random_uuid());a:=(payload->>'id')::uuid;
  for n in 1..4 loop perform public.reserve_media(wx,gen_random_uuid()); end loop;
  denied:=false;begin perform public.reserve_media(wx,gen_random_uuid());exception when sqlstate 'PT409' then denied:=true;end;
  if not denied then raise exception 'FAIL: sixth concurrent slot allowed';end if;
  denied:=false;begin perform public.process_media(wx,a,ua,lease,'begin','{}');exception when insufficient_privilege then denied:=true;end;
  if not denied then raise exception 'FAIL: browser can forge readiness';end if;
  denied:=false;begin insert into storage.objects(bucket_id,name) values('wedding-media','synthetic-unauthorized');exception when insufficient_privilege then denied:=true;end;
  if not denied then raise exception 'FAIL: direct browser Storage write allowed';end if;
  execute 'reset role';
  perform set_config('request.jwt.claims',jsonb_build_object('sub',ub,'aal','aal1','role','authenticated')::text,true);
  execute 'set local role authenticated';
  select count(*) into n from public.media_assets where wedding_id=wx;
  if n<>0 then raise exception 'FAIL: media leaked to foreign owner';end if;
  denied:=false;begin perform public.remove_media(wy,a);exception when sqlstate 'PT404' then denied:=true;end;
  if not denied then raise exception 'FAIL: foreign photo removal allowed';end if;
  execute 'reset role';
  perform set_config('request.jwt.claims',jsonb_build_object('role','service_role')::text,true);
  execute 'set local role service_role';
  job:=public.process_media(wx,a,ua,lease,'begin','{}');
  perform public.process_media(wx,a,ua,lease,'fingerprint',jsonb_build_object('hash',repeat('a',64)));
  execute 'reset role';
  foreach size in array array['480','960','1600'] loop
    insert into storage.objects(bucket_id,name,metadata) values('wedding-media',(job->>'prefix')||'/'||size||'.webp','{"size":100,"mimetype":"image/webp"}');
    objects:=objects||jsonb_build_object(size,jsonb_build_object('path',(job->>'prefix')||'/'||size||'.webp','bytes',100,'hash',repeat('a',64)));
  end loop;
  perform set_config('request.jwt.claims',jsonb_build_object('role','service_role')::text,true);
  execute 'set local role service_role';
  perform public.process_media(wx,a,ua,lease,'complete',jsonb_build_object('width',800,'height',600,'bytes',300,'objects',objects));
  execute 'reset role';
  p:=jsonb_build_object('id',a,'src','/media/'||a::text||'/960/','alt','পরীক্ষার ছবি','position','center');
  content:=jsonb_set(content,'{photos}',jsonb_build_array(p));
  perform set_config('request.jwt.claims',jsonb_build_object('sub',ua,'aal','aal1','role','authenticated')::text,true);
  execute 'set local role authenticated';
  perform public.save_draft(wx,0,content);perform public.publish_invitation(wx,1,gen_random_uuid());
  denied:=false;begin perform public.remove_media(wx,a);exception when sqlstate 'PT409' then denied:=true;end;
  if not denied then raise exception 'FAIL: removed an active draft photo';end if;
  perform public.save_draft(wx,1,jsonb_set(content,'{photos}','[]'));perform public.remove_media(wx,a);
  execute 'reset role';
  select w.slug into slug from public.weddings w where id=wx;
  insert into public.households(id,wedding_id,name) values(h,wx,'Synthetic media household');
  insert into public.household_events(wedding_id,household_id,event_id,max_people) values(wx,h,'reception',2);
  insert into private.guest_links(wedding_id,household_id,digest,ciphertext,key_id) values(wx,h,repeat('b',64),repeat('c',90),'synthetic');
  insert into private.guest_sessions(digest,wedding_id,household_id,link_revision,expires_at) values(repeat('d',64),wx,h,1,now()+interval '1 hour');
  perform set_config('request.jwt.claims','{}',true);execute 'set local role anon';
  payload:=public.resolve_media(a,'960',null,slug,null,null);
  if payload->>'path' is distinct from objects->'960'->>'path' then raise exception 'FAIL: published photo was lost after draft removal';end if;
  perform public.resolve_media(a,'960',null,slug,h,repeat('d',64));
  execute 'reset role';update private.guest_links set active=false where wedding_id=wx and household_id=h;
  perform set_config('request.jwt.claims','{}',true);execute 'set local role anon';
  denied:=false;begin perform public.resolve_media(a,'960',null,slug,h,repeat('d',64));exception when sqlstate 'PT404' then denied:=true;end;
  if not denied then raise exception 'FAIL: revoked guest can resolve photo';end if;
  execute 'reset role';
  if (select public from storage.buckets where id='wedding-media') then raise exception 'FAIL: bucket is public';end if;
end $$;
rollback;
select 'PASS: max five, tenant isolation, private Storage policy, trusted processing, immutable publication references and guest photo revocation. Synthetic rows rolled back.' as hosted_media_proof;
