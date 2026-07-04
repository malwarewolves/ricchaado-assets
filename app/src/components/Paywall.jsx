import { useState } from "react";
import { PRO_PRODUCT } from "../lib/purchases.js";

const PERKS = [
  { icon: "🧠", title: "Smart Review", desc: "Keiro requizzes exactly what you keep getting wrong, right when you're about to forget it." },
  { icon: "🎤", title: "Speak-to-check", desc: "Say it out loud — Japanese or the English meaning — and get graded instantly." },
  { icon: "📚", title: "Every word", desc: "Unlock the full vocabulary bank, every category, both directions." },
  { icon: "🃏", title: "200 custom cards", desc: "Build your own decks (free tier: 10)." },
];

export default function Paywall({ isPro, onBuy, onRestore, onClose }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const run = async (fn, failText) => {
    setBusy(true); setMsg(null);
    try {
      const res = await fn();
      if (!res.success) setMsg(failText);
    } catch (e) {
      setMsg(e?.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  if (isPro) {
    return (
      <div className="settings-content">
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40 }}>⭐</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "var(--charcoal)", marginTop: 6 }}>
            You have {PRO_PRODUCT.title}
          </div>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginTop: 6 }}>
            Everything is unlocked. ありがとう！
          </p>
        </div>
        <button className="start-btn" onClick={onClose}>Keep practicing →</button>
      </div>
    );
  }

  return (
    <div className="settings-content">
      <div style={{ textAlign: "center", padding: "6px 0 2px" }}>
        <div style={{
          fontSize: 26, fontWeight: 900,
          background: "linear-gradient(120deg, var(--coral), var(--accent))",
          WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
        }}>
          {PRO_PRODUCT.title} ⭐
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginTop: 2 }}>
          One-time purchase · {PRO_PRODUCT.price} · yours forever
        </div>
      </div>

      {PERKS.map((p) => (
        <div className="card" key={p.title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ fontSize: 24, lineHeight: 1 }}>{p.icon}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, color: "var(--charcoal)" }}>{p.title}</div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted)", marginTop: 2, lineHeight: 1.45 }}>{p.desc}</div>
          </div>
        </div>
      ))}

      {msg && (
        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--wrong)", textAlign: "center" }}>{msg}</p>
      )}

      <button className="start-btn" disabled={busy}
        onClick={() => run(onBuy, "Purchase didn't complete.")}>
        {busy ? "..." : `Unlock ${PRO_PRODUCT.title} · ${PRO_PRODUCT.price}`}
      </button>
      <button
        style={{ background: "none", border: "none", fontFamily: "'Nunito', sans-serif", fontSize: 13, fontWeight: 800, color: "var(--muted)", cursor: "pointer", padding: 6 }}
        disabled={busy}
        onClick={() => run(onRestore, "No previous purchase found.")}>
        Restore purchase
      </button>
      <p style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textAlign: "center", lineHeight: 1.5 }}>
        Kana drills, the reference chart, audio, and your streak stay free forever.
      </p>
    </div>
  );
}
