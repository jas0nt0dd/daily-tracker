-- 008_workouts.sql

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_type text not null check (workout_type in
    ('gym','running','walking','cycling','sports','home_workout','yoga','mobility','other')),
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_minutes int not null check (duration_minutes > 0),
  intensity text check (intensity in ('low','moderate','high')),
  notes text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_workouts_user_started on public.workouts(user_id, started_at);

create trigger trg_workouts_updated_at
before update on public.workouts
for each row execute function public.set_updated_at();

-- Optional detailed exercise logging. A workout does not require any rows here
-- ("lightweight mode" per the product spec).
create table if not exists public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_name text not null,
  sets int check (sets is null or sets > 0),
  reps int check (reps is null or reps > 0),
  weight numeric(7,2) check (weight is null or weight >= 0),
  distance numeric(8,2) check (distance is null or distance >= 0),
  duration_seconds int check (duration_seconds is null or duration_seconds > 0),
  notes text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_workout_exercises_workout on public.workout_exercises(workout_id);
