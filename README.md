# 🍽️ Morsel

Remember every meal you've tried — rate it, note it, photograph it, and share lists with the
people you cook with.

A mobile-first, installable PWA built with **React + Vite + TypeScript + Tailwind**, backed by
**Supabase** (Postgres + Auth + Storage) and deployable to **Netlify**.

## Features

- **Google sign-in** (Supabase Auth)
- **Multiple meal lists**, create / rename / delete
- **Meals** with a recipe link, free-text notes, tags, and a photo (auto-compressed on upload)
- **Ratings** — taste / ease / digestion (1–10) with an automatic global score
- **Collaboration** via shareable invite links (editor / viewer roles)
- **Search, tag filters, and sorting** within a list
- **Row Level Security** on every table — you only see lists you own or were invited to
- **PWA** — installs to your phone home screen, works offline for the app shell
- Privacy Policy, Terms, and a self-service **delete account** flow

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase URL + publishable key
npm run dev
```

## Setup & deployment

See [SETUP.md](SETUP.md) for creating the Supabase project, running the SQL migrations
(`supabase/migrations/`), configuring Google OAuth, and deploying to Netlify.

## Project structure

- `src/pages/` — routed screens (login, lists, list detail, join, legal)
- `src/components/` — UI kit, modals, meal/list cards, rating sliders
- `src/lib/` — Supabase client, auth context, and data access (lists, meals, collab, account)
- `supabase/migrations/` — schema, RLS policies, storage, and functions
