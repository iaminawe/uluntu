import { createAIExtension } from '@blocknote/xl-ai';
// @blocknote/xl-ai@0.35 targets AI SDK v4 (LanguageModelV1). Use the aliased v1
// providers here so the model matches; the rest of the app uses AI SDK v5.
import { createOpenAI } from 'ai-sdk-openai-v1';
import { createAnthropic } from 'ai-sdk-anthropic-v1';
import { isAIEnabled, getAIProviderName } from './provider';
import { supabase } from '@/lib/supabase';

// Model names are non-secret (safe as VITE_). The actual provider API keys live
// server-side and are injected by /api/ai/provider.
const ANTHROPIC_MODEL = import.meta.env.VITE_ANTHROPIC_MODEL || 'claude-haiku-5-5';
const OPENAI_MODEL = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';

// Custom fetch: rewrite every provider call to our transparent proxy and attach
// the user's Supabase token. The proxy injects the real provider key, so no key
// is ever present in the client bundle.
const proxyFetch =
  (provider: 'openai' | 'anthropic') =>
  async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const original = new Request(input, init);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const headers = new Headers(init?.headers ?? original.headers);
    headers.set('Authorization', `Bearer ${session?.access_token ?? ''}`);

    const proxyUrl = `/api/ai/provider?provider=${provider}&url=${encodeURIComponent(
      original.url
    )}`;
    return fetch(proxyUrl, {
      method: original.method || 'POST',
      headers,
      body: init?.body ?? original.body,
      // required when streaming a request body
      duplex: 'half',
    } as RequestInit);
  };

// Create the BlockNote AI extension (inline AI menu) for the block editor.
export const createBlockNoteAI = () => {
  if (!isAIEnabled()) {
    console.warn('AI features are disabled');
    return null;
  }

  const providerName = getAIProviderName();
  const model =
    providerName === 'anthropic'
      ? createAnthropic({ apiKey: 'proxy', fetch: proxyFetch('anthropic') })(ANTHROPIC_MODEL)
      : createOpenAI({ apiKey: 'proxy', fetch: proxyFetch('openai') })(OPENAI_MODEL);

  return createAIExtension({ model, stream: true });
};

// Helper to check if AI is available (server owns actual key availability)
export const isAIAvailable = (): boolean => isAIEnabled();
