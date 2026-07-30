-- ============================================================
-- Morsel — private Storage bucket for meal photos
-- Path convention: {list_id}/{meal_id}/{filename}
-- The first path segment is the list id, so we reuse the same
-- membership helpers for access control. Files are served via
-- short-lived signed URLs generated on the client.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('meal-photos', 'meal-photos', false)
on conflict (id) do nothing;

-- Read a photo if you belong to the list in its path.
create policy "members read meal photos"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'meal-photos'
    and public.is_list_member(((storage.foldername(name))[1])::uuid)
  );

-- Upload if you can edit the list.
create policy "editors upload meal photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'meal-photos'
    and public.list_role(((storage.foldername(name))[1])::uuid) in ('owner', 'editor')
  );

-- Replace / delete photos if you can edit the list.
create policy "editors update meal photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'meal-photos'
    and public.list_role(((storage.foldername(name))[1])::uuid) in ('owner', 'editor')
  );

create policy "editors delete meal photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'meal-photos'
    and public.list_role(((storage.foldername(name))[1])::uuid) in ('owner', 'editor')
  );
