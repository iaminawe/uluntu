/**
 * Conversation-related query and mutation hooks
 * Handles conversation CRUD operations, archiving, and specialized thread creation
 */

import {
  useQuery,
  UseQueryResult,
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { messagingApi } from '@/features/messaging/api/messagingApi';
import {
  Conversation,
  MessageThread,
  CreateConversationInput,
  UpdateConversationInput,
  DeleteConversationInput,
  ConversationFilters,
  CreateMarketplaceThreadInput,
  CreateOpportunityThreadInput,
} from './types';
import { messagingQueryKeys } from './types';
import { logger } from '@/utils/logger';

/**
 * Hook to fetch conversations with optional filters
 */
export function useConversations(filters?: ConversationFilters): UseQueryResult<Conversation[], Error> {
  return useQuery({
    queryKey: filters ? messagingQueryKeys.conversationsWithFilters(filters) : messagingQueryKeys.conversations,
    queryFn: () => messagingApi.getConversations(filters),
    staleTime: 30 * 1000, // 30 seconds - conversations change less frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error?.message?.includes('auth') || error?.message?.includes('401')) {
        return false;
      }
      return failureCount < 3;
    }
  });
}

/**
 * Hook to fetch a specific conversation by ID
 */
export function useConversation(id: string): UseQueryResult<Conversation | null, Error> {
  return useQuery({
    queryKey: messagingQueryKeys.conversation(id),
    queryFn: () => messagingApi.getConversation(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry if conversation not found
      if (error?.message?.includes('not found') || error?.message?.includes('404')) {
        return false;
      }
      // Don't retry permission errors
      if (error?.message?.includes('permission') || error?.message?.includes('authorized')) {
        return false;
      }
      // Don't retry RLS policy errors
      if (error?.code === '42501') {
        return false;
      }
      // Retry 406 errors once (might be transient)
      if (error?.code === 'PGRST106' && failureCount < 1) {
        return true;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000)
  });
}

/**
 * Hook to check for existing conversation with a specific participant
 */
export function useExistingConversation(participantId?: string): UseQueryResult<Conversation | null, Error> {
  return useQuery({
    queryKey: messagingQueryKeys.existingConversation(participantId || ''),
    queryFn: () => participantId ? messagingApi.findExistingConversation(participantId) : Promise.resolve(null),
    enabled: !!participantId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to create a new conversation
 */
export function useCreateConversation(): UseMutationResult<Conversation, Error, CreateConversationInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateConversationInput) => messagingApi.createConversation(input),
    onSuccess: (newConversation) => {
      logger.debug(`Created conversation ${newConversation.id}`, 'MESSAGING');

      // Invalidate conversations list
      queryClient.invalidateQueries({ queryKey: messagingQueryKeys.conversations });

      // Add the new conversation to cache
      queryClient.setQueryData(
        messagingQueryKeys.conversation(newConversation.id),
        newConversation
      );

      // Update unread count
      queryClient.invalidateQueries({ queryKey: messagingQueryKeys.unreadCount });
    },
    onError: (error) => {
      logger.error('Failed to create conversation:', error.message, 'MESSAGING');
    }
  });
}

/**
 * Hook to update a conversation
 */
export function useUpdateConversation(): UseMutationResult<Conversation, Error, { id: string } & UpdateConversationInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & UpdateConversationInput) => messagingApi.updateConversation(id, input),
    onSuccess: (updatedConversation, variables) => {
      logger.debug(`Updated conversation ${variables.id}`, 'MESSAGING');

      // Update conversations list cache
      queryClient.setQueryData(
        messagingQueryKeys.conversations,
        (oldData: Conversation[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map((conversation: Conversation) =>
            conversation.id === variables.id ? updatedConversation : conversation
          );
        }
      );

      // Update specific conversation cache
      queryClient.setQueryData(
        messagingQueryKeys.conversation(variables.id),
        updatedConversation
      );

      // Invalidate conversations to refresh any filtered views
      queryClient.invalidateQueries({ queryKey: messagingQueryKeys.conversations });
    },
    onError: (error) => {
      // Enhanced error logging with RLS context
      logger.error('Failed to update conversation:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        isRLSError: error.code === '42501' || error.message?.includes('RLS'),
        is406Error: error.code === 'PGRST106' || error.message?.includes('JSON object requested'),
        isPermissionError: error.message?.includes('permission') || error.message?.includes('authorized')
      }, 'MESSAGING');

      // Provide user-friendly error messages
      if (error.message?.includes('permission') || error.message?.includes('authorized')) {
        error.message = 'You do not have permission to update this conversation';
      } else if (error.message?.includes('temporarily unavailable')) {
        error.message = 'Conversation update is temporarily unavailable. Please try again in a moment.';
      } else if (error.code === '42501' || error.message?.includes('security restrictions')) {
        error.message = 'Unable to update conversation due to security restrictions. Please contact support if this persists.';
      } else if (error.code === 'PGRST106') {
        error.message = 'Conversation update failed due to a database issue. Please try again.';
      }
    },
    retry: (failureCount, error) => {
      // Don't retry permission errors
      if (error?.message?.includes('permission') || error?.message?.includes('authorized')) {
        return false;
      }
      // Don't retry RLS policy errors
      if (error?.code === '42501') {
        return false;
      }
      // Retry 406 errors once (might be transient)
      if (error?.code === 'PGRST106' && failureCount < 1) {
        return true;
      }
      // Standard retry logic for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000)
  });
}

