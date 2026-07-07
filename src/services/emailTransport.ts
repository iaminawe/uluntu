// Client-side email transport shim.
//
// SECURITY: the Resend API key lives ONLY on the server (see api/email.ts).
// This shim exposes the tiny slice of the Resend client the app actually uses
// (`emails.send` and `batch.send`) but forwards every send to the /api/email
// proxy with the user's Supabase token. No key is present in the client bundle.
import { supabase } from '@/lib/supabase';

export interface EmailPayload {
  from?: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  reply_to?: string;
  headers?: Record<string, string>;
  tags?: { name: string; value: string }[];
  [key: string]: unknown;
}

export interface EmailSendResult {
  data: { id?: string } | null;
  error: { message: string } | null;
}

async function authHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
  } catch {
    /* anon (e.g. contact form) — endpoint validates via submission id */
  }
  return headers;
}

// Pull the submission id (if any) from the X-Submission-ID header the email
// services already set, so the server can authorize anon contact-form sends.
function submissionIdOf(payload: EmailPayload): string | undefined {
  const h = payload.headers || {};
  return h['X-Submission-ID'] || h['x-submission-id'] || undefined;
}

async function post(body: unknown): Promise<EmailSendResult> {
  try {
    const res = await fetch('/api/email', {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => ({}))) as {
      id?: string;
      error?: string;
    };
    if (!res.ok) {
      return { data: null, error: { message: json.error || `Email failed (${res.status})` } };
    }
    return { data: { id: json.id }, error: null };
  } catch (err) {
    return {
      data: null,
      error: { message: err instanceof Error ? err.message : 'Email request failed' },
    };
  }
}

export interface EmailTransport {
  emails: { send(payload: EmailPayload): Promise<EmailSendResult> };
  batch: { send(payloads: EmailPayload[]): Promise<EmailSendResult> };
}

export function createEmailTransport(): EmailTransport {
  return {
    emails: {
      send: (payload) =>
        post({ email: payload, submissionId: submissionIdOf(payload) }),
    },
    batch: {
      send: (payloads) => post({ batch: payloads }),
    },
  };
}
