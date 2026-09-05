import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

/**
 * Service-role client. Bypasses RLS — only ever use this for operations that
 * are genuinely privileged (notification jobs, exports, cron). Never expose
 * this client or its key to the browser.
 */
export const supabaseAdmin: SupabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/**
 * Creates a client scoped to a specific end user's access token, so that
 * RLS applies exactly as it would for a direct-from-browser Supabase call.
 * Prefer this over supabaseAdmin whenever the operation should be
 * user-scoped rather than privileged.
 */
export function supabaseForUser(accessToken: string): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
