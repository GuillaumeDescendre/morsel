-- ============================================================
-- Morsel — optional image icon for a list (falls back to emoji).
-- Icons are stored in the existing meal-photos bucket under the list's
-- folder ({list_id}/...), so the same membership storage policies apply.
-- ============================================================

alter table public.lists add column if not exists icon_path text;
