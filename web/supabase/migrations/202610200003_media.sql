begin;
-- Objects are never public and have no anonymous/authenticated Storage policies.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('wedding-media','wedding-media',false,10485760,array['image/webp'])
on conflict(id) do update set public=false,file_size_limit=10485760,allowed_mime_types=array['image/webp'];
create policy dawat_media_private on storage.objects as restrictive for all to anon,authenticated
using(bucket_id<>'wedding-media') with check(bucket_id<>'wedding-media');

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id),
  created_by uuid not null references auth.users(id),
  upload_key uuid not null,
  state text not null default 'reserved' check(state in ('reserved','processing','ready','rejected')),
  error_code text,
  width integer, height integer, bytes integer,
  created_at timestamptz not null default clock_timestamp(),
  expires_at timestamptz not null default clock_timestamp()+interval '30 minutes',
  removed_at timestamptz,
  unique(wedding_id,id), unique(created_by,upload_key)
);
create index media_wedding_state on public.media_assets(wedding_id,state,removed_at);
create table private.media_processing (
  wedding_id uuid not null,
  asset_id uuid primary key,
  lease uuid,
  lease_until timestamptz,
  attempt integer not null default 0,
  content_hash text,
  objects jsonb,
  foreign key(wedding_id,asset_id) references public.media_assets(wedding_id,id)
);
create table public.publication_media (
  wedding_id uuid not null,
  version_id uuid not null,
  asset_id uuid not null,
  primary key(wedding_id,version_id,asset_id),
  foreign key(wedding_id,version_id) references public.invitation_versions(wedding_id,id),
  foreign key(wedding_id,asset_id) references public.media_assets(wedding_id,id)
);
create table private.media_attempts (
  asset_id uuid not null references public.media_assets(id),
  lease uuid primary key,
  prefix text not null,
  created_at timestamptz not null default clock_timestamp(),
  deleted_at timestamptz
);
alter table public.media_assets enable row level security;
alter table public.publication_media enable row level security;
revoke all on public.media_assets,public.publication_media from anon,authenticated;
grant select on public.media_assets,public.publication_media to authenticated;
create policy media_owner on public.media_assets for select to authenticated using(private.can_manage(wedding_id));
create policy publication_media_owner on public.publication_media for select to authenticated using(private.can_manage(wedding_id));
revoke all on private.media_processing,private.media_attempts from public,anon,authenticated;

alter function private.validate_content(jsonb,boolean) rename to validate_content_before_media;
create function private.validate_content(c jsonb,publishing boolean) returns void language plpgsql set search_path='' as $$
declare p jsonb; k text; ids text[]:='{}';
begin
  perform private.validate_content_before_media(jsonb_set(c,'{photos}','[]'),publishing);
  if jsonb_typeof(c->'photos') is distinct from 'array' or jsonb_array_length(c->'photos')>5 then
    raise sqlstate 'PT422' using message='Choose at most five processed photos.';
  end if;
  for p in select value from jsonb_array_elements(c->'photos') loop
    if jsonb_typeof(p)<>'object' or not p ?& array['id','src','alt'] or coalesce(p->>'id','') !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$'
      or p->>'id'=any(ids) or p->>'src' is distinct from '/media/'||(p->>'id')||'/960/' then
      raise sqlstate 'PT422' using message='Use distinct, processed photo references; direct uploads and external URLs are not allowed.';
    end if;
    ids:=array_append(ids,p->>'id');
    for k in select jsonb_object_keys(p) loop
      if k not in ('id','src','alt','altBn','position') or jsonb_typeof(p->k)<>'string' then raise sqlstate 'PT422' using message='Invalid photo field.'; end if;
    end loop;
    if length(p->>'alt')>300 or length(coalesce(p->>'altBn',''))>300 or (p ? 'position' and p->>'position' not in ('top','center','bottom')) then
      raise sqlstate 'PT422' using message='Invalid photo caption or crop position.';
    end if;
  end loop;
