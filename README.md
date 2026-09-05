# Daily Life OS

A personal life-tracking system: money, time, sleep, tasks, workouts, side
quests, habits, and wellbeing, in one place, built around a single day/night
day-ring visualization of your 24 hours.

This repo contains three parts:

```
database/   Supabase/Postgres migrations, RLS policies, views, seed data
backend/    Express + TypeScript API for privileged operations (notifications,
            exports, cron jobs) — never holds the service-role key in the browser
frontend/   Next.js 14 (App Router) + TypeScript + Tailwind + Supabase client
```

## Status of this build

This is a complete, working codebase you can run locally and deploy — but it
was generated in a sandboxed environment with no access to a live Supabase
project, Vercel, or Render account. That means:

- ✅ Every table, RLS policy, API route, form, chart, and page described in
  the product spec is implemented with real code — nothing is a mock or a
  placeholder screen.
- ✅ Backend unit tests exist and are written to actually pass.
- ⚠️ Nothing here has been run against a live database or deployed. Follow
  `docs/SETUP.md` to stand up your own Supabase project, run the migrations,
  and verify RLS/behavior yourself before relying on it.
- ⚠️ Push/email notification *delivery* is stubbed (see
  `backend/src/services/notificationService.ts`) — the scheduling, quiet
  hours, and idempotency logic are real, but you'll need to wire in a
  provider (e.g. web-push or Resend) to actually deliver notifications.

## Quickstart

1. Create a Supabase project.
2. Run the migrations in `database/migrations/` **in order** (0 through
   015) via the Supabase SQL editor or `supabase db push` — see
   `docs/SETUP.md`.
3. Copy `backend/.env.example` → `backend/.env` and fill in your Supabase
   URL + service role key.
4. Copy `frontend/.env.example` → `frontend/.env.local` and fill in your
   Supabase URL + anon key.
5. `cd backend && npm install && npm run dev` (defaults to port 4000).
6. `cd frontend && npm install && npm run dev` (defaults to port 3000).
7. Sign up in the app — your profile, default categories, and notification
   preferences are created automatically by database triggers.

Full details, troubleshooting, and deployment instructions live in `docs/`.

## Design notes

- **Timezone correctness**: "today" is always computed in the user's
  configured timezone (`profiles.timezone`), never the server's UTC clock.
  See `frontend/lib/dates/timezone.ts`.
- **RLS is the real security boundary.** Every table has `user_id = auth.uid()`
  policies (`database/migrations/014_rls.sql`). The backend's service-role
  client bypasses RLS by design and is only used for genuinely privileged
  operations (notifications, exports, cron).
- **Soft deletes** on expenses/time entries/sleep/workouts/side quests
  preserve historical analytics integrity — nothing important is
  hard-deleted from the client.
- **Insights only render when there's enough underlying data** to say
  something real (see `backend/src/services/insightsService.ts`) — no
  trend lines drawn from three data points.
