import { useState, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { SpeechRecognition } from "@capacitor-community/speech-recognition";

/**
 * Speak-to-check using the device's NATIVE speech recognizer
 * (iOS SFSpeechRecognizer / Android SpeechRecognizer) via Capacitor.
 *
 * Runs on-device — no backend, no hosting cost. Intentionally reports
 * `supported: false` on the web (browser recognition is unreliable in the
 * iOS WebView), so the mic UI only appears in the packaged native app.
 *
 * iOS setup (see ios-setup.md): add NSMicrophoneUsageDescription and
 * NSSpeechRecognitionUsageDescription to Info.plist, or the app is rejected.
 */
const normalize = (s) =>
  (s || "").trim().replace(/[。、，,.！!？?・\s]/g, "");

export function useSpeechRecognition(language = "ja-JP") {
  const supported = Capacitor.isNativePlatform();
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);

  const listen = useCallback(async () => {
    if (!supported) return null;
    setError(null);
    try {
      const { available } = await SpeechRecognition.available();
      if (!available) {
        setError("unavailable");
        return null;
      }
      let perm = await SpeechRecognition.checkPermissions();
      if (perm.speechRecognition !== "granted") {
        perm = await SpeechRecognition.requestPermissions();
      }
      if (perm.speechRecognition !== "granted") {
        setError("denied");
        return null;
      }

      setListening(true);
      const res = await SpeechRecognition.start({
        language,
        maxResults: 1,
        partialResults: false,
        popup: false,
      });
      setListening(false);

      const match = res?.matches?.[0];
      return match ? normalize(match) : null;
    } catch (e) {
      setListening(false);
      setError(e?.message || "error");
      return null;
    }
  }, [supported, language]);

  const stop = useCallback(async () => {
    if (!supported) return;
    try {
      await SpeechRecognition.stop();
    } catch {
      /* ignore */
    }
    setListening(false);
  }, [supported]);

  return { supported, listening, error, listen, stop };
}
