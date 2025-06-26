// TEMPORARY: Using mock implementation until messaging database tables are created
// TODO: Replace with actual Supabase implementation after running migration 009_create_messaging_system.sql

export { messagingApi } from './messagingApi.mock';

// Export query keys for React Query
export const messagingQueryKeys = {
  conversations: ['messaging', 'conversations'] as const,
  conversation: (id: string) => ['messaging', 'conversations', id] as const,
  messages: (conversationId: string) => ['messaging', 'messages', conversationId] as const,
  unreadCount: ['messaging', 'unreadCount'] as const,
  blockedUsers: ['messaging', 'blockedUsers'] as const,
} as const;