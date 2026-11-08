import { finalizeEvent, generateSecretKey, getPublicKey, verifyEvent } from 'nostr-tools/pure';
import {
  KIND,
  contentHash,
  deletionTemplate,
  eventTemplate,
  geohash,
  isNip05Name,
  linkMessage,
  newsTemplate,
  opportunityTemplate,
  profileTemplate,
  verifyLinkEvent,
} from '../../api/_lib/nostr';

const ctx = { siteUrl: 'https://uluntu.io', toMarkdown: (s: string) => s };
const tagValues = (tags: string[][], name: string) => tags.filter((t) => t[0] === name).map((t) => t[1]);
const tagValue = (tags: string[][], name: string) => tagValues(tags, name)[0];

describe('geohash', () => {
  it('matches known values', () => {
    expect(geohash(57.64911, 10.40744, 11)).toBe('u4pruydqqvj');
    expect(geohash(42.6, -5.6, 5)).toBe('ezs42');
  });
});

describe('eventTemplate (NIP-52, kind 31923)', () => {
  const row = {
    id: '11111111-1111-1111-1111-111111111111',
    slug: 'design-sprint',
    title: 'Design sprint',
    description: 'Bring a laptop.',
    date: '2026-11-20T18:00:00Z',
    end_date: '2026-11-21T02:00:00Z',
    location: 'Nelson Library',
    address: '602 Stanley St',
    latitude: '49.4928',
    longitude: -117.2948,
    image: '/images/sprint.jpg',
    type: 'in-person',
  };

  it('maps the required and optional tags', () => {
    const t = eventTemplate(row, { ...ctx, timezone: 'America/Vancouver' })!;
    expect(t.kind).toBe(KIND.calendarEvent);
    expect(tagValue(t.tags, 'd')).toBe(row.id);
    expect(tagValue(t.tags, 'title')).toBe('Design sprint');
    expect(tagValue(t.tags, 'start')).toBe(String(Date.parse(row.date) / 1000));
    expect(tagValue(t.tags, 'end')).toBe(String(Date.parse(row.end_date) / 1000));
    expect(tagValue(t.tags, 'start_tzid')).toBe('America/Vancouver');
    expect(tagValues(t.tags, 'location')).toEqual(['Nelson Library', '602 Stanley St']);
    const g = tagValues(t.tags, 'g');
    expect(g.map((v) => v.length)).toEqual([4, 5, 6, 7]);
    expect(g.every((v) => g[3].startsWith(v))).toBe(true);
    expect(tagValue(t.tags, 'image')).toBe('https://uluntu.io/images/sprint.jpg');
    expect(tagValue(t.tags, 'r')).toBe('https://uluntu.io/events/design-sprint');
    expect(t.content).toContain('Bring a laptop.');
    expect(t.content).toContain('https://uluntu.io/events/design-sprint');
  });

  it('adds a D tag for every day the event touches', () => {
    const t = eventTemplate(row, ctx)!;
    const start = Math.floor(Date.parse(row.date) / 1000 / 86400);
    expect(tagValues(t.tags, 'D')).toEqual([String(start), String(start + 1)]);
  });

  it('ends at midnight without spilling into the next day', () => {
    const t = eventTemplate({ ...row, date: '2026-11-20T10:00:00Z', end_date: '2026-11-21T00:00:00Z' }, ctx)!;
    expect(tagValues(t.tags, 'D')).toHaveLength(1);
  });

  it('skips bad dates, coordinates and relative image paths', () => {
    expect(eventTemplate({ ...row, date: 'not a date' }, ctx)).toBeNull();
    const t = eventTemplate({ ...row, latitude: null, image: 'sprint.jpg', end_date: null }, ctx)!;
    expect(tagValues(t.tags, 'g')).toEqual([]);
    expect(tagValues(t.tags, 'image')).toEqual([]);
    expect(tagValues(t.tags, 'end')).toEqual([]);
  });
});

describe('newsTemplate (NIP-23, kind 30023)', () => {
  it('maps title, summary, published_at and hashtags', () => {
    const t = newsTemplate(
      {
        id: 'n1',
        slug: 'hello',
        title: 'Hello',
        content: '<p>Hi</p>',
        excerpt: 'Short',
        hero_image: 'https://cdn.example/x.png',
        publish_date: '2025-08-23',
        tags: ['AI & ML', 'ai-ml', 'Open Source'],
      },
      { ...ctx, toMarkdown: (s) => s.replace(/<\/?p>/g, '') }
    );
    expect(t.kind).toBe(KIND.article);
    expect(tagValue(t.tags, 'summary')).toBe('Short');
    expect(tagValue(t.tags, 'published_at')).toBe(String(Date.parse('2025-08-23') / 1000));
    expect(tagValues(t.tags, 't')).toEqual(['ai--ml', 'ai-ml', 'open-source']);
    expect(t.content.startsWith('Hi')).toBe(true);
  });
});

