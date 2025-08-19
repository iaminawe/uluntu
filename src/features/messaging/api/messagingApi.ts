// Switch between mock and real implementation based on environment variable
// Set VITE_USE_MOCK_MESSAGING=false to use real Supabase implementation
// Default to real implementation now that database is ready

import { messagingApi as realApi } from './messagingApi.real';
import { messagingApi as mockApi } from './messagingApi.mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_MESSAGING === 'true';

// Use real implementation by default, mock only if explicitly set
export const messagingApi = USE_MOCK ? mockApi : realApi;

// Export query keys for React Query
export const messagingQueryKeys = {
  conversations: ['messaging', 'conversations'] as const,
  conversation: (id: string) => ['messaging', 'conversations', id] as const,
  messages: (conversationId: string) => ['messaging', 'messages', conversationId] as const,
  unreadCount: ['messaging', 'unreadCount'] as const,
  blockedUsers: ['messaging', 'blockedUsers'] as const,
} as const;