-- ============================================================
-- Morsel — initial schema + Row Level Security
-- Run this in the Supabase SQL editor (or via the CLI).
-- ============================================================

-- ---------- Tables ----------

create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url   text,
  created_at   timestamptz not null default now()
);

create table if not exists public.lists (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 1 and 80),
  emoji      text,
  owner_id   uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.list_members (
  list_id    uuid not null references public.lists(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       text not null check (role in ('owner', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (list_id, user_id)
);

create table if not exists public.list_invites (
  id         uuid primary key default gen_random_uuid(),
  list_id    uuid not null references public.lists(id) on delete cascade,
  email      text not null,
  role       text not null check (role in ('editor', 'viewer')),
  invited_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (list_id, email)
);

create table if not exists public.meals (
  id         uuid primary key default gen_random_uuid(),
  list_id    uuid not null references public.lists(id) on delete cascade,
  title      text not null check (char_length(title) between 1 and 160),
  source_url text,
  notes      text,
  photo_path text,
  tags       text[] not null default '{}',
  created_by uuid not null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  -- Shared rating (one per meal), each 1..10
  taste     smallint check (taste between 1 and 10),
  ease      smallint check (ease between 1 and 10),
  digestion smallint check (digestion between 1 and 10),
  rated_by  uuid references auth.users(id) on delete set null,
  rated_at  timestamptz
);

create index if not exists meals_list_id_idx on public.meals(list_id);
create index if not exists list_members_user_id_idx on public.list_members(user_id);
create index if not exists list_invites_email_idx on public.list_invites(lower(email));

-- ---------- Helper functions (SECURITY DEFINER = bypass RLS, avoids recursion) ----------

-- True if the current user belongs to the list (owner counts, since owners are members too).
create or replace function public.is_list_member(_list_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.list_members m
    where m.list_id = _list_id and m.user_id = auth.uid()
  );
$$;

-- The current user's role on a list, or null if not a member.
create or replace function public.list_role(_list_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.list_members
  where list_id = _list_id and user_id = auth.uid()
  limit 1;
$$;

-- ---------- Triggers ----------

-- Every new list gets its owner as an 'owner' member row.
create or replace function public.handle_new_list()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.list_members (list_id, user_id, role)
  values (new.id, new.owner_id, 'owner');
  return new;
end;
$$;

drop trigger if exists on_list_created on public.lists;
create trigger on_list_created
  after insert on public.lists
  for each row execute function public.handle_new_list();

-- Auto-create a profile whenever a new auth user signs up (pulls name/avatar from Google).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Turn any invites matching the caller's email into memberships. Called client-side after login.
create or replace function public.redeem_invites()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  _email text := lower(auth.jwt() ->> 'email');
  _count integer := 0;
begin
  if _email is null then
    return 0;
  end if;

  with moved as (
    insert into public.list_members (list_id, user_id, role)
    select i.list_id, auth.uid(), i.role
    from public.list_invites i
    where lower(i.email) = _email
    on conflict (list_id, user_id) do nothing
    returning list_id
  )
  select count(*) into _count from moved;

  delete from public.list_invites i where lower(i.email) = _email;
  return _count;
end;
$$;

grant execute on function public.redeem_invites() to authenticated;

-- ---------- Row Level Security ----------

alter table public.profiles     enable row level security;
alter table public.lists        enable row level security;
alter table public.list_members enable row level security;
alter table public.list_invites enable row level security;
alter table public.meals        enable row level security;

-- profiles: any signed-in user can read basic profiles (needed to show collaborator names);
-- you can only create/edit your own.
create policy "profiles are readable by authenticated"
  on public.profiles for select
  to authenticated using (true);

create policy "insert own profile"
  on public.profiles for insert
  to authenticated with check (id = auth.uid());

create policy "update own profile"
  on public.profiles for update
  to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- lists: members can read; anyone can create a list they own; owners/editors rename; owners delete.
create policy "read lists you belong to"
  on public.lists for select
  to authenticated using (public.is_list_member(id));

create policy "create your own list"
  on public.lists for insert
  to authenticated with check (owner_id = auth.uid());

create policy "owners and editors update lists"
  on public.lists for update
  to authenticated using (public.list_role(id) in ('owner', 'editor'));

create policy "owners delete lists"
  on public.lists for delete
  to authenticated using (public.list_role(id) = 'owner');

-- list_members: members see co-members; owners manage; anyone can remove themselves (leave).
create policy "read members of your lists"
  on public.list_members for select
  to authenticated using (public.is_list_member(list_id));

create policy "owners add members"
  on public.list_members for insert
  to authenticated with check (public.list_role(list_id) = 'owner');

create policy "owners update member roles"
  on public.list_members for update
  to authenticated using (public.list_role(list_id) = 'owner');

create policy "owners remove members or leave yourself"
  on public.list_members for delete
  to authenticated using (
    public.list_role(list_id) = 'owner' or user_id = auth.uid()
  );

-- list_invites: list owners manage; an invitee can see invites addressed to their email.
create policy "owners and invitees read invites"
  on public.list_invites for select
  to authenticated using (
    public.list_role(list_id) = 'owner'
    or lower(email) = lower(auth.jwt() ->> 'email')
  );

create policy "owners create invites"
  on public.list_invites for insert
  to authenticated with check (
    public.list_role(list_id) = 'owner' and invited_by = auth.uid()
  );

create policy "owners or invitee delete invites"
  on public.list_invites for delete
  to authenticated using (
    public.list_role(list_id) = 'owner'
    or lower(email) = lower(auth.jwt() ->> 'email')
  );

-- meals: members read; owners/editors write (this also governs the shared rating). Viewers are read-only.
create policy "read meals in your lists"
  on public.meals for select
  to authenticated using (public.is_list_member(list_id));

create policy "owners and editors add meals"
  on public.meals for insert
  to authenticated with check (
    public.list_role(list_id) in ('owner', 'editor') and created_by = auth.uid()
  );

create policy "owners and editors update meals"
  on public.meals for update
  to authenticated using (public.list_role(list_id) in ('owner', 'editor'));

create policy "owners and editors delete meals"
  on public.meals for delete
  to authenticated using (public.list_role(list_id) in ('owner', 'editor'));
