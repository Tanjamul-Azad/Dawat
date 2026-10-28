begin;
-- Duplicate hints run for each visible family, including on large guest lists.
create index households_name_match on public.households(wedding_id,lower(trim(name)),id) where not hidden;
create index households_phone_match on public.households(wedding_id,contact_phone,id) where not hidden and contact_phone is not null;
commit;
