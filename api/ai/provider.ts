// Transparent AI provider proxy for the BlockNote xl-ai inline editor.
//
// The client-side AI SDK model is configured with a custom fetch that rewrites
// every provider call to `/api/ai/provider?provider=<p>&url=<original>` and
// attaches the user's Supabase token. This endpoint authenticates the user,
// injects the REAL provider key (never in the client), and forwards the raw
// request to the provider — so BlockNote's streaming AI menu works without any
// key in the bundle.
import { getUser, type ApiReq, type ApiRes } from '../_lib/auth.js';

// SSRF guard: only these hosts may ever be proxied.
const ALLOWED_HOST: Record<string, string> = {
  openai: 'api.openai.com',
  anthropic: 'api.anthropic.com',
};

const OPENAI_KEY = process.env.OPENAI_API_KEY || '';
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';

function q(v: string | string[] | undefined): string {
  return Array.isArray(v) ? v[0] || '' : v || '';
}

export default async function handler(req: ApiReq, res: ApiRes): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Authenticate: the token arrives as the Bearer "apiKey" the SDK was given.
  const user = await getUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const provider = q(req.query?.provider);
  const targetUrl = q(req.query?.url);
  const allowedHost = ALLOWED_HOST[provider];
  if (!allowedHost || !targetUrl) {
    res.status(400).json({ error: 'Invalid provider or url' });
    return;
  }

  // SSRF guard — the target must be the exact provider host.
  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
  } catch {
    res.status(400).json({ error: 'Invalid url' });
    return;
  }
  if (parsed.protocol !== 'https:' || parsed.host !== allowedHost) {
    res.status(400).json({ error: 'Host not allowed' });
    return;
  }

  const key = provider === 'anthropic' ? ANTHROPIC_KEY : OPENAI_KEY;
  if (!key) {
    res.status(503).json({ error: `${provider} not configured` });
    return;
  }

  // Build outbound headers: JSON + the real provider auth, nothing client-supplied.
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (provider === 'anthropic') {
    headers['x-api-key'] = key;
    headers['anthropic-version'] =
      q(req.headers['anthropic-version']) || '2023-06-01';
    const beta = q(req.headers['anthropic-beta']);
    if (beta) headers['anthropic-beta'] = beta;
  } else {
    headers['authorization'] = `Bearer ${key}`;
  }

  try {
    const upstream = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {}),
    });

    res.status(upstream.status);
    res.setHeader(
      'Content-Type',
      upstream.headers.get('content-type') || 'application/json'
    );
    res.setHeader('Cache-Control', 'no-store');

    if (!upstream.body) {
      res.end();
      return;
    }
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }
    res.end();
  } catch (err) {
    console.error('AI provider proxy error:', err);
    try {
      res.status(502).json({ error: 'Upstream request failed' });
    } catch {
      res.end();
    }
  }
}
