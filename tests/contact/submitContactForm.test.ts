const insert = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn(() => ({ insert })) },
}));

import { contactSubmissionsAPI } from '@/features/contact/api/contactSubmissionsApi';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const form = {
  name: 'Ada',
  email: 'ada@example.com',
  subject: 'Hello',
  message: 'Hi there',
  type: 'support',
  metadata: { user_agent: 'jest', referrer: '' },
};

describe('contactSubmissionsAPI.submitContactForm', () => {
  const realRandomUUID = crypto.randomUUID;

  beforeEach(() => {
    insert.mockReset().mockResolvedValue({ error: null });
  });

  afterEach(() => {
    Object.defineProperty(crypto, 'randomUUID', { value: realRandomUUID, configurable: true });
  });

  it('inserts only real columns and leaves status to the database default', async () => {
    const result = await contactSubmissionsAPI.submitContactForm(form);

    expect(insert).toHaveBeenCalledWith({
      id: result.id,
      name: 'Ada',
      email: 'ada@example.com',
      subject: 'Hello',
      message: 'Hi there',
      tags: ['support'],
      user_agent: 'jest',
      referrer: null,
    });
    expect(result).toEqual({ success: true, id: expect.stringMatching(UUID_V4) });
  });

  it('generates a v4 id without crypto.randomUUID (plain-HTTP sites)', async () => {
    Object.defineProperty(crypto, 'randomUUID', { value: undefined, configurable: true });

    const result = await contactSubmissionsAPI.submitContactForm(form);

    expect(result.id).toMatch(UUID_V4);
    expect(insert.mock.calls[0][0].id).toBe(result.id);
  });

  it('throws when the insert fails', async () => {
    insert.mockResolvedValue({ error: new Error('denied') });

    await expect(contactSubmissionsAPI.submitContactForm(form)).rejects.toThrow('denied');
  });
});
