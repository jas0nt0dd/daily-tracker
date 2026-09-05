import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

/**
 * Client for use in Client Components. Reads the anon key + URL from
 * NEXT_PUBLIC_* env vars — safe to ship to the browser. RLS on every table
 * is what actually enforces per-user isolation, not this client.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
