/**
 * Auth and safety checks for api/nostr/publish.ts. Network calls are stubbed:
 * Supabase REST/Auth through global.fetch, relays through SimplePool.
 */
const publishMock = jest.fn();
jest.mock('nostr-tools/pool', () => ({
  SimplePool: jest.fn().mockImplementation(() => ({ publish: publishMock, destroy: jest.fn() })),
}));

type Handler = (req: unknown, res: unknown) => Promise<void>;

const ADMIN_TOKEN = 'admin-token';
const MEMBER_TOKEN = 'member-token';
const SECRET_KEY_HEX = '11'.repeat(32);

const rows: Record<string, unknown[]> = {
  events: [{ id: 'e1', title: 'Meetup', date: '2026-11-20T18:00:00Z' }],
  news: [],
  opportunities: [],
  nostr_publications: [],
};

let restWriteStatus = 201;
const restWrites: { method: string; path: string }[] = [];

// jsdom has no Response; the code only reads ok, status and json().
const reply = (body: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

function mockFetch() {
  global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input));
    const auth = ((init?.headers || {}) as Record<string, string>).Authorization || '';
    if (url.pathname === '/auth/v1/user') {
      if (auth === `Bearer ${ADMIN_TOKEN}`) return reply({ id: 'admin-user' });
      if (auth === `Bearer ${MEMBER_TOKEN}`) return reply({ id: 'member-user' });
      return reply({}, 401);
    }
    const table = url.pathname.replace('/rest/v1/', '');
    if (init?.method && init.method !== 'GET') {
      restWrites.push({ method: init.method, path: table });
      return reply(null, restWriteStatus);
    }
    if (table === 'user_roles') {
      return reply(url.search.includes('admin-user') ? [{ role: 'admin' }] : []);
    }
    return reply(rows[table] ?? []);
  }) as unknown as typeof fetch;
}

function call(handler: Handler, opts: { auth?: string; method?: string; query?: Record<string, string> }) {
  const res: { code?: number; body?: Record<string, unknown> } & Record<string, unknown> = {};
  Object.assign(res, {
    status(c: number) { res.code = c; return res; },
    setHeader() {},
    json(b: Record<string, unknown>) { res.body = b; },
    write() { return true; },
    end() {},
  });
  return handler(
    {
      method: opts.method ?? 'GET',
      headers: { host: 'uluntu.io', ...(opts.auth ? { authorization: opts.auth } : {}) },
      query: opts.query ?? {},
    },
    res
  ).then(() => res);
}

describe('api/nostr/publish', () => {
  let handler: Handler;
  const env = { ...process.env };

  beforeAll(() => {
    process.env.SUPABASE_URL = 'https://db.example';
    process.env.SUPABASE_PUBLISHABLE_KEY = 'pk';
    process.env.SUPABASE_SECRET_KEY = 'sk';
    process.env.SITE_URL = 'https://uluntu.io';
    process.env.CRON_SECRET = 'cron-secret';
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    handler = require('../../api/nostr/publish').default;
  });

  beforeEach(() => {
    mockFetch();
    restWrites.length = 0;
    restWriteStatus = 201;
    publishMock.mockReset().mockImplementation((relays: string[]) => relays.map(() => Promise.resolve('ok')));
    delete process.env.NOSTR_PUBLISH_ENABLED;
    delete process.env.NOSTR_SECRET_KEY;
  });

  afterAll(() => {
    process.env = env;
  });

  it('rejects anonymous callers, members and wrong cron secrets', async () => {
    expect((await call(handler, {})).code).toBe(401);
    expect((await call(handler, { auth: `Bearer ${MEMBER_TOKEN}` })).code).toBe(401);
    expect((await call(handler, { auth: 'Bearer cron-secreT' })).code).toBe(401);
    expect((await call(handler, { auth: 'Bearer cron-secret-longer' })).code).toBe(401);
  });

  it('does nothing while publishing is disabled', async () => {
    const cron = await call(handler, { auth: 'Bearer cron-secret' });
    expect(cron.code).toBe(200);
    expect(cron.body).toMatchObject({ skipped: true });
    const admin = await call(handler, { auth: `Bearer ${ADMIN_TOKEN}`, method: 'POST' });
    expect(admin.code).toBe(409);
    expect(publishMock).not.toHaveBeenCalled();
  });

  it('dry run shows the plan without sending or writing', async () => {
    const res = await call(handler, { auth: `Bearer ${ADMIN_TOKEN}`, query: { dry_run: '1' } });
    expect(res.code).toBe(200);
    expect(res.body).toMatchObject({ dry_run: true, summary: { create: 2, update: 0, delete: 0 } });
    expect(publishMock).not.toHaveBeenCalled();
    expect(restWrites).toHaveLength(0);
  });

  it('refuses to publish without a valid instance key', async () => {
    process.env.NOSTR_PUBLISH_ENABLED = 'true';
    process.env.NOSTR_SECRET_KEY = 'not-a-key';
    const res = await call(handler, { auth: 'Bearer cron-secret' });
    expect(res.code).toBe(503);
    expect(publishMock).not.toHaveBeenCalled();
  });

  it('publishes and records each event when enabled', async () => {
    process.env.NOSTR_PUBLISH_ENABLED = 'true';
    process.env.NOSTR_SECRET_KEY = SECRET_KEY_HEX;
    const res = await call(handler, { auth: 'Bearer cron-secret' });
    expect(res.code).toBe(200);
    expect(publishMock).toHaveBeenCalledTimes(2);
    expect(restWrites.filter((w) => w.path.startsWith('nostr_publications'))).toHaveLength(2);
  });

  it('stops the run when a publication record cannot be saved', async () => {
    process.env.NOSTR_PUBLISH_ENABLED = 'true';
    process.env.NOSTR_SECRET_KEY = SECRET_KEY_HEX;
    restWriteStatus = 500;
    const res = await call(handler, { auth: 'Bearer cron-secret' });
    expect(res.code).toBe(502);
    expect(publishMock).toHaveBeenCalledTimes(1);
    expect(res.body).toMatchObject({ remaining: 1 });
  });
});
