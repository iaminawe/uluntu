import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { membersApi } from '../api/membersApi';
import { Member } from '../types';
import { useAuth } from './useAuth';

// Hook to get the current user's member profile
export function useCurrentMember(): UseQueryResult<Member | null, Error> {
  const { user, isAuthenticated } = useAuth();
  const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';
  
  return useQuery<Member | null, Error>({
    queryKey: ['member', 'current', user?.id, useSupabase ? 'supabase' : 'mock'],
    queryFn: async () => {
      if (!user?.id || !isAuthenticated) {
        return null;
      }

      if (useSupabase) {
        return await membersApi.getByUserId(user.id);
      } else {
        // Mock implementation - return a mock member profile
        return {
          id: 'mock-member-1',
          name: user.email?.split('@')[0] || 'Mock User',
          email: user.email,
          title: 'Community Member',
          image: '/placeholder-avatar.png',
          bio: 'Mock member profile',
          location: 'Nelson, BC',
          joinDate: new Date().toISOString(),
          status: 'published' as const,
          created_at: new Date().toISOString()
        } as Member;
      }
    },
    enabled: !!user?.id && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}