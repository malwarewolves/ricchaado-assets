import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./auth.jsx";
import { supabase, isSupabaseConfigured } from "./supabase.js";

const LS_KEY = "ricchaado_progress";

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
    },
    [cloud, user?.id]
  );

  return { stats, recordResult };
}
