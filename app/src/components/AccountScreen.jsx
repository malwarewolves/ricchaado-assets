import { useState } from "react";
import { useAuth } from "../lib/auth.jsx";

export default function AccountScreen({ lifetime }) {
  const { user, configured, signIn, signUp, signOut } = useAuth();
  const [tab, setTab] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setMsg(null);
    setBusy(true);
    try {
      if (tab === "signin") {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password);
        setMsg({ ok: true, text: "Account created. Check your email to confirm, then sign in." });
        setTab("signin");
      }
    } catch (e) {
      setMsg({ ok: false, text: e.message || "Something went wrong." });
    } finally {
      setBusy(false);
    }
  };

  // ---- Backend not wired up yet -------------------------------------------
  if (!configured) {
    return (
      <div className="settings-content">
        <div className="card">
          <div className="section-label">☁️ Accounts</div>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", lineHeight: 1.5 }}>
            Cloud accounts aren&apos;t connected yet. Add your Supabase URL and anon key to a
            <code> .env </code> file (see <code>.env.example</code> and <code>supabase/README.md</code>),
            then restart. Until then, your cards and progress are saved on this device.
          </p>
        </div>
      </div>
    );
  }

  // ---- Signed in -----------------------------------------------------------
  if (user) {
    const acc =
      lifetime && lifetime.totalAnswered > 0
        ? Math.round((lifetime.totalCorrect / lifetime.totalAnswered) * 100)
        : 0;
    return (
      <div className="settings-content">
        <div className="card">
          <div className="section-label">👤 Signed in</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--charcoal)" }}>{user.email}</div>
        </div>

        <div className="card">
          <div className="section-label">📊 Lifetime Progress</div>
          <div className="stats-row">
            <div className="stat-box">
              <div className="stat-num neu">{lifetime?.currentStreak ?? 0}</div>
              <div className="stat-label">Day Streak</div>
            </div>
            <div className="stat-box">
              <div className="stat-num good">{lifetime?.bestStreak ?? 0}</div>
              <div className="stat-label">Best</div>
            </div>
            <div className="stat-box">
              <div className="stat-num neu">{lifetime?.totalQuizzes ?? 0}</div>
              <div className="stat-label">Quizzes</div>
            </div>
            <div className="stat-box">
              <div className="stat-num good">{acc}%</div>
              <div className="stat-label">Accuracy</div>
            </div>
          </div>
        </div>

        <button className="start-btn" style={{ background: "var(--charcoal)" }} onClick={signOut}>
          Sign Out
        </button>
      </div>
    );
  }

  // ---- Signed out: sign in / sign up --------------------------------------
  return (
    <div className="settings-content">
      <div className="card">
        <div className="mode-selector" style={{ marginBottom: 12 }}>
          <button
            className={`mode-btn ${tab === "signin" ? "active" : ""}`}
            onClick={() => setTab("signin")}
          >
            <span className="mode-btn-label">Sign In</span>
          </button>
          <button
            className={`mode-btn ${tab === "signup" ? "active" : ""}`}
            onClick={() => setTab("signup")}
          >
            <span className="mode-btn-label">Sign Up</span>
          </button>
        </div>

        <input
          className="custom-input"
          type="email"
          placeholder="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginBottom: 9 }}
        />
        <input
          className="custom-input"
          type="password"
          placeholder="Password"
          autoComplete={tab === "signin" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />

        {msg && (
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              marginTop: 9,
              color: msg.ok ? "var(--correct)" : "var(--wrong)",
            }}
          >
            {msg.text}
          </p>
        )}

        <button
          className="start-btn"
          style={{ marginTop: 12 }}
          disabled={busy || !email.trim() || !password}
          onClick={submit}
        >
          {busy ? "..." : tab === "signin" ? "Sign In" : "Create Account"}
        </button>
      </div>

      <p style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textAlign: "center" }}>
        An account syncs your custom cards and progress across devices.
      </p>
    </div>
  );
}
