import { useEffect, useRef, useCallback } from "react";

/**
 * Text-to-speech via the browser's built-in Web Speech API.
 * Free, on-device, no backend. iOS/Safari ship good Japanese voices
 * (e.g. Kyoko), which also applies inside the Capacitor WebView.
 */
export function useSpeech(lang = "ja-JP") {
  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;
  const voiceRef = useRef(null);

  useEffect(() => {
    if (!supported) return;
    const pick = () => {
      const voices = window.speechSynthesis.getVoices();
      voiceRef.current =
        voices.find((v) => v.lang === lang) ||
        voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("ja")) ||
        null;
    };
    pick();
    // Voices load asynchronously on first use.
    window.speechSynthesis.addEventListener?.("voiceschanged", pick);
    return () =>
      window.speechSynthesis.removeEventListener?.("voiceschanged", pick);
  }, [lang, supported]);

  const speak = useCallback(
    (text) => {
      if (!supported || !text) return;
      try {
        const synth = window.speechSynthesis;
        synth.cancel(); // stop anything still playing
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang;
        if (voiceRef.current) u.voice = voiceRef.current;
        u.rate = 0.9; // a touch slower for learners
        synth.speak(u);
      } catch {
        /* ignore — audio is a non-critical enhancement */
      }
    },
    [lang, supported]
  );

  return { speak, supported };
}
