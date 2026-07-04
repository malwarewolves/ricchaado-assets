import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./auth.jsx";
import { supabase, isSupabaseConfigured } from "./supabase.js";

const LS_KEY = "keiro_srs";

// Leitner boxes: wrong -> box 0 (due now), right -> next box.
// Days until an item comes back, per box.
const INTERVAL_DAYS = [0, 1, 3, 7, 14, 30];
const MAX_BOX = INTERVAL_DAYS.length - 1;
const DAY_MS = 864e5;

// Stable identity for anything quizzable.
export const srsKey = (item) =>
  item.isCustom ? `c:${item.char}` : item.isWord ? `w:${item.char}` : `k:${item.char}`;

const readLocal = () => {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); }
  catch { return {}; }
};
const writeLocal = (items) => localStorage.setItem(LS_KEY, JSON.stringify(items));

/**
 * Spaced-repetition store. Every answer moves the item through Leitner
 * boxes; items fall due after their box's interval. Local-first, mirrored
 * to Supabase (`review_items`) when signed in — see migrations/0002.
 */
export function useSrs() {
  const { user } = useAuth();
  const cloud = isSupabaseConfigured && !!user;
  const [items, setItems] = useState(() => readLocal());
  const loadedCloud = useRef(false);

  // On sign-in: pull cloud rows (they win per key), push local-only keys up.
  useEffect(() => {
    if (!cloud) { loadedCloud.current = false; return; }
    let active = true;
    (async () => {
      const { data, error } = await supabase.from("review_items").select("*");
      if (error || !active) return;
      const merged = { ...readLocal() };
      const cloudKeys = new Set();
      (data || []).forEach((r) => {
        cloudKeys.add(r.item_key);
        merged[r.item_key] = {
          box: r.box, due: new Date(r.due_at).getTime(),
          seen: r.seen, correct: r.correct,
        };
      });
      const localOnly = Object.entries(merged).filter(([k]) => !cloudKeys.has(k));
      if (localOnly.length) {
        await supabase.from("review_items").upsert(localOnly.map(([k, v]) => ({
          user_id: user.id, item_key: k, box: v.box,
          due_at: new Date(v.due).toISOString(), seen: v.seen, correct: v.correct,
        })));
      }
      if (active) { setItems(merged); writeLocal(merged); loadedCloud.current = true; }
    })();
    return () => { active = false; };
  }, [cloud, user?.id]);

  const recordAnswer = useCallback((key, wasCorrect) => {
    setItems((prev) => {
      const cur = prev[key] || { box: 0, due: 0, seen: 0, correct: 0 };
      const box = wasCorrect ? Math.min(cur.box + 1, MAX_BOX) : 0;
      const next = {
        ...prev,
        [key]: {
          box,
          due: Date.now() + INTERVAL_DAYS[box] * DAY_MS,
          seen: cur.seen + 1,
          correct: cur.correct + (wasCorrect ? 1 : 0),
        },
      };
      writeLocal(next);
      if (cloud) {
        const v = next[key];
        supabase.from("review_items").upsert({
          user_id: user.id, item_key: key, box: v.box,
          due_at: new Date(v.due).toISOString(), seen: v.seen, correct: v.correct,
        }).then(() => {});
      }
      return next;
    });
  }, [cloud, user?.id]);

  // Keys that have been answered before and are due for review now.
  const dueKeys = useCallback(() => {
    const now = Date.now();
    return Object.entries(items)
      .filter(([, v]) => v.due <= now)
      .sort((a, b) => a[1].due - b[1].due)
      .map(([k]) => k);
  }, [items]);

  return { items, recordAnswer, dueKeys };
}
