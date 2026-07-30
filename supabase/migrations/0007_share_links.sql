-- ============================================================
-- Morsel — collaboration via shareable invite links.
-- Replaces the (unused) email-invite machinery with token links.
-- ============================================================

-- Remove the email-invite approach we're no longer using.
drop function if exists public.redeem_invites();
drop table if exists public.list_invites;

-- A secret, role-scoped link for a list. The token (uuid) is the secret.
create table if not exists public.list_share_links (
  token      uuid primary key default gen_random_uuid(),
  list_id    uuid not null references public.lists(id) on delete cascade,
  role       text not null check (role in ('editor', 'viewer')),
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now()
);

create index if not exists list_share_links_list_id_idx on public.list_share_links(list_id);

alter table public.list_share_links enable row level security;

-- Only the list owner manages links.
create policy "owners read share links"
  on public.list_share_links for select
  to authenticated using (public.list_role(list_id) = 'owner');

create policy "owners create share links"
  on public.list_share_links for insert
  to authenticated with check (public.list_role(list_id) = 'owner');

create policy "owners delete share links"
  on public.list_share_links for delete
  to authenticated using (public.list_role(list_id) = 'owner');

-- Join a list from a token. SECURITY DEFINER so the joiner never needs to
-- read the links table directly. Returns the list id (null if token invalid).
create or replace function public.join_list_via_token(_token uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  _list_id uuid;
  _role text;
begin
  select list_id, role into _list_id, _role
  from public.list_share_links
  where token = _token;

  if _list_id is null then
    return null;
  end if;

  insert into public.list_members (list_id, user_id, role)
  values (_list_id, auth.uid(), _role)
  on conflict (list_id, user_id) do nothing;

  return _list_id;
end;
$$;

grant execute on function public.join_list_via_token(uuid) to authenticated;
