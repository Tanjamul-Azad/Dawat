begin;
-- The approved 30-day phone retention also covers saved household retry payloads.
create function private.purge_expired_guest_contacts() returns integer
language plpgsql security definer set search_path='' as $$
declare removed integer;
begin
 update public.households h set contact_phone=null
 from public.entitlements e where e.wedding_id=h.wedding_id and e.expires_at<now()-interval '30 days' and h.contact_phone is not null;
 get diagnostics removed = row_count;
 update private.commands c set body=c.body #- '{input,contactPhone}'
 from public.entitlements e where c.body->>'wedding'=e.wedding_id::text and e.expires_at<now()-interval '30 days' and (c.body->'input') ? 'contactPhone';
 return removed;
end $$;
revoke all on function private.purge_expired_guest_contacts() from public,anon,authenticated;
-- Schedule in the database; no browser endpoint or externally configured worker.
create extension if not exists pg_cron with schema pg_catalog;
select cron.schedule('dawat-guest-contact-retention','17 2 * * *','select private.purge_expired_guest_contacts()');
commit;
