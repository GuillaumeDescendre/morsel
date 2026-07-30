-- ============================================================
-- Morsel — fix INSERT ... RETURNING on lists.
-- An insert with RETURNING also applies the SELECT (USING) policy to the new
-- row. Owner membership is added by an AFTER-INSERT trigger, so it isn't
-- visible yet at that moment and the read-back fails ("new row violates RLS").
-- Letting the SELECT policy recognise the owner directly makes a freshly
-- created list immediately readable.
-- ============================================================

alter policy "read lists you belong to" on public.lists
  using (owner_id = auth.uid() or public.is_list_member(id));
