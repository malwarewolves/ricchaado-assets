import { createClient } from "@supabase/supabase-js";

// Credentials come from environment (.env), never hard-coded.
// The anon key is safe to ship in a client build — Row Level Security
// in the database is what actually protects each user's data.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

// When unconfigured, the app still runs fully in local-only mode
// (localStorage), so you can develop the UI before wiring up a backend.
export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;
