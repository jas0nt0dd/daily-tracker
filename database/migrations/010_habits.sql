-- 010_habits.sql

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  frequency_type text not null default 'daily' check (frequency_type in ('daily','weekly','custom')),
  target_count int not null default 1 check (target_count > 0), -- times per frequency period
  active boolean not null default true,
  start_date date not null default current_date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_habits_user_active on public.habits(user_id, active);

create trigger trg_habits_updated_at
before update on public.habits
for each row execute function public.set_updated_at();

create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  completed_count int not null default 1 check (completed_count >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, habit_id, log_date)
);

create index if not exists idx_habit_logs_user_date on public.habit_logs(user_id, log_date);

create trigger trg_habit_logs_updated_at
before update on public.habit_logs
for each row execute function public.set_updated_at();
