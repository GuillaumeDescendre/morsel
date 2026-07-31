-- ============================================================
-- Morsel — per-list rating configuration.
-- rating_enabled: whether meals in this list are rated at all.
-- rating_dims: which dimensions are used (subset of taste/ease/digestion).
-- ============================================================

alter table public.lists
  add column if not exists rating_enabled boolean not null default true;

alter table public.lists
  add column if not exists rating_dims text[] not null
  default array['taste', 'ease', 'digestion'];
