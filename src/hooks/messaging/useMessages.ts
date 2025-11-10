/**
 * Message-related query and mutation hooks
 * Handles message CRUD operations, reactions, and infinite scrolling
 */

import {
  useQuery,
  UseQueryResult,
  useMutation,
  UseMutationResult,
  useQueryClient,
  useInfiniteQuery,
  UseInfiniteQueryResult,
  InfiniteData
} from '@tanstack/react-query';
import { messagingApi } from '@/features/messaging/api/messagingApi';
import {
  Message,
  MessageReaction,
  SendMessageInput,
  UpdateMessageInput,
  MessageFilters,
} from './types';
import { messagingQueryKeys } from './types';
import { logger } from '@/utils/logger';
import { supabase } from '@/lib/supabase';

/**
 * Hook to fetch messages for a conversation with infinite scrolling support
 * Ensures proper conversation isolation by using conversation-specific query keys
 */
export function useMessages(
  conversationId: string,
  limit: number = 50
): UseInfiniteQueryResult<Message[], Error> {
  return useInfiniteQuery({
    queryKey: [...messagingQueryKeys.messages(conversationId), limit, 'infinite'],
    queryFn: ({ pageParam }) => {
      const filters: MessageFilters = {
        conversation_id: conversationId,
        limit,
        offset: pageParam as number || 0
      };
      return messagingApi.getMessages(conversationId, filters);
    },
    getNextPageParam: (lastPage, allPages) => {
      // Return the next offset for pagination
      if (lastPage.length === 0 || lastPage.length < limit) {
        return undefined; // No more pages
      }
      return allPages.length * limit; // Next offset
    },
    initialPageParam: 0,
    enabled: !!conversationId && conversationId.trim() !== '',
    staleTime: 10 * 1000, // 10 seconds - messages update frequently
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    // Ensure each conversation has isolated cache
    structuralSharing: false,
    // Don't share data between different conversation queries
    select: (data) => {
      if (!data?.pages) return { pages: [], pageParams: [] };
      // Filter messages to ensure they belong to this conversation only
      const filteredPages = data.pages.map(page =>
        Array.isArray(page) ? page.filter(msg => msg.conversation_id === conversationId) : []
      );
      return { ...data, pages: filteredPages };
    }
  });
}

/**
 * Hook to fetch messages with specific filters (non-infinite)
 */
export function useMessagesWithFilters(filters: MessageFilters): UseQueryResult<Message[], Error> {
  return useQuery({
    queryKey: messagingQueryKeys.messagesWithFilters(filters),
    queryFn: () => messagingApi.getMessages(filters.conversation_id, filters),
    enabled: !!filters.conversation_id,
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes,
  });
}

/**
 * Hook to get unread message count
 */
export function useUnreadMessageCount(): UseQueryResult<number, Error> {
  return useQuery({
    queryKey: messagingQueryKeys.unreadCount,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;
      return messagingApi.getUnreadCount(user.id);
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to get unread count (alias for UnreadBadge compatibility)
 */
export function useUnreadCount(userId?: string, options?: { enabled?: boolean }): UseQueryResult<number, Error> {
  return useUnreadMessageCount();
}

/**
 * Hook to send a message with proper cache isolation
 */
export function useSendMessage(): UseMutationResult<Message, Error, SendMessageInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SendMessageInput) => messagingApi.sendMessage(input),
    onSuccess: (newMessage, variables) => {
      logger.debug(`Sent message ${newMessage.id}`, 'MESSAGING');

      // Update messages cache with conversation-specific keys
      const messagesQueryKey = [...messagingQueryKeys.messages(variables.conversation_id), 50, 'infinite'];
      queryClient.setQueryData<InfiniteData<Message[]>>(
        messagesQueryKey,
        (oldData) => {
          if (!oldData) return { pages: [[newMessage]], pageParams: [0] };

          // Ensure the message belongs to the correct conversation
          if (newMessage.conversation_id !== variables.conversation_id) {
            logger.warn('Message conversation_id mismatch', 'MESSAGING');
            return oldData;
          }

          const updatedPages = [...oldData.pages];
          if (updatedPages.length > 0) {
            // Add to the first page (most recent messages)
            updatedPages[0] = [newMessage, ...updatedPages[0]];
          } else {
            updatedPages.push([newMessage]);
          }

          return { ...oldData, pages: updatedPages };
        }
      );

      // Only invalidate conversation-specific queries
      queryClient.invalidateQueries({
        queryKey: messagingQueryKeys.conversation(variables.conversation_id),
        exact: true
      });

      // Update conversations list (but not other conversation caches)
      queryClient.invalidateQueries({
        queryKey: messagingQueryKeys.conversations,
        exact: true
      });

      // Update unread count
      queryClient.invalidateQueries({
        queryKey: messagingQueryKeys.unreadCount,
        exact: true
      });
    },
    onError: (error) => {
      logger.error('Failed to send message:', error.message, 'MESSAGING');
    }
  });
}

