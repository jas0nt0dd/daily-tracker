# Deployment

This assumes: Supabase (database + auth), Vercel (frontend), Render (backend
+ cron). Substitute equivalents as you prefer — nothing here is
Vercel/Render-specific at the code level.

## Database (Supabase)

Already covered in `SETUP.md`. Use a separate Supabase project for
production vs. local/staging development so you never run experimental
migrations against real data.

## Backend → Render

1. Push this repo to GitHub.
2. In Render: **New → Web Service**, point at the repo, set:
   - Root directory: `backend`
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
3. Environment variables (Render → Environment): set all of
   `backend/.env.example`'s keys with production values. Use your
   **production** Supabase project's URL and service-role key.
   `FRONTEND_URL` should be your deployed frontend's origin(s), comma
   separated if there's more than one (e.g. a preview + production domain).
4. Add a **Render Cron Job** (separate from the web service):
   - Command: `curl -X POST https://YOUR-BACKEND.onrender.com/api/jobs/process-reminders -H "x-cron-secret: $CRON_SECRET"`
   - Schedule: every 5–15 minutes (`*/10 * * * *`)
   - Give the cron job the same `CRON_SECRET` env var as the web service.

## Frontend → Vercel

1. In Vercel: **New Project**, import the repo, set:
   - Root directory: `frontend`
   - Framework preset: Next.js (auto-detected)
2. Environment variables: `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_API_URL` (your Render
   backend's URL).
3. Deploy. Add the deployed domain to the backend's `FRONTEND_URL`.

## Supabase Auth redirect URLs

In Supabase → Authentication → URL Configuration, add your deployed
frontend's URL (and `http://localhost:3000` for local dev) to both the Site
URL and the additional Redirect URLs list, or email confirmation / password
reset links will point at the wrong place.

## Post-deploy checklist

- [ ] `curl https://YOUR-BACKEND/health` returns `{"status":"ok"}`
- [ ] Sign up with a real email on the deployed frontend and confirm the
      profile + default categories appear (check Supabase Table Editor)
- [ ] Log one entry in every module (expense, time, sleep, task, workout,
      side quest, habit, wellbeing) and confirm it round-trips
- [ ] Trigger the cron endpoint manually once and check
      `notification_jobs` gets rows with `status = 'sent'`
- [ ] Run the CSV and JSON export from Settings and confirm the file
      downloads and contains your data
- [ ] Re-run the two-account RLS check from `SETUP.md` against production
