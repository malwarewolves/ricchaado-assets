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
