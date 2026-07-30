-- ============================================================
-- Morsel — let a user delete their own account.
-- Deleting the auth.users row cascades to profiles, owned lists (and their
-- meals/members/share links), and this user's memberships via FKs.
-- SECURITY DEFINER so the function (owned by a privileged role) can remove
-- the auth.users row; it only ever deletes the caller (auth.uid()).
-- ============================================================

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

grant execute on function public.delete_my_account() to authenticated;
