-- 005_time_entries.sql
-- A time entry either has (start_at, end_at) or a manual duration_minutes.
-- entry_date is the user's *local* calendar day the activity is attributed to
-- (computed client/server side from the user's profile timezone, not server UTC "today").

create table if not exists public.time_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.time_categories(id) on delete set null,
  activity_name text not null,
  start_at timestamptz,
  end_at timestamptz,
  duration_minutes int not null check (duration_minutes > 0),
  entry_date date not null,
  notes text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
  -- Note: we deliberately do NOT enforce end_at > start_at here. Overnight
  -- activities (e.g. "Travel 11pm -> 2am") are legitimate. The application
  -- layer computes duration and flags same-day overlaps as a soft warning
  -- rather than a hard DB rejection (see DATA QUALITY RULES in the product spec).
);

create index if not exists idx_time_entries_user_date on public.time_entries(user_id, entry_date);

create trigger trg_time_entries_updated_at
before update on public.time_entries
for each row execute function public.set_updated_at();
