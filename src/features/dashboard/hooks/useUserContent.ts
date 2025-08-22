import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';
import type { UserContentResponse, ContentFilter } from '../types';

/**
 * Hook to fetch user's content with filtering and pagination
 */
export function useUserContent(filters: ContentFilter = {}): UseQueryResult<UserContentResponse> {
  return useQuery({
    queryKey: ['dashboard', 'user-content', filters],
    queryFn: async () => {
      const response = await dashboardApi.getUserContent(filters);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch user content');
      }
      return response.data;
    },
    staleTime: 2 * 60 * 1000,  // 2 minutes
    gcTime: 5 * 60 * 1000,     // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    // Keep previous data while loading new data (good for pagination)
    placeholderData: (previousData) => previousData
  });
}