// Publish public community content to Nostr relays (stage 2).
//
// Signs published events, news and opportunities with the instance key and
// sends them to NOSTR_RELAYS. Rows whose content hasn't changed since the last
// run are skipped; rows that are no longer published get a NIP-09 deletion
// request. Relays may ignore deletions, so publishing is off unless
// NOSTR_PUBLISH_ENABLED=true.
//
// Callers: the Vercel cron (Authorization: Bearer $CRON_SECRET) or a site
// admin. ?dry_run=1 returns the plan and unsigned events without sending.
import TurndownService from 'turndown';
import { finalizeEvent, type EventTemplate } from 'nostr-tools/pure';
import { SimplePool } from 'nostr-tools/pool';
import {
  getUser,
  isSiteAdmin,
  secretRestSelect,
  secretRestWrite,
  type ApiReq,
  type ApiRes,
} from '../_lib/auth.js';
import {
  contentHash,
  deletionTemplate,
  eventTemplate,
  newsTemplate,
  opportunityTemplate,
  profileTemplate,
  type BuildContext,
  type EventRow,
  type NewsRow,
  type OpportunityRow,
} from '../_lib/nostr.js';
import { getInstanceKey, getRelays, isPublishEnabled, siteUrl } from '../_lib/nostr-config.js';

const MAX_SENDS_PER_RUN = 25;
const RELAY_TIMEOUT_MS = 8000;

const SOURCES = {
  events:
    'events?status=eq.published&select=id,slug,title,description,date,end_date,location,address,latitude,longitude,image,type',
  news: 'news?status=eq.published&select=id,slug,title,content,excerpt,hero_image,publish_date,created_at,tags',
  opportunities:
    'opportunities?status=eq.published&select=id,slug,title,description,type,organization,location,remote,compensation,deadline,image,created_at,requirements,responsibilities,benefits',
};

interface Publication {
  source_table: string;
  source_id: string;
  kind: number;
  d_tag: string;
  event_id: string;
  content_hash: string;
  deleted_at: string | null;
}

interface PlannedItem {
  source_table: string;
  source_id: string;
  title?: string;
  action: 'create' | 'update' | 'unchanged' | 'delete';
  template: EventTemplate;
  d_tag: string;
  hash: string;
}

function q(v: string | string[] | undefined): string {
  return Array.isArray(v) ? v[0] || '' : v || '';
}

function headerValue(v: string | string[] | undefined): string {
  return Array.isArray(v) ? v[0] || '' : v || '';
}

async function authorize(req: ApiReq): Promise<'cron' | 'admin' | null> {
  const cronSecret = process.env.CRON_SECRET;
  const auth = headerValue(req.headers['authorization']);
  if (cronSecret && auth === `Bearer ${cronSecret}`) return 'cron';
  const user = await getUser(req);
  if (!user) return null;
  return (await isSiteAdmin(user.id)) ? 'admin' : null;
}

function buildContext(req: ApiReq): BuildContext {
  const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
  return {
    siteUrl: siteUrl(req),
    timezone: process.env.NOSTR_EVENT_TIMEZONE || undefined,
    toMarkdown: (html) => (html ? turndown.turndown(html).trim() : ''),
  };
}

async function plan(req: ApiReq, pubkey: string): Promise<PlannedItem[] | null> {
  const [events, news, opportunities, publications] = await Promise.all([
    secretRestSelect(SOURCES.events),
    secretRestSelect(SOURCES.news),
    secretRestSelect(SOURCES.opportunities),
    secretRestSelect('nostr_publications?select=*'),
  ]);
  if (![events, news, opportunities, publications].every(Array.isArray)) return null;

  const ctx = buildContext(req);
  const today = new Date().toISOString().slice(0, 10);
  const current: Omit<PlannedItem, 'action' | 'hash'>[] = [];

  current.push({
    source_table: 'profile',
    source_id: 'instance',
    d_tag: '',
    template: profileTemplate(
      {
        name: process.env.NOSTR_PROFILE_NAME || new URL(ctx.siteUrl).host,
        about: process.env.NOSTR_PROFILE_ABOUT,
        picture: process.env.NOSTR_PROFILE_PICTURE,
      },
      ctx
    ),
  });
  for (const row of events as EventRow[]) {
    const template = eventTemplate(row, ctx);
    if (template) current.push({ source_table: 'events', source_id: row.id, title: row.title, d_tag: row.id, template });
  }
  for (const row of news as NewsRow[]) {
    if (row.publish_date && row.publish_date > today) continue;
    current.push({ source_table: 'news', source_id: row.id, title: row.title, d_tag: row.id, template: newsTemplate(row, ctx) });
  }
  for (const row of opportunities as OpportunityRow[]) {
    current.push({
      source_table: 'opportunities',
      source_id: row.id,
      title: row.title,
      d_tag: row.id,
      template: opportunityTemplate(row, ctx),
    });
  }

  const existing = new Map(
    (publications as Publication[]).map((p) => [`${p.source_table}:${p.source_id}`, p])
  );
  const items: PlannedItem[] = current.map((c) => {
    const hash = contentHash(c.template);
    const prev = existing.get(`${c.source_table}:${c.source_id}`);
    existing.delete(`${c.source_table}:${c.source_id}`);
    const action =
      !prev || prev.deleted_at ? 'create' : prev.content_hash === hash ? 'unchanged' : 'update';
    return { ...c, hash, action };
  });

  // Anything published before that is no longer public gets a deletion request.
  for (const prev of existing.values()) {
    if (prev.deleted_at || prev.source_table === 'profile') continue;
    const template = deletionTemplate(prev.kind, pubkey, prev.d_tag, prev.event_id);
    items.push({
      source_table: prev.source_table,
      source_id: prev.source_id,
      d_tag: prev.d_tag,
      action: 'delete',
      template,
      hash: contentHash(template),
    });
  }
  return items;
}

