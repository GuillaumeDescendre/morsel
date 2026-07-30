-- ============================================================
-- Morsel — default ownership columns from the verified JWT.
-- Instead of the client sending owner_id / created_by (which must then
-- match auth.uid() in the RLS WITH CHECK), let Postgres fill them from
-- the authenticated user. This removes any client/server mismatch.
-- ============================================================

alter table public.lists alter column owner_id set default auth.uid();
alter table public.meals alter column created_by set default auth.uid();
