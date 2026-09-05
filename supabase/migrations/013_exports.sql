-- 013_exports.sql
-- Tracks export jobs requested via the backend (POST /api/exports).
-- The actual file is generated on demand and streamed back / stored
-- temporarily; this table just tracks request state so the frontend can poll.

create table if not exists public.export_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  format text not null check (format in ('csv','json')),
  status text not null default 'pending' check (status in ('pending','processing','completed','failed')),
  file_path text,
  error_message text,
  requested_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists idx_export_jobs_user on public.export_jobs(user_id, requested_at desc);
