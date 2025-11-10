/**
 * Blocked users query and mutation hooks
 * Handles user blocking and unblocking operations
 */

import {
  useQuery,
  UseQueryResult,
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { messagingApi } from '@/features/messaging/api/messagingApi';
import { BlockedUser } from './types';
import { messagingQueryKeys } from './types';
import { logger } from '@/utils/logger';

/**
 * Hook to get blocked users list
 * @deprecated Use useGetBlockedUsers instead
 */
export function useBlockedUsers(): UseQueryResult<BlockedUser[], Error> {
  return useQuery({
    queryKey: messagingQueryKeys.blockedUsers,
    queryFn: () => {
      // This function doesn't exist in the API yet, return empty array
      return Promise.resolve([]);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get blocked users list
 */
export function useGetBlockedUsers(): UseQueryResult<BlockedUser[], Error> {
  return useQuery({
    queryKey: messagingQueryKeys.blockedUsers,
    queryFn: () => messagingApi.getBlockedUsers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to block a user
 */
export function useBlockUser(): UseMutationResult<void, Error, { userId: string; reason?: string }> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, reason }) => messagingApi.blockUser(userId, reason),
    onSuccess: (_, variables) => {
      logger.debug(`Blocked user ${variables.userId}`, 'MESSAGING');

      // Update blocked users list
      queryClient.invalidateQueries({ queryKey: messagingQueryKeys.blockedUsers });

      // Invalidate conversations to hide blocked user conversations
      queryClient.invalidateQueries({ queryKey: messagingQueryKeys.conversations });
    },
    onError: (error) => {
      logger.error('Failed to block user:', error.message, 'MESSAGING');
    }
  });
}

/**
 * Hook to unblock a user
 */
export function useUnblockUser(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => messagingApi.unblockUser(userId),
    onSuccess: (_, userId) => {
      logger.debug(`Unblocked user ${userId}`, 'MESSAGING');

      // Update blocked users list
      queryClient.invalidateQueries({ queryKey: messagingQueryKeys.blockedUsers });

      // Invalidate conversations to show unblocked user conversations
      queryClient.invalidateQueries({ queryKey: messagingQueryKeys.conversations });
    },
    onError: (error) => {
      logger.error('Failed to unblock user:', error.message, 'MESSAGING');
    }
  });
}
