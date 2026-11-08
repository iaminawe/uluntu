// Server-side email proxy (Vercel Node.js runtime). Keeps the Resend API key
// off the client.
//
// Authorization:
//  - Site admins (user_roles admin/superadmin) may send free-form email and
//    batches (newsletters, test sends, admin notifications). `from` must stay
//    on the configured sending domain.
//  - Contact-form flow (signed in or not): requires a recent `submissionId`.
//    Mail addressed to the submitter only ever gets a fixed acknowledgement
//    built here. Any other recipients are replaced with the support address,
//    which may receive the client's content. Either way the endpoint can't be
//    used to send arbitrary content to arbitrary people.
//  - Other signed-in users may send a single email to their own address only
//    (e.g. newsletter confirmation), with the default `from`.
//  - Everything else is rejected.
import { Resend } from 'resend';
import {
  getUser,
  isSiteAdmin,
  secretRestSelect,
  parseBody,
  type ApiReq,
  type ApiRes,
} from './_lib/auth.js';

const SUPABASE_CONFIGURED = Boolean(
  (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL) &&
    (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)
);

const RESEND_KEY = process.env.RESEND_API_KEY || '';
const DEFAULT_FROM = process.env.EMAIL_FROM || 'noreply@uluntu.io';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Uluntu';
const SUPPORT_EMAIL = (process.env.SUPPORT_EMAIL || DEFAULT_FROM).toLowerCase();

const SUBMISSION_MAX_AGE_MS = 15 * 60 * 1000;
const MAX_HTML_BYTES = 200_000;

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

function domainOf(address: string): string {
  const match = address.match(/<([^>]+)>/);
  const bare = (match ? match[1] : address).trim().toLowerCase();
  return bare.slice(bare.lastIndexOf('@') + 1);
}

// Only allow `from` addresses on the domain the project actually sends from.
function safeFrom(requested: string | undefined): string {
  if (requested && domainOf(requested) === domainOf(DEFAULT_FROM)) return requested;
  return DEFAULT_FROM;
}

// Returns null when the lookup itself failed (for example a missing or revoked
// secret key), so callers can report a server error instead of silently
// treating an admin as an ordinary member.
function acknowledgement(to: string) {
  return {
    from: DEFAULT_FROM,
    to,
    subject: `We received your message`,
    text:
      `Thanks for getting in touch with ${FROM_NAME}.\n\n` +
      `We've received your message and will reply as soon as we can.\n\n` +
      `If you didn't contact us, you can ignore this email.`,
  };
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
  if (!SUPABASE_CONFIGURED) {
    console.error('Email proxy: SUPABASE_URL and SUPABASE_SECRET_KEY must be set');
    res.status(503).json({ error: 'Email auth not configured' });
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
  const admin = user ? await isSiteAdmin(user.id) : false;
  if (admin === null) {
    console.error('Email proxy: role lookup failed; check SUPABASE_SECRET_KEY');
    res.status(503).json({ error: 'Email auth unavailable' });
    return;
  }
  const resend = new Resend(RESEND_KEY);

  try {
    // --- Admins: free-form sends and batches --------------------------------
    if (admin) {
      if (body.batch && Array.isArray(body.batch)) {
        const payloads = body.batch.map((e) => ({ ...e, from: safeFrom(e.from) }));
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
        from: safeFrom(email.from),
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
      return;
    }

    // Non-admins never get batches.
    const email = body.email;
    if (body.batch || !email || !email.to || !email.subject) {
      res.status(user ? 403 : 401).json({ error: user ? 'Forbidden' : 'Unauthorized' });
      return;
    }
    const to = recipients(email.to);
    if ((email.html?.length || 0) > MAX_HTML_BYTES) {
      res.status(413).json({ error: 'Email too large' });
      return;
    }

    // --- Contact-form flow ---------------------------------------------------
    if (body.submissionId) {
      const rows = await secretRestSelect(
        `contact_submissions?id=eq.${encodeURIComponent(body.submissionId)}&select=email,created_at`
      );
      const submission = rows && (rows[0] as { email?: string; created_at?: string } | undefined);
      const fresh =
        submission?.created_at &&
        Date.now() - new Date(submission.created_at).getTime() < SUBMISSION_MAX_AGE_MS;
      if (!submission || !fresh) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const submitter = (submission.email || '').toLowerCase();
      const message =
        to.length === 1 && to[0] === submitter
          ? // Reply to the submitter: fixed content only.
            acknowledgement(submitter)
          : // Anything else (e.g. the admin notification list) goes only to
            // our own support inbox, where client content is fine.
            {
              from: DEFAULT_FROM,
              to: SUPPORT_EMAIL,
              subject: email.subject.slice(0, 200),
              html: email.html,
              text: email.text,
            };

      const { data, error } = await resend.emails.send(message as never);
      if (error) {
        res.status(502).json({ error: error.message });
        return;
      }
      res.status(200).json({ id: (data as { id?: string } | null)?.id });
      return;
    }

    // --- Signed-in members: only to their own address -----------------------
    if (user && user.email && to.length === 1 && to[0] === user.email.toLowerCase()) {
      const { data, error } = await resend.emails.send({
        from: DEFAULT_FROM,
        to: to[0],
        subject: email.subject.slice(0, 200),
        html: email.html,
        text: email.text,
      } as never);
      if (error) {
        res.status(502).json({ error: error.message });
        return;
      }
      res.status(200).json({ id: (data as { id?: string } | null)?.id });
      return;
    }

    res.status(user ? 403 : 401).json({ error: user ? 'Forbidden' : 'Unauthorized' });
  } catch (err) {
    console.error('Email proxy error:', err);
    res.status(502).json({ error: 'Email send failed' });
  }
}
