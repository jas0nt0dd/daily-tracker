import { createClient } from '@/lib/supabase/client';

export async function callBackend<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!configuredUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is missing. Set it to the deployed backend URL and redeploy the frontend.');
  }

  let apiUrl: string;
  try {
    const parsedUrl = new URL(configuredUrl);
    if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') throw new Error();
    apiUrl = configuredUrl.replace(/\/+$/, '');
  } catch {
    throw new Error('NEXT_PUBLIC_API_URL must be a complete http:// or https:// backend URL.');
  }

  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Your session has expired. Sign in again to load Insights.');

  let res: Response;
  try {
    res = await fetch(`${apiUrl}${path.startsWith('/') ? path : `/${path}`}`, {
      ...init,
      headers: {
        ...(init.headers ?? {}),
        Authorization: `Bearer ${session.access_token}`,
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      },
    });
  } catch {
    throw new Error(`Could not connect to ${apiUrl}. Confirm the backend is running and allows the deployed frontend origin.`);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Backend request failed with status ${res.status}.`);
  }

  return res.json();
}
