/**
 * Messaging hooks barrel export
 * Provides a centralized import point for all messaging-related hooks
 *
 * @example
 * ```typescript
 * // Import specific hooks
 * import { useConversations, useSendMessage } from '@/hooks/messaging';
 *
 * // Import types
 * import type { Conversation, Message } from '@/hooks/messaging';
 * ```
 */

// =============================================
// TYPE EXPORTS
// =============================================
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
} from './types';

export { messagingQueryKeys } from './types';

// =============================================
// CONVERSATION HOOKS
// =============================================
export {
  useConversations,
  useConversation,
  useExistingConversation,
  useCreateConversation,
  useUpdateConversation,
  useDeleteConversation,
  useDeleteConversations,
  useDeleteConversationEnhanced,
  useLeaveConversation,
  useArchiveConversation,
  useUnarchiveConversation,
  useMarkAsRead,
  useCreateMarketplaceThread,
  useCreateOpportunityThread,
} from './useConversations';

// =============================================
// MESSAGE HOOKS
// =============================================
export {
  useMessages,
  useMessagesWithFilters,
  useUnreadMessageCount,
  useUnreadCount,
  useSendMessage,
  useUpdateMessage,
  useDeleteMessage,
  useAddReaction,
  useRemoveReaction,
} from './useMessages';

// =============================================
// BLOCKED USERS HOOKS
// =============================================
export {
  useBlockedUsers,
  useGetBlockedUsers,
  useBlockUser,
  useUnblockUser,
} from './useBlockedUsers';

// =============================================
// UTILITY FUNCTIONS
// =============================================
export {
  invalidateMessagingQueries,
  clearConversationCache,
  resetConversationState,
  optimisticallyUpdateMessage,
} from './utils';
