# Ricchaado Academy リチャードアカデミー

A single-page Japanese practice app: drill **hiragana** & **katakana**, quiz yourself on a
~400-word **vocabulary bank**, and build your own **custom flashcards**.

Built with React + Vite. The brand logos are loaded from this repo via GitHub raw URLs, so the
app stays in sync with `RA-Logo-transparent.png` / `RA-Logo-transparent-icon.png` at the repo root.

## Features

- **Characters mode** — practice any hiragana/katakana rows (incl. dakuten/handakuten), or all of them.
- **Words mode** — categorized vocabulary, with a **JP → English** / **English → Japanese** direction
  toggle and a selectable number of questions.
- **My Cards** — add your own Japanese / romaji / English cards (saved in `localStorage`), then quiz them.
- Instant feedback, score, grade, and chibi mascots — all self-contained (inline CSS + SVG).

## Run locally

```bash
cd app
npm install
npm run dev        # start the dev server (Vite prints the local URL)
```

Then open the printed `http://localhost:5173` URL.

To produce a static production build:

```bash
npm run build      # outputs to app/dist
npm run preview    # serve the built app locally
```

## Project layout

```
app/
├── index.html        # Vite entry; sets favicon from the GitHub-hosted icon
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx      # mounts <RicchaadoAcademy /> into #root
    └── App.jsx       # the whole app (data + UI) in one component
```

## Provenance

`src/App.jsx` is the consolidated, latest version (formerly `ricchaadoacademynewapril.jsx`).
Cleanups applied while combining the variants:

- Removed a duplicate `からい (karai)` vocabulary entry; replaced it with `しょっぱい (shoppai) — Salty`.
- Custom flashcards no longer require a romaji value: a card is marked correct if you type its
  romaji **or** its Japanese **or** its English meaning.
- The logos are linked to GitHub (no base64-embedded image), keeping the source small.
