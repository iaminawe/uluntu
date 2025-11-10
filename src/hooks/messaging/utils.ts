/**
 * Utility functions for messaging cache management
 * Provides helpers for cache invalidation and conversation isolation
 */

import { QueryClient, InfiniteData } from '@tanstack/react-query';
import { Message } from './types';
import { messagingQueryKeys } from './types';

/**
 * Helper to invalidate all messaging-related queries
 */
export function invalidateMessagingQueries(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: messagingQueryKeys.all });
}

/**
 * Helper to clear conversation-specific cache when switching conversations
 * This prevents message bleeding between conversations
 */
export function clearConversationCache(queryClient: QueryClient, conversationId: string): void {
  // Remove all message queries for this conversation
  queryClient.removeQueries({
    queryKey: messagingQueryKeys.messages(conversationId),
    exact: false
  });

  // Remove infinite query cache specifically
  queryClient.removeQueries({
    queryKey: [...messagingQueryKeys.messages(conversationId), 50, 'infinite'],
    exact: true
  });

  // Remove conversation-specific cache
  queryClient.removeQueries({
    queryKey: messagingQueryKeys.conversation(conversationId),
    exact: true
  });
}

/**
 * Helper to ensure conversation isolation by clearing all cached data
 * and forcing fresh queries
 */
export function resetConversationState(queryClient: QueryClient, conversationId: string): void {
  clearConversationCache(queryClient, conversationId);

  // Force refetch of conversation data
  queryClient.invalidateQueries({
    queryKey: messagingQueryKeys.conversation(conversationId),
    exact: true
  });

  // Force refetch of messages
  queryClient.invalidateQueries({
    queryKey: [...messagingQueryKeys.messages(conversationId), 50, 'infinite'],
    exact: true
  });
}

/**
 * Helper to optimistically update a message in cache with conversation isolation
 */
export function optimisticallyUpdateMessage(
  queryClient: QueryClient,
  conversationId: string,
  messageId: string,
  updater: (message: Message) => Message
): void {
  const queryKey = [...messagingQueryKeys.messages(conversationId), 50, 'infinite'];

  queryClient.setQueryData<InfiniteData<Message[]>>(
    queryKey,
    (oldData) => {
      if (!oldData) return oldData;

      const updatedPages = oldData.pages.map((page) =>
        page.map((message) =>
          message.id === messageId && message.conversation_id === conversationId
            ? updater(message)
            : message
        )
      );

      return { ...oldData, pages: updatedPages };
    }
  );
}
