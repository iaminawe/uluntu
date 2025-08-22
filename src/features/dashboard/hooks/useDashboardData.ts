import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';
import type { DashboardData } from '../types';

/**
 * Hook to fetch complete dashboard data
 */
export function useDashboardData(): UseQueryResult<DashboardData> {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: async () => {
      const response = await dashboardApi.getDashboardData();
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch dashboard data');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    retry: 2
  });
}