-- Attribute sleep sessions to the correct local sleep-night date and use
-- that same date in the dashboard's day overview.

create or replace view public.sleep_daily_summary
with (security_invoker = true) as
select
  s.user_id,
  s.id,
  s.sleep_start,
  s.sleep_end,
  s.duration_minutes,
  s.quality,
  case
    when (s.sleep_end at time zone coalesce(p.timezone, 'UTC'))::time <
         coalesce(p.sleep_day_boundary, time '04:00')
    then (s.sleep_end at time zone coalesce(p.timezone, 'UTC'))::date - 1
    else (s.sleep_end at time zone coalesce(p.timezone, 'UTC'))::date
  end as sleep_night
from public.sleep_entries s
left join public.profiles p on p.user_id = s.user_id
where s.deleted_at is null;

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
      where user_id = p_user_id and status = 'completed'
        and (completed_at at time zone coalesce(
          (select timezone from public.profiles where user_id = p_user_id), 'UTC'
        ))::date = p_day
    ),
    'tasks_planned', (
      select count(*) from public.tasks
      where user_id = p_user_id and planned_for = p_day and status <> 'removed'
    ),
    'workout_minutes', (
      select coalesce(sum(duration_minutes), 0) from public.workouts
      where user_id = p_user_id and deleted_at is null
        and (started_at at time zone coalesce(
          (select timezone from public.profiles where user_id = p_user_id), 'UTC'
        ))::date = p_day
    ),
    'sleep_minutes', (
      select coalesce(sum(duration_minutes), 0) from public.sleep_daily_summary
      where user_id = p_user_id and sleep_night = p_day
    ),
    'wellbeing', (
      select json_build_object('mood', mood, 'energy', energy, 'stress', stress)
      from public.wellbeing_logs
      where user_id = p_user_id and log_date = p_day
    )
  );
$$;

grant execute on function public.get_day_overview(uuid, date) to authenticated;