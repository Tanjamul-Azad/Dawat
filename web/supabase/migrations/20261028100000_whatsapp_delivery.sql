begin;
alter table public.households add column contact_phone text check(contact_phone is null or contact_phone ~ '^\+[1-9][0-9]{7,14}$');
alter table public.weddings
 add column host_whatsapp text check(host_whatsapp is null or host_whatsapp ~ '^\+[1-9][0-9]{7,14}$'),
 add column show_host_whatsapp boolean not null default false,
 add column invite_message_bn text not null default '' check(length(invite_message_bn)<=600),
 add column invite_message_en text not null default '' check(length(invite_message_en)<=600),
 add column invite_settings_revision integer not null default 0;
create table public.household_deliveries (
 id uuid primary key default gen_random_uuid(),
 wedding_id uuid not null,
 household_id uuid not null,
 channel text not null check(channel in ('whatsapp','share','copy')),
 link_revision integer not null check(link_revision>0),
 actor_id uuid not null default auth.uid() references auth.users(id),
 created_at timestamptz not null default now(),
 foreign key(wedding_id,household_id) references public.households(wedding_id,id)
);
create index household_delivery_latest on public.household_deliveries(wedding_id,household_id,created_at desc);
alter table public.household_deliveries enable row level security;
revoke all on public.household_deliveries from anon,authenticated;
grant select on public.household_deliveries to authenticated;
create policy delivery_member_read on public.household_deliveries for select to authenticated using(private.is_member(wedding_id));

create function public.record_delivery(p_key uuid,p_wedding_id uuid,p_household_id uuid,p_channel text,p_link_revision integer) returns jsonb
language plpgsql security definer set search_path='' as $$
declare b jsonb; previous private.commands; result jsonb; l private.guest_links;
begin
 perform private.lock_management(p_wedding_id);
 if p_key is null or p_channel is null or p_channel not in ('whatsapp','share','copy') then raise sqlstate 'PT422' using message='Invalid delivery.'; end if;
 b:=jsonb_build_object('kind','delivery','wedding',p_wedding_id,'household',p_household_id,'channel',p_channel,'revision',p_link_revision);
 select * into previous from private.commands where actor_id=auth.uid() and key=p_key;
 if found then
  if previous.body<>b then raise sqlstate 'PT409' using message='Retry key conflict.'; end if;
  return previous.result;
 end if;
 select * into l from private.guest_links where wedding_id=p_wedding_id and household_id=p_household_id for update;
 if l.household_id is null or not l.active or l.revision is distinct from p_link_revision then raise sqlstate 'PT409' using message='The link changed. Refresh before confirming delivery.'; end if;
 insert into public.household_deliveries(wedding_id,household_id,channel,link_revision) values(p_wedding_id,p_household_id,p_channel,p_link_revision)
 returning jsonb_build_object('id',id,'channel',channel,'at',created_at,'linkRevision',link_revision) into result;
 insert into private.commands values(auth.uid(),p_key,b,result);
 return result;
end $$;

