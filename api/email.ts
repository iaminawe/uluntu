// Server-side email proxy (Vercel Node.js runtime). Keeps the Resend API key
// off the client.
//
// Authorization:
//  - Authenticated Supabase users may send (newsletter/admin/transactional).
//  - Unauthenticated callers may send ONLY in the contact-form flow: a valid
//    `submissionId` that exists in contact_submissions, and every recipient
//    must be either the submission's own email or the configured support
//    address. This prevents the endpoint from being an open mail relay.
import { Resend } from 'resend';
import { getUser, secretRestSelect, parseBody, type ApiReq, type ApiRes } from './_lib/auth.js';

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

export default async function handler(req: ApiReq, res: ApiRes): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!RESEND_KEY) {
    res.status(503).json({ error: 'Email not configured' });
    return;
  }

  const body = parseBody<{
    email?: EmailPayload;
    batch?: EmailPayload[];
    submissionId?: string;
  }>(req);
  if (!body) {
    res.status(400).json({ error: 'Invalid JSON body' });
    return;
  }

  const user = await getUser(req);

  // Unauthenticated callers must pass validation for the contact-form flow.
  if (!user) {
    const { submissionId, email, batch } = body;
    if (!submissionId || !email || batch) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const rows = await secretRestSelect(
      `contact_submissions?id=eq.${encodeURIComponent(submissionId)}&select=id,email`
    );
    const submission = rows && (rows[0] as { email?: string } | undefined);
    if (!submission) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const allowed = new Set(
      [submission.email, SUPPORT_EMAIL].filter(Boolean).map((e) => e!.toLowerCase())
    );
    const bad = recipients(email.to).filter((r) => !allowed.has(r));
    if (bad.length > 0) {
      res.status(403).json({ error: 'Recipient not allowed' });
      return;
    }
  }

  const resend = new Resend(RESEND_KEY);

  try {
    if (body.batch && Array.isArray(body.batch)) {
      const payloads = body.batch.map((e) => ({ from: e.from || DEFAULT_FROM, ...e }));
      const { data, error } = await resend.batch.send(payloads as never);
      if (error) {
        res.status(502).json({ error: error.message });
        return;
      }
      res.status(200).json({ id: (data as { data?: { id?: string }[] } | null)?.data?.[0]?.id });
      return;
    }

    const email = body.email;
    if (!email || !email.to || !email.subject) {
      res.status(400).json({ error: 'email.to and email.subject are required' });
      return;
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
    if (error) {
      res.status(502).json({ error: error.message });
      return;
    }
    res.status(200).json({ id: (data as { id?: string } | null)?.id });
  } catch (err) {
    console.error('Email proxy error:', err);
    res.status(502).json({ error: 'Email send failed' });
  }
}
