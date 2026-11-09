import { supabase } from '@/shared/api';

// NIP-07 browser signer (Alby, nos2x, etc.).
interface Nip07Signer {
  getPublicKey(): Promise<string>;
  signEvent(event: {
    kind: number;
    created_at: number;
    tags: string[][];
    content: string;
  }): Promise<unknown>;
}

declare global {
  interface Window {
    nostr?: Nip07Signer;
  }
}

export interface NostrIdentity {
  pubkey: string | null;
  slug: string | null;
}

export function hasNostrSigner(): boolean {
  return typeof window !== 'undefined' && !!window.nostr;
}

export async function fetchNostrIdentity(userId: string): Promise<NostrIdentity> {
  const { data, error } = await supabase
    .from('members')
    .select('nostr_pubkey, slug')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  // nostr_pubkey isn't in the generated types yet.
  const row = data as unknown as { nostr_pubkey?: string | null; slug?: string | null } | null;
  return { pubkey: row?.nostr_pubkey ?? null, slug: row?.slug ?? null };
}

async function accessToken(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error('Sign in to link a Nostr key');
  return session.access_token;
}

async function callLinkEndpoint(method: 'GET' | 'POST' | 'DELETE', body?: unknown) {
  const res = await fetch('/api/nostr/link', {
    method,
    headers: {
      Authorization: `Bearer ${await accessToken()}`,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as {
    error?: string;
    pubkey?: string | null;
    url?: string;
  };
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json;
}

// Must match linkMessage() in api/_lib/nostr.ts.
function linkMessage(userId: string): string {
  return `Link this Nostr key to Uluntu account ${userId}`;
}

/** Asks the browser signer to prove key ownership, then links the key. */
export async function linkNostrKey(userId: string): Promise<void> {
  if (!window.nostr) throw new Error('No Nostr signer extension found');
  // The server says which URL to sign (its canonical SITE_URL).
  const { url } = await callLinkEndpoint('GET');
  if (!url) throw new Error('Could not start linking');
  const event = await window.nostr.signEvent({
    kind: 27235,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['u', url],
      ['method', 'POST'],
    ],
    content: linkMessage(userId),
  });
  await callLinkEndpoint('POST', { event });
}

export async function unlinkNostrKey(): Promise<void> {
  await callLinkEndpoint('DELETE');
}
