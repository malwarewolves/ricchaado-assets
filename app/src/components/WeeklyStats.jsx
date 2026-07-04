const DAY_MS = 864e5;
const dayStart = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };

// Aggregate the rolling activity log into the last 7 days + the 7 before.
function summarize(activity) {
  const today = dayStart(Date.now());
  const days = Array.from({ length: 7 }, (_, i) => {
    const start = today - (6 - i) * DAY_MS;
    return { start, answered: 0, correct: 0, quizzes: 0 };
  });
  let prevAnswered = 0, prevCorrect = 0;
  for (const e of activity) {
    const idx = Math.floor((dayStart(e.t) - (today - 6 * DAY_MS)) / DAY_MS);
    if (idx >= 0 && idx < 7) {
      days[idx].answered += e.a; days[idx].correct += e.c; days[idx].quizzes += 1;
    } else if (idx >= -7 && idx < 0) {
      prevAnswered += e.a; prevCorrect += e.c;
    }
  }
  const answered = days.reduce((s, d) => s + d.answered, 0);
  const correct = days.reduce((s, d) => s + d.correct, 0);
  const quizzes = days.reduce((s, d) => s + d.quizzes, 0);
  return {
    days, answered, correct, quizzes,
    accuracy: answered ? Math.round((correct / answered) * 100) : 0,
    prevAccuracy: prevAnswered ? Math.round((prevCorrect / prevAnswered) * 100) : null,
    prevAnswered,
  };
}

const tile = { flex: 1, background: "white", borderRadius: 11, padding: "9px 7px", textAlign: "center", border: "2px solid var(--cream2)" };
const tileNum = { fontSize: 22, fontWeight: 900, lineHeight: 1, color: "var(--charcoal)" };
const tileLabel = { fontSize: 10, fontWeight: 800, color: "var(--muted)", marginTop: 3, letterSpacing: "0.05em", textTransform: "uppercase" };

export default function WeeklyStats({ activity, isPro, weakItems, groupStats, onUpgrade, onReview }) {
  const wk = summarize(activity || []);
  const max = Math.max(...wk.days.map((d) => d.answered), 1);
  const todayIdx = 6;
  const maxIdx = wk.days.reduce((m, d, i) => (d.answered > wk.days[m].answered ? i : m), 0);
  const delta = wk.prevAccuracy == null ? null : wk.accuracy - wk.prevAccuracy;

  return (
    <>
      {/* ── This Week (free) ─────────────────────────────── */}
      <div className="card">
        <div className="section-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span>📅 This Week</span>
          {delta != null && wk.answered > 0 && (
            <span style={{ fontSize: 11, fontWeight: 900, textTransform: "none", letterSpacing: 0,
              color: delta >= 0 ? "var(--correct)" : "var(--wrong)" }}>
              {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% vs last week
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <div style={tile}><div style={tileNum}>{wk.quizzes}</div><div style={tileLabel}>Quizzes</div></div>
          <div style={tile}><div style={tileNum}>{wk.answered}</div><div style={tileLabel}>Answers</div></div>
          <div style={tile}><div style={tileNum}>{wk.answered ? `${wk.accuracy}%` : "—"}</div><div style={tileLabel}>Accuracy</div></div>
        </div>

        {/* 7-day answers bar row: single hue, rounded data-end, 2px gaps */}
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 64, padding: "0 2px" }}>
          {wk.days.map((d, i) => {
            const h = d.answered ? Math.max(6, Math.round((d.answered / max) * 52)) : 2;
            const wd = "SMTWTFS"[new Date(d.start).getDay()];
            return (
              <div key={d.start} title={`${new Date(d.start).toLocaleDateString(undefined, { weekday: "short" })}: ${d.answered} answers`}
                style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", height: 13 }}>
                  {i === maxIdx && d.answered > 0 ? d.answered : ""}
                </span>
                <div style={{
                  width: "100%", maxWidth: 26, height: h,
                  borderRadius: "4px 4px 0 0",
                  background: d.answered ? "var(--accent)" : "var(--cream2)",
                }} />
                <span style={{ fontSize: 10, fontWeight: i === todayIdx ? 900 : 700,
                  color: i === todayIdx ? "var(--charcoal)" : "var(--muted)" }}>{wd}</span>
              </div>
            );
          })}
        </div>
        {wk.answered === 0 && (
          <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "var(--muted)", marginTop: 8 }}>
            No practice yet this week — start a quiz!
          </div>
        )}
      </div>

      {/* ── Breakdown (Pro) ──────────────────────────────── */}
      {!isPro ? (
        <div className="card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 24 }}>🔬</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: "var(--charcoal)" }}>Trouble spots & breakdowns ⭐</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", marginTop: 1 }}>
              See exactly which characters and words to fix.
            </div>
          </div>
          <button onClick={onUpgrade}
            style={{ border: "none", borderRadius: 11, padding: "10px 14px", cursor: "pointer",
              fontFamily: "'Nunito', sans-serif", fontSize: 13, fontWeight: 900, color: "white", flexShrink: 0,
              background: "linear-gradient(135deg, var(--coral), var(--accent))" }}>
            Unlock
          </button>
        </div>
      ) : (
        <>
          {groupStats?.length > 0 && (
            <div className="card">
              <div className="section-label">🎯 Accuracy by area</div>
              {groupStats.map((g) => (
                <div key={g.label} style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 7 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "var(--charcoal)", width: 74, flexShrink: 0 }}>{g.label}</span>
                  <div style={{ flex: 1, height: 8, background: "var(--cream2)", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ width: `${g.accuracy}%`, height: "100%", background: "var(--accent)", borderRadius: 99 }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 900, color: "var(--charcoal)", width: 38, textAlign: "right" }}>{g.accuracy}%</span>
                </div>
              ))}
            </div>
          )}
          {weakItems?.length > 0 && (
            <div className="card">
              <div className="section-label">🔥 Trouble spots</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                {weakItems.map((w) => (
                  <span key={w.key} title={`${w.accuracy}% correct`}
                    style={{ background: "white", border: "2px solid var(--cream2)", borderRadius: 99,
                      padding: "5px 11px", fontSize: 13, fontWeight: 800, color: "var(--charcoal)",
                      fontFamily: "'Noto Sans JP', sans-serif" }}>
                    {w.char}
                    <span style={{ color: "var(--muted)", fontFamily: "'Nunito', sans-serif", fontSize: 11, marginLeft: 5 }}>
                      {w.romaji} · {w.accuracy}%
                    </span>
                  </span>
                ))}
              </div>
              <button className="start-btn" style={{ marginTop: 12, padding: 13, fontSize: 15 }} onClick={onReview}>
                Review these now 🧠
              </button>
            </div>
          )}
          {(!weakItems || weakItems.length === 0) && (!groupStats || groupStats.length === 0) && (
            <div className="card" style={{ textAlign: "center", fontSize: 12.5, fontWeight: 700, color: "var(--muted)" }}>
              🔬 Practice a bit more and your trouble spots will show up here.
            </div>
          )}
        </>
      )}
    </>
  );
}
