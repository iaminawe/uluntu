import { checkTargetUrl, isAIProvider, limitBody } from '../../api/_lib/ai-limits';

const opts = { model: 'server-model', maxOutputTokens: 4000 };
const parse = (s: string | null) => JSON.parse(s as string);

describe('limitBody', () => {
  it('replaces the client model with the server model', () => {
    const out = parse(limitBody('openai', { model: 'gpt-expensive', messages: [] }, opts));
    expect(out.model).toBe('server-model');
  });

  it('clamps numeric token fields to the cap', () => {
    const out = parse(
      limitBody('openai', { max_tokens: 99999, max_completion_tokens: 100 }, opts)
    );
    expect(out.max_tokens).toBe(4000);
    expect(out.max_completion_tokens).toBe(100);
  });

  it('forces non-numeric or invalid token values to the cap', () => {
    for (const value of ['999999', null, -1, Infinity, { n: 1 }]) {
      const out = parse(limitBody('anthropic', { max_tokens: value }, opts));
      expect(out.max_tokens).toBe(4000);
    }
  });

  it('adds a default cap when the client sends none', () => {
    expect(parse(limitBody('openai', {}, opts)).max_completion_tokens).toBe(4000);
    expect(parse(limitBody('anthropic', {}, opts)).max_tokens).toBe(4000);
  });

  it('accepts a JSON string body and rejects invalid JSON', () => {
    expect(parse(limitBody('openai', '{"max_tokens":10}', opts)).max_tokens).toBe(10);
    expect(limitBody('openai', '{not json', opts)).toBeNull();
    expect(limitBody('openai', '[1,2]', opts)).toBeNull();
  });
});

describe('checkTargetUrl', () => {
  it('allows the generation endpoints', () => {
    expect(checkTargetUrl('openai', 'https://api.openai.com/v1/chat/completions')).not.toBeNull();
    expect(checkTargetUrl('anthropic', 'https://api.anthropic.com/v1/messages')).not.toBeNull();
  });

  it('rejects other hosts, paths, protocols and query strings', () => {
    for (const url of [
      'https://api.openai.com/v1/images/generations',
      'https://api.openai.com/v1/responses',
      'https://api.openai.com/v1/chat/completions?x=1',
      'http://api.openai.com/v1/chat/completions',
      'https://evil.example/v1/chat/completions',
      'https://api.anthropic.com/v1/messages',
      'not a url',
    ]) {
      expect(checkTargetUrl('openai', url)).toBeNull();
    }
  });
});

describe('isAIProvider', () => {
  it('only accepts known providers', () => {
    expect(isAIProvider('openai')).toBe(true);
    expect(isAIProvider('anthropic')).toBe(true);
    expect(isAIProvider('toString')).toBe(false);
    expect(isAIProvider('')).toBe(false);
  });
});
