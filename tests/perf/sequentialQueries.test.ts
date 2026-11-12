// Checks that hot paths make a fixed number of requests rather than one per
// row (see the PR that parallelised sequential awaits).

type Result = { data?: unknown; error?: unknown };

const calls: { table: string; ops: [string, unknown[]][] }[] = [];
const results: Record<string, Result[]> = {};

// A chainable stand-in for a supabase query builder. Every method records
// itself and returns the builder; awaiting it yields the next queued result
// for that table.
function builder(table: string) {
  const entry = { table, ops: [] as [string, unknown[]][] };
  calls.push(entry);
  const b: any = new Proxy({}, {
    get(_t, prop: string) {
      if (prop === 'then') {
        const next = (results[table] || []).shift() || { data: null, error: null };
        return (resolve: (r: Result) => void) => resolve(next);
      }
      return (...args: unknown[]) => {
        entry.ops.push([prop, args]);
        return b;
      };
    },
  });
  return b;
}

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: (table: string) => builder(table),
    auth: { getUser: async () => ({ data: { user: { id: 'auth-user' } } }) },
  },
}));

jest.mock('@/services/resend', () => ({
  resendService: { sendNewsletterCampaign: jest.fn() },
}));

import { messagingApi } from '@/features/messaging/api/messagingApi.real';
import { newsletterCampaignApi } from '@/features/newsletter/api/campaigns';
import { resendService } from '@/services/resend';

beforeEach(() => {
  calls.length = 0;
  for (const key of Object.keys(results)) delete results[key];
});

describe('messagingApi.findExistingConversation', () => {
  it('looks up the shared conversation in one query, however many conversations exist', async () => {
    const conversations = Array.from({ length: 40 }, (_, i) => ({ id: `c${i}` }));
    results.members = [{ data: { id: 'me' } }];
    results.conversations = [{ data: conversations }];
    results.conversation_participants = [{ data: [{ conversation_id: 'c27' }] }];

    const found = await messagingApi.findExistingConversation('them');

    expect(found).toEqual({ id: 'c27' });
    const participantQueries = calls.filter(c => c.table === 'conversation_participants');
    expect(participantQueries).toHaveLength(1);
    expect(participantQueries[0].ops).toContainEqual(['in', ['conversation_id', conversations.map(c => c.id)]]);
    expect(participantQueries[0].ops).toContainEqual(['eq', ['user_id', 'them']]);
  });

  it('returns null without a second query when there are no direct conversations', async () => {
    results.members = [{ data: { id: 'me' } }];
    results.conversations = [{ data: [] }];

    await expect(messagingApi.findExistingConversation('them')).resolves.toBeNull();
    expect(calls.some(c => c.table === 'conversation_participants')).toBe(false);
  });
});

describe('newsletterCampaignApi.sendCampaignToSegment', () => {
  it('records sent analytics in chunks of 500 instead of one insert per subscriber', async () => {
    const subscribers = Array.from({ length: 1200 }, (_, i) => ({
      id: `s${i}`, email: `s${i}@example.com`, status: 'active',
    }));
    jest.spyOn(newsletterCampaignApi, 'getCampaign').mockResolvedValue({ id: 'camp' } as never);
    results.newsletter_subscriptions = [{ data: subscribers }];
    (resendService.sendNewsletterCampaign as jest.Mock).mockResolvedValue({
      success: true, sent_count: 1200, failed_count: 0, failed_emails: [],
    });

    await newsletterCampaignApi.sendCampaignToSegment('camp', subscribers.map(s => s.id));

    const inserts = calls
      .filter(c => c.table === 'newsletter_analytics')
      .map(c => c.ops.find(([op]) => op === 'insert')?.[1][0] as unknown[]);
    expect(inserts.map(rows => rows.length)).toEqual([500, 500, 200]);
    expect(inserts[0][0]).toEqual({ campaign_id: 'camp', subscription_id: 's0', event_type: 'sent' });
  });
});
