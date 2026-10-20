-- Synthetic normal-role proof. All rows and temporary role changes roll back.
begin;
do $$
declare
  ua uuid:=gen_random_uuid(); ub uuid:=gen_random_uuid();
  ox uuid:=gen_random_uuid(); oy uuid:=gen_random_uuid();
  wx uuid:=gen_random_uuid(); wy uuid:=gen_random_uuid();
  hx uuid:=gen_random_uuid(); hy uuid:=gen_random_uuid();
  vx uuid:=gen_random_uuid(); vy uuid:=gen_random_uuid();
  sx uuid; sy uuid; payload jsonb; result jsonb; n integer; denied boolean;
  content jsonb:='{"partnerOne":"Synthetic","partnerTwo":"Couple","hosts":"","message":"","theme":"jamdani","photos":[],"generalEventIds":[],"events":[{"id":"nikah","title":"Nikah","date":"2026-12-11","time":"16:30","venue":"SECRET_NIKAH","address":""},{"id":"reception","title":"Reception","date":"2026-12-12","time":"19:00","venue":"Synthetic Garden","address":""}]}'::jsonb;
begin
  insert into auth.users(id,email,email_confirmed_at) values(ua,ua||'@example.invalid',now()),(ub,ub||'@example.invalid',now());
  insert into public.orders(id,customer_email,customer_name,package_name,amount_minor,term_days,status,exception_reason)
    values(ox,ua||'@example.invalid','Synthetic X','Rollback-only verification',0,1,'confirmed','Synthetic rollback-only verification'),
          (oy,ub||'@example.invalid','Synthetic Y','Rollback-only verification',0,1,'confirmed','Synthetic rollback-only verification');
  insert into public.weddings(id,order_id,title) values(wx,ox,'Synthetic X'),(wy,oy,'Synthetic Y');
  insert into public.wedding_memberships(wedding_id,user_id) values(wx,ua),(wy,ub);
  insert into public.dashboard_grants(wedding_id,state) values(wx,'active'),(wy,'active');
  insert into public.entitlements(wedding_id,term_days,starts_at,expires_at) values(wx,1,now(),now()+interval '1 day'),(wy,1,now(),now()+interval '1 day');
  insert into public.invitation_drafts(wedding_id,content,revision) values(wx,content,1),(wy,content,1);
  insert into public.invitation_versions(id,wedding_id,content,draft_revision) values(vx,wx,content,1),(vy,wy,content,1);
  update public.weddings set live_version_id=case id when wx then vx else vy end,visibility='live' where id in(wx,wy);
  select slug into sx from public.weddings where id=wx; select slug into sy from public.weddings where id=wy;
  insert into public.households(id,wedding_id,name,private_note) values(hx,wx,'Synthetic Family X','PRIVATE_ONLY'),(hy,wy,'Synthetic Family Y','PRIVATE_ONLY');
  insert into public.household_events(wedding_id,household_id,event_id,max_people) values(wx,hx,'reception',5),(wy,hy,'reception',2);
  insert into private.guest_links(wedding_id,household_id,digest,ciphertext,key_id) values(wx,hx,repeat('a',64),repeat('c',90),'synthetic');
  insert into private.guest_sessions(digest,wedding_id,household_id,link_revision,expires_at) values(repeat('b',64),wx,hx,1,now()+interval '1 hour');
  denied:=false;
  begin insert into public.household_events(wedding_id,household_id,event_id,max_people) values(wx,hy,'nikah',1); exception when foreign_key_violation then denied:=true; end;
  if not denied then raise exception 'FAIL: cross-wedding composite reference accepted'; end if;

  perform set_config('request.jwt.claims',jsonb_build_object('sub',ua,'aal','aal1')::text,true);
  execute 'set local role authenticated';
  select count(*) into n from public.households where wedding_id=wx;
  if n<>1 then raise exception 'FAIL: own household unavailable'; end if;
  select count(*) into n from public.households where wedding_id=wy;
  if n<>0 then raise exception 'FAIL: foreign household leaked'; end if;
  denied:=false;
  begin perform public.household_preview(wy,hy); exception when sqlstate 'PT404' then denied:=true; end;
  if not denied then raise exception 'FAIL: foreign preview allowed'; end if;
  execute 'reset role';

  perform set_config('request.jwt.claims','{}',true);
  execute 'set local role anon';
  denied:=false;
  begin perform 1 from public.responses; exception when insufficient_privilege then denied:=true; end;
  if not denied then raise exception 'FAIL: anonymous response table read allowed'; end if;
  payload:=public.guest_invitation(sx,hx,repeat('b',64));
  if jsonb_array_length(payload->'content'->'events')<>1 or payload::text like '%SECRET_NIKAH%' or payload::text like '%PRIVATE_ONLY%' then raise exception 'FAIL: guest payload was not filtered'; end if;
  denied:=false;
  begin perform public.guest_invitation(sy,hy,repeat('b',64)); exception when sqlstate 'PT404' then denied:=true; end;
  if not denied then raise exception 'FAIL: cross-household guest credential allowed'; end if;
  perform public.guest_command(sx,hx,repeat('b',64),gen_random_uuid(),jsonb_build_object('kind','wish','body','Synthetic wish with no attendance effect'));
  perform public.guest_command(sx,hx,repeat('b',64),gen_random_uuid(),jsonb_build_object('kind','response','expectedPolicyRevision',(payload->>'policyRevision')::integer,'expectedHouseholdRevision',1,'expectedResponseRevision',0,'answers','[{"eventId":"reception","attendance":"accepted","adults":2,"children":1,"note":"Synthetic reply"}]'::jsonb));
  execute 'reset role';

  perform set_config('request.jwt.claims',jsonb_build_object('sub',ua,'aal','aal1')::text,true);
  execute 'set local role authenticated';
  result:=public.household_report(wx,'reception',null,'','all');
  if result->'summary'->>'accepted'<>'1' or result->'summary'->>'adults'<>'2' or result->'summary'->>'children'<>'1' then raise exception 'FAIL: event metrics disagree with persisted reply'; end if;

  payload:=jsonb_build_object('expectedResponseRevision',1,'expectedHouseholdRevision',1,'expectedPolicyRevision',(result->>'policyRevision')::integer,
    'answer',jsonb_build_object('eventId','reception','attendance','accepted','adults',4,'children',1,'note','Confirmed by phone'),
    'reason','Synthetic phone confirmation correction','overrideClosed',false);
  result:=public.correct_response(wx,hx,hx,payload);
  if result<>public.correct_response(wx,hx,hx,payload) then raise exception 'FAIL: correction replay mismatch'; end if;
  result:=public.export_households(wx,'reception','','all');
  if jsonb_array_length(result->'rows')<>1 or result->'rows'->0->>'source'<>'host' or result->'rows'->0->>'adults'<>'4'
    or result::text like '%PRIVATE_ONLY%' then raise exception 'FAIL: scoped attributed export'; end if;
  result:=public.workspace_overview();
  if jsonb_array_length(result)<>1 or result->0->>'id'<>wx::text then raise exception 'FAIL: overview tenancy'; end if;
  execute 'reset role';
  perform set_config('request.jwt.claims',jsonb_build_object('sub',ub,'aal','aal1')::text,true);
  execute 'set local role authenticated';
  denied:=false;begin perform public.export_households(wx,'reception','','all'); exception when sqlstate 'PT404' then denied:=true;end;
  if not denied then raise exception 'FAIL: foreign export allowed';end if;
  denied:=false;begin perform public.correct_response(wx,hx,gen_random_uuid(),payload); exception when sqlstate 'PT404' then denied:=true;end;
  if not denied then raise exception 'FAIL: foreign correction allowed';end if;
  execute 'reset role';
  perform set_config('request.jwt.claims',jsonb_build_object('sub',ua,'aal','aal1')::text,true);
  execute 'set local role authenticated';
  select publication_revision into n from public.weddings where id=wx;
  perform public.set_invitation_visibility(wx,n,false,gen_random_uuid());
  execute 'reset role';
  perform set_config('request.jwt.claims','{}',true);
  execute 'set local role anon';
  denied:=false;begin perform public.guest_invitation(sx,hx,repeat('b',64)); exception when sqlstate 'PT404' then denied:=true;end;
  if not denied then raise exception 'FAIL: paused invitation stayed readable';end if;
  execute 'reset role';
  perform set_config('request.jwt.claims',jsonb_build_object('sub',ua,'aal','aal1')::text,true);
  execute 'set local role authenticated';
  perform public.set_invitation_visibility(wx,n+1,true,gen_random_uuid());
  perform public.household_link(wx,hx,'revoke',1,gen_random_uuid(),repeat('d',64),repeat('e',90),'synthetic');
  execute 'reset role';
  perform set_config('request.jwt.claims','{}',true);
  execute 'set local role anon';
  denied:=false;
  begin perform public.guest_invitation(sx,hx,repeat('b',64)); exception when sqlstate 'PT404' then denied:=true; end;
  if not denied then raise exception 'FAIL: revoked session remained valid'; end if;
  execute 'reset role';
  update public.entitlements set starts_at=now()-interval '2 days',expires_at=now()-interval '1 day' where wedding_id=wx;
  perform set_config('request.jwt.claims',jsonb_build_object('sub',ua,'aal','aal1')::text,true);
  execute 'set local role authenticated';
  result:=public.workspace_overview();
  if result->0->>'state'<>'expired' then raise exception 'FAIL: expired access shown active';end if;
  denied:=false;begin perform public.export_households(wx,'reception','','all'); exception when sqlstate 'PT404' then denied:=true;end;
  if not denied then raise exception 'FAIL: expired export allowed';end if;
  execute 'reset role';
end $$;
rollback;
select 'PASS: normal-role corrections, replay, attributed export, pause/resume, expiry and overview isolation. Synthetic rows rolled back.' as hosted_response_tools_proof;
