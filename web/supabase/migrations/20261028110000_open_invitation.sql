begin;
alter table public.households
 add column source text not null default 'host' check(source in ('host','open')),
 add column open_device_digest text check(open_device_digest is null or open_device_digest ~ '^[a-f0-9]{64}$'),
 add column hidden boolean not null default false;
create unique index household_open_device on public.households(wedding_id,open_device_digest) where open_device_digest is not null;
create table private.open_invites (
 wedding_id uuid primary key references public.weddings(id),
 enabled boolean not null default false,
 digest text not null unique check(digest ~ '^[a-f0-9]{64}$'),
 ciphertext text not null check(length(ciphertext) between 50 and 1024),
 key_id text not null check(key_id ~ '^[a-zA-Z0-9_-]{1,40}$'),
 revision integer not null default 1,
 event_ids text[] not null,
 max_people integer not null default 5 check(max_people between 1 and 20),
 greeting_bn text not null default 'প্রিয় অতিথি' check(length(greeting_bn) between 1 and 300),
 greeting_en text not null default 'Dear guest' check(length(greeting_en) between 1 and 300),
 ask_phone boolean not null default true,
 cap integer not null default 500 check(cap between 1 and 10000),
 updated_at timestamptz not null default now()
);
alter table private.open_invites enable row level security;
revoke all on private.open_invites from public,anon,authenticated;