/**
 * Hook to delete a conversation
 */
export function useDeleteConversation(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => messagingApi.deleteConversation(conversationId),
    onSuccess: (_, conversationId) => {
      logger.debug(`Deleted conversation ${conversationId}`, 'MESSAGING');

      // Remove from conversations list cache
      queryClient.setQueryData(
        messagingQueryKeys.conversations,
        (oldData: Conversation[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.filter((conversation: Conversation) => conversation.id !== conversationId);
        }
      );

      // Remove specific conversation cache
      queryClient.removeQueries({ queryKey: messagingQueryKeys.conversation(conversationId) });

      // Remove messages cache for this conversation
      queryClient.removeQueries({ queryKey: messagingQueryKeys.messages(conversationId) });

      // Invalidate conversations to refresh any filtered views
      queryClient.invalidateQueries({ queryKey: messagingQueryKeys.conversations });
    },
    onError: (error) => {
      logger.error('Failed to delete conversation:', error.message, 'MESSAGING');
    }
  });
}

/**
 * Hook to delete multiple conversations (bulk delete)
 */
export function useDeleteConversations(): UseMutationResult<void, Error, string[]> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationIds: string[]) => messagingApi.deleteConversations(conversationIds),
    onSuccess: (_, conversationIds) => {
      logger.debug(`Bulk deleted ${conversationIds.length} conversations`, 'MESSAGING');

      // Remove from conversations list cache
      queryClient.setQueryData(
        messagingQueryKeys.conversations,
        (oldData: Conversation[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.filter((conversation: Conversation) => !conversationIds.includes(conversation.id));
        }
      );

      // Remove specific conversation caches
      conversationIds.forEach(conversationId => {
        queryClient.removeQueries({ queryKey: messagingQueryKeys.conversation(conversationId) });
        queryClient.removeQueries({ queryKey: messagingQueryKeys.messages(conversationId) });
      });

      // Invalidate conversations to refresh any filtered views
      queryClient.invalidateQueries({ queryKey: messagingQueryKeys.conversations });
    },
    onError: (error) => {
      logger.error('Failed to bulk delete conversations:', error.message, 'MESSAGING');
    }
  });
}

/**
 * Hook to delete a conversation with enhanced options
 */
export function useDeleteConversationEnhanced(): UseMutationResult<void, Error, DeleteConversationInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DeleteConversationInput) => messagingApi.deleteConversation(input),
    onSuccess: (_, variables) => {
      logger.debug(`Deleted conversation ${variables.id} (${variables.deleteType})`, 'MESSAGING');

      // Remove conversation from cache
      queryClient.setQueryData(
        messagingQueryKeys.conversations,
        (oldData: Conversation[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.filter((conversation: Conversation) => conversation.id !== variables.id);
        }
      );

      // Remove specific conversation cache
      queryClient.removeQueries({
        queryKey: messagingQueryKeys.conversation(variables.id)
      });

      // Remove messages cache for this conversation
      queryClient.removeQueries({
        queryKey: messagingQueryKeys.messages(variables.id)
      });

      // Refresh conversations list
      queryClient.invalidateQueries({ queryKey: messagingQueryKeys.conversations });

      // Update unread count
      queryClient.invalidateQueries({ queryKey: messagingQueryKeys.unreadCount });
    },
    onError: (error) => {
      logger.error('Failed to delete conversation:', error.message, 'MESSAGING');
    }
  });
}

/**
 * Hook to leave a conversation
 */
export function useLeaveConversation(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => messagingApi.leaveConversation(conversationId),
    onSuccess: (_, conversationId) => {
      logger.debug(`Left conversation ${conversationId}`, 'MESSAGING');

      // Remove conversation from cache
      queryClient.setQueryData(
        messagingQueryKeys.conversations,
        (oldData: Conversation[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.filter((conversation: Conversation) => conversation.id !== conversationId);
        }
      );

      // Remove specific conversation cache
      queryClient.removeQueries({
        queryKey: messagingQueryKeys.conversation(conversationId)
      });

      // Remove messages cache for this conversation
      queryClient.removeQueries({
        queryKey: messagingQueryKeys.messages(conversationId)
      });

      // Refresh conversations list
      queryClient.invalidateQueries({ queryKey: messagingQueryKeys.conversations });
    },
    onError: (error) => {
      logger.error('Failed to leave conversation:', error.message, 'MESSAGING');
    }
  });
}

