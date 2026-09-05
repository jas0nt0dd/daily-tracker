# Environment Variables

## `backend/.env`

| Variable | Required | Notes |
|---|---|---|
| `PORT` | No (default 4000) | Port the Express server listens on |
| `NODE_ENV` | No (default development) | `development` \| `test` \| `production` |
| `SUPABASE_URL` | Yes | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | **Secret.** Bypasses RLS. Never expose to a browser or commit to git. |
| `SUPABASE_ANON_KEY` | Yes | Used to build user-scoped (RLS-respecting) Supabase clients server-side |
| `FRONTEND_URL` | Yes | Comma-separated list of allowed CORS origins |
| `CRON_SECRET` | Yes | Shared secret required in the `x-cron-secret` header to call `/api/jobs/process-reminders` |

## `frontend/.env.local`

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Same Supabase project URL as the backend |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Safe to expose — RLS is what actually protects data, not this key |
| `NEXT_PUBLIC_API_URL` | Yes | Base URL of the deployed/local backend, e.g. `http://localhost:4000` |

All `NEXT_PUBLIC_*` variables are baked into the client bundle at build
time — never put a secret behind that prefix.

## Rotating the service role key

If `SUPABASE_SERVICE_ROLE_KEY` is ever exposed (e.g. accidentally committed
or logged), rotate it immediately from Supabase → Project Settings → API →
"Reset service_role key", then update it in Render's environment variables
and redeploy the backend.
