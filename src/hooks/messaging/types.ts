/**
 * Type definitions and re-exports for messaging hooks
 * Centralizes all messaging-related types for hook usage
 */

// Re-export all types from messaging feature
export type {
  // Core types
  User,
  Conversation,
  ConversationParticipant,
  Message,
  MessageAttachment,
  MessageReaction,

  // Metadata types
  ConversationMetadata,
  MessageMetadata,

  // Input types
  CreateConversationInput,
  SendMessageInput,
  UpdateMessageInput,
  UpdateConversationInput,
  DeleteConversationInput,
  CreateMarketplaceThreadInput,
  CreateOpportunityThreadInput,

  // Filter types
  ConversationFilters,
  MessageFilters,

  // Utility types
  ConversationType,
  MessageType,
  ParticipantRole,
  DeleteType,

  // Block types
  BlockedUser,

  // Typing indicator types
  TypingIndicator,
  TypingStatus,

  // Response types
  ConversationsResponse,
  MessagesResponse,

  // Error types
  MessagingError,
  ConversationError,
  ConversationIsolationError,

  // Thread types
  MessageThread,

  // Cache types
  ConversationCacheOptions,
  ConversationSwitchContext,
  ConversationWithCache,
} from '@/features/messaging/types';

/**
 * Query keys for consistent cache management across messaging hooks
 */
export const messagingQueryKeys = {
  all: ['messaging'] as const,
  conversations: ['messaging', 'conversations'] as const,
  conversationsWithFilters: (filters: import('@/features/messaging/types').ConversationFilters) =>
    ['messaging', 'conversations', 'filtered', filters] as const,
  conversation: (id: string) => ['messaging', 'conversation', id] as const,
  messages: (conversationId: string) => ['messaging', 'messages', conversationId] as const,
  messagesWithFilters: (filters: import('@/features/messaging/types').MessageFilters) =>
    ['messaging', 'messages', filters.conversation_id, 'filtered', filters] as const,
  unreadCount: ['messaging', 'unread-count'] as const,
  blockedUsers: ['messaging', 'blocked-users'] as const,
  existingConversation: (participantId: string) => ['messaging', 'existing-conversation', participantId] as const,
};
