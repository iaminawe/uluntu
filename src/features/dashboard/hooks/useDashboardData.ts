import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';
import type { DashboardData, UserContent, ContentFilters, PaginatedResponse } from '../types';

/**
 * Hook to fetch complete dashboard data
 */
export function useDashboardData(): UseQueryResult<DashboardData> {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: async () => {
      return await dashboardApi.getOverview();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    retry: 2
  });
}

/**
 * Hook to fetch user's content with filtering
 */
export function useUserContent(
  filters: ContentFilters = {},
  page: number = 1,
  limit: number = 20
): UseQueryResult<PaginatedResponse<UserContent>> {
  return useQuery({
    queryKey: ['dashboard', 'user-content', filters, page, limit],
    queryFn: async () => {
      return await dashboardApi.getUserContent(filters, page, limit);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,    // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2
  });
}