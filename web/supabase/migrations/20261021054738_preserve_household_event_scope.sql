begin;
-- save_household and publish_invitation share the wedding management lock, so a
-- concurrent scope assignment cannot race this publication check.
create function private.publication_household_guard() returns trigger
language plpgsql set search_path='' as $$
declare c jsonb;
begin
  if new.live_version_id is distinct from old.live_version_id then
    select content into c from public.invitation_versions
      where wedding_id=new.id and id=new.live_version_id;
    if exists(
      select 1 from public.household_events he where he.wedding_id=new.id
      and not exists(select 1 from jsonb_array_elements(c->'events') e where e->>'id'=he.event_id)
    ) then
      raise sqlstate 'PT409' using message='An event with invited households cannot be removed. Update their invitation scopes first.';
    end if;
  end if;
  return new;
end $$;
revoke all on function private.publication_household_guard() from public,anon,authenticated;
create trigger publication_household_guard before update of live_version_id on public.weddings
  for each row execute function private.publication_household_guard();
commit;
