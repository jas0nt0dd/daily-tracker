-- 015_views_and_functions.sql
-- Centralized aggregation, mirroring the analytics engine functions used by
-- the frontend/backend (getDailyExpenseSummary, getMonthlyTimeSummary, etc.)
-- so that logic isn't reimplemented separately in every React component.
--
-- All views use `security_invoker = true` so they respect the RLS policies of
-- the calling user (Postgres 15+ / Supabase default). A view is NOT a
-- substitute for RLS on the base tables, which are already enabled above.

create or replace view public.daily_expense_summary
with (security_invoker = true) as
select
  user_id,
  expense_date,
  count(*) filter (where deleted_at is null) as expense_count,
  coalesce(sum(amount) filter (where deleted_at is null), 0) as total_amount
from public.expenses
group by user_id, expense_date;

create or replace view public.monthly_expense_summary
with (security_invoker = true) as
select
  user_id,
  date_trunc('month', expense_date)::date as month,
  count(*) filter (where deleted_at is null) as expense_count,
  coalesce(sum(amount) filter (where deleted_at is null), 0) as total_amount,
  coalesce(avg(amount) filter (where deleted_at is null), 0) as avg_amount
from public.expenses
group by user_id, date_trunc('month', expense_date)::date;

create or replace view public.category_expense_breakdown
with (security_invoker = true) as
select
  e.user_id,
  date_trunc('month', e.expense_date)::date as month,
  ec.name as category_name,
  coalesce(sum(e.amount), 0) as total_amount,
  count(*) as expense_count
from public.expenses e
left join public.expense_categories ec on ec.id = e.category_id
where e.deleted_at is null
group by e.user_id, date_trunc('month', e.expense_date)::date, ec.name;

create or replace view public.daily_time_summary
with (security_invoker = true) as
select
  user_id,
  entry_date,
  coalesce(sum(duration_minutes) filter (where deleted_at is null), 0) as total_minutes,
  count(*) filter (where deleted_at is null) as entry_count
from public.time_entries
group by user_id, entry_date;

create or replace view public.category_time_breakdown
with (security_invoker = true) as
select
  t.user_id,
  t.entry_date,
  tc.name as category_name,
  coalesce(sum(t.duration_minutes), 0) as total_minutes
from public.time_entries t
left join public.time_categories tc on tc.id = t.category_id
where t.deleted_at is null
group by t.user_id, t.entry_date, tc.name;

create or replace view public.sleep_daily_summary
with (security_invoker = true) as
select
  user_id,
  id,
  sleep_start,
  sleep_end,
  duration_minutes,
  quality,
  -- The "sleep night" a session is attributed to: if the wake time's local
  -- clock time is before the user's configured sleep_day_boundary, attribute
  -- the session to the *previous* calendar day (the night it started).
  case
    when (sleep_end at time zone 'UTC')::time <
         (select p.sleep_day_boundary from public.profiles p where p.user_id = s.user_id)
    then (sleep_start::date)
    else (sleep_start::date)
  end as sleep_night
from public.sleep_entries s
where deleted_at is null;

create or replace view public.task_completion_summary
with (security_invoker = true) as
select
  user_id,
  date_trunc('week', coalesce(completed_at, created_at))::date as week_start,
  count(*) filter (where status = 'completed') as completed_count,
  count(*) filter (where status = 'postponed') as postponed_count,
  count(*) filter (where status = 'removed') as removed_count,
  count(*) as total_count
from public.tasks
group by user_id, date_trunc('week', coalesce(completed_at, created_at))::date;

create or replace view public.workout_weekly_summary
with (security_invoker = true) as
select
  user_id,
  date_trunc('week', started_at)::date as week_start,
  count(*) as workout_count,
  coalesce(sum(duration_minutes), 0) as total_minutes
from public.workouts
where deleted_at is null
group by user_id, date_trunc('week', started_at)::date;

create or replace view public.habit_completion_summary
with (security_invoker = true) as
select
  h.user_id,
  h.id as habit_id,
  h.name,
  date_trunc('week', hl.log_date)::date as week_start,
  count(*) filter (where hl.completed_count >= h.target_count) as days_met,
  count(*) as days_logged
from public.habits h
join public.habit_logs hl on hl.habit_id = h.id
group by h.user_id, h.id, h.name, date_trunc('week', hl.log_date)::date;

-- Function form for a single day's full picture (used by the Dashboard /
-- Day view to avoid N+1 queries from the client).
create or replace function public.get_day_overview(p_user_id uuid, p_day date)
returns json
language sql
stable
security invoker
as $$
  select json_build_object(
    'expenses_total', (
      select coalesce(sum(amount), 0) from public.expenses
      where user_id = p_user_id and expense_date = p_day and deleted_at is null
    ),
    'time_total_minutes', (
      select coalesce(sum(duration_minutes), 0) from public.time_entries
      where user_id = p_user_id and entry_date = p_day and deleted_at is null
    ),
    'tasks_completed', (
      select count(*) from public.tasks
      where user_id = p_user_id and status = 'completed' and completed_at::date = p_day
    ),
    'tasks_planned', (
      select count(*) from public.tasks
      where user_id = p_user_id and planned_for = p_day and status <> 'removed'
    ),
    'workout_minutes', (
      select coalesce(sum(duration_minutes), 0) from public.workouts
      where user_id = p_user_id and started_at::date = p_day and deleted_at is null
    ),
    'sleep_minutes', (
      select coalesce(sum(duration_minutes), 0) from public.sleep_entries
      where user_id = p_user_id and sleep_start::date = p_day and deleted_at is null
    ),
    'wellbeing', (
      select json_build_object('mood', mood, 'energy', energy, 'stress', stress)
      from public.wellbeing_logs
      where user_id = p_user_id and log_date = p_day
    )
  );
$$;

grant execute on function public.get_day_overview(uuid, date) to authenticated;
