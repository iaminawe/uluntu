// Link or unlink a member's Nostr key (NIP-05 identity, stage 1).
//
// GET: returns the URL the member must sign (built from SITE_URL, so the
//   check doesn't rely on forwarded host headers).
// POST { event }: the member signs a kind 27235 event in their browser
// extension (NIP-07) naming that URL and their account. We verify it and store
// the pubkey, which makes <slug>@<domain> resolve via /.well-known/nostr.json.
// DELETE: unlink.
import {
  getUser,
  parseBody,
  secretRestSelect,
  secretRestWrite,
  type ApiReq,
  type ApiRes,
} from '../_lib/auth.js';
import { verifyLinkEvent } from '../_lib/nostr.js';
import { siteUrl } from '../_lib/nostr-config.js';

export default async function handler(req: ApiReq, res: ApiRes): Promise<void> {
  if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'DELETE') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const linkUrl = `${siteUrl(req)}/api/nostr/link`;
  if (req.method === 'GET') {
    res.status(200).json({ url: linkUrl });
    return;
  }

  const user = await getUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const rows = await secretRestSelect(
    `members?user_id=eq.${encodeURIComponent(user.id)}&select=id,slug&limit=1`
  );
  if (!Array.isArray(rows)) {
    res.status(503).json({ error: 'Member lookup unavailable' });
    return;
  }
  const member = rows[0] as { id: string; slug: string | null } | undefined;
  if (!member) {
    res.status(404).json({ error: 'Create your member profile first' });
    return;
  }
  const memberPath = `members?id=eq.${encodeURIComponent(member.id)}`;

  if (req.method === 'DELETE') {
    const status = await secretRestWrite('PATCH', memberPath, { nostr_pubkey: null });
    if (status === null || status >= 300) {
      res.status(502).json({ error: 'Could not unlink key' });
      return;
    }
    res.status(200).json({ pubkey: null });
    return;
  }

  const body = parseBody<{ event?: unknown }>(req);
  const result = verifyLinkEvent(body?.event, {
    url: linkUrl,
    userId: user.id,
    now: Math.floor(Date.now() / 1000),
  });
  if ('error' in result) {
    res.status(400).json({ error: result.error });
    return;
  }

  const status = await secretRestWrite('PATCH', memberPath, { nostr_pubkey: result.pubkey });
  if (status === 409) {
    res.status(409).json({ error: 'That key is already linked to another member' });
    return;
  }
  if (status === null || status >= 300) {
    res.status(502).json({ error: 'Could not link key' });
    return;
  }
  // The column is guarded by a trigger; confirm the write actually stuck.
  const saved = await secretRestSelect(`${memberPath}&select=nostr_pubkey`);
  if (!Array.isArray(saved) || (saved[0] as { nostr_pubkey?: string })?.nostr_pubkey !== result.pubkey) {
    res.status(502).json({ error: 'Could not link key' });
    return;
  }

  const host = new URL(siteUrl(req)).host;
  res.status(200).json({
    pubkey: result.pubkey,
    nip05: member.slug ? `${member.slug}@${host}` : null,
  });
}
