import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchNostrIdentity, linkNostrKey, unlinkNostrKey } from '../api/nostrApi';

const key = (userId?: string) => ['nostr-identity', userId];

export function useNostrIdentity(userId?: string) {
  return useQuery({
    queryKey: key(userId),
    queryFn: () => fetchNostrIdentity(userId as string),
    enabled: !!userId,
  });
}

export function useLinkNostrKey(userId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => linkNostrKey(userId as string),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key(userId) }),
  });
}

export function useUnlinkNostrKey(userId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => unlinkNostrKey(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key(userId) }),
  });
}
