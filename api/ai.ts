// Server-side AI proxy. Keeps the Anthropic/OpenAI keys off the client.
// The browser POSTs { messages, maxTokens?, temperature? } with the user's
// Supabase access token; this function calls the provider server-side and
// streams plain text back.
import { streamText, type CoreMessage } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { getUserFromRequest, json } from './_lib/auth';

// Node.js runtime (not edge): the AI SDK / provider packages reference modules
// the edge runtime does not support. Node supports the Web Request/Response
// handler signature and streaming responses.
export const config = { runtime: 'nodejs' };

const PROVIDER = process.env.AI_PROVIDER || 'openai';
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';
const OPENAI_KEY = process.env.OPENAI_API_KEY || '';
const ANTHROPIC_MODEL = process.env.AI_ANTHROPIC_MODEL || 'claude-3-haiku-20240307';
const OPENAI_MODEL = process.env.AI_OPENAI_MODEL || 'gpt-4o-mini';
const DEFAULT_MAX_TOKENS = parseInt(process.env.AI_MAX_TOKENS || '2000', 10);
const DEFAULT_TEMPERATURE = parseFloat(process.env.AI_TEMPERATURE || '0.7');

function resolveModel() {
  if (PROVIDER === 'anthropic') {
    if (!ANTHROPIC_KEY) return null;
    return createAnthropic({ apiKey: ANTHROPIC_KEY })(ANTHROPIC_MODEL);
  }
  if (!OPENAI_KEY) return null;
  return createOpenAI({ apiKey: OPENAI_KEY })(OPENAI_MODEL);
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  // Require an authenticated Supabase user — this endpoint spends AI credits.
  const user = await getUserFromRequest(req);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const model = resolveModel();
  if (!model) return json({ error: 'AI provider not configured' }, 503);

  let body: {
    messages?: CoreMessage[];
    maxTokens?: number;
    temperature?: number;
  };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return json({ error: 'messages is required' }, 400);
  }

  try {
    const result = streamText({
      model,
      messages,
      maxOutputTokens: body.maxTokens ?? DEFAULT_MAX_TOKENS,
      temperature: body.temperature ?? DEFAULT_TEMPERATURE,
    });
    return result.toTextStreamResponse();
  } catch (err) {
    console.error('AI proxy error:', err);
    return json({ error: 'AI request failed' }, 502);
  }
}
