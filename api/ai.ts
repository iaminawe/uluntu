// Server-side AI proxy (Vercel Node.js runtime). Keeps the Anthropic/OpenAI
// keys off the client. The browser POSTs { messages, maxTokens?, temperature? }
// with the user's Supabase access token; this calls the provider server-side
// and streams plain text back.
import { streamText, type CoreMessage } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { getUser, parseBody, type ApiReq, type ApiRes } from './_lib/auth.js';

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

export default async function handler(req: ApiReq, res: ApiRes): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Require an authenticated Supabase user — this endpoint spends AI credits.
  const user = await getUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const model = resolveModel();
  if (!model) {
    res.status(503).json({ error: 'AI provider not configured' });
    return;
  }

  const body = parseBody<{
    messages?: CoreMessage[];
    maxTokens?: number;
    temperature?: number;
  }>(req);
  const messages = body?.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'messages is required' });
    return;
  }

  try {
    const result = streamText({
      model,
      messages,
      maxOutputTokens: body?.maxTokens ?? DEFAULT_MAX_TOKENS,
      temperature: body?.temperature ?? DEFAULT_TEMPERATURE,
    });
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    for await (const chunk of result.textStream) {
      res.write(chunk);
    }
    res.end();
  } catch (err) {
    console.error('AI proxy error:', err);
    // Headers may already be sent once streaming starts.
    try {
      res.status(502).json({ error: 'AI request failed' });
    } catch {
      res.end();
    }
  }
}
