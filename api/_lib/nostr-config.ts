// Server-only Nostr configuration read from the environment.
import { getPublicKey } from 'nostr-tools/pure';
import { decode } from 'nostr-tools/nip19';
import type { ApiReq } from './auth.js';

const DEFAULT_RELAYS = ['wss://relay.damus.io', 'wss://nos.lol', 'wss://relay.primal.net'];

export interface InstanceKey {
  secretKey: Uint8Array;
  pubkey: string;
}

/** The instance signing key from NOSTR_SECRET_KEY (hex or nsec), or null. */
export function getInstanceKey(): InstanceKey | null {
  const raw = (process.env.NOSTR_SECRET_KEY || '').trim();
  if (!raw) return null;
  try {
    let secretKey: Uint8Array;
    if (raw.startsWith('nsec1')) {
      const decoded = decode(raw);
      if (decoded.type !== 'nsec') return null;
      secretKey = decoded.data;
    } else if (/^[0-9a-f]{64}$/i.test(raw)) {
      secretKey = Uint8Array.from(Buffer.from(raw, 'hex'));
    } else {
      return null;
    }
    return { secretKey, pubkey: getPublicKey(secretKey) };
  } catch {
    return null;
  }
}

export function getRelays(): string[] {
  const configured = (process.env.NOSTR_RELAYS || '')
    .split(',')
    .map((r) => r.trim())
    .filter((r) => /^wss:\/\/[^\s]+$/.test(r));
  return configured.length ? configured : DEFAULT_RELAYS;
}

/** Publishing must be switched on explicitly; it can't be undone. */
export function isPublishEnabled(): boolean {
  return process.env.NOSTR_PUBLISH_ENABLED === 'true';
}

function headerValue(v: string | string[] | undefined): string {
  return Array.isArray(v) ? v[0] || '' : v || '';
}

/**
 * Origin of the current request, e.g. https://uluntu.io. Derived from
 * forwarded headers, which Vercel sets; prefer siteUrl() where it matters.
 */
export function requestOrigin(req: ApiReq): string {
  const host = headerValue(req.headers['x-forwarded-host']) || headerValue(req.headers['host']);
  const proto = headerValue(req.headers['x-forwarded-proto']) || 'https';
  return `${proto.split(',')[0].trim()}://${host.split(',')[0].trim()}`;
}

/** Canonical public site origin, used in published links and NIP-05 names. */
export function siteUrl(req: ApiReq): string {
  const configured = (process.env.SITE_URL || '').trim().replace(/\/+$/, '');
  return /^https?:\/\//.test(configured) ? configured : requestOrigin(req);
}
