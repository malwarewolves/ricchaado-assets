import { useState, useCallback, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { SpeechRecognition } from "@capacitor-community/speech-recognition";

/**
 * Speak-to-check using the device's NATIVE recognizer (iOS SFSpeechRecognizer /
 * Android) via Capacitor. On-device, no backend, no hosting cost. Reports
 * supported:false on web so the mic UI only appears in the packaged app.
 *
 * iOS specifics this code works around:
 *  - With partialResults:false iOS NEVER auto-stops on silence, so start()
 *    hangs forever ("Listening…" never resolves). We stream partial results
 *    and stop ourselves: after a pause once something was heard, on a hard
 *    timeout, or when the user taps the mic again.
 *  - Calling stop() when nothing is recording hard-crashes the plugin
 *    (nil unwrap in Plugin.swift) — only stop while a session is active.
 *  - Cancel any TTS first or the audio session may refuse the mic.
 */
const normalize = (s) =>
  (s || "").trim().replace(/[。、，！？・]/g, "").replace(/\s+/g, " ");

const SILENCE_MS = 1800; // stop this long after the last new words
const FIRST_WORD_MS = 7000; // give up if nothing heard at all
const MAX_MS = 12000; // absolute cap

export function useSpeechRecognition(language = "ja-JP") {
  const supported = Capacitor.isNativePlatform();
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const activeRef = useRef(false);
  const finishRef = useRef(null);

  const listen = useCallback(
    async (langOverride) => {
      if (!supported) return null;
      // Tap while listening = finish now with whatever was heard.
      if (activeRef.current) {
        finishRef.current?.();
        return null;
      }
      setError(null);

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

        return await new Promise(async (resolve) => {
          let transcript = "";
          let silenceTimer = null;
          let maxTimer = null;
          let listener = null;
          let done = false;

          const finish = async () => {
            if (done) return;
            done = true;
            clearTimeout(silenceTimer);
            clearTimeout(maxTimer);
            try { await listener?.remove(); } catch { /* ignore */ }
            if (activeRef.current) {
              try { await SpeechRecognition.stop(); } catch { /* ignore */ }
            }
            activeRef.current = false;
            finishRef.current = null;
            setListening(false);
            resolve(transcript ? normalize(transcript) : null);
          };
          finishRef.current = finish;

          const armSilence = (ms) => {
            clearTimeout(silenceTimer);
            silenceTimer = setTimeout(finish, ms);
          };

          try {
            listener = await SpeechRecognition.addListener("partialResults", (data) => {
              const next = data?.matches?.[0];
              if (next && next !== transcript) {
                transcript = next;
                armSilence(SILENCE_MS); // heard something new → restart pause timer
              }
            });

            armSilence(FIRST_WORD_MS);
            maxTimer = setTimeout(finish, MAX_MS);

            // On iOS with partialResults:true this resolves immediately and
            // results flow through the listener; on Android it may resolve
            // with final matches when recognition ends.
            const res = await SpeechRecognition.start({
              language: langOverride || language,
              maxResults: 1,
              partialResults: true,
              popup: false,
            });
            const finalMatch = res?.matches?.[0];
            if (finalMatch) {
              transcript = finalMatch;
              finish();
            }
          } catch (e) {
            setError(e?.message || "error");
            finish();
          }
        });
      } catch (e) {
        setError(e?.message || "error");
        activeRef.current = false;
        setListening(false);
        return null;
      }
    },
    [supported, language]
  );

  const stop = useCallback(async () => {
    finishRef.current?.();
  }, []);

  return { supported, listening, error, listen, stop };
}
