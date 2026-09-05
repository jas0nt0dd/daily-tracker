-- 007_tasks.sql

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  due_at timestamptz,
  priority text not null default 'medium' check (priority in ('low','medium','high')),
  status text not null default 'pending' check (status in ('pending','in_progress','completed','postponed','removed')),
  category text,
  estimated_minutes int check (estimated_minutes is null or estimated_minutes > 0),
  reminder_at timestamptz,
  completed_at timestamptz,
  postponed_until date,
  current_reason text, -- reason for the most recent postpone/remove, kept for quick display
  planned_for date, -- the day this task was planned for (tomorrow-planning flow)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tasks_user_due on public.tasks(user_id, due_at);
create index if not exists idx_tasks_user_planned on public.tasks(user_id, planned_for);
create index if not exists idx_tasks_user_status on public.tasks(user_id, status);

create trigger trg_tasks_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

-- Full audit trail of every status transition, so "Created -> Planned ->
-- Postponed -> Postponed -> Completed" can be reconstructed later.
create table if not exists public.task_events (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in ('created','status_change','postponed','removed','reminder_sent')),
  from_status text,
  to_status text,
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists idx_task_events_task on public.task_events(task_id, created_at);
create index if not exists idx_task_events_user on public.task_events(user_id, created_at);

-- Record the initial "created" event automatically.
create or replace function public.log_task_created()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.task_events (task_id, user_id, event_type, to_status)
  values (new.id, new.user_id, 'created', new.status);
  return new;
end;
$$;

drop trigger if exists trg_task_created_event on public.tasks;
create trigger trg_task_created_event
after insert on public.tasks
for each row execute function public.log_task_created();

-- Record every subsequent status change automatically.
create or replace function public.log_task_status_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    insert into public.task_events (task_id, user_id, event_type, from_status, to_status, reason)
    values (
      new.id, new.user_id,
      case when new.status in ('postponed','removed') then new.status else 'status_change' end,
      old.status, new.status, new.current_reason
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_task_status_change_event on public.tasks;
create trigger trg_task_status_change_event
after update on public.tasks
for each row execute function public.log_task_status_change();