describe('opportunityTemplate (NIP-99, kind 30402)', () => {
  const row = {
    id: 'o1',
    slug: 'dev',
    title: 'Developer',
    description: 'Build things.',
    type: 'Job',
    organization: 'Acme',
    location: null,
    remote: true,
    compensation: '$80k',
    deadline: '2026-12-01',
    requirements: ['TypeScript', ' '],
    contact_email: 'jobs@acme.example',
    website: 'https://acme.example/private',
  };

  it('never publishes contact details', () => {
    const t = opportunityTemplate(row as never, ctx);
    const serialized = JSON.stringify(t);
    expect(serialized).not.toContain('jobs@acme.example');
    expect(serialized).not.toContain('acme.example/private');
  });

  it('maps listing tags', () => {
    const t = opportunityTemplate(row as never, ctx);
    expect(t.kind).toBe(KIND.listing);
    expect(tagValue(t.tags, 'location')).toBe('Remote');
    expect(tagValue(t.tags, 'status')).toBe('active');
    expect(tagValue(t.tags, 'summary')).toBe('Job · Acme');
    expect(tagValues(t.tags, 't')).toEqual(['opportunity', 'job', 'remote']);
    expect(t.content).toContain('- TypeScript');
    expect(t.content).not.toContain('- \n');
  });
});

describe('profile, deletion and hashing', () => {
  it('sets the root NIP-05 identifier on the instance profile', () => {
    const t = profileTemplate({ name: 'Uluntu' }, ctx);
    expect(JSON.parse(t.content)).toMatchObject({ name: 'Uluntu', nip05: '_@uluntu.io' });
  });

  it('builds a deletion request by address', () => {
    const t = deletionTemplate(31923, 'ab'.repeat(32), 'row-1', 'cd'.repeat(32));
    expect(t.kind).toBe(KIND.deletion);
    expect(t.tags).toEqual([
      ['a', `31923:${'ab'.repeat(32)}:row-1`],
      ['e', 'cd'.repeat(32)],
      ['k', '31923'],
    ]);
  });

  it('hashes content but not the timestamp', () => {
    const a = newsTemplate({ id: 'n', title: 'A' }, ctx);
    expect(contentHash({ ...a, created_at: 1 })).toBe(contentHash({ ...a, created_at: 2 }));
    expect(contentHash(a)).not.toBe(contentHash(newsTemplate({ id: 'n', title: 'B' }, ctx)));
  });

  it('produces templates that sign and verify', () => {
    const sk = generateSecretKey();
    const signed = finalizeEvent({ ...newsTemplate({ id: 'n', title: 'A' }, ctx), created_at: 1 }, sk);
    expect(verifyEvent(signed)).toBe(true);
  });
});

describe('verifyLinkEvent', () => {
  const sk = generateSecretKey();
  const pubkey = getPublicKey(sk);
  const url = 'https://uluntu.io/api/nostr/link';
  const userId = 'user-1';
  const now = 1_800_000_000;
  const sign = (overrides: Partial<{ kind: number; created_at: number; tags: string[][]; content: string }> = {}) =>
    finalizeEvent(
      {
        kind: 27235,
        created_at: now,
        tags: [['u', url], ['method', 'POST']],
        content: linkMessage(userId),
        ...overrides,
      },
      sk
    );

  it('accepts a fresh event for this account', () => {
    expect(verifyLinkEvent(sign(), { url, userId, now })).toEqual({ pubkey });
  });

  it('rejects replays against another account, stale events and other URLs', () => {
    expect(verifyLinkEvent(sign(), { url, userId: 'user-2', now })).toEqual({ error: 'Account mismatch' });
    expect(verifyLinkEvent(sign({ created_at: now - 600 }), { url, userId, now })).toEqual({ error: 'Event expired' });
    expect(verifyLinkEvent(sign(), { url: 'https://evil.example/api/nostr/link', userId, now })).toEqual({
      error: 'URL mismatch',
    });
    expect(verifyLinkEvent(sign({ kind: 1 }), { url, userId, now })).toEqual({ error: 'Wrong event kind' });
  });

  it('rejects a tampered signature', () => {
    const e = sign();
    expect(verifyLinkEvent({ ...e, sig: '00'.repeat(64) }, { url, userId, now })).toEqual({
      error: 'Invalid signature',
    });
  });
});

describe('isNip05Name', () => {
  it('only allows NIP-05 local-part characters', () => {
    expect(isNip05Name('jane-doe.2')).toBe(true);
    expect(isNip05Name('Jane')).toBe(false);
    expect(isNip05Name('a b')).toBe(false);
    expect(isNip05Name('')).toBe(false);
  });
});
