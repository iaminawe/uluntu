// Spend limits for the transparent AI provider proxy (api/ai/provider.ts).
// Kept free of runtime dependencies so it can be unit tested.

export type AIProvider = 'openai' | 'anthropic';

// SSRF guard: only these hosts may ever be proxied.
export const ALLOWED_HOST: Record<AIProvider, string> = {
  openai: 'api.openai.com',
  anthropic: 'api.anthropic.com',
};

// Only the generation endpoints the editor uses may be proxied, so a signed-in
// user can't reach other paid APIs (images, batches, files, the Responses API's
// hosted tools) with our key. The editor's AI SDK uses chat completions.
export const ALLOWED_PATHS: Record<AIProvider, string[]> = {
  openai: ['/v1/chat/completions'],
  anthropic: ['/v1/messages'],
};

// Used when AI_OPENAI_MODEL / AI_ANTHROPIC_MODEL aren't set, so the client
// never chooses the model.
export const DEFAULT_MODEL: Record<AIProvider, string> = {
  openai: 'gpt-4o-mini',
  anthropic: 'claude-haiku-5-5',
};

const TOKEN_FIELDS = ['max_tokens', 'max_completion_tokens', 'max_output_tokens'];

export function isAIProvider(value: string): value is AIProvider {
  return Object.prototype.hasOwnProperty.call(ALLOWED_HOST, value);
}

// Returns null when the URL isn't an allowed provider endpoint.
export function checkTargetUrl(provider: AIProvider, targetUrl: string): URL | null {
  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'https:' || parsed.host !== ALLOWED_HOST[provider]) return null;
  if (!ALLOWED_PATHS[provider].includes(parsed.pathname) || parsed.search) return null;
  return parsed;
}

// Pins the model and caps output tokens. Returns null for an unparseable body.
export function limitBody(
  provider: AIProvider,
  raw: unknown,
  opts: { model: string; maxOutputTokens: number }
): string | null {
  let body: Record<string, unknown>;
  try {
    body = (typeof raw === 'string' ? JSON.parse(raw) : raw ?? {}) as Record<string, unknown>;
  } catch {
    return null;
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;

  body.model = opts.model;

  let capped = false;
  for (const field of TOKEN_FIELDS) {
    if (!(field in body)) continue;
    const value = body[field];
    body[field] =
      typeof value === 'number' && Number.isFinite(value) && value > 0
        ? Math.min(Math.floor(value), opts.maxOutputTokens)
        : opts.maxOutputTokens;
    capped = true;
  }
  if (!capped) {
    body[provider === 'anthropic' ? 'max_tokens' : 'max_completion_tokens'] = opts.maxOutputTokens;
  }
  return JSON.stringify(body);
}
