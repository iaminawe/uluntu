// Shared server-side helpers for /api functions (Vercel Node.js runtime).
// Files/dirs prefixed with "_" are NOT routed as endpoints by Vercel.

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
// Publishable/anon key used only as the required `apikey` header when calling
// the Supabase Auth API. Not a secret.
const SUPABASE_PUBLISHABLE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
// Secret key (server-only) for privileged reads (e.g. validating a row exists).
const SUPABASE_SECRET_KEY =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Minimal shapes for Vercel Node.js request/response (avoids a type dependency).
export interface ApiReq {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
}
export interface ApiRes {
  status(code: number): ApiRes;
  json(body: unknown): void;
  setHeader(key: string, value: string): void;
  write(chunk: string): boolean;
  end(): void;
}

export interface AuthedUser {
  id: string;
  email?: string;
}

function headerValue(v: string | string[] | undefined): string {
  return Array.isArray(v) ? v[0] || '' : v || '';
}

/**
 * Validate the caller's Supabase access token via the Auth API.
 * Returns the user, or null if the token is missing/invalid.
 */
export async function getUser(req: ApiReq): Promise<AuthedUser | null> {
  const authHeader = headerValue(req.headers['authorization'] || req.headers['Authorization']);
  const token = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : '';
  if (!token || !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return null;

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_PUBLISHABLE_KEY },
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
 * Used to confirm a referenced row exists before an unauthenticated side effect.
 */
export async function secretRestSelect(path: string): Promise<unknown[] | null> {
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      headers: { apikey: SUPABASE_SECRET_KEY, Authorization: `Bearer ${SUPABASE_SECRET_KEY}` },
    });
    if (!res.ok) return null;
    return (await res.json()) as unknown[];
  } catch {
    return null;
  }
}

/** Parse a JSON body whether Vercel pre-parsed it or handed us a string. */
export function parseBody<T>(req: ApiReq): T | null {
  const b = req.body;
  if (b == null) return null;
  if (typeof b === 'string') {
    try {
      return JSON.parse(b) as T;
    } catch {
      return null;
    }
  }
  return b as T;
}
