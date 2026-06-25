# Keiro — new-machine setup & handoff

Everything needed to continue development on another computer. All source is in this
repo; the items below are the machine-specific pieces that are **not** committed and
must be recreated locally.

## Branches
- **`claude/keiro-redesign`** — latest work: Keiro rebrand, vibrant redesign, mascots removed.
- **`main`** — stable app: consolidated quiz app + accounts/sync + voice (TTS + speak-to-check) + iOS fixes.

Pick up where we left off on `claude/keiro-redesign`.

## What is NOT in git (recreate on the new machine)
- `node_modules/` → `npm install`
- `ios/` native project → `npm run cap:add:ios` (generated, gitignored)
- `.env` (Supabase keys) → optional; copy from `.env.example` (see below)
- Xcode signing (tied to your Apple ID) → set in Xcode each machine
- Info.plist permission strings + the "User Script Sandboxing = No" setting → live inside the
  generated `ios/` project, so they must be re-applied after `cap add ios` (steps below)

## Prerequisites (macOS)
```bash
xcode-select --install          # Xcode command-line tools
# Install Xcode from the Mac App Store as well (needed to build/run on device)
brew install cocoapods          # NOT `sudo gem install` — system Ruby 2.6 is too old
# Node 18+ (nvm or brew). Verify: node -v
```

## First-time setup
```bash
git clone https://github.com/malwarewolves/ricchaado-assets.git
cd ricchaado-assets
git checkout claude/keiro-redesign
cd app
npm install
npm run dev        # web preview at http://localhost:5173 (everything except the 🎤 mic)
```

## Build to an iPhone (for speak-to-check 🎤)
```bash
npm run build
npm run cap:add:ios      # one-time, creates ios/

# Required mic + speech permission strings (app crashes / is rejected without them):
/usr/libexec/PlistBuddy -c "Add :NSMicrophoneUsageDescription string 'Practice speaking Japanese aloud.'" ios/App/App/Info.plist
/usr/libexec/PlistBuddy -c "Add :NSSpeechRecognitionUsageDescription string 'Check the Japanese words you say.'" ios/App/App/Info.plist

npm run cap:sync
npx cap open ios
```
In Xcode:
1. **Build Settings → search "sandbox" → User Script Sandboxing → No**
   (otherwise the CocoaPods build phase fails with `Sandbox: bash deny(1) file-read-data`).
2. **Signing & Capabilities** → Automatically manage signing → pick your **Team** (Apple ID).
   Bundle id used so far: `com.ricchaado.academy` (change freely).
3. Plug in iPhone, select it as the destination, **⌘R**. First launch: on the phone,
   Settings → General → VPN & Device Management → trust the developer, then open the app.

## Day-to-day workflow (important)
After pulling new commits or switching branches, ALWAYS:
```bash
git pull
npm install            # in case dependencies changed
npm run cap:sync       # rebuild web + copy into ios/
```
Then in Xcode **⇧⌘K** (Clean Build Folder) → **⌘R**.
If the app looks unchanged after a rebuild, you're usually on the wrong branch or skipped
`cap:sync`; verify with `git log --oneline -1`.

## Accounts / cloud sync (optional)
The app runs fully without a backend (local storage). To enable accounts + sync:
```bash
cp .env.example .env   # then paste your Supabase URL + anon key
```
Run the SQL in `supabase/migrations/0001_init.sql` in your Supabase project. Full notes in
`supabase/README.md`. **Never commit `.env` or the service_role key.**

## Branding
All brand strings (name "Keiro", kana, tagline, course label, logo/icon URLs) live in
`src/lib/config.js`. The in-app wordmark is text. The iOS **app icon** is separate art —
swap it in Xcode's AppIcon set / `iconUrl` when new art is ready.

## Known gotchas we already solved
- **CocoaPods install fails on `ffi`/Ruby 2.6** → use `brew install cocoapods`, not gem.
- **`Sandbox: bash deny(1)` build error** → set User Script Sandboxing = No.
- **Rebuild looks identical** → wrong branch (work is on `main`/`claude/keiro-redesign`, not the
  old `claude/quirky-allen-38LE7`), or missed `npm install` / `cap:sync` / Clean Build Folder.
- **Mic "Listening…" never finishes on iOS** → fixed: it streams partial results and auto-stops
  after a pause (`src/lib/useSpeechRecognition.js`).
