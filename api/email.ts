// Server-side email proxy. Keeps the Resend API key off the client.
//
// Authorization:
//  - Authenticated Supabase users may send (newsletter/admin/transactional).
//  - Unauthenticated callers may send ONLY in the contact-form flow: a valid
//    `submissionId` that exists in contact_submissions, and every recipient
//    must be either the submission's own email or the configured support
//    address. This prevents the endpoint from being an open mail relay.
import { Resend } from 'resend';
import { getUserFromRequest, secretRestSelect, json } from './_lib/auth';

// Node.js runtime: the Resend SDK is not supported on the edge runtime.
export const config = { runtime: 'nodejs' };

const RESEND_KEY = process.env.RESEND_API_KEY || '';
const DEFAULT_FROM = process.env.EMAIL_FROM || 'noreply@uluntu.io';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || DEFAULT_FROM;

interface EmailPayload {
  from?: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  reply_to?: string;
  headers?: Record<string, string>;
  tags?: { name: string; value: string }[];
}

function recipients(to: string | string[]): string[] {
  return (Array.isArray(to) ? to : [to]).map((e) => (e || '').toLowerCase().trim());
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!RESEND_KEY) return json({ error: 'Email not configured' }, 503);

  let body: { email?: EmailPayload; batch?: EmailPayload[]; submissionId?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const user = await getUserFromRequest(req);

  // Unauthenticated callers must pass validation for the contact-form flow.
  if (!user) {
    const submissionId = body.submissionId;
    const email = body.email;
    if (!submissionId || !email || body.batch) {
      return json({ error: 'Unauthorized' }, 401);
    }
    // The submission must actually exist.
    const rows = await secretRestSelect(
      `contact_submissions?id=eq.${encodeURIComponent(submissionId)}&select=id,email`
    );
    const submission = rows && (rows[0] as { email?: string } | undefined);
    if (!submission) return json({ error: 'Unauthorized' }, 401);

    // Recipients are constrained to the submitter or the support inbox.
    const allowed = new Set(
      [submission.email, SUPPORT_EMAIL].filter(Boolean).map((e) => e!.toLowerCase())
    );
    const bad = recipients(email.to).filter((r) => !allowed.has(r));
    if (bad.length > 0) return json({ error: 'Recipient not allowed' }, 403);
  }

  const resend = new Resend(RESEND_KEY);

  try {
    if (body.batch && Array.isArray(body.batch)) {
      const payloads = body.batch.map((e) => ({ from: e.from || DEFAULT_FROM, ...e }));
      const { data, error } = await resend.batch.send(payloads as never);
      if (error) return json({ error: error.message }, 502);
      return json({ id: (data as { data?: { id?: string }[] } | null)?.data?.[0]?.id });
    }

    const email = body.email;
    if (!email || !email.to || !email.subject) {
      return json({ error: 'email.to and email.subject are required' }, 400);
    }
    const { data, error } = await resend.emails.send({
      from: email.from || DEFAULT_FROM,
      to: email.to,
      subject: email.subject,
      html: email.html,
      text: email.text,
      reply_to: email.reply_to,
      headers: email.headers,
      tags: email.tags,
    } as never);
    if (error) return json({ error: error.message }, 502);
    return json({ id: (data as { id?: string } | null)?.id });
  } catch (err) {
    console.error('Email proxy error:', err);
    return json({ error: 'Email send failed' }, 502);
  }
}
