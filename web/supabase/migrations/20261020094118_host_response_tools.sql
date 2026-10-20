begin;

alter table public.response_changes
  add column change_sequence bigint generated always as identity,
  add column source text not null default 'guest' check(source in ('guest','host')),
  add column actor_id uuid references auth.users(id),
  add column reason text not null default '',
  add column override_closed boolean not null default false;
create index response_history on public.response_changes(wedding_id,household_id,event_id,change_sequence desc);
create table private.host_response_commands (
  wedding_id uuid not null references public.weddings(id),
  actor_id uuid not null references auth.users(id),
  key uuid not null,
  household_id uuid not null,
  body jsonb not null,
  result jsonb not null,
  primary key(wedding_id,actor_id,key)
);
alter table private.host_response_commands enable row level security;
revoke all on private.host_response_commands from public,anon,authenticated;

create function public.correct_response(p_wedding_id uuid,p_household_id uuid,p_key uuid,p_body jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare h public.households; w public.weddings; old public.responses; prev private.host_response_commands;
  a jsonb; c jsonb; policy public.rsvp_policies; allowance integer; result jsonb; closed boolean;
begin
  perform private.lock_management(p_wedding_id);
  select * into h from public.households where wedding_id=p_wedding_id and id=p_household_id for update;
  if h.id is null then raise sqlstate 'PT404' using message='Household unavailable.'; end if;
  if p_key is null or jsonb_typeof(p_body) is distinct from 'object' or octet_length(p_body::text)>12000
    or not p_body ?& array['expectedResponseRevision','expectedHouseholdRevision','expectedPolicyRevision','answer','reason','overrideClosed']
    or (select count(*) from jsonb_object_keys(p_body))<>6 then raise sqlstate 'PT422' using message='Invalid correction.'; end if;
  select * into prev from private.host_response_commands where wedding_id=p_wedding_id and actor_id=auth.uid() and key=p_key;
  if found then
    if prev.household_id<>p_household_id or prev.body<>p_body then raise sqlstate 'PT409' using message='This retry key belongs to another correction.'; end if;
    return prev.result;
  end if;
  select * into w from public.weddings where id=p_wedding_id;
  if (p_body->>'expectedResponseRevision') !~ '^[0-9]{1,9}$' or (p_body->>'expectedHouseholdRevision') !~ '^[0-9]{1,9}$'
    or (p_body->>'expectedPolicyRevision') !~ '^[0-9]{1,9}$' then raise sqlstate 'PT422' using message='Invalid revision.'; end if;
  if h.response_revision is distinct from (p_body->>'expectedResponseRevision')::integer
    or h.overlay_revision is distinct from (p_body->>'expectedHouseholdRevision')::integer
    or w.rsvp_policy_revision is distinct from (p_body->>'expectedPolicyRevision')::integer then
    raise sqlstate 'PT409' using message='The invitation or reply changed. Refresh and review before correcting.';
  end if;
  if jsonb_typeof(p_body->'reason') is distinct from 'string' or length(trim(p_body->>'reason')) not between 10 and 1000
    or length(regexp_replace(p_body->>'reason','[[:space:][:cntrl:]'||chr(8203)||chr(65279)||']','','g'))<5
    or jsonb_typeof(p_body->'overrideClosed') is distinct from 'boolean' then raise sqlstate 'PT422' using message='Explain the correction with at least 10 characters.'; end if;
  a:=p_body->'answer';
  if jsonb_typeof(a) is distinct from 'object' or not a ?& array['eventId','attendance','adults','children','note']
    or (select count(*) from jsonb_object_keys(a))<>5
    or jsonb_typeof(a->'attendance') is distinct from 'string' or a->>'attendance' not in ('accepted','declined')
    or jsonb_typeof(a->'adults') is distinct from 'number' or jsonb_typeof(a->'children') is distinct from 'number'
    or (a->>'adults')!~ '^(0|[1-9][0-9]?)$' or (a->>'children')!~ '^(0|[1-9][0-9]?)$'
    or jsonb_typeof(a->'note') is distinct from 'string' or length(a->>'note')>1000 then raise sqlstate 'PT422' using message='Use whole non-negative counts and a plain-text note.'; end if;
  select max_people into allowance from public.household_events where wedding_id=p_wedding_id and household_id=h.id and event_id=a->>'eventId';
  select content into c from public.invitation_versions where wedding_id=p_wedding_id and id=w.live_version_id;
  if allowance is null or not exists(select 1 from jsonb_array_elements(c->'events') e where e->>'id'=a->>'eventId') then raise sqlstate 'PT422' using message='This event is not included in the published invitation.'; end if;
  select * into policy from public.rsvp_policies where wedding_id=p_wedding_id and event_id=a->>'eventId';
  closed:=not policy.is_open or (policy.deadline is not null and clock_timestamp()>=policy.deadline)
    or (c ? 'rsvpClosesAt' and clock_timestamp()>=(c->>'rsvpClosesAt')::timestamptz);
  if closed and not (p_body->>'overrideClosed')::boolean then raise sqlstate 'PT409' using message='Replies are closed. Explicitly confirm the deadline override.'; end if;
  if (a->>'attendance'='declined' and ((a->>'adults')::integer<>0 or (a->>'children')::integer<>0))
    or (a->>'attendance'='accepted' and (a->>'adults')::integer+(a->>'children')::integer not between 1 and allowance) then raise sqlstate 'PT422' using message='Use people counts within the household allowance.'; end if;
  select * into old from public.responses where wedding_id=p_wedding_id and household_id=h.id and event_id=a->>'eventId';
  insert into public.response_changes(wedding_id,household_id,event_id,previous,current_value,source,actor_id,reason,override_closed)
    values(p_wedding_id,h.id,a->>'eventId',case when old.household_id is null then null else to_jsonb(old)-'wedding_id'-'household_id' end,
    a,'host',auth.uid(),trim(p_body->>'reason'),(p_body->>'overrideClosed')::boolean);
  insert into public.responses(wedding_id,household_id,event_id,attendance,adults,children,note,revision)
    values(p_wedding_id,h.id,a->>'eventId',a->>'attendance',(a->>'adults')::integer,(a->>'children')::integer,a->>'note',h.response_revision+1)
    on conflict(wedding_id,household_id,event_id) do update set attendance=excluded.attendance,adults=excluded.adults,children=excluded.children,note=excluded.note,revision=excluded.revision,updated_at=now();
  update public.households set response_revision=response_revision+1 where wedding_id=p_wedding_id and id=h.id returning * into h;
  insert into public.audit_events(wedding_id,actor_id,action,reason) values(p_wedding_id,auth.uid(),'response.correct',trim(p_body->>'reason'));
  result:=jsonb_build_object('responseRevision',h.response_revision,'confirmedAt',now());
  insert into private.host_response_commands values(p_wedding_id,auth.uid(),p_key,h.id,p_body,result);
  return result;
end $$;

-- One transaction, one event, all matching rows (not the visible UI page). No persistent export objects.
create function public.export_households(p_wedding_id uuid,p_event_id text,p_search text default '',p_status text default 'all')
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
  ) select jsonb_build_object('rows',coalesce(jsonb_agg(to_jsonb(rows) order by id),'[]'),'asOf',now(),'eventId',p_event_id) into result from rows;
  if jsonb_array_length(result->'rows')>10000 then raise sqlstate 'PT422' using message='Narrow the export filters to at most 10000 households.'; end if;
  insert into public.audit_events(wedding_id,actor_id,action) values(p_wedding_id,auth.uid(),'households.export');
  return result;
end $$;
revoke all on function public.correct_response(uuid,uuid,uuid,jsonb),public.export_households(uuid,text,text,text) from public,anon;
grant execute on function public.correct_response(uuid,uuid,uuid,jsonb),public.export_households(uuid,text,text,text) to authenticated;
create function public.workspace_overview() returns jsonb
language sql stable security definer set search_path='' as $$
  select coalesce(jsonb_agg(to_jsonb(items) order by created_at desc),'[]') from (
    select w.id,w.title,w.slug,w.visibility,w.publication_revision,w.created_at,
      case when g.state='active' and e.expires_at is not null and e.expires_at<=now() then 'expired'
        else coalesce(g.state,'inactive') end as state
    from public.weddings w left join public.dashboard_grants g on g.wedding_id=w.id
    left join public.entitlements e on e.wedding_id=w.id
    where private.is_member(w.id) order by w.created_at desc limit 100
  ) items;
$$;
revoke all on function public.workspace_overview() from public,anon;
grant execute on function public.workspace_overview() to authenticated;
commit;
