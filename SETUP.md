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

## 5. Run all migrations

Run every file in `supabase/migrations/` in order (`0001` → `0008`) in the SQL Editor if you
haven't already. `0008_delete_account.sql` powers the in-app "Delete account" option.

## 6. Deploy to Netlify (when ready)

The app is a static SPA — Netlify builds it and serves it.

1. **Push the repo to GitHub** (create a repo, then `git remote add origin …` and `git push -u origin main`).
2. In **Netlify** → **Add new site → Import from Git** → pick the repo.
3. Build settings (Netlify usually auto-detects Vite):
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. **Environment variables** (Site settings → Environment): add
   - `VITE_SUPABASE_URL` = your project URL
   - `VITE_SUPABASE_ANON_KEY` = your `sb_publishable_…` key
5. **SPA routing:** this repo includes `public/_redirects` so deep links (e.g. `/join/<token>`)
   resolve to `index.html`. No extra config needed.
6. Deploy. Note your live URL, e.g. `https://your-site.netlify.app`.

### After the first deploy — make auth work in production

- **Supabase → Authentication → URL Configuration:** set **Site URL** to your Netlify URL and add
  `https://your-site.netlify.app/**` to **Redirect URLs**.
- **Google Cloud → Clients → your OAuth client:** add `https://your-site.netlify.app` to
  **Authorized JavaScript origins**. (The redirect URI stays the Supabase callback.)
- When your Google app is still in "Testing", only accounts you've added as **Test users** can sign
  in — publish the OAuth consent screen when you're ready for anyone to use it.