export default async function handler(req: ApiReq, res: ApiRes): Promise<void> {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  res.setHeader('Cache-Control', 'no-store');

  const caller = await authorize(req);
  if (!caller) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const dryRun = q(req.query?.dry_run) === '1';
  const enabled = isPublishEnabled();
  const instance = getInstanceKey();

  if (!dryRun && !enabled) {
    // The daily cron runs everywhere; stay quiet until an operator opts in.
    res.status(caller === 'cron' ? 200 : 409).json({
      skipped: true,
      reason: 'Publishing is disabled. Set NOSTR_PUBLISH_ENABLED=true to enable it.',
    });
    return;
  }
  if (!dryRun && !instance) {
    res.status(503).json({ error: 'NOSTR_SECRET_KEY is missing or invalid' });
    return;
  }

  const pubkey = instance?.pubkey ?? '<instance pubkey>';
  const items = await plan(req, pubkey);
  if (!items) {
    res.status(503).json({ error: 'Could not read content or publication state' });
    return;
  }
  const pending = items.filter((i) => i.action !== 'unchanged');
  const summary = {
    create: items.filter((i) => i.action === 'create').length,
    update: items.filter((i) => i.action === 'update').length,
    delete: items.filter((i) => i.action === 'delete').length,
    unchanged: items.filter((i) => i.action === 'unchanged').length,
  };

  if (dryRun) {
    res.status(200).json({
      dry_run: true,
      enabled,
      pubkey: instance?.pubkey ?? null,
      relays: getRelays(),
      summary,
      items: pending.map(({ source_table, source_id, title, action, template }) => ({
        source_table,
        source_id,
        title,
        action,
        event: template,
      })),
    });
    return;
  }

  const relays = getRelays();
  const pool = new SimplePool();
  const sent: { source_table: string; source_id: string; action: string; accepted: number }[] = [];
  const now = Math.floor(Date.now() / 1000);

  try {
    for (const item of pending.slice(0, MAX_SENDS_PER_RUN)) {
      const event = finalizeEvent({ ...item.template, created_at: now }, instance!.secretKey);
      const results = await Promise.allSettled(
        pool.publish(relays, event, { maxWait: RELAY_TIMEOUT_MS })
      );
      const accepted = results.filter((r) => r.status === 'fulfilled').length;
      sent.push({ source_table: item.source_table, source_id: item.source_id, action: item.action, accepted });
      if (accepted === 0) continue;

      if (item.action === 'delete') {
        await secretRestWrite(
          'PATCH',
          `nostr_publications?source_table=eq.${encodeURIComponent(item.source_table)}` +
            `&source_id=eq.${encodeURIComponent(item.source_id)}`,
          { deleted_at: new Date().toISOString() }
        );
      } else {
        await secretRestWrite(
          'POST',
          'nostr_publications?on_conflict=source_table,source_id',
          {
            source_table: item.source_table,
            source_id: item.source_id,
            kind: item.template.kind,
            d_tag: item.d_tag,
            event_id: event.id,
            content_hash: item.hash,
            published_at: new Date().toISOString(),
            deleted_at: null,
          },
          'resolution=merge-duplicates,return=minimal'
        );
      }
    }
  } finally {
    pool.destroy();
  }

  res.status(200).json({
    dry_run: false,
    pubkey: instance!.pubkey,
    relays,
    summary,
    sent,
    remaining: Math.max(0, pending.length - MAX_SENDS_PER_RUN),
  });
}
