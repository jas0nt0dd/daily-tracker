-- 009_side_quests.sql

create table if not exists public.side_quests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  category text,
  status text not null default 'planned' check (status in ('planned','active','paused','completed','abandoned')),
  priority text not null default 'medium' check (priority in ('low','medium','high')),
  progress_percent smallint not null default 0 check (progress_percent between 0 and 100),
  start_date date,
  target_date date,
  completed_at timestamptz,
  notes text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_side_quests_user_status on public.side_quests(user_id, status);

create trigger trg_side_quests_updated_at
before update on public.side_quests
for each row execute function public.set_updated_at();

create table if not exists public.side_quest_milestones (
  id uuid primary key default gen_random_uuid(),
  side_quest_id uuid not null references public.side_quests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  due_date date,
  completed boolean not null default false,
  completed_at timestamptz,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_side_quest_milestones_quest on public.side_quest_milestones(side_quest_id, sort_order);

create trigger trg_side_quest_milestones_updated_at
before update on public.side_quest_milestones
for each row execute function public.set_updated_at();

-- Optional loose links so a side quest can be connected to time entries,
-- tasks, or habits without forcing a rigid foreign key on those tables.
create table if not exists public.side_quest_links (
  id uuid primary key default gen_random_uuid(),
  side_quest_id uuid not null references public.side_quests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  linked_type text not null check (linked_type in ('time_entry','task','habit')),
  linked_id uuid not null,
  created_at timestamptz not null default now(),
  unique (side_quest_id, linked_type, linked_id)
);

create index if not exists idx_side_quest_links_quest on public.side_quest_links(side_quest_id);
