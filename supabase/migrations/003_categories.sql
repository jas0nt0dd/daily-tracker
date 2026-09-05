-- 003_categories.sql
-- Per-user customizable categories for expenses and time entries.
-- Default categories are seeded per-user on signup (see function below),
-- not shared globally, so a user can freely rename/delete without affecting anyone else.

create table if not exists public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table if not exists public.time_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create index if not exists idx_expense_categories_user on public.expense_categories(user_id);
create index if not exists idx_time_categories_user on public.time_categories(user_id);

-- Seed a sensible default category set for a newly created user.
create or replace function public.seed_default_categories()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  expense_defaults text[] := array[
    'Food','Grocery','Transport','Petrol/Fuel','Shopping','Bills','Utilities',
    'Health','Fitness','Entertainment','Education','Travel','Subscriptions',
    'Family','Gifts','Personal','Other'
  ];
  time_defaults text[] := array[
    'Sleep','Office','Commute','Travel','Workout','Learning','Entertainment',
    'Family','Social','Personal','Side Quest','Household','Other'
  ];
  cat text;
begin
  foreach cat in array expense_defaults loop
    insert into public.expense_categories (user_id, name, is_default)
    values (new.user_id, cat, true)
    on conflict (user_id, name) do nothing;
  end loop;

  foreach cat in array time_defaults loop
    insert into public.time_categories (user_id, name, is_default)
    values (new.user_id, cat, true)
    on conflict (user_id, name) do nothing;
  end loop;

  return new;
end;
$$;

drop trigger if exists on_profile_created_seed_categories on public.profiles;
create trigger on_profile_created_seed_categories
after insert on public.profiles
for each row execute function public.seed_default_categories();
