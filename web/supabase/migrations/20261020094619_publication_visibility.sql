begin;
create function public.set_invitation_visibility(p_wedding_id uuid,p_revision integer,p_live boolean,p_key uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare w public.weddings; previous private.commands; b jsonb; result jsonb;
begin
  if not private.can_manage(p_wedding_id) then raise sqlstate 'PT404' using message='Workspace unavailable.';end if;
  if p_key is null or p_live is null or p_revision is null or p_revision<0 then raise sqlstate 'PT422' using message='Invalid visibility request.';end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text||p_key::text,0));
  perform private.lock_management(p_wedding_id);
  b:=jsonb_build_object('kind','visibility','weddingId',p_wedding_id,'revision',p_revision,'live',p_live);
  select * into previous from private.commands where actor_id=auth.uid() and key=p_key;
  if found then
    if previous.body<>b then raise sqlstate 'PT409' using message='Retry key conflict.';end if;
    return previous.result;
  end if;
  select * into w from public.weddings where id=p_wedding_id;
  if w.publication_revision<>p_revision then raise sqlstate 'PT409' using message='Publication changed. Refresh and review.';end if;
  if w.live_version_id is null then raise sqlstate 'PT409' using message='Publish the invitation before changing visibility.';end if;
  if w.visibility<>(case when p_live then 'live' else 'paused' end) then
    update public.weddings set visibility=case when p_live then 'live' else 'paused' end,publication_revision=publication_revision+1
      where id=p_wedding_id returning * into w;
    insert into public.audit_events(wedding_id,actor_id,action) values(p_wedding_id,auth.uid(),case when p_live then 'publication.resume' else 'publication.pause' end);
  end if;
  result:=jsonb_build_object('visibility',w.visibility,'publicationRevision',w.publication_revision);
  insert into private.commands values(auth.uid(),p_key,b,result);
  return result;
end $$;
revoke all on function public.set_invitation_visibility(uuid,integer,boolean,uuid) from public,anon;
grant execute on function public.set_invitation_visibility(uuid,integer,boolean,uuid) to authenticated;
commit;
