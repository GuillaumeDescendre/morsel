-- ============================================================
-- Morsel — explicit role grants
-- Postgres checks table/function GRANTs *before* RLS. Supabase normally
-- grants these to anon/authenticated automatically, but make it explicit
-- so the authenticated role can reach the tables (RLS still does the gating).
-- ============================================================

grant usage on schema public to anon, authenticated;

-- Reads for anon (RLS returns nothing unless a policy allows it);
-- full DML for authenticated (again, RLS decides what each user may touch).
grant select on all tables in schema public to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;

grant execute on all functions in schema public to anon, authenticated;

-- Apply the same to anything created later.
alter default privileges in schema public
  grant select on tables to anon;
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant execute on functions to anon, authenticated;
