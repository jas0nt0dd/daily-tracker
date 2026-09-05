-- 006_sleep.sql
-- Sleep is stored as an actual start/end timestamptz pair so a session that
-- crosses midnight is never split across two rows. "Which night" a session
-- belongs to is a *derived* concept (based on profiles.sleep_day_boundary),
-- computed in application code / views, never baked into this table.

create table if not exists public.sleep_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sleep_start timestamptz not null,
  sleep_end timestamptz not null,
  duration_minutes int generated always as (
    greatest(0, round(extract(epoch from (sleep_end - sleep_start)) / 60))
  ) stored,
  quality smallint check (quality between 1 and 5),
  notes text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_sleep_end_after_start check (sleep_end > sleep_start),
  constraint chk_sleep_reasonable_length check (sleep_end - sleep_start <= interval '24 hours')
);

create index if not exists idx_sleep_entries_user_start on public.sleep_entries(user_id, sleep_start);

create trigger trg_sleep_entries_updated_at
before update on public.sleep_entries
for each row execute function public.set_updated_at();
