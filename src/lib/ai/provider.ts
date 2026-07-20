import { CoreMessage } from 'ai';

// AI configuration.
//
// SECURITY: provider API keys live ONLY on the server (see api/ai.ts). The
// client never holds an Anthropic/OpenAI key — it POSTs to /api/ai with the
// user's Supabase token. The values below are non-secret UI config.
//
// `VITE_AI_PROVIDER` is kept only as a display hint for the UI. Whether AI is
// actually available is decided server-side; the client optimistically enables
// the UI unless VITE_AI_ENABLED is explicitly 'false'.

export const getAIProviderName = (): string =>
  import.meta.env.VITE_AI_PROVIDER || 'openai';

export const isAIEnabled = (): boolean =>
  import.meta.env.VITE_AI_ENABLED !== 'false';

// AI request tuning (non-secret). The server applies its own defaults/caps too.
export const getAIConfig = () => ({
  maxTokens: parseInt(import.meta.env.VITE_AI_MAX_TOKENS || '2000'),
  temperature: parseFloat(import.meta.env.VITE_AI_TEMPERATURE || '0.7'),
  isEnabled: isAIEnabled(),
});

// Helper to create system prompts
export const createSystemPrompt = (context?: string): CoreMessage => ({
  role: 'system',
  content: `You are an AI assistant helping with content creation in a block-based editor.
    ${context ? `Context: ${context}` : ''}
    Please provide helpful, accurate, and well-formatted content.
    Keep responses concise and relevant to the user's request.`,
});

// Helper to format user prompts
export const formatUserPrompt = (prompt: string, selectedText?: string): CoreMessage => ({
  role: 'user',
  content: selectedText
    ? `${prompt}\n\nSelected text:\n${selectedText}`
    : prompt,
});
