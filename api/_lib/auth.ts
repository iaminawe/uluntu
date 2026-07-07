// Shared server-side helpers for /api functions.
// Files/dirs prefixed with "_" are NOT routed as endpoints by Vercel.

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
// Publishable/anon key used only as the required `apikey` header when calling
// the Supabase Auth API. Not a secret.
const SUPABASE_PUBLISHABLE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
// Secret key (server-only) for privileged reads (e.g. validating a row exists).
const SUPABASE_SECRET_KEY =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export interface AuthedUser {
  id: string;
  email?: string;
}

/**
 * Validate the caller's Supabase access token by calling the Auth API.
 * Returns the user, or null if the token is missing/invalid.
 */
export async function getUserFromRequest(req: Request): Promise<AuthedUser | null> {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : '';
  if (!token || !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return null;

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_PUBLISHABLE_KEY,
      },
    });
    if (!res.ok) return null;
    const user = (await res.json()) as { id?: string; email?: string };
    return user?.id ? { id: user.id, email: user.email } : null;
  } catch {
    return null;
  }
}

/**
 * Server-side privileged read against PostgREST using the secret key.
 * Used to validate that a referenced row exists (e.g. a contact submission)
 * before performing an unauthenticated side effect.
 */
export async function secretRestSelect(
  path: string
): Promise<unknown[] | null> {
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      headers: {
        apikey: SUPABASE_SECRET_KEY,
        Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as unknown[];
  } catch {
    return null;
  }
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
