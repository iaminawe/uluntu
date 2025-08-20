import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { lookupMember } from '@/utils/memberSlugUtils';

/**
 * Hook to fetch member by slug or ID
 * Supports both slug-based and UUID-based lookups for backward compatibility
 */
export function useMemberBySlugOrId(identifier?: string) {
  return useQuery({
    queryKey: ['member', 'identifier', identifier],
    queryFn: async () => {
      if (!identifier) return null;
      
      const { data } = await lookupMember(identifier);
      return data;
    },
    enabled: !!identifier,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}