/**
 * Hook to update a message with proper cache isolation
 */
export function useUpdateMessage(): UseMutationResult<Message, Error, UpdateMessageInput & { id: string }> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...input }: UpdateMessageInput & { id: string }) => messagingApi.updateMessage({ id, ...input }),
    onSuccess: (updatedMessage, variables) => {
      logger.debug(`Updated message ${variables.id}`, 'MESSAGING');

      // Update messages cache with conversation-specific key
      const messagesQueryKey = [...messagingQueryKeys.messages(updatedMessage.conversation_id), 50, 'infinite'];
      queryClient.setQueryData<InfiniteData<Message[]>>(
        messagesQueryKey,
        (oldData) => {
          if (!oldData) return oldData;

          const updatedPages = oldData.pages.map((page) =>
            page.map((message) =>
              message.id === variables.id && message.conversation_id === updatedMessage.conversation_id
                ? updatedMessage
                : message
            )
          );

          return { ...oldData, pages: updatedPages };
        }
      );
    },
    onError: (error) => {
      logger.error('Failed to update message:', error.message, 'MESSAGING');
    }
  });
}

/**
 * Hook to delete a message
 */
export function useDeleteMessage(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => messagingApi.deleteMessage(messageId),
    onSuccess: (_, messageId) => {
      logger.debug(`Deleted message ${messageId}`, 'MESSAGING');

      // Invalidate messages cache to refetch updated data
      queryClient.invalidateQueries({ queryKey: messagingQueryKeys.all });
    },
    onError: (error) => {
      logger.error('Failed to delete message:', error.message, 'MESSAGING');
    }
  });
}

/**
 * Hook to add a reaction to a message
 */
export function useAddReaction(): UseMutationResult<MessageReaction, Error, { messageId: string; reaction: string }> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, reaction }) => messagingApi.addReaction(messageId, reaction),
    onSuccess: (newReaction, variables) => {
      logger.debug(`Added reaction ${variables.reaction} to message ${variables.messageId}`, 'MESSAGING');

      // Update all message caches that might contain this message
      queryClient.invalidateQueries({ queryKey: messagingQueryKeys.all });
    },
    onError: (error) => {
      logger.error('Failed to add reaction:', error.message, 'MESSAGING');
    }
  });
}

/**
 * Hook to remove a reaction from a message
 */
export function useRemoveReaction(): UseMutationResult<void, Error, { messageId: string; reaction: string }> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, reaction }) => messagingApi.removeReaction(messageId, reaction),
    onSuccess: (_, variables) => {
      logger.debug(`Removed reaction ${variables.reaction} from message ${variables.messageId}`, 'MESSAGING');

      // Update all message caches that might contain this message
      queryClient.invalidateQueries({ queryKey: messagingQueryKeys.all });
    },
    onError: (error) => {
      logger.error('Failed to remove reaction:', error.message, 'MESSAGING');
    }
  });
}
