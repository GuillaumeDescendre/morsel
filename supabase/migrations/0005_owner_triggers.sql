-- ============================================================
-- Morsel — force ownership columns via BEFORE INSERT triggers.
-- Column defaults of auth.uid() were not being applied on insert in this
-- project, leaving owner_id/created_by NULL and failing the RLS WITH CHECK.
-- A trigger runs unconditionally and is the reliable way to stamp the owner.
-- ============================================================

create or replace function public.set_list_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.owner_id is null then
    new.owner_id := auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists set_owner_before_insert on public.lists;
create trigger set_owner_before_insert
  before insert on public.lists
  for each row execute function public.set_list_owner();

create or replace function public.set_meal_creator()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.created_by is null then
    new.created_by := auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists set_creator_before_insert on public.meals;
create trigger set_creator_before_insert
  before insert on public.meals
  for each row execute function public.set_meal_creator();
