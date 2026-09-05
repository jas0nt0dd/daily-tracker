# Troubleshooting

### "Invalid environment configuration" on backend startup
The backend validates all required env vars at boot
(`backend/src/config/env.ts`) and exits immediately if any are missing or
malformed, rather than failing confusingly later. Check the printed field
errors against `docs/ENVIRONMENT_VARIABLES.md`.

### CORS errors in the browser console
`FRONTEND_URL` on the backend must **exactly** match the origin the
frontend is served from (protocol + host + port), comma-separated if there
are multiple. `http://localhost:3000` and `http://127.0.0.1:3000` are
different origins.

### Sign-up works but no profile/categories appear
The auto-provisioning is done by Postgres triggers
(`handle_new_user` → `seed_default_categories` /
`seed_notification_preferences` in migrations 002/003/012). If rows are
missing, confirm those migrations ran successfully and that the triggers
exist: in the SQL editor, `select * from pg_trigger where tgname like 'on_%'`.

### A user can see (or can't see) the wrong data
This is almost always an RLS issue. Confirm:
1. `alter table ... enable row level security` **and**
   `force row level security` both ran (migration 014).
2. The frontend is using the **anon** key + a real user session — the
   `service_role` key must never reach the browser.
3. Re-run the two-account manual test in `docs/SETUP.md`.

### Notifications aren't arriving
By design, `notificationService.ts` only *marks jobs as sent* and logs what
would be delivered — actual push/email delivery is a pluggable step you
need to wire in (see the README's "Status of this build" section). Check
the backend logs / `notification_jobs` table to confirm jobs are being
created and marked `sent`; if that's happening, the gap is the delivery
provider, not the scheduling logic.

### Times/dates look off by a few hours
Check `profiles.timezone` for the affected user. All "today" and daily
aggregation logic reads this field (`frontend/lib/dates/timezone.ts`) — if
it's wrong or still the default, update it from Settings → Profile.

### `npm run build` fails on the frontend with a Supabase type error
The `Database` type in `frontend/types/database.ts` is hand-written to
match the SQL migrations. If you've since changed the schema without
regenerating types, either update this file to match or (recommended once
you have a real project) replace it with:
```bash
supabase gen types typescript --project-id YOUR_PROJECT_REF > types/database.ts
```

### Export downloads an empty file
The export endpoint uses the user-scoped (RLS-respecting) Supabase client,
not the admin client — if RLS is misconfigured such that the user can't see
their own rows, the export will be empty too. Debug RLS first (see above).
