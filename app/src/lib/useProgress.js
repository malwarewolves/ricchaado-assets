import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./auth.jsx";
import { supabase, isSupabaseConfigured } from "./supabase.js";

const LS_KEY = "ricchaado_progress";
const ACT_KEY = "keiro_activity"; // rolling per-quiz log for weekly stats
const ACTIVITY_DAYS = 90;
const DAY_MS = 864e5;

const readActivity = () => {
  try { return JSON.parse(localStorage.getItem(ACT_KEY) || "[]"); }
  catch { return []; }
};
const writeActivity = (log) => localStorage.setItem(ACT_KEY, JSON.stringify(log));

const EMPTY = {
  totalQuizzes: 0,
  totalAnswered: 0,
  totalCorrect: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastQuizDate: null,
};

const dayString = (d = new Date()) => d.toISOString().slice(0, 10);

const readLocal = () => {
  try {
    return { ...EMPTY, ...JSON.parse(localStorage.getItem(LS_KEY) || "{}") };
  } catch {
    return { ...EMPTY };
  }
};

// Pure reducer so streak logic is testable and identical local vs cloud.
function applyResult(prev, { correct, answered }) {
  const today = dayString();
  let currentStreak = prev.currentStreak || 0;
  if (prev.lastQuizDate !== today) {
    const yesterday = dayString(new Date(Date.now() - 864e5));
    currentStreak = prev.lastQuizDate === yesterday ? currentStreak + 1 : 1;
  }
  return {
    totalQuizzes: (prev.totalQuizzes || 0) + 1,
    totalAnswered: (prev.totalAnswered || 0) + answered,
    totalCorrect: (prev.totalCorrect || 0) + correct,
    currentStreak,
    bestStreak: Math.max(prev.bestStreak || 0, currentStreak),
    lastQuizDate: today,
  };
}

/**
 * Lifetime progress + daily streak.
 * Aggregates live in `profiles.stats` (cloud) or localStorage (local).
 * Each completed quiz also appends a row to `quiz_results` for future analytics.
 */
export function useProgress() {
  const { user } = useAuth();
  const cloud = isSupabaseConfigured && !!user;
  const [stats, setStats] = useState(() => readLocal());
  const [activity, setActivity] = useState(() => readActivity());

  useEffect(() => {
    let active = true;
    (async () => {
      if (cloud) {
        const { data } = await supabase
          .from("profiles")
          .select("stats")
          .eq("id", user.id)
          .maybeSingle();
        if (active && data?.stats) setStats({ ...EMPTY, ...data.stats });
        // Fresh device: rebuild the local activity log from quiz history.
        if (active && readActivity().length === 0) {
          const since = new Date(Date.now() - ACTIVITY_DAYS * DAY_MS).toISOString();
          const { data: rows } = await supabase
            .from("quiz_results")
            .select("created_at, correct, answered")
            .gte("created_at", since)
            .order("created_at", { ascending: true });
          if (active && rows?.length) {
            const log = rows.map((r) => ({
              t: new Date(r.created_at).getTime(), c: r.correct, a: r.answered,
            }));
            writeActivity(log);
            setActivity(log);
          }
        }
      } else {
        setStats(readLocal());
      }
    })();
    return () => {
      active = false;
    };
  }, [cloud, user?.id]);

  const recordResult = useCallback(
    ({ correct, answered }) => {
      setStats((prev) => {
        const next = applyResult(prev, { correct, answered });
        if (cloud) {
          supabase.from("profiles").upsert({ id: user.id, stats: next }).then(() => {});
          supabase
            .from("quiz_results")
            .insert({ user_id: user.id, correct, answered })
            .then(() => {});
        } else {
          localStorage.setItem(LS_KEY, JSON.stringify(next));
        }
        return next;
      });
      setActivity((prev) => {
        const cutoff = Date.now() - ACTIVITY_DAYS * DAY_MS;
        const next = [...prev.filter((e) => e.t >= cutoff), { t: Date.now(), c: correct, a: answered }];
        writeActivity(next);
        return next;
      });
    },
    [cloud, user?.id]
  );

  return { stats, recordResult, activity };
}
