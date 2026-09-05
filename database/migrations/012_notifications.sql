-- 012_notifications.sql

create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  task_reminders_enabled boolean not null default true,
  tomorrow_planning_enabled boolean not null default true,
  habit_reminders_enabled boolean not null default true,
  sleep_reminders_enabled boolean not null default false,
  planned_bedtime time,
  tomorrow_planning_time time not null default '21:00',
  quiet_hours_start time not null default '22:30',
  quiet_hours_end time not null default '07:00',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_notification_preferences_updated_at
before update on public.notification_preferences
for each row execute function public.set_updated_at();

-- Create default notification preferences whenever a profile is created.
create or replace function public.seed_notification_preferences()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.notification_preferences (user_id)
  values (new.user_id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_profile_created_seed_notifications on public.profiles;
create trigger on_profile_created_seed_notifications
after insert on public.profiles
for each row execute function public.seed_notification_preferences();

-- Queued notification jobs, processed by the backend's cron worker.
-- Idempotency is enforced by (user_id, type, reference_id, scheduled_for).
create table if not exists public.notification_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in
    ('tomorrow_planning','task_due','task_overdue','habit_reminder','sleep_bedtime')),
  reference_id uuid, -- e.g. task id or habit id, nullable for generic reminders
  title text not null,
  body text not null,
  scheduled_for timestamptz not null,
  status text not null default 'pending' check (status in ('pending','sent','skipped','failed')),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_notification_jobs_idempotency
on public.notification_jobs (
  user_id,
  type,
  coalesce(reference_id, '00000000-0000-0000-0000-000000000000'::uuid),
  scheduled_for
);

create index if not exists idx_notification_jobs_pending on public.notification_jobs(status, scheduled_for);
create index if not exists idx_notification_jobs_user on public.notification_jobs(user_id, scheduled_for);