/**
 * Hook to archive a conversation
 */
export function useArchiveConversation(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => messagingApi.archiveConversation(conversationId),
    onSuccess: (_, conversationId) => {
      logger.debug(`Archived conversation ${conversationId}`, 'MESSAGING');

      // Update conversation in cache to reflect archived status
      queryClient.setQueryData(
        messagingQueryKeys.conversations,
        (oldData: Conversation[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map((conversation: Conversation) => {
            if (conversation.id === conversationId) {
              return { ...conversation, is_archived: true };
            }
            return conversation;
          });
        }
      );

      // Update specific conversation cache
      queryClient.setQueryData(
        messagingQueryKeys.conversation(conversationId),
        (oldData: Conversation | null | undefined) => {
          if (!oldData) return oldData;
          return { ...oldData, is_archived: true };
        }
      );

      // Invalidate conversations list to refresh filtered views
      queryClient.invalidateQueries({ queryKey: messagingQueryKeys.conversations });
    },
    onError: (error) => {
      logger.error('Failed to archive conversation:', error.message, 'MESSAGING');
    }
  });
}

/**
 * Hook to unarchive a conversation
 */
export function useUnarchiveConversation(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => messagingApi.unarchiveConversation(conversationId),
    onSuccess: (_, conversationId) => {
      logger.debug(`Unarchived conversation ${conversationId}`, 'MESSAGING');

      // Update conversation in cache to reflect unarchived status
      queryClient.setQueryData(
        messagingQueryKeys.conversations,
        (oldData: Conversation[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map((conversation: Conversation) => {
            if (conversation.id === conversationId) {
              return { ...conversation, is_archived: false };
            }
            return conversation;
          });
        }
      );

      // Update specific conversation cache
      queryClient.setQueryData(
        messagingQueryKeys.conversation(conversationId),
        (oldData: Conversation | null | undefined) => {
          if (!oldData) return oldData;
          return { ...oldData, is_archived: false };
        }
      );

      // Invalidate conversations list to refresh filtered views
      queryClient.invalidateQueries({ queryKey: messagingQueryKeys.conversations });
    },
    onError: (error) => {
      logger.error('Failed to unarchive conversation:', error.message, 'MESSAGING');
    }
  });
}

/**
 * Hook to mark a conversation as read
 */
export function useMarkAsRead(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => messagingApi.markConversationAsRead(conversationId),
    onSuccess: (_, conversationId) => {
      logger.debug(`Marked conversation ${conversationId} as read`, 'MESSAGING');

      // Update unread count
      queryClient.invalidateQueries({ queryKey: messagingQueryKeys.unreadCount });

      // Update conversations list to reflect read status
      queryClient.invalidateQueries({ queryKey: messagingQueryKeys.conversations });
    },
    onError: (error) => {
      logger.error('Failed to mark conversation as read:', error.message, 'MESSAGING');
    }
  });
}

/**
 * Hook to create marketplace conversation thread
 */
export function useCreateMarketplaceThread(): UseMutationResult<Conversation, Error, CreateMarketplaceThreadInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateMarketplaceThreadInput) => messagingApi.createMarketplaceThread(input),
    onSuccess: (newConversation) => {
      logger.debug(`Created marketplace thread ${newConversation.id}`, 'MESSAGING');

      // Invalidate conversations list to show new thread
      queryClient.invalidateQueries({ queryKey: messagingQueryKeys.conversations });

      // Add the new conversation to cache
      queryClient.setQueryData(
        messagingQueryKeys.conversation(newConversation.id),
        newConversation
      );

      // Update unread count
      queryClient.invalidateQueries({ queryKey: messagingQueryKeys.unreadCount });
    },
    onError: (error) => {
      logger.error('Failed to create marketplace thread:', error.message, 'MESSAGING');
    }
  });
}

/**
 * Hook to create opportunity conversation thread
 */
export function useCreateOpportunityThread(): UseMutationResult<Conversation, Error, CreateOpportunityThreadInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOpportunityThreadInput) => messagingApi.createOpportunityThread(input),
    onSuccess: (newConversation) => {
      logger.debug(`Created opportunity thread ${newConversation.id}`, 'MESSAGING');

      // Invalidate conversations list to show new thread
      queryClient.invalidateQueries({ queryKey: messagingQueryKeys.conversations });

      // Add the new conversation to cache
      queryClient.setQueryData(
        messagingQueryKeys.conversation(newConversation.id),
        newConversation
      );

      // Update unread count
      queryClient.invalidateQueries({ queryKey: messagingQueryKeys.unreadCount });
    },
    onError: (error) => {
      logger.error('Failed to create opportunity thread:', 'MESSAGING', error);
    }
  });
}