create function public.set_invite_settings(p_key uuid,p_wedding_id uuid,p_body jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare w public.weddings; previous private.commands; b jsonb; result jsonb;
begin
 perform private.lock_management(p_wedding_id);
 if p_key is null or p_body is null or jsonb_typeof(p_body)<>'object' or octet_length(p_body::text)>8000 then raise sqlstate 'PT422' using message='Invalid invitation settings.'; end if;
 b:=jsonb_build_object('kind','invite-settings','wedding',p_wedding_id,'input',p_body);
 select * into previous from private.commands where actor_id=auth.uid() and key=p_key;
 if found then
  if previous.body<>b then raise sqlstate 'PT409' using message='Retry key conflict.'; end if;
  return previous.result;
 end if;
 select * into w from public.weddings where id=p_wedding_id;
 if w.invite_settings_revision is distinct from (p_body->>'expectedRevision')::integer then raise sqlstate 'PT409' using message='Invitation settings changed. Refresh before saving.'; end if;
 if not p_body ?& array['hostWhatsapp','showHostWhatsapp','messageBn','messageEn','expectedRevision'] or
  jsonb_typeof(p_body->'showHostWhatsapp') is distinct from 'boolean' or
  jsonb_typeof(p_body->'messageBn') is distinct from 'string' or jsonb_typeof(p_body->'messageEn') is distinct from 'string' or
  length(p_body->>'messageBn')>600 or length(p_body->>'messageEn')>600 or
  (nullif(p_body->>'hostWhatsapp','') is not null and p_body->>'hostWhatsapp' !~ '^\+[1-9][0-9]{7,14}$') then
  raise sqlstate 'PT422' using message='Check the WhatsApp number and message length (600 characters).';
 end if;
 update public.weddings set host_whatsapp=nullif(p_body->>'hostWhatsapp',''),show_host_whatsapp=(p_body->>'showHostWhatsapp')::boolean,
  invite_message_bn=p_body->>'messageBn',invite_message_en=p_body->>'messageEn',invite_settings_revision=invite_settings_revision+1 where id=p_wedding_id
  returning jsonb_build_object('revision',invite_settings_revision) into result;
 insert into public.audit_events(wedding_id,actor_id,action) values(p_wedding_id,auth.uid(),'invite.settings');
 insert into private.commands values(auth.uid(),p_key,b,result);
 return result;
end $$;
revoke all on function public.record_delivery(uuid,uuid,uuid,text,integer),public.set_invite_settings(uuid,uuid,jsonb) from public,anon;
grant execute on function public.record_delivery(uuid,uuid,uuid,text,integer),public.set_invite_settings(uuid,uuid,jsonb) to authenticated;

-- Extended definitions below preserve the existing locks, validation and receipts.
create or replace function public.save_household(p_wedding_id uuid,p_household_id uuid,p_revision integer,p_key uuid,p_body jsonb) returns jsonb
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
    if k not in ('name','nameBn','greeting','greetingEn','message','messageEn','privateNote','events','contactPhone') then raise sqlstate 'PT422' using message='Unsupported household field.'; end if;
    if k not in ('events','contactPhone') and (jsonb_typeof(v)<>'string' or length(v#>>'{}')>(case when k in ('name','nameBn') then 120 when k in ('greeting','greetingEn') then 300 when k='privateNote' then 1000 else 500 end)) then raise sqlstate 'PT422' using message='Invalid household text.'; end if;
  end loop;
  if nullif(p_body->>'contactPhone','') is not null and (jsonb_typeof(p_body->'contactPhone')<>'string' or p_body->>'contactPhone' !~ '^\+[1-9][0-9]{7,14}$') then raise sqlstate 'PT422' using message='Enter a valid WhatsApp number.'; end if;
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
    update public.households set name=trim(p_body->>'name'),name_bn=p_body->>'nameBn',greeting=p_body->>'greeting',greeting_en=p_body->>'greetingEn',message=p_body->>'message',message_en=p_body->>'messageEn',private_note=p_body->>'privateNote',contact_phone=nullif(p_body->>'contactPhone',''),overlay_revision=overlay_revision+1,updated_at=now() where wedding_id=p_wedding_id and id=p_household_id returning * into h;
    delete from public.household_events he where he.wedding_id=p_wedding_id and he.household_id=h.id and not exists(select 1 from jsonb_array_elements(p_body->'events') e where e->>'eventId'=he.event_id);
  else
    if p_revision is distinct from 0 then raise sqlstate 'PT404' using message='Household unavailable.'; end if;
    insert into public.households(id,wedding_id,name,name_bn,greeting,greeting_en,message,message_en,private_note,contact_phone) values(p_household_id,p_wedding_id,trim(p_body->>'name'),p_body->>'nameBn',p_body->>'greeting',p_body->>'greetingEn',p_body->>'message',p_body->>'messageEn',p_body->>'privateNote',nullif(p_body->>'contactPhone','')) returning * into h;
  end if;
  insert into public.household_events(wedding_id,household_id,event_id,max_people) select p_wedding_id,h.id,value->>'eventId',(value->>'maxPeople')::integer from jsonb_array_elements(p_body->'events') on conflict(wedding_id,household_id,event_id) do update set max_people=excluded.max_people;
  insert into public.audit_events(wedding_id,actor_id,action) values(p_wedding_id,auth.uid(),'household.save');
  result:=jsonb_build_object('id',h.id,'revision',h.overlay_revision);
  insert into private.commands values(auth.uid(),p_key,b,result);
  return result;
end $$;
create or replace function private.household_payload(p_wedding_id uuid,p_household_id uuid) returns jsonb
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
  return jsonb_build_object('content',jsonb_set(c-'generalEventIds','{events}',es),'guest',jsonb_build_object('id',h.id,'name',h.name,'nameBn',h.name_bn,'greeting',h.greeting,'greetingEn',h.greeting_en,'message',h.message,'messageEn',h.message_en,'responses',answers),'scopes',scopes,'policies',policies,'householdRevision',h.overlay_revision,'responseRevision',h.response_revision,'policyRevision',rev) || coalesce((select jsonb_build_object('hostWhatsapp',host_whatsapp) from public.weddings where id=p_wedding_id and show_host_whatsapp and host_whatsapp is not null),'{}'::jsonb);
end $$;
drop function public.household_report(uuid,text,uuid,text,text);
create function public.household_report(p_wedding_id uuid,p_event_id text,p_after uuid default null,p_search text default '',p_status text default 'all',p_delivery text default 'all') returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare result jsonb; rows jsonb; total jsonb; next_id uuid; rev integer; policies jsonb;
begin
  if not private.can_manage(p_wedding_id) then raise sqlstate 'PT404' using message='Workspace unavailable.'; end if;
  if length(p_search)>120 or p_status not in ('all','accepted','declined','pending') or p_delivery not in ('all','unsent','sent_unreplied') or p_event_id not in ('nikah','reception') then raise sqlstate 'PT422' using message='Invalid report filter.'; end if;
  if exists(select 1 from public.weddings w join public.invitation_versions v on v.wedding_id=w.id and v.id=w.live_version_id where w.id=p_wedding_id and not exists(select 1 from jsonb_array_elements(v.content->'events') e where e->>'id'=p_event_id)) then raise sqlstate 'PT422' using message='This celebration is no longer published.'; end if;
  select rsvp_policy_revision into rev from public.weddings where id=p_wedding_id;
  select jsonb_agg(jsonb_build_object('eventId',event_id,'isOpen',is_open,'deadline',deadline)) into policies from public.rsvp_policies where wedding_id=p_wedding_id;
  select jsonb_build_object('invited',count(*),'accepted',count(*) filter(where r.attendance='accepted'),'declined',count(*) filter(where r.attendance='declined'),'pending',count(*) filter(where r.household_id is null),'adults',coalesce(sum(r.adults) filter(where r.attendance='accepted'),0),'children',coalesce(sum(r.children) filter(where r.attendance='accepted'),0),'sent',(select count(distinct d.household_id) from public.household_deliveries d join private.guest_links l on l.wedding_id=d.wedding_id and l.household_id=d.household_id and l.revision=d.link_revision and l.active join public.household_events se on se.wedding_id=d.wedding_id and se.household_id=d.household_id and se.event_id=p_event_id where d.wedding_id=p_wedding_id and d.channel<>'copy'),'opened',(select count(distinct s.household_id) from private.guest_sessions s join private.guest_links l on l.wedding_id=s.wedding_id and l.household_id=s.household_id and l.revision=s.link_revision and l.active join public.household_events se on se.wedding_id=s.wedding_id and se.household_id=s.household_id and se.event_id=p_event_id where s.wedding_id=p_wedding_id),'replied',count(*) filter(where r.household_id is not null)) into total from public.household_events he left join public.responses r using(wedding_id,household_id,event_id) where he.wedding_id=p_wedding_id and he.event_id=p_event_id;
  with candidates as (
    select h.id,h.wedding_id,h.name,h.name_bn,h.greeting,h.greeting_en,h.message,h.message_en,h.private_note,h.contact_phone,h.overlay_revision,h.response_revision
    from public.households h join public.household_events he on he.wedding_id=h.wedding_id and he.household_id=h.id and he.event_id=p_event_id
    left join public.responses r on r.wedding_id=h.wedding_id and r.household_id=h.id and r.event_id=p_event_id
    where h.wedding_id=p_wedding_id and (p_after is null or h.id>p_after) and position(lower(p_search) in lower(h.name||' '||h.name_bn))>0 and (p_status='all' or coalesce(r.attendance,'pending')=p_status) and (p_delivery='all' or (p_delivery='unsent' and not exists(select 1 from public.household_deliveries d join private.guest_links gl on gl.wedding_id=d.wedding_id and gl.household_id=d.household_id and gl.revision=d.link_revision and gl.active where d.wedding_id=h.wedding_id and d.household_id=h.id and d.channel<>'copy')) or (p_delivery='sent_unreplied' and r.household_id is null and exists(select 1 from public.household_deliveries d join private.guest_links gl on gl.wedding_id=d.wedding_id and gl.household_id=d.household_id and gl.revision=d.link_revision and gl.active where d.wedding_id=h.wedding_id and d.household_id=h.id and d.channel<>'copy')))
    order by h.id limit 26
  ), page as (select * from candidates order by id limit 25)
  select coalesce(jsonb_agg(jsonb_build_object('id',h.id,'name',h.name,'nameBn',h.name_bn,'greeting',h.greeting,'greetingEn',h.greeting_en,'message',h.message,'messageEn',h.message_en,'privateNote',h.private_note,'revision',h.overlay_revision,'responseRevision',h.response_revision,
    'contactPhone',h.contact_phone,'lastDelivery',(select jsonb_build_object('channel',d.channel,'at',d.created_at,'linkRevision',d.link_revision) from public.household_deliveries d where d.wedding_id=h.wedding_id and d.household_id=h.id order by (d.channel<>'copy') desc,d.created_at desc,d.id desc limit 1),'firstOpenedAt',(select min(s.created_at) from private.guest_sessions s where s.wedding_id=h.wedding_id and s.household_id=h.id and s.link_revision=l.revision and l.active),'linkRevision',coalesce(l.revision,0),'linkState',case when l.household_id is null then 'missing' when l.active then 'active' else 'revoked' end,
    'events',(select jsonb_agg(jsonb_build_object('eventId',he.event_id,'maxPeople',he.max_people)) from public.household_events he where he.wedding_id=h.wedding_id and he.household_id=h.id),
    'responses',coalesce((select jsonb_object_agg(r.event_id,jsonb_build_object('attendance',r.attendance,'adults',r.adults,'children',r.children,'note',r.note,'updatedAt',r.updated_at)) from public.responses r where r.wedding_id=h.wedding_id and r.household_id=h.id),'{}')
  ) order by h.id),'[]'),case when (select count(*) from candidates)>25 then (select id from page order by id desc limit 1) else null end into rows,next_id from page h left join private.guest_links l on l.wedding_id=h.wedding_id and l.household_id=h.id;
  result:=jsonb_build_object('rows',rows,'summary',total,'nextCursor',next_id,'asOf',now(),'policyRevision',rev,'policies',coalesce(policies,'[]'));
  return result;
end $$;
drop function public.export_households(uuid,text,text,text);
create function public.export_households(p_wedding_id uuid,p_event_id text,p_search text default '',p_status text default 'all',p_include_contacts boolean default false)
returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
  perform private.lock_management(p_wedding_id);
  if p_event_id not in ('nikah','reception') or p_event_id is null or p_search is null or length(p_search)>120
    or p_status is null or p_status not in ('all','accepted','declined','pending') then raise sqlstate 'PT422' using message='Invalid export filter.'; end if;
  if exists(select 1 from public.weddings w join public.invitation_versions v on v.wedding_id=w.id and v.id=w.live_version_id where w.id=p_wedding_id and not exists(select 1 from jsonb_array_elements(v.content->'events') e where e->>'id'=p_event_id)) then raise sqlstate 'PT422' using message='This celebration is no longer published.'; end if;
  with rows as (
    select h.id,h.name,h.name_bn,he.max_people,coalesce(r.attendance,'pending') as attendance,
      coalesce(r.adults,0) as adults,coalesce(r.children,0) as children,coalesce(r.note,'') as note,r.updated_at,
      coalesce(ch.source,case when r.household_id is null then '' else 'guest' end) as source
    from public.households h join public.household_events he on he.wedding_id=h.wedding_id and he.household_id=h.id
    left join public.responses r on r.wedding_id=h.wedding_id and r.household_id=h.id and r.event_id=he.event_id
    left join lateral (select source from public.response_changes rc where rc.wedding_id=h.wedding_id and rc.household_id=h.id and rc.event_id=he.event_id order by change_sequence desc limit 1) ch on true
    where h.wedding_id=p_wedding_id and he.event_id=p_event_id and position(lower(p_search) in lower(h.name||' '||h.name_bn))>0
      and (p_status='all' or coalesce(r.attendance,'pending')=p_status)
    order by h.id limit 10001
  ) select jsonb_build_object('rows',coalesce(jsonb_agg((to_jsonb(rows) || case when p_include_contacts then jsonb_build_object('contact_phone',(select h.contact_phone from public.households h where h.id=rows.id and h.wedding_id=p_wedding_id)) else '{}'::jsonb end) order by id),'[]'),'asOf',now(),'eventId',p_event_id) into result from rows;
  if jsonb_array_length(result->'rows')>10000 then raise sqlstate 'PT422' using message='Narrow the export filters to at most 10000 households.'; end if;
  insert into public.audit_events(wedding_id,actor_id,action) values(p_wedding_id,auth.uid(),'households.export');
  return result;
end $$;
revoke all on function public.household_report(uuid,text,uuid,text,text,text),public.export_households(uuid,text,text,text,boolean) from public,anon;
grant execute on function public.household_report(uuid,text,uuid,text,text,text),public.export_households(uuid,text,text,text,boolean) to authenticated;
commit;
