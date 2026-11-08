// Nostr helpers for /api/nostr/*: build unsigned event templates from Uluntu
// rows, and verify the signed event a member uses to link their key. No
// network or env access here, so it can be unit tested.
//
// Kinds used:
//   31923  NIP-52 time-based calendar event   (events)
//   30023  NIP-23 long-form article           (news)
//   30402  NIP-99 classified listing          (opportunities)
//   0      NIP-01 profile metadata            (the instance's own profile)
//   5      NIP-09 deletion request            (rows that stop being public)
//   27235  NIP-98-style HTTP auth event       (linking a member's key)
import { createHash } from 'node:crypto';
import { verifyEvent, type Event, type EventTemplate } from 'nostr-tools/pure';

export const KIND = {
  profile: 0,
  deletion: 5,
  article: 30023,
  listing: 30402,
  calendarEvent: 31923,
  httpAuth: 27235,
} as const;

export type SourceTable = 'events' | 'news' | 'opportunities';

export interface BuildContext {
  /** Public site origin, e.g. https://uluntu.io (no trailing slash). */
  siteUrl: string;
  /** Converts stored HTML (or plain text) to Markdown. */
  toMarkdown: (html: string) => string;
  /** Optional IANA time zone for calendar events, e.g. America/Vancouver. */
  timezone?: string;
}

export interface EventRow {
  id: string;
  slug?: string | null;
  title: string;
  description?: string | null;
  date: string;
  end_date?: string | null;
  location?: string | null;
  address?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  image?: string | null;
  type?: string | null;
}

export interface NewsRow {
  id: string;
  slug?: string | null;
  title: string;
  content?: string | null;
  excerpt?: string | null;
  hero_image?: string | null;
  publish_date?: string | null;
  created_at?: string | null;
  tags?: string[] | null;
}

// contact_email and website are deliberately absent: contact details never
// leave the site.
export interface OpportunityRow {
  id: string;
  slug?: string | null;
  title: string;
  description?: string | null;
  type?: string | null;
  organization?: string | null;
  location?: string | null;
  remote?: boolean | null;
  compensation?: string | null;
  deadline?: string | null;
  image?: string | null;
  created_at?: string | null;
  requirements?: string[] | null;
  responsibilities?: string[] | null;
  benefits?: string[] | null;
}

type Tags = string[][];

function unix(value: string | null | undefined): number | null {
  if (!value) return null;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : null;
}

function pageUrl(ctx: BuildContext, section: string, row: { id: string; slug?: string | null }) {
  return `${ctx.siteUrl}/${section}/${encodeURIComponent(row.slug || row.id)}`;
}

// Only absolute http(s) URLs or site-relative paths are published.
function absoluteUrl(ctx: BuildContext, value: string | null | undefined): string | null {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('/')) return `${ctx.siteUrl}${value}`;
  return null;
}

function hashtag(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 50);
}

function hashtags(values: (string | null | undefined)[]): Tags {
  const seen = new Set<string>();
  const tags: Tags = [];
  for (const v of values) {
    const t = v ? hashtag(v) : '';
    if (t && !seen.has(t)) {
      seen.add(t);
      tags.push(['t', t]);
    }
  }
  return tags;
}

const GEOHASH_BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

export function geohash(lat: number, lon: number, precision = 7): string {
  let latMin = -90, latMax = 90, lonMin = -180, lonMax = 180;
  let hash = '';
  let bit = 0, ch = 0, even = true;
  while (hash.length < precision) {
    if (even) {
      const mid = (lonMin + lonMax) / 2;
      if (lon >= mid) { ch = (ch << 1) | 1; lonMin = mid; } else { ch <<= 1; lonMax = mid; }
    } else {
      const mid = (latMin + latMax) / 2;
      if (lat >= mid) { ch = (ch << 1) | 1; latMin = mid; } else { ch <<= 1; latMax = mid; }
    }
    even = !even;
    if (++bit === 5) {
      hash += GEOHASH_BASE32[ch];
      bit = 0;
      ch = 0;
    }
  }
  return hash;
}

