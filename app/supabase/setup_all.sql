-- ============================================================
-- Keiro — COMPLETE database setup (runs 0001 + 0002 in order)
-- Paste this whole file into the Supabase SQL Editor and Run.
-- Safe to re-run: everything is IF NOT EXISTS / OR REPLACE.
-- ============================================================

-- ============================================================
-- Ricchaado Academy — initial schema
-- Accounts (auth.users) + per-user profiles, custom cards, quiz history.
-- Run this in the Supabase SQL editor, or via the Supabase CLI.
-- ============================================================

-- ---------- Profiles -----------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  display_name text,
  stats        jsonb not null default '{}'::jsonb,   -- lifetime totals + streak
  settings     jsonb not null default '{}'::jsonb,   -- user preferences
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------- Custom flashcards --------------------------------------------
create table if not exists public.custom_cards (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  japanese   text not null,
  romaji     text default '',
  english    text not null,
  created_at timestamptz not null default now()
);
create index if not exists custom_cards_user_idx on public.custom_cards(user_id);

-- ---------- Quiz history (for analytics / future features) ---------------
create table if not exists public.quiz_results (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  mode       text,
  correct    int not null default 0,
  answered   int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists quiz_results_user_idx on public.quiz_results(user_id);

-- ---------- Row Level Security: each user sees only their own rows -------
alter table public.profiles     enable row level security;
alter table public.custom_cards enable row level security;
alter table public.quiz_results enable row level security;

drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_select_own on public.profiles for select using (auth.uid() = id);
create policy profiles_insert_own on public.profiles for insert with check (auth.uid() = id);
create policy profiles_update_own on public.profiles for update using (auth.uid() = id);

drop policy if exists cards_all_own on public.custom_cards;
create policy cards_all_own on public.custom_cards for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists results_all_own on public.quiz_results;
create policy results_all_own on public.quiz_results for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- Auto-create a profile row on signup --------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Keep profiles.updated_at fresh -------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ============================================================
-- Keiro — migration 0002: spaced-repetition review items
-- Run AFTER 0001_init.sql, in the Supabase SQL editor.
-- (The Pro entitlement flag lives in profiles.settings -> {"pro": true},
--  so no new table is needed for it.)
-- ============================================================

create table if not exists public.review_items (
  user_id    uuid not null references auth.users(id) on delete cascade,
  item_key   text not null,                -- "k:あ" kana, "w:ねこ" word, "c:..." custom
  box        int  not null default 0,      -- Leitner box 0..5
  due_at     timestamptz not null default now(),
  seen       int  not null default 0,
  correct    int  not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, item_key)
);

create index if not exists review_items_due_idx on public.review_items(user_id, due_at);

alter table public.review_items enable row level security;

drop policy if exists review_items_all_own on public.review_items;
create policy review_items_all_own on public.review_items for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.touch_review_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists review_items_touch on public.review_items;
create trigger review_items_touch
  before update on public.review_items
  for each row execute function public.touch_review_updated_at();
