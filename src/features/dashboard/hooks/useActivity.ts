import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';
import type { ActivityResponse, ActivityFilter } from '../types';

/**
 * Hook to fetch user activity feed
 */
export function useActivity(filters: ActivityFilter = {}): UseQueryResult<ActivityResponse> {
  return useQuery({
    queryKey: ['dashboard', 'activity', filters],
    queryFn: async () => {
      const response = await dashboardApi.getActivity(filters);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch activity');
      }
      return response.data;
    },
    staleTime: 30 * 1000,     // 30 seconds
    gcTime: 2 * 60 * 1000,    // 2 minutes
    refetchInterval: 60 * 1000, // Auto-refetch every minute
    retry: 2
  });
}