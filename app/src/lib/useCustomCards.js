import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./auth.jsx";
import { supabase, isSupabaseConfigured } from "./supabase.js";

const LS_KEY = "ricchaado_custom_cards";

const readLocal = () => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
};
const writeLocal = (cards) => localStorage.setItem(LS_KEY, JSON.stringify(cards));

const toCard = (r) => ({
  id: r.id,
  japanese: r.japanese,
  romaji: r.romaji || "",
  english: r.english,
});

/**
 * Custom flashcards with transparent cloud sync:
 *  - signed in + Supabase configured  -> rows in `custom_cards`
 *  - otherwise                        -> localStorage
 * On first sign-in, any local cards are migrated up to the account.
 */
export function useCustomCards() {
  const { user } = useAuth();
  const cloud = isSupabaseConfigured && !!user;
  const [cards, setCards] = useState(() => readLocal());

  useEffect(() => {
    let active = true;
    (async () => {
      if (cloud) {
        const { data, error } = await supabase
          .from("custom_cards")
          .select("*")
          .order("created_at", { ascending: true });
        if (error || !active) return;
        let rows = (data || []).map(toCard);

        // One-time migration of local cards into the new account.
        const local = readLocal();
        if (rows.length === 0 && local.length > 0) {
          const payload = local.map((c) => ({
            user_id: user.id,
            japanese: c.japanese,
            romaji: c.romaji || "",
            english: c.english,
          }));
          const { data: inserted } = await supabase
            .from("custom_cards")
            .insert(payload)
            .select();
          if (inserted) rows = inserted.map(toCard);
          writeLocal([]);
        }
        if (active) setCards(rows);
      } else {
        setCards(readLocal());
      }
    })();
    return () => {
      active = false;
    };
  }, [cloud, user?.id]);

  // Keep localStorage in sync while in local-only mode.
  useEffect(() => {
    if (!cloud) writeLocal(cards);
  }, [cards, cloud]);

  const addCard = useCallback(
    async (card) => {
      const clean = {
        japanese: card.japanese,
        romaji: card.romaji || "",
        english: card.english,
      };
      if (cloud) {
        const { data, error } = await supabase
          .from("custom_cards")
          .insert({ user_id: user.id, ...clean })
          .select()
          .single();
        if (!error && data) setCards((prev) => [...prev, toCard(data)]);
      } else {
        setCards((prev) => [...prev, { id: Date.now(), ...clean }]);
      }
    },
    [cloud, user?.id]
  );

  const deleteCard = useCallback(
    async (id) => {
      if (cloud) await supabase.from("custom_cards").delete().eq("id", id);
      setCards((prev) => prev.filter((c) => c.id !== id));
    },
    [cloud]
  );

  return { cards, addCard, deleteCard };
}
