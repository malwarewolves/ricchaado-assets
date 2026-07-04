# Backend (Supabase)

The app uses [Supabase](https://supabase.com) for accounts + data sync. It's free to start
(the free tier comfortably covers tens of thousands of users) and you only pay (~$25/mo) once
you outgrow it.

## One-time setup

1. Create a project at https://supabase.com → **New project**.
2. Open **SQL Editor**, paste the contents of `migrations/0001_init.sql`, and run it.
   This creates the `profiles`, `custom_cards`, and `quiz_results` tables, Row Level Security
   policies (each user can only touch their own rows), and a trigger that creates a profile on signup.
   Then run `migrations/0002_srs.sql` the same way — it adds the `review_items` table that powers
   Smart Review (spaced repetition). The Pro flag syncs into `profiles.settings` (`{"pro": true}`),
   so it needs no extra table.
3. In **Project Settings → API**, copy the **Project URL** and the **anon public** key.
4. In the `app/` folder, create a `.env` from the template:

   ```bash
   cp .env.example .env
   # then paste your URL + anon key into .env
   ```

5. Restart the dev server. The Account tab will now offer real sign in / sign up.

## Auth notes

- Email/password is enabled by default. Email confirmation is on in new Supabase projects —
  for quick local testing you can disable it under **Authentication → Providers → Email**.
- **Sign in with Apple** is recommended/required for the App Store. Add it later under
  **Authentication → Providers → Apple** (needs an Apple Developer account + a Services ID).
  No app code change is needed beyond calling `supabase.auth.signInWithOAuth({ provider: "apple" })`.

## What's safe to commit

- ✅ `migrations/*.sql` and this README.
- ✅ The **anon** key in a client build — RLS is what protects data.
- ❌ Never commit `.env` (it's gitignored) or the **service_role** key.

## Data model

| Table          | Holds                                              |
|----------------|----------------------------------------------------|
| `profiles`     | one row per user: email, `stats` (totals + streak), `settings` |
| `custom_cards` | user-created flashcards (japanese / romaji / english) |
| `quiz_results` | one row per completed quiz, for future analytics   |
