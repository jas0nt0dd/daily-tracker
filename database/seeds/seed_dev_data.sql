-- seed_dev_data.sql
--
-- DEVELOPMENT ONLY. Do not run against production.
--
-- Populates a sample day/week of data for ONE existing auth user so the UI
-- can be exercised end to end. Replace :'seed_user_id' before running, e.g.:
--   psql "$DATABASE_URL" -v seed_user_id="'00000000-0000-0000-0000-000000000000'" -f seed_dev_data.sql
--
-- The user must already exist in auth.users (sign up once through the app
-- first, which auto-creates the profile + default categories via triggers).

do $$
declare
  uid uuid := :seed_user_id;
  cat_food uuid;
  cat_grocery uuid;
  cat_transport uuid;
  time_office uuid;
  time_workout uuid;
  time_entertainment uuid;
  quest_id uuid;
begin
  select id into cat_food from public.expense_categories where user_id = uid and name = 'Food' limit 1;
  select id into cat_grocery from public.expense_categories where user_id = uid and name = 'Grocery' limit 1;
  select id into cat_transport from public.expense_categories where user_id = uid and name = 'Transport' limit 1;

  select id into time_office from public.time_categories where user_id = uid and name = 'Office' limit 1;
  select id into time_workout from public.time_categories where user_id = uid and name = 'Workout' limit 1;
  select id into time_entertainment from public.time_categories where user_id = uid and name = 'Entertainment' limit 1;

  -- Expenses (last 3 days)
  insert into public.expenses (user_id, category_id, amount, expense_date, description, payment_method)
  values
    (uid, cat_grocery, 540, current_date, 'Weekly groceries', 'upi'),
    (uid, cat_food, 220, current_date, 'Lunch', 'card'),
    (uid, cat_transport, 80, current_date, 'Auto fare', 'cash'),
    (uid, cat_food, 350, current_date - 1, 'Dinner out', 'card'),
    (uid, cat_grocery, 610, current_date - 2, 'Monthly staples', 'upi');

  -- Time entries (today)
  insert into public.time_entries (user_id, category_id, activity_name, duration_minutes, entry_date)
  values
    (uid, time_office, 'Office work', 540, current_date),
    (uid, time_workout, 'Gym session', 60, current_date),
    (uid, time_entertainment, 'Evening downtime', 60, current_date);

  -- Sleep (last night)
  insert into public.sleep_entries (user_id, sleep_start, sleep_end, quality)
  values (
    uid,
    (current_date - 1 + time '23:00') at time zone 'Asia/Kolkata',
    (current_date + time '06:30') at time zone 'Asia/Kolkata',
    4
  );

  -- Tasks
  insert into public.tasks (user_id, title, priority, status, planned_for, due_at)
  values
    (uid, 'Finish project documentation', 'high', 'pending', current_date, now() + interval '4 hours'),
    (uid, 'Reply to client email', 'medium', 'completed', current_date - 1, now() - interval '1 day'),
    (uid, 'Review pull request', 'low', 'pending', current_date + 1, null);

  update public.tasks set completed_at = now() - interval '20 hours'
  where user_id = uid and title = 'Reply to client email';

  -- Workout
  insert into public.workouts (user_id, workout_type, started_at, duration_minutes, intensity)
  values (uid, 'gym', now() - interval '3 hours', 60, 'moderate');

  -- Habits + today's logs
  insert into public.habits (user_id, name, frequency_type, target_count)
  values (uid, 'Drink 3L water', 'daily', 1), (uid, 'Read 20 minutes', 'daily', 1)
  returning id into quest_id; -- last inserted id (Read habit), fine for demo

  insert into public.habit_logs (user_id, habit_id, log_date, completed_count)
  select uid, h.id, current_date, 1 from public.habits h where h.user_id = uid;

  -- Side quest with milestones
  insert into public.side_quests (user_id, title, category, status, progress_percent, start_date, target_date)
  values (uid, 'Build personal SaaS project', 'Project', 'active', 35, current_date - 20, current_date + 40)
  returning id into quest_id;

  insert into public.side_quest_milestones (side_quest_id, user_id, title, due_date, completed, sort_order)
  values
    (quest_id, uid, 'Research', current_date - 15, true, 1),
    (quest_id, uid, 'MVP', current_date + 10, false, 2),
    (quest_id, uid, 'Testing', current_date + 25, false, 3),
    (quest_id, uid, 'Launch', current_date + 40, false, 4);

  -- Wellbeing check-in
  insert into public.wellbeing_logs (user_id, log_date, mood, energy, stress)
  values (uid, current_date, 4, 3, 2)
  on conflict (user_id, log_date) do nothing;

  -- Budget
  insert into public.budgets (user_id, name, category_id, amount, period_type, start_date)
  values (uid, 'Monthly overall budget', null, 20000, 'monthly', date_trunc('month', current_date)::date);
end $$;
