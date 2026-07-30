# Morsel — setup guide

External accounts you'll need: **Supabase** (database + auth + storage) and **Netlify** (hosting).
Steps that require entering passwords or credentials are done by you — I'll never do those.

## 1. Create the Supabase project

1. Go to <https://supabase.com> → sign in → **New project**.
2. Name it `morsel` (anything works), pick a region close to you, set a strong database password (save it in your password manager).
3. Wait ~2 minutes for it to provision.

## 2. Run the database migrations

1. In the project, open **SQL Editor** (left sidebar).
2. Open `supabase/migrations/0001_init.sql` from this repo, paste the whole thing, click **Run**.
3. Do the same with `supabase/migrations/0002_storage.sql`.
4. You should see "Success. No rows returned" for both.

## 3. Get your API keys into the app

1. In Supabase: **Project Settings → API**.
2. Copy the **Project URL** and the **anon / public** key.
3. In this repo, create a file `.env.local` (copy from `.env.example`) and fill them in:

   ```
   VITE_SUPABASE_URL=https://YOUR-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

   The anon key is safe to expose in a browser app — security is enforced by the Row Level Security
   policies from step 2, not by hiding this key.

## 4. Google sign-in (done in Phase 2)

We'll set this up together when we build auth: create Google OAuth credentials, paste them into
Supabase **Authentication → Providers → Google**, and add the redirect URL. I'll walk you through it.

## 5. Netlify deploy (done in Phase 8)

Connect the git repo to Netlify, add the same two env vars, deploy. Details later.