end $$;
create function private.check_media_refs() returns trigger language plpgsql security definer set search_path='' as $$
declare p jsonb;
begin
  for p in select value from jsonb_array_elements(coalesce(new.content->'photos','[]')) loop
    if not exists(select 1 from public.media_assets where wedding_id=new.wedding_id and id=(p->>'id')::uuid and state='ready' and removed_at is null) then
      raise sqlstate 'PT422' using message='A photo is unavailable, unprocessed or belongs to another wedding. Refresh your photo library.';
    end if;
  end loop;
  return new;
end $$;
create trigger draft_media_refs before insert or update of content on public.invitation_drafts for each row execute function private.check_media_refs();
create trigger version_media_refs before insert on public.invitation_versions for each row execute function private.check_media_refs();
create function private.pin_publication_media() returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.publication_media(wedding_id,version_id,asset_id)
  select new.wedding_id,new.id,(value->>'id')::uuid from jsonb_array_elements(new.content->'photos');
  return new;
end $$;
create trigger pin_publication_media after insert on public.invitation_versions for each row execute function private.pin_publication_media();

create function public.reserve_media(p_wedding_id uuid,p_key uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare a public.media_assets;
begin
  perform private.lock_management(p_wedding_id);
  if p_key is null then raise sqlstate 'PT422' using message='A retry key is required.'; end if;
  select * into a from public.media_assets where created_by=auth.uid() and upload_key=p_key;
  if found then
    if a.wedding_id<>p_wedding_id then raise sqlstate 'PT409' using message='Upload retry key conflict.'; end if;
    return to_jsonb(a);
  end if;
  if (select count(*) from public.media_assets where wedding_id=p_wedding_id and removed_at is null
    and (state='ready' or (state in ('reserved','processing') and expires_at>clock_timestamp())))>=5 then
    raise sqlstate 'PT409' using message='Five photo slots are already occupied. Remove an unused photo or cancel an unfinished upload first.';
  end if;
  if (select count(*) from public.media_assets where wedding_id=p_wedding_id and created_at>clock_timestamp()-interval '24 hours')>=30
    or (select count(*) from public.media_assets where wedding_id=p_wedding_id and state='ready')>=50 then
    raise sqlstate 'PT429' using message='Photo storage or daily upload allowance reached. Please contact support.';
  end if;
  insert into public.media_assets(wedding_id,created_by,upload_key) values(p_wedding_id,auth.uid(),p_key) returning * into a;
  insert into private.media_processing(wedding_id,asset_id) values(p_wedding_id,a.id);
  return to_jsonb(a);
end $$;

-- Only the trusted server processor can lease/complete uploads, never a browser JWT.
create function public.process_media(p_wedding_id uuid,p_asset_id uuid,p_actor uuid,p_lease uuid,p_kind text,p_data jsonb default '{}') returns jsonb
language plpgsql security definer set search_path='' as $$
declare a public.media_assets; j private.media_processing; original_claims text; o jsonb;
begin
  if coalesce(auth.jwt()->>'role','')<>'service_role' then raise sqlstate 'PT403' using message='Trusted media processor required.'; end if;
  -- Reuse the complete owner gate, including verified identity, grant and term, at commit time.
  original_claims:=current_setting('request.jwt.claims',true);
  perform set_config('request.jwt.claims',jsonb_build_object('sub',p_actor,'aal','aal1','role','authenticated')::text,true);
  perform private.lock_management(p_wedding_id);
  perform set_config('request.jwt.claims',original_claims,true);
  select * into a from public.media_assets where wedding_id=p_wedding_id and id=p_asset_id for update;
  if not found or a.removed_at is not null or a.created_by<>p_actor then raise sqlstate 'PT404' using message='Photo unavailable.'; end if;
  select * into j from private.media_processing where asset_id=a.id for update;
  if p_kind='begin' then
    if a.state='ready' then return jsonb_build_object('ready',true); end if;
    if a.state='rejected' or a.expires_at<clock_timestamp() then raise sqlstate 'PT409' using message='This upload expired or was rejected. Choose the file again.'; end if;
    if j.lease_until>clock_timestamp() then raise sqlstate 'PT409' using message='This photo is still processing. Please wait before retrying.'; end if;
    if p_data ? 'hash' and j.content_hash is not null and j.content_hash is distinct from p_data->>'hash' then raise sqlstate 'PT409' using message='Use the same file when retrying this upload.'; end if;
    if (p_data ? 'hash' and coalesce(p_data->>'hash','') !~ '^[a-f0-9]{64}$') or p_lease is null then raise sqlstate 'PT422' using message='Invalid upload fingerprint.'; end if;
    perform pg_advisory_xact_lock(hashtextextended('dawat:media:processing',0));
    if (select count(*) from private.media_processing where lease_until>clock_timestamp())>=4 then raise sqlstate 'PT429' using message='Photo processing is busy. Retry shortly.'; end if;
    if j.attempt>=4 then raise sqlstate 'PT409' using message='Upload retry limit reached. Cancel and choose the file again.'; end if;
    update private.media_processing set lease=p_lease,lease_until=clock_timestamp()+interval '2 minutes',attempt=attempt+1,content_hash=coalesce(content_hash,p_data->>'hash') where asset_id=a.id;
    insert into private.media_attempts(asset_id,lease,prefix) values(a.id,p_lease,p_wedding_id::text||'/'||a.id::text||'/'||p_lease::text);
    update public.media_assets set state='processing',error_code=null where id=a.id;
    return jsonb_build_object('ready',false,'prefix',p_wedding_id::text||'/'||a.id::text||'/'||p_lease::text);
  end if;
  if j.lease is distinct from p_lease or j.lease_until<clock_timestamp() or a.state<>'processing' then raise sqlstate 'PT409' using message='Processing lease expired. Retry the upload.'; end if;
  if p_kind='fingerprint' then
    if coalesce(p_data->>'hash','') !~ '^[a-f0-9]{64}$' then raise sqlstate 'PT422' using message='Invalid upload fingerprint.'; end if;
    if j.content_hash is not null and j.content_hash is distinct from p_data->>'hash' then raise sqlstate 'PT409' using message='Use the same file when retrying this upload.'; end if;
    update private.media_processing set content_hash=p_data->>'hash' where asset_id=a.id;
    return jsonb_build_object('verified',true);
  end if;
  if p_kind='fail' then
    update public.media_assets set state=case when p_data->>'retryable'='true' then 'reserved' else 'rejected' end,error_code=case when p_data->>'retryable'='true' then 'RETRY_UPLOAD' else 'INVALID_IMAGE' end where id=a.id;
    update private.media_processing set lease_until=null where asset_id=a.id;
    return jsonb_build_object('retryable',p_data->>'retryable'='true');
  end if;
  if p_kind is distinct from 'complete' or coalesce((p_data->>'width')::integer,0) not between 1 and 1600 or coalesce((p_data->>'height')::integer,0) not between 1 and 1600
    or coalesce((p_data->>'bytes')::integer,0) not between 1 and 10485760 or jsonb_typeof(p_data->'objects') is distinct from 'object' then raise sqlstate 'PT422' using message='Invalid processed image result.'; end if;
  for o in select jsonb_build_object('key',key,'value',value) from jsonb_each(p_data->'objects') loop
    if (o->'value'->>'path') is distinct from p_wedding_id::text||'/'||a.id::text||'/'||p_lease::text||'/'||(o->>'key')||'.webp'
      or coalesce((o->'value'->>'bytes')::integer,0)<=0 or coalesce(o->'value'->>'hash','') !~ '^[a-f0-9]{64}$'
      or not exists(select 1 from storage.objects where bucket_id='wedding-media' and name=o->'value'->>'path') then raise sqlstate 'PT422' using message='Invalid or missing processed object.'; end if;
  end loop;
  if not (p_data->'objects') ?& array['480','960','1600'] or (select count(*) from jsonb_object_keys(p_data->'objects'))<>3 then raise sqlstate 'PT422' using message='Missing responsive images.'; end if;
  update private.media_processing set objects=p_data->'objects',lease_until=null where asset_id=a.id;
  update public.media_assets set state='ready',width=(p_data->>'width')::integer,height=(p_data->>'height')::integer,bytes=(p_data->>'bytes')::integer,error_code=null where id=a.id returning * into a;
  return to_jsonb(a);
end $$;

create function public.remove_media(p_wedding_id uuid,p_asset_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare a public.media_assets;
begin
  perform private.lock_management(p_wedding_id);
  select * into a from public.media_assets where wedding_id=p_wedding_id and id=p_asset_id for update;
  if not found then raise sqlstate 'PT404' using message='Photo unavailable.'; end if;
  if exists(select 1 from public.invitation_drafts d,jsonb_array_elements(coalesce(d.content->'photos','[]')) p where d.wedding_id=p_wedding_id and p->>'id'=a.id::text) then
    raise sqlstate 'PT409' using message='Remove this photo from the draft and save before removing it from your library.';
  end if;
  update public.media_assets set removed_at=coalesce(removed_at,clock_timestamp()) where id=a.id;
end $$;

create function public.resolve_media(p_asset_id uuid,p_size text,p_wedding_id uuid default null,p_slug uuid default null,p_household_id uuid default null,p_session_digest text default null) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare wid uuid; version uuid; c jsonb; o jsonb; h public.households;
begin
  if p_size not in ('480','960','1600') then raise sqlstate 'PT404' using message='Photo unavailable.'; end if;
  if p_wedding_id is not null then
    if not private.can_manage(p_wedding_id) then raise sqlstate 'PT404' using message='Photo unavailable.'; end if;
    wid:=p_wedding_id;
  else
    if p_household_id is not null then
      h:=private.guest_scope(p_slug,p_household_id,p_session_digest);
      wid:=h.wedding_id;
    else
      perform public.resolve_general_invitation(p_slug);
      select id into wid from public.weddings where slug=p_slug;
    end if;
    select live_version_id into version from public.weddings where id=wid;
    if not exists(select 1 from public.publication_media where wedding_id=wid and version_id=version and asset_id=p_asset_id) then raise sqlstate 'PT404' using message='Photo unavailable.'; end if;
  end if;
  select mp.objects->p_size into o from public.media_assets a join private.media_processing mp on mp.asset_id=a.id
    where a.wedding_id=wid and a.id=p_asset_id and a.state='ready' and (p_wedding_id is null or a.removed_at is null);
  if o is null then raise sqlstate 'PT404' using message='Photo unavailable.'; end if;
  return o;
end $$;

create function public.media_cleanup_batch(p_done uuid default null) returns jsonb language plpgsql security definer set search_path='' as $$
begin
  if coalesce(auth.jwt()->>'role','')<>'service_role' then raise sqlstate 'PT403' using message='Trusted media processor required.'; end if;
  if p_done is not null then update private.media_attempts set deleted_at=clock_timestamp() where lease=p_done; return '[]'::jsonb; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('lease',t.lease,'prefix',t.prefix)) from (
    select ma.* from private.media_attempts ma join public.media_assets a on a.id=ma.asset_id
    join private.media_processing mp on mp.asset_id=a.id
    where ma.deleted_at is null and ma.created_at<clock_timestamp()-interval '24 hours'
      and (ma.lease is distinct from mp.lease or
        ((a.state<>'ready' and a.expires_at<clock_timestamp()) or
          (a.removed_at is not null and not exists(select 1 from public.publication_media pm where pm.asset_id=a.id))))
      and not (coalesce(mp.lease_until>clock_timestamp(),false) and mp.lease=ma.lease)
    order by ma.created_at limit 25
  ) t),'[]'::jsonb);
end $$;

revoke all on function public.reserve_media(uuid,uuid),public.remove_media(uuid,uuid) from public,anon;
grant execute on function public.reserve_media(uuid,uuid),public.remove_media(uuid,uuid) to authenticated;
revoke all on function public.process_media(uuid,uuid,uuid,uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.process_media(uuid,uuid,uuid,uuid,text,jsonb) to service_role;
revoke all on function public.media_cleanup_batch(uuid) from public,anon,authenticated;
grant execute on function public.media_cleanup_batch(uuid) to service_role;
revoke all on function public.resolve_media(uuid,text,uuid,uuid,uuid,text) from public;
grant execute on function public.resolve_media(uuid,text,uuid,uuid,uuid,text) to anon,authenticated;
revoke all on function private.validate_content(jsonb,boolean),private.check_media_refs(),private.pin_publication_media() from public,anon,authenticated;
commit;
