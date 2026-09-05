-- 004_expenses.sql

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.expense_categories(id) on delete set null,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'INR',
  expense_date date not null,
  expense_time time,
  merchant text,
  payment_method text, -- e.g. cash, card, upi, netbanking, other
  description text,
  notes text,
  deleted_at timestamptz, -- soft delete: keep history for analytics integrity
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_expenses_user_date on public.expenses(user_id, expense_date);
create index if not exists idx_expenses_user_category on public.expenses(user_id, category_id);

create trigger trg_expenses_updated_at
before update on public.expenses
for each row execute function public.set_updated_at();

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category_id uuid references public.expense_categories(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  period_type text not null default 'monthly' check (period_type in ('weekly','monthly','yearly')),
  start_date date not null,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_budgets_user on public.budgets(user_id, start_date);

create trigger trg_budgets_updated_at
before update on public.budgets
for each row execute function public.set_updated_at();
