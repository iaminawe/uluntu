// Client-side helper for the server-side AI proxy (/api/ai).
// No API keys live here — the browser only sends the user's Supabase token.
import type { CoreMessage } from 'ai';
import { supabase } from '@/lib/supabase';

export interface AIRequestOptions {
  maxTokens?: number;
  temperature?: number;
}

async function authHeaders(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
  return headers;
}

/**
 * POST messages to the AI proxy and return the raw streaming Response.
 * Callers that need the stream (e.g. editor integrations) use this directly.
 */
export async function postAIMessages(
  messages: CoreMessage[],
  opts: AIRequestOptions = {}
): Promise<Response> {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ messages, ...opts }),
  });
  if (!res.ok) {
    const detail = res.status === 401 ? 'Please sign in to use AI features.' : '';
    throw new Error(`AI request failed (${res.status}). ${detail}`.trim());
  }
  return res;
}

/** POST messages and accumulate the streamed text into a single string. */
export async function streamAIText(
  messages: CoreMessage[],
  opts: AIRequestOptions = {}
): Promise<string> {
  const res = await postAIMessages(messages, opts);
  if (!res.body) return '';
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let text = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
  }
  text += decoder.decode();
  return text;
}
