import { useState, useCallback, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { SpeechRecognition } from "@capacitor-community/speech-recognition";

/**
 * Speak-to-check using the device's NATIVE recognizer (iOS SFSpeechRecognizer /
 * Android) via Capacitor. On-device, no backend, no hosting cost. Reports
 * supported:false on web so the mic UI only appears in the packaged app.
 *
 * Notes learned the hard way:
 *  - Never call SpeechRecognition.stop() when nothing is recording — the iOS
 *    plugin force-unwraps a nil and the app hard-crashes. We only stop() while
 *    a session is actually active (tracked via activeRef).
 *  - Cancel any text-to-speech first, otherwise the audio session stays owned
 *    by playback and the recognizer won't start the 2nd time ("works once").
 */
const normalize = (s) =>
  (s || "").trim().replace(/[。、，！？・]/g, "").replace(/\s+/g, " ");

export function useSpeechRecognition(language = "ja-JP") {
  const supported = Capacitor.isNativePlatform();
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const activeRef = useRef(false);

  const listen = useCallback(
    async (langOverride) => {
      if (!supported || activeRef.current) return null;
      setError(null);

      // Free the audio session from any TTS playback before recording.
      try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }

      try {
        const { available } = await SpeechRecognition.available();
        if (!available) { setError("unavailable"); return null; }

        let perm = await SpeechRecognition.checkPermissions();
        if (perm.speechRecognition !== "granted") {
          perm = await SpeechRecognition.requestPermissions();
        }
        if (perm.speechRecognition !== "granted") { setError("denied"); return null; }

        activeRef.current = true;
        setListening(true);
        const res = await SpeechRecognition.start({
          language: langOverride || language,
          maxResults: 1,
          partialResults: false,
          popup: false,
        });

        const match = res?.matches?.[0];
        return match ? normalize(match) : null;
      } catch (e) {
        setError(e?.message || "error");
        return null;
      } finally {
        activeRef.current = false;
        setListening(false);
      }
    },
    [supported, language]
  );

  const stop = useCallback(async () => {
    // Only safe to call while actually recording (see note above).
    if (!supported || !activeRef.current) return;
    try { await SpeechRecognition.stop(); } catch { /* ignore */ }
    activeRef.current = false;
    setListening(false);
  }, [supported]);

  return { supported, listening, error, listen, stop };
}
