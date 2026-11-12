// NIP-05 lookup, served at /.well-known/nostr.json (see vercel.json).
// ?name=<member slug> returns that member's linked key; ?name=_ returns the
// instance key. Without a name it returns nothing, so the endpoint can't be
// used to list every member.
import { secretRestSelect, type ApiReq, type ApiRes } from '../_lib/auth.js';
import { isNip05Name } from '../_lib/nostr.js';
import { getInstanceKey, getRelays } from '../_lib/nostr-config.js';

function q(v: string | string[] | undefined): string {
  return Array.isArray(v) ? v[0] || '' : v || '';
}

export default async function handler(req: ApiReq, res: ApiRes): Promise<void> {
  // NIP-05: browser clients fetch this cross-origin, and it must not redirect.
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const name = q(req.query?.name).toLowerCase();
  const names: Record<string, string> = {};
  const relays: Record<string, string[]> = {};

  if (name === '_') {
    const instance = getInstanceKey();
    if (instance) {
      names._ = instance.pubkey;
      relays[instance.pubkey] = getRelays();
    }
  } else if (isNip05Name(name)) {
    const rows = await secretRestSelect(
      `members?slug=eq.${encodeURIComponent(name)}&status=eq.published` +
        `&nostr_pubkey=not.is.null&select=slug,nostr_pubkey&limit=1`
    );
    if (!Array.isArray(rows)) {
      res.status(503).json({ error: 'Lookup unavailable' });
      return;
    }
    const row = rows[0] as { slug: string; nostr_pubkey: string } | undefined;
    if (row) names[row.slug] = row.nostr_pubkey;
  }

  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
  res.status(200).json(Object.keys(relays).length ? { names, relays } : { names });
}
