import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./auth.jsx";
import { supabase, isSupabaseConfigured } from "./supabase.js";
import { purchasePro, restorePurchases } from "./purchases.js";

// What free users get. Everything else is Pro.
export const FREE_LIMITS = {
  words: 100, // first N of WORD_BANK (greetings/numbers/colors/basics)
  customCards: 10,
};
export const PRO_LIMITS = {
  customCards: 200,
};

const LS_KEY = "keiro_pro";

/**
 * Pro entitlement. Persisted locally and mirrored into
 * profiles.settings.pro when signed in, so it follows the account.
 * The actual payment happens in purchases.js (swap for StoreKit later).
 */
export function usePro() {
  const { user } = useAuth();
  const cloud = isSupabaseConfigured && !!user;
  const [isPro, setIsPro] = useState(() => localStorage.getItem(LS_KEY) === "1");

  // Merge with the account's flag on sign-in: either side being true wins,
  // and the other side is brought up to date.
  useEffect(() => {
    if (!cloud) return;
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("profiles").select("settings").eq("id", user.id).maybeSingle();
      if (!active) return;
      const cloudPro = !!data?.settings?.pro;
      const localPro = localStorage.getItem(LS_KEY) === "1";
      const merged = cloudPro || localPro;
      setIsPro(merged);
      localStorage.setItem(LS_KEY, merged ? "1" : "0");
      if (merged && !cloudPro) {
        await supabase.from("profiles").upsert({
          id: user.id,
          settings: { ...(data?.settings || {}), pro: true },
        });
      }
    })();
    return () => { active = false; };
  }, [cloud, user?.id]);

  const grant = useCallback(async () => {
    setIsPro(true);
    localStorage.setItem(LS_KEY, "1");
    if (cloud) {
      const { data } = await supabase
        .from("profiles").select("settings").eq("id", user.id).maybeSingle();
      await supabase.from("profiles").upsert({
        id: user.id,
        settings: { ...(data?.settings || {}), pro: true },
      });
    }
  }, [cloud, user?.id]);

  const buy = useCallback(async () => {
    const res = await purchasePro();
    if (res.success) await grant();
    return res;
  }, [grant]);

  const restore = useCallback(async () => {
    const res = await restorePurchases();
    if (res.success) await grant();
    return res;
  }, [grant]);

  return { isPro, buy, restore };
}
