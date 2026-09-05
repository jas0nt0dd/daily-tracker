-- 014_rls.sql
-- Mandatory RLS: every user-owned table only exposes rows where user_id = auth.uid().
-- The backend's service-role key bypasses RLS by design (Postgres superuser-like
-- role) and must only be used server-side, never sent to the browser.

-- Helper: apply the standard "own rows only" policy set to a table in one call.
do $$
declare
  t text;
  tables text[] := array[
    'profiles',
    'expense_categories',
    'time_categories',
    'expenses',
    'budgets',
    'time_entries',
    'sleep_entries',
    'tasks',
    'task_events',
    'workouts',
    'workout_exercises',
    'side_quests',
    'side_quest_milestones',
    'side_quest_links',
    'habits',
    'habit_logs',
    'wellbeing_logs',
    'notification_preferences',
    'notification_jobs',
    'export_jobs'
  ];
begin
  foreach t in array tables loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('alter table public.%I force row level security;', t);

    execute format(
      'drop policy if exists %1$s_select_own on public.%1$s;', t
    );
    execute format(
      'create policy %1$s_select_own on public.%1$s for select using (user_id = auth.uid());', t
    );

    execute format(
      'drop policy if exists %1$s_insert_own on public.%1$s;', t
    );
    execute format(
      'create policy %1$s_insert_own on public.%1$s for insert with check (user_id = auth.uid());', t
    );

    execute format(
      'drop policy if exists %1$s_update_own on public.%1$s;', t
    );
    execute format(
      'create policy %1$s_update_own on public.%1$s for update using (user_id = auth.uid()) with check (user_id = auth.uid());', t
    );

    execute format(
      'drop policy if exists %1$s_delete_own on public.%1$s;', t
    );
    execute format(
      'create policy %1$s_delete_own on public.%1$s for delete using (user_id = auth.uid());', t
    );
  end loop;
end $$;

-- profiles is special: a user should only ever have exactly one row and it is
-- keyed by user_id already, the generic policies above are sufficient. We also
-- explicitly forbid a user from changing their own user_id via update check
-- (already covered: with check (user_id = auth.uid()) means they cannot move
-- ownership to someone else).

-- Notes on tables without a direct user_id column at the schema level:
-- every table in `tables` above DOES include user_id directly (denormalized
-- onto child tables like task_events, workout_exercises, side_quest_milestones,
-- side_quest_links) specifically so a single simple RLS policy shape works
-- everywhere, instead of relying on joins inside policies (joins in RLS
-- policies are correct but slower and easier to get subtly wrong).
