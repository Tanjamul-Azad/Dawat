begin;
alter function private.validate_content(jsonb,boolean) rename to validate_content_with_media;
create function private.validate_content(c jsonb,publishing boolean) returns void language plpgsql set search_path='' as $$
declare e jsonb; value text;
begin
  perform private.validate_content_with_media(c,publishing);
  if publishing then
    foreach value in array array[c->>'partnerOne',c->>'partnerTwo'] loop
      if value is null or value !~ '[[:alnum:]]' or value ~ '[[:cntrl:]]' then
        raise sqlstate 'PT422' using message='Add both names.';
      end if;
    end loop;
    for e in select * from jsonb_array_elements(c->'events') loop
      foreach value in array array[e->>'title',e->>'venue'] loop
        if value is null or value !~ '[[:alnum:]]' or value ~ '[[:cntrl:]]' then
          raise sqlstate 'PT422' using message='Complete the celebration title, date, time and venue.';
        end if;
      end loop;
    end loop;
  end if;
end $$;
revoke all on function private.validate_content(jsonb,boolean),private.validate_content_with_media(jsonb,boolean) from public,anon,authenticated;
alter policy staff_self on public.staff_roles using (user_id=(select auth.uid()) and (select private.verified()));
alter policy own_membership on public.wedding_memberships using ((select private.is_staff()) or (user_id=(select auth.uid()) and (select private.verified())));
commit;
