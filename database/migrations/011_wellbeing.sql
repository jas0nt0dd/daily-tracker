-- 011_wellbeing.sql
-- Lightweight daily reflection. Deliberately not medical/diagnostic language.

create table if not exists public.wellbeing_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  mood smallint check (mood between 1 and 5),
  energy smallint check (energy between 1 and 5),
  stress smallint check (stress between 1 and 5),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create index if not exists idx_wellbeing_logs_user_date on public.wellbeing_logs(user_id, log_date);

create trigger trg_wellbeing_logs_updated_at
before update on public.wellbeing_logs
for each row execute function public.set_updated_at();
