import { UseQueryResult } from '@tanstack/react-query';
import { useMemberByUserId } from './useMemberByUserId';
import { Member } from './useMemberQueries';
import { useAuth } from './useAuth';
import { IS_SUPABASE_ENABLED } from '@/config/env';

// Hook to get the current user's member profile
export function useCurrentMember(): UseQueryResult<Member | null, Error> {
  const { user, isAuthenticated } = useAuth();
  const useSupabase = IS_SUPABASE_ENABLED;
  
  // Use the existing useMemberByUserId hook when Supabase is enabled
  const memberQuery = useMemberByUserId(useSupabase && user?.id ? user.id : undefined);
  
  // If not using Supabase, return a mock query result
  if (!useSupabase) {
    const mockData: Member | null = user?.id && isAuthenticated ? {
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
    } as Member : null;

    // Create a proper UseQueryResult-like object with all required properties
    const mockResult = {
      data: mockData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: async () => {
        // Return the same mock result structure
        return Promise.resolve(mockResult as UseQueryResult<Member | null, Error>);
      },
      isFetching: false,
      isSuccess: true,
      isPending: false,
      isRefetching: false,
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: true,
      isFetchedAfterMount: true,
      isLoadingError: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isStale: false,
      status: 'success' as const,
      fetchStatus: 'idle' as const
    };

    return mockResult as UseQueryResult<Member | null, Error>;
  }
  
  return memberQuery;
}