// Several precisions so clients can match on a coarser prefix.
function geohashTags(lat: unknown, lon: unknown): Tags {
  const la = Number(lat), lo = Number(lon);
  if (lat == null || lon == null || !Number.isFinite(la) || !Number.isFinite(lo)) return [];
  if (Math.abs(la) > 90 || Math.abs(lo) > 180) return [];
  const full = geohash(la, lo, 7);
  return [4, 5, 6, 7].map((n) => ['g', full.slice(0, n)]);
}

const SECONDS_PER_DAY = 86_400;
const MAX_DAY_TAGS = 60;

// NIP-52 requires a `D` tag for each day the event touches.
function dayTags(start: number, end: number | null): Tags {
  const first = Math.floor(start / SECONDS_PER_DAY);
  const last = end && end > start ? Math.floor((end - 1) / SECONDS_PER_DAY) : first;
  const tags: Tags = [];
  for (let d = first; d <= last && tags.length < MAX_DAY_TAGS; d++) tags.push(['D', String(d)]);
  return tags;
}

function withFooter(body: string, url: string): string {
  const text = body.trim();
  return `${text}${text ? '\n\n' : ''}More on the community site: ${url}`;
}

export function eventTemplate(row: EventRow, ctx: BuildContext): EventTemplate | null {
  const start = unix(row.date);
  if (start == null) return null;
  const endRaw = unix(row.end_date);
  const end = endRaw != null && endRaw > start ? endRaw : null;
  const url = pageUrl(ctx, 'events', row);
  const image = absoluteUrl(ctx, row.image);

  const tags: Tags = [
    ['d', row.id],
    ['title', row.title],
    ['start', String(start)],
    ...(end != null ? [['end', String(end)]] : []),
    ...dayTags(start, end),
    ...(ctx.timezone ? [['start_tzid', ctx.timezone]] : []),
    ...[row.location, row.address].filter((v): v is string => !!v).map((v) => ['location', v]),
    ...geohashTags(row.latitude, row.longitude),
    ...(image ? [['image', image]] : []),
    ...hashtags([row.type]),
    ['r', url],
  ];
  return {
    kind: KIND.calendarEvent,
    created_at: 0,
    tags,
    content: withFooter(ctx.toMarkdown(row.description || ''), url),
  };
}

export function newsTemplate(row: NewsRow, ctx: BuildContext): EventTemplate {
  const url = pageUrl(ctx, 'news', row);
  const image = absoluteUrl(ctx, row.hero_image);
  const published = unix(row.publish_date) ?? unix(row.created_at);
  const tags: Tags = [
    ['d', row.id],
    ['title', row.title],
    ...(row.excerpt ? [['summary', row.excerpt]] : []),
    ...(image ? [['image', image]] : []),
    ...(published != null ? [['published_at', String(published)]] : []),
    ...hashtags(row.tags || []),
    ['r', url],
  ];
  return {
    kind: KIND.article,
    created_at: 0,
    tags,
    content: withFooter(ctx.toMarkdown(row.content || ''), url),
  };
}

function list(heading: string, items: string[] | null | undefined): string {
  const clean = (items || []).map((i) => i.trim()).filter(Boolean);
  return clean.length ? `\n\n**${heading}**\n\n${clean.map((i) => `- ${i}`).join('\n')}` : '';
}

export function opportunityTemplate(row: OpportunityRow, ctx: BuildContext): EventTemplate {
  const url = pageUrl(ctx, 'opportunities', row);
  const image = absoluteUrl(ctx, row.image);
  const published = unix(row.created_at);
  const summary = [row.type, row.organization].filter(Boolean).join(' · ');
  const location = row.location || (row.remote ? 'Remote' : null);

  let body = ctx.toMarkdown(row.description || '');
  const facts = [
    row.organization ? `**Organization:** ${row.organization}` : '',
    row.compensation ? `**Compensation:** ${row.compensation}` : '',
    row.deadline ? `**Apply by:** ${row.deadline}` : '',
  ].filter(Boolean);
  if (facts.length) body += `\n\n${facts.join('\n\n')}`;
  body += list('Responsibilities', row.responsibilities);
  body += list('Requirements', row.requirements);
  body += list('Benefits', row.benefits);

  const tags: Tags = [
    ['d', row.id],
    ['title', row.title],
    ...(summary ? [['summary', summary]] : []),
    ...(published != null ? [['published_at', String(published)]] : []),
    ...(location ? [['location', location]] : []),
    ...(image ? [['image', image]] : []),
    ['status', 'active'],
    ...hashtags(['opportunity', row.type, row.remote ? 'remote' : null]),
    ['r', url],
  ];
  return { kind: KIND.listing, created_at: 0, tags, content: withFooter(body, url) };
}

export interface InstanceProfile {
  name: string;
  about?: string;
  picture?: string;
}

export function profileTemplate(profile: InstanceProfile, ctx: BuildContext): EventTemplate {
  const host = new URL(ctx.siteUrl).host;
  const metadata: Record<string, string> = {
    name: profile.name,
    website: ctx.siteUrl,
    nip05: `_@${host}`,
  };
  if (profile.about) metadata.about = profile.about;
  if (profile.picture) metadata.picture = profile.picture;
  return { kind: KIND.profile, created_at: 0, tags: [], content: JSON.stringify(metadata) };
}

/** NIP-09 deletion request for an addressable event we published earlier. */
export function deletionTemplate(
  kind: number,
  pubkey: string,
  dTag: string,
  eventId?: string | null
): EventTemplate {
  return {
    kind: KIND.deletion,
    created_at: 0,
    tags: [
      ['a', `${kind}:${pubkey}:${dTag}`],
      ...(eventId ? [['e', eventId]] : []),
      ['k', String(kind)],
    ],
    content: '',
  };
}

/** Stable hash of what a template says, ignoring its timestamp. */
export function contentHash(t: EventTemplate): string {
  return createHash('sha256')
    .update(JSON.stringify([t.kind, t.tags, t.content]))
    .digest('hex');
}

// ---------------------------------------------------------------------------
// Linking a member's key
// ---------------------------------------------------------------------------

export const LINK_MAX_AGE_SECONDS = 120;

export function linkMessage(userId: string): string {
  return `Link this Nostr key to Uluntu account ${userId}`;
}

export function isHexPubkey(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{64}$/.test(value);
}

/**
 * Checks the event a member signed to prove they own a key. It must be a
 * kind 27235 event for this endpoint (u + method tags), recent, and name the
 * caller's own account, so it can't be replayed against a different account.
 * Returns the verified hex pubkey, or an error string.
 */
export function verifyLinkEvent(
  event: unknown,
  expected: { url: string; userId: string; now: number }
): { pubkey: string } | { error: string } {
  const e = event as Event;
  if (!e || typeof e !== 'object' || !Array.isArray(e.tags)) return { error: 'Missing event' };
  if (e.kind !== KIND.httpAuth) return { error: 'Wrong event kind' };
  if (!isHexPubkey(e.pubkey)) return { error: 'Invalid pubkey' };
  if (typeof e.created_at !== 'number' || Math.abs(expected.now - e.created_at) > LINK_MAX_AGE_SECONDS) {
    return { error: 'Event expired' };
  }
  const tag = (name: string) => e.tags.find((t) => Array.isArray(t) && t[0] === name)?.[1];
  if (tag('u') !== expected.url) return { error: 'URL mismatch' };
  if ((tag('method') || '').toUpperCase() !== 'POST') return { error: 'Method mismatch' };
  if (e.content !== linkMessage(expected.userId)) return { error: 'Account mismatch' };
  // Verify a fresh copy: nostr-tools caches a "verified" flag on the object it
  // checks, and that flag survives object spread.
  const { id, pubkey, created_at, kind, tags, content, sig } = e;
  if (!verifyEvent({ id, pubkey, created_at, kind, tags, content, sig })) {
    return { error: 'Invalid signature' };
  }
  return { pubkey };
}

// NIP-05 local parts may only use a-z, 0-9, '-', '_' and '.'.
export function isNip05Name(value: unknown): value is string {
  return typeof value === 'string' && /^[a-z0-9._-]{1,64}$/.test(value);
}
