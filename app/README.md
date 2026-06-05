# Ricchaado Academy リチャードアカデミー

A single-page Japanese practice app: drill **hiragana** & **katakana**, quiz yourself on a
~400-word **vocabulary bank**, build your own **custom flashcards**, and track **streaks &
progress** across devices with an optional account.

Built with React + Vite. Branding (name, logos, tagline) lives in one file — `src/lib/config.js` —
so a rebrand is a single-file change. The logos load from this repo's GitHub raw URLs.

## Features

- **Characters mode** — practice any hiragana/katakana rows (incl. dakuten/handakuten) or all of them.
- **Words mode** — categorized vocabulary, a **JP → English / English → Japanese** toggle, and a
  selectable number of questions.
- **My Cards** — add your own Japanese / romaji / English cards; quiz them.
- **Accounts + sync** *(optional)* — sign in to sync custom cards and lifetime progress across devices.
- **Streaks & stats** — daily streak, best streak, total quizzes, accuracy.

## Run locally

```bash
cd app
npm install
npm run dev        # Vite prints a http://localhost:5173 URL
```

Without a backend configured, the app runs fully in **local-only mode** (cards + progress saved in
`localStorage`). To enable accounts and cross-device sync, set up Supabase (below).

Production build:

```bash
npm run build      # outputs to app/dist
npm run preview
```

## Backend (accounts + sync)

See [`supabase/README.md`](supabase/README.md). Short version:

1. Create a free Supabase project.
2. Run `supabase/migrations/0001_init.sql` in the SQL editor.
3. `cp .env.example .env` and paste your **Project URL** + **anon key**.
4. Restart — the **Sign In** tab now creates real accounts.

The anon key is safe in a client build; **Row Level Security** isolates each user's data. Never commit
`.env` or the service_role key.

## iOS / App Store (Capacitor)

The web app wraps into a native iOS app with [Capacitor](https://capacitorjs.com) — no rewrite.
Requires a **Mac with Xcode** and an **Apple Developer account** ($99/yr).

```bash
npm run cap:add:ios     # one-time: create the native iOS project
npm run cap:sync        # build web + copy into the iOS project
npx cap open ios        # open in Xcode to run / archive / submit
```

Set the bundle id / app name in `capacitor.config.json` (update these when you rebrand).
For App Store sign-in, add **Sign in with Apple** in Supabase (see `supabase/README.md`).

## Project layout

```
app/
├── index.html
├── capacitor.config.json     # native app id / name
├── .env.example              # Supabase keys template (copy to .env)
├── supabase/
│   ├── README.md             # backend setup
│   └── migrations/0001_init.sql
└── src/
    ├── main.jsx              # mounts the app inside <AuthProvider>
    ├── App.jsx               # the app (data + UI)
    ├── components/
    │   └── AccountScreen.jsx # sign in / up / profile + lifetime stats
    └── lib/
        ├── config.js         # 🎨 branding: name, logos, tagline
        ├── supabase.js       # client (no-op if .env missing)
        ├── auth.jsx          # AuthProvider + useAuth()
        ├── useCustomCards.js # cards: cloud when signed in, else local
        └── useProgress.js    # streak + lifetime stats
```

## Provenance / cleanups

`src/App.jsx` is the consolidated latest version (formerly `ricchaadoacademynewapril.jsx`). While
combining the variants:

- Removed a duplicate `からい (karai)` entry; replaced with `しょっぱい (shoppai) — Salty`.
- Custom cards no longer require romaji: a card is correct if you type its romaji, its Japanese, or
  its English meaning.
- Logos linked to GitHub (no base64-embedded image), keeping the source small.
- Branding centralized in `src/lib/config.js` for an easy future rebrand.
