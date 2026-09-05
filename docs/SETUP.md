# Setup

## 1. Create a Supabase project

1. Go to https://supabase.com/dashboard and create a new project.
2. Note down, from Project Settings → API:
   - Project URL (`SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL`)
   - `anon` public key (`SUPABASE_ANON_KEY` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - `service_role` secret key (`SUPABASE_SERVICE_ROLE_KEY` — **backend only,
     never put this in the frontend or commit it**)

## 2. Run the database migrations

Migrations live in `database/migrations/` and are numbered — run them in
order. Two ways to do this:

### Option A: Supabase SQL Editor (simplest)

Open the SQL Editor in the Supabase dashboard and paste in each file's
contents in numeric order (`001_extensions.sql` through
`015_views_and_functions.sql`), running each one before moving to the next.

### Option B: Supabase CLI

```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
# Copy the migrations into supabase/migrations/ with Supabase CLI's naming
# convention (or point supabase db push at this database/migrations folder
# by copying it to supabase/migrations before running):
supabase db push
```

After running migrations, check in the Table Editor that all tables exist
and that **RLS is enabled** (a small "RLS enabled" badge appears per table).
`014_rls.sql` enables and forces RLS on every user-owned table — if you see
any table without it, re-run that migration.

## 3. (Optional) Seed sample data

1. Sign up once through the running frontend app so a real `auth.users` row
   (and the auto-created profile + default categories) exists.
2. Find that user's id in Supabase → Authentication → Users.
3. Run:
   ```bash
   psql "$DATABASE_URL" \
     -v seed_user_id="'<paste-user-id-here>'" \
     -f database/seeds/seed_dev_data.sql
   ```
   `DATABASE_URL` is under Project Settings → Database → Connection string.

## 4. Backend

```bash
cd backend
cp .env.example .env
# fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY,
# FRONTEND_URL (http://localhost:3000 for local dev), and a random CRON_SECRET
npm install
npm run dev
```

Verify it's up: `curl http://localhost:4000/health` should return
`{"status":"ok", ...}`.

Run tests: `npm test`.

## 5. Frontend

```bash
cd frontend
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# and NEXT_PUBLIC_API_URL (http://localhost:4000 for local dev)
npm install
npm run dev
```

Open http://localhost:3000, sign up, and you should land on the dashboard.

## 6. Verifying RLS actually works

Before trusting this with real data:

1. Create two test accounts.
2. Log expenses/tasks/etc. as user A.
3. Log in as user B and confirm you see **none** of user A's data anywhere
   in the UI.
4. In the Supabase SQL editor, run a query as the `anon` role
   impersonating user B's JWT (`select set_config('request.jwt.claims', ...)`)
   and confirm `select * from expenses` only returns user B's rows.

This step was not (and could not be) performed for you in the environment
this codebase was generated in — do not skip it.