create function public.open_invite_link(p_wedding_id uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 if not private.can_manage(p_wedding_id) then raise sqlstate 'PT404' using message='Workspace unavailable.'; end if;
 return (select to_jsonb(o)-'digest' from private.open_invites o where wedding_id=p_wedding_id);
end $$;
create function public.set_open_invite(p_key uuid,p_wedding_id uuid,p_body jsonb,p_digest text,p_ciphertext text,p_key_id text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare previous private.commands; b jsonb; result jsonb; o private.open_invites; c jsonb; events text[];
begin
 perform private.lock_management(p_wedding_id);
 if p_key is null or p_body is null or jsonb_typeof(p_body)<>'object' or octet_length(p_body::text)>8000 then raise sqlstate 'PT422' using message='Invalid shared invitation settings.'; end if;
 b:=jsonb_build_object('kind','open-invite','wedding',p_wedding_id,'input',p_body);
 select * into previous from private.commands where actor_id=auth.uid() and key=p_key;
 if found then
  if previous.body<>b then raise sqlstate 'PT409' using message='Retry key conflict.'; end if;
  return previous.result;
 end if;
 select * into o from private.open_invites where wedding_id=p_wedding_id for update;
 if coalesce(o.revision,0) is distinct from (p_body->>'expectedRevision')::integer then raise sqlstate 'PT409' using message='Shared invitation changed. Refresh before saving.'; end if;
 if not p_body ?& array['enabled','eventIds','maxPeople','greetingBn','greetingEn','askPhone','rotate','expectedRevision'] or
  jsonb_typeof(p_body->'enabled') is distinct from 'boolean' or jsonb_typeof(p_body->'askPhone') is distinct from 'boolean' or jsonb_typeof(p_body->'rotate') is distinct from 'boolean' or
  jsonb_typeof(p_body->'eventIds') is distinct from 'array' or jsonb_array_length(p_body->'eventIds') not between 1 and 2 or
  jsonb_typeof(p_body->'maxPeople') is distinct from 'number' or (p_body->>'maxPeople') !~ '^([1-9]|1[0-9]|20)$' or
  jsonb_typeof(p_body->'greetingBn') is distinct from 'string' or jsonb_typeof(p_body->'greetingEn') is distinct from 'string' or
  length(trim(p_body->>'greetingBn')) not between 1 and 300 or length(trim(p_body->>'greetingEn')) not between 1 and 300 then raise sqlstate 'PT422' using message='Choose events, a greeting and an allowance from 1 to 20.'; end if;
 select array_agg(value) into events from jsonb_array_elements_text(p_body->'eventIds');
 select v.content into c from public.weddings w join public.invitation_versions v on v.wedding_id=w.id and v.id=w.live_version_id where w.id=p_wedding_id;
 if cardinality(events)<>(select count(distinct e) from unnest(events) e) or exists(select 1 from unnest(events) e where not exists(select 1 from jsonb_array_elements(c->'events') ce where ce->>'id'=e)) or c is null then raise sqlstate 'PT422' using message='Choose published events for the shared invitation.'; end if;
 insert into private.open_invites(wedding_id,enabled,digest,ciphertext,key_id,event_ids,max_people,greeting_bn,greeting_en,ask_phone)
 values(p_wedding_id,(p_body->>'enabled')::boolean,p_digest,p_ciphertext,p_key_id,events,(p_body->>'maxPeople')::integer,trim(p_body->>'greetingBn'),trim(p_body->>'greetingEn'),(p_body->>'askPhone')::boolean)
 on conflict(wedding_id) do update set enabled=excluded.enabled,event_ids=excluded.event_ids,max_people=excluded.max_people,greeting_bn=excluded.greeting_bn,greeting_en=excluded.greeting_en,ask_phone=excluded.ask_phone,
  digest=case when (p_body->>'rotate')::boolean then excluded.digest else private.open_invites.digest end,
  ciphertext=case when (p_body->>'rotate')::boolean then excluded.ciphertext else private.open_invites.ciphertext end,
  key_id=case when (p_body->>'rotate')::boolean then excluded.key_id else private.open_invites.key_id end,
  revision=private.open_invites.revision+1,updated_at=now();
 result:=public.open_invite_link(p_wedding_id);
 insert into public.audit_events(wedding_id,actor_id,action) values(p_wedding_id,auth.uid(),'open-invite.settings');
 insert into private.commands values(auth.uid(),p_key,b,result);
 return result;
end $$;

-- Public resolution needs the bearer digest. It returns only the selected published events.
create function public.resolve_open_invitation(p_slug uuid,p_open_digest text,p_device_digest text default null) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare o private.open_invites; c jsonb; es jsonb; wid uuid; hid uuid;
begin
 select w.id,v.content into wid,c from public.weddings w join public.entitlements e on e.wedding_id=w.id
  join public.invitation_versions v on v.wedding_id=w.id and v.id=w.live_version_id
  where w.slug=p_slug and w.visibility='live' and e.expires_at>now();
 select * into o from private.open_invites where wedding_id=wid and enabled and digest=p_open_digest;
 if o.wedding_id is null then raise sqlstate 'PT404' using message='Shared invitation unavailable. Ask the hosts for the current link.'; end if;
 select jsonb_agg(value) into es from jsonb_array_elements(c->'events') where value->>'id'=any(o.event_ids);
 if es is null or jsonb_array_length(es)<>cardinality(o.event_ids) then raise sqlstate 'PT404' using message='This invitation is being updated. Please contact the hosts.'; end if;
 select h.id into hid from public.households h join private.guest_links l on l.wedding_id=h.wedding_id and l.household_id=h.id and l.active
  where h.wedding_id=wid and h.open_device_digest=p_device_digest;
 return jsonb_build_object('weddingId',wid,'content',jsonb_set(c,'{events}',es),'greetingBn',o.greeting_bn,'greetingEn',o.greeting_en,'askPhone',o.ask_phone,'householdId',hid);
end $$;

create function public.join_open_invitation(p_slug uuid,p_open_digest text,p_device_digest text,p_ip_digest text,p_name text,p_phone text,p_session_digest text,p_link_digest text,p_link_ciphertext text,p_link_key_id text,p_household_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare wid uuid; h public.households; o private.open_invites; l private.guest_links;
begin
 if p_household_id is null or p_device_digest is null or p_device_digest !~ '^[a-f0-9]{64}$' or p_ip_digest is null or p_ip_digest !~ '^[a-f0-9]{64}$' then raise sqlstate 'PT422' using message='Invalid invitation device.'; end if;
 select id into wid from public.weddings where slug=p_slug;
 -- Same lock order as host commands and guest exchange; serializes cap and device reuse.
 perform 1 from public.orders where id=(select order_id from public.weddings where id=wid) for update;
 perform 1 from public.weddings where id=wid for update;
 perform public.resolve_open_invitation(p_slug,p_open_digest,p_device_digest);
 select * into o from private.open_invites where wedding_id=wid;
 select * into h from public.households where wedding_id=wid and open_device_digest=p_device_digest;
 if h.id is null then
  perform private.guest_throttle('open-ip:'||p_ip_digest,10);
  perform private.guest_throttle('open-device:'||p_device_digest,3);
  if (select count(*) from public.households where wedding_id=wid and source='open' and not hidden)>=o.cap then raise sqlstate 'PT409' using message='This shared invitation is full. Contact the hosts.'; end if;
  if p_name is null or length(trim(p_name)) not between 1 and 120 or p_name ~ '[[:cntrl:]]' or length(regexp_replace(p_name,'[[:space:]'||chr(8203)||chr(65279)||chr(8204)||chr(8205)||']','','g'))=0 then raise sqlstate 'PT422' using message='Enter your name (1–120 characters).'; end if;
  if nullif(p_phone,'') is not null and p_phone !~ '^\+[1-9][0-9]{7,14}$' then raise sqlstate 'PT422' using message='Enter a valid WhatsApp number.'; end if;
  insert into public.households(id,wedding_id,name,contact_phone,source,open_device_digest,greeting,greeting_en)
   values(p_household_id,wid,trim(p_name),case when o.ask_phone then nullif(p_phone,'') else null end,'open',p_device_digest,o.greeting_bn,o.greeting_en) returning * into h;
  insert into public.household_events(wedding_id,household_id,event_id,max_people) select wid,h.id,e,o.max_people from unnest(o.event_ids) e;
  insert into private.guest_links(wedding_id,household_id,digest,ciphertext,key_id) values(wid,h.id,p_link_digest,p_link_ciphertext,p_link_key_id);
 end if;
 select * into l from private.guest_links where wedding_id=wid and household_id=h.id;
 if not l.active then raise sqlstate 'PT404' using message='This invitation is unavailable. Please contact the hosts.'; end if;
 perform private.guest_throttle('exchange:'||h.id,100);
 insert into private.guest_sessions(digest,wedding_id,household_id,link_revision,expires_at) values(p_session_digest,wid,h.id,l.revision,now()+interval '12 hours');
 perform private.guest_scope(p_slug,h.id,p_session_digest);
 return jsonb_build_object('householdId',h.id,'expiresIn',43200);
end $$;

create function public.hide_household(p_key uuid,p_wedding_id uuid,p_household_id uuid,p_hidden boolean) returns jsonb
language plpgsql security definer set search_path='' as $$
declare previous private.commands; b jsonb; result jsonb;
begin
 perform private.lock_management(p_wedding_id);
 if p_key is null or p_hidden is null then raise sqlstate 'PT422' using message='Invalid visibility action.'; end if;
 b:=jsonb_build_object('kind','hide-household','wedding',p_wedding_id,'household',p_household_id,'hidden',p_hidden);
 select * into previous from private.commands where actor_id=auth.uid() and key=p_key;
 if found then
  if previous.body<>b then raise sqlstate 'PT409' using message='Retry key conflict.'; end if;
  return previous.result;
 end if;
 update public.households set hidden=p_hidden,updated_at=now() where wedding_id=p_wedding_id and id=p_household_id returning jsonb_build_object('hidden',hidden) into result;
 if result is null then raise sqlstate 'PT404' using message='Household unavailable.'; end if;
 insert into public.audit_events(wedding_id,actor_id,action) values(p_wedding_id,auth.uid(),case when p_hidden then 'household.hide' else 'household.unhide' end);
 insert into private.commands values(auth.uid(),p_key,b,result);
 return result;
end $$;
revoke all on function public.open_invite_link(uuid),public.set_open_invite(uuid,uuid,jsonb,text,text,text),public.hide_household(uuid,uuid,uuid,boolean) from public,anon;
grant execute on function public.open_invite_link(uuid),public.set_open_invite(uuid,uuid,jsonb,text,text,text),public.hide_household(uuid,uuid,uuid,boolean) to authenticated;
revoke all on function public.resolve_open_invitation(uuid,text,text),public.join_open_invitation(uuid,text,text,text,text,text,text,text,text,text,uuid) from public;
grant execute on function public.resolve_open_invitation(uuid,text,text),public.join_open_invitation(uuid,text,text,text,text,text,text,text,text,text,uuid) to anon,authenticated;

-- Reporting extensions follow below.

drop function public.household_report(uuid,text,uuid,text,text,text);
create function public.household_report(p_wedding_id uuid,p_event_id text,p_after uuid default null,p_search text default '',p_status text default 'all',p_delivery text default 'all',p_source text default 'all') returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare result jsonb; rows jsonb; total jsonb; next_id uuid; rev integer; policies jsonb;
begin
  if not private.can_manage(p_wedding_id) then raise sqlstate 'PT404' using message='Workspace unavailable.'; end if;
  if length(p_search)>120 or p_status not in ('all','accepted','declined','pending','hidden') or p_source not in ('all','host','open') or p_delivery not in ('all','unsent','sent_unreplied') or p_event_id not in ('nikah','reception') then raise sqlstate 'PT422' using message='Invalid report filter.'; end if;
  if exists(select 1 from public.weddings w join public.invitation_versions v on v.wedding_id=w.id and v.id=w.live_version_id where w.id=p_wedding_id and not exists(select 1 from jsonb_array_elements(v.content->'events') e where e->>'id'=p_event_id)) then raise sqlstate 'PT422' using message='This celebration is no longer published.'; end if;
  select rsvp_policy_revision into rev from public.weddings where id=p_wedding_id;
  select jsonb_agg(jsonb_build_object('eventId',event_id,'isOpen',is_open,'deadline',deadline)) into policies from public.rsvp_policies where wedding_id=p_wedding_id;
  select jsonb_build_object('invited',count(*),'accepted',count(*) filter(where r.attendance='accepted'),'declined',count(*) filter(where r.attendance='declined'),'pending',count(*) filter(where r.household_id is null),'adults',coalesce(sum(r.adults) filter(where r.attendance='accepted'),0),'children',coalesce(sum(r.children) filter(where r.attendance='accepted'),0),'sent',(select count(distinct d.household_id) from public.household_deliveries d join private.guest_links l on l.wedding_id=d.wedding_id and l.household_id=d.household_id and l.revision=d.link_revision and l.active join public.household_events se on se.wedding_id=d.wedding_id and se.household_id=d.household_id and se.event_id=p_event_id where d.wedding_id=p_wedding_id and d.channel<>'copy' and exists(select 1 from public.households hh where hh.id=d.household_id and not hh.hidden)),'opened',(select count(distinct s.household_id) from private.guest_sessions s join private.guest_links l on l.wedding_id=s.wedding_id and l.household_id=s.household_id and l.revision=s.link_revision and l.active join public.household_events se on se.wedding_id=s.wedding_id and se.household_id=s.household_id and se.event_id=p_event_id where s.wedding_id=p_wedding_id and exists(select 1 from public.households hh where hh.id=s.household_id and not hh.hidden)),'replied',count(*) filter(where r.household_id is not null),'openCount',count(*) filter(where h.source='open'),'hostCount',count(*) filter(where h.source='host')) into total from public.household_events he join public.households h on h.wedding_id=he.wedding_id and h.id=he.household_id left join public.responses r on r.wedding_id=he.wedding_id and r.household_id=he.household_id and r.event_id=he.event_id where not h.hidden and he.wedding_id=p_wedding_id and he.event_id=p_event_id;
  with candidates as (
    select h.id,h.wedding_id,h.name,h.name_bn,h.greeting,h.greeting_en,h.message,h.message_en,h.private_note,h.contact_phone,h.source,h.hidden,h.overlay_revision,h.response_revision
    from public.households h join public.household_events he on he.wedding_id=h.wedding_id and he.household_id=h.id and he.event_id=p_event_id
    left join public.responses r on r.wedding_id=h.wedding_id and r.household_id=h.id and r.event_id=p_event_id
    where h.wedding_id=p_wedding_id and h.hidden=(p_status='hidden') and (p_source='all' or h.source=p_source) and (p_after is null or h.id>p_after) and position(lower(p_search) in lower(h.name||' '||h.name_bn))>0 and (p_status in ('all','hidden') or coalesce(r.attendance,'pending')=p_status) and (p_delivery='all' or (p_delivery='unsent' and not exists(select 1 from public.household_deliveries d join private.guest_links gl on gl.wedding_id=d.wedding_id and gl.household_id=d.household_id and gl.revision=d.link_revision and gl.active where d.wedding_id=h.wedding_id and d.household_id=h.id and d.channel<>'copy')) or (p_delivery='sent_unreplied' and r.household_id is null and exists(select 1 from public.household_deliveries d join private.guest_links gl on gl.wedding_id=d.wedding_id and gl.household_id=d.household_id and gl.revision=d.link_revision and gl.active where d.wedding_id=h.wedding_id and d.household_id=h.id and d.channel<>'copy')))
    order by h.id limit 26
  ), page as (select * from candidates order by id limit 25)
  select coalesce(jsonb_agg(jsonb_build_object('id',h.id,'name',h.name,'nameBn',h.name_bn,'greeting',h.greeting,'greetingEn',h.greeting_en,'message',h.message,'messageEn',h.message_en,'privateNote',h.private_note,'revision',h.overlay_revision,'responseRevision',h.response_revision,
    'source',h.source,'hidden',h.hidden,'duplicateOf',(select hh.id from public.households hh where hh.wedding_id=h.wedding_id and hh.id<>h.id and not hh.hidden and (lower(trim(hh.name))=lower(trim(h.name)) or (h.contact_phone is not null and hh.contact_phone=h.contact_phone)) order by hh.id limit 1),'contactPhone',h.contact_phone,'lastDelivery',(select jsonb_build_object('channel',d.channel,'at',d.created_at,'linkRevision',d.link_revision) from public.household_deliveries d where d.wedding_id=h.wedding_id and d.household_id=h.id order by (d.channel<>'copy') desc,d.created_at desc,d.id desc limit 1),'firstOpenedAt',(select min(s.created_at) from private.guest_sessions s where s.wedding_id=h.wedding_id and s.household_id=h.id and s.link_revision=l.revision and l.active),'linkRevision',coalesce(l.revision,0),'linkState',case when l.household_id is null then 'missing' when l.active then 'active' else 'revoked' end,
    'events',(select jsonb_agg(jsonb_build_object('eventId',he.event_id,'maxPeople',he.max_people)) from public.household_events he where he.wedding_id=h.wedding_id and he.household_id=h.id),
    'responses',coalesce((select jsonb_object_agg(r.event_id,jsonb_build_object('attendance',r.attendance,'adults',r.adults,'children',r.children,'note',r.note,'updatedAt',r.updated_at)) from public.responses r where r.wedding_id=h.wedding_id and r.household_id=h.id),'{}')
  ) order by h.id),'[]'),case when (select count(*) from candidates)>25 then (select id from page order by id desc limit 1) else null end into rows,next_id from page h left join private.guest_links l on l.wedding_id=h.wedding_id and l.household_id=h.id;
  result:=jsonb_build_object('rows',rows,'summary',total,'nextCursor',next_id,'asOf',now(),'policyRevision',rev,'policies',coalesce(policies,'[]'));
  return result;
end $$;
drop function public.export_households(uuid,text,text,text,boolean);
create function public.export_households(p_wedding_id uuid,p_event_id text,p_search text default '',p_status text default 'all',p_include_contacts boolean default false,p_source text default 'all')
returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
  perform private.lock_management(p_wedding_id);
  if p_event_id not in ('nikah','reception') or p_event_id is null or p_search is null or length(p_search)>120
    or p_status is null or p_status not in ('all','accepted','declined','pending') or p_source is null or p_source not in ('all','host','open') then raise sqlstate 'PT422' using message='Invalid export filter.'; end if;
  if exists(select 1 from public.weddings w join public.invitation_versions v on v.wedding_id=w.id and v.id=w.live_version_id where w.id=p_wedding_id and not exists(select 1 from jsonb_array_elements(v.content->'events') e where e->>'id'=p_event_id)) then raise sqlstate 'PT422' using message='This celebration is no longer published.'; end if;
  with rows as (
    select h.id,h.name,h.name_bn,he.max_people,coalesce(r.attendance,'pending') as attendance,
      coalesce(r.adults,0) as adults,coalesce(r.children,0) as children,coalesce(r.note,'') as note,r.updated_at,
      coalesce(ch.source,case when r.household_id is null then '' else 'guest' end) as source
    from public.households h join public.household_events he on he.wedding_id=h.wedding_id and he.household_id=h.id
    left join public.responses r on r.wedding_id=h.wedding_id and r.household_id=h.id and r.event_id=he.event_id
    left join lateral (select source from public.response_changes rc where rc.wedding_id=h.wedding_id and rc.household_id=h.id and rc.event_id=he.event_id order by change_sequence desc limit 1) ch on true
    where not h.hidden and (p_source='all' or h.source=p_source) and h.wedding_id=p_wedding_id and he.event_id=p_event_id and position(lower(p_search) in lower(h.name||' '||h.name_bn))>0
      and (p_status='all' or coalesce(r.attendance,'pending')=p_status)
    order by h.id limit 10001
  ) select jsonb_build_object('rows',coalesce(jsonb_agg((to_jsonb(rows) || case when p_include_contacts then jsonb_build_object('contact_phone',(select h.contact_phone from public.households h where h.id=rows.id and h.wedding_id=p_wedding_id)) else '{}'::jsonb end) order by id),'[]'),'asOf',now(),'eventId',p_event_id) into result from rows;
  if jsonb_array_length(result->'rows')>10000 then raise sqlstate 'PT422' using message='Narrow the export filters to at most 10000 households.'; end if;
  insert into public.audit_events(wedding_id,actor_id,action) values(p_wedding_id,auth.uid(),'households.export');
  return result;
end $$;
revoke all on function public.household_report(uuid,text,uuid,text,text,text,text),public.export_households(uuid,text,text,text,boolean,text) from public,anon;
grant execute on function public.household_report(uuid,text,uuid,text,text,text,text),public.export_households(uuid,text,text,text,boolean,text) to authenticated;

-- Media is gated by the same live bearer invitation and pinned publication.
create function public.resolve_open_media(p_slug uuid,p_open_digest text,p_asset_id uuid,p_size text) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare wid uuid; version uuid; o jsonb;
begin
 if p_size is null or p_size not in ('480','960','1600') then raise sqlstate 'PT404' using message='Photo unavailable.'; end if;
 wid:=(public.resolve_open_invitation(p_slug,p_open_digest)->>'weddingId')::uuid;
 select live_version_id into version from public.weddings where id=wid;
 if not exists(select 1 from public.publication_media where wedding_id=wid and version_id=version and asset_id=p_asset_id) then raise sqlstate 'PT404' using message='Photo unavailable.'; end if;
 select mp.objects->p_size into o from public.media_assets a join private.media_processing mp on mp.asset_id=a.id where a.wedding_id=wid and a.id=p_asset_id and a.state='ready';
 if o is null then raise sqlstate 'PT404' using message='Photo unavailable.'; end if;
 return o;
end $$;
revoke all on function public.resolve_open_media(uuid,text,uuid,text) from public;
grant execute on function public.resolve_open_media(uuid,text,uuid,text) to anon,authenticated;
commit;
