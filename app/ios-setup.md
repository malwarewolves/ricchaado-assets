# iOS setup (Capacitor)

Steps to build the native iOS app and enable **speak-to-check** (native speech recognition).
Requires a **Mac with Xcode** and an **Apple Developer account** ($99/yr).

## 1. Generate the iOS project

```bash
cd app
npm install
npm run cap:add:ios     # creates ios/ (one time)
npm run cap:sync        # build web + copy into the iOS project
npx cap open ios        # open in Xcode
```

## 2. Add the required permission strings  ⚠️ mandatory

Speech recognition **will crash / be rejected at App Store review** without these.
In Xcode open `ios/App/App/Info.plist` and add:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>Used so you can practice speaking Japanese words aloud.</string>
<key>NSSpeechRecognitionUsageDescription</key>
<string>Used to check the Japanese words you say during practice.</string>
```

(You can also add these in Xcode: target **App → Info → Custom iOS Target Properties → +**.)

## 3. Run on a real device

- Speech recognition needs a **physical iPhone** — the Simulator has no microphone/speech support.
- Select your device in Xcode and press ▶︎.

## How it behaves

- The 🎤 button only appears in **Words** and **My Cards** practice (where the answer is a
  Japanese word). It's hidden for single-kana drills (recognition of isolated kana is unreliable)
  and hidden entirely on the web build.
- Tapping 🎤 listens, then drops what it heard into the answer box so the learner can see it and
  submit (or correct it). Matching is normalized (punctuation/spacing stripped).
- 100% on-device / Apple-provided — **no backend, no hosting cost.**

## After any web code change

Re-sync so the native app picks it up:

```bash
npm run cap:sync
```
