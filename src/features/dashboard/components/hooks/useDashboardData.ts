import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../api/dashboardApi';
import { ContentFilters, PaginationParams } from '../../types';

export const useDashboardData = () => {
  return useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: dashboardApi.getOverview,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2
  });
};

export const useUserContent = (
  filters: ContentFilters = {},
  page: number = 1,
  limit: number = 20
) => {
  return useQuery({
    queryKey: ['user-content', filters, page, limit],
    queryFn: () => dashboardApi.getUserContent(filters, page, limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true,
    retry: 2
  });
};

export const useActivityFeed = (limit: number = 10) => {
  return useQuery({
    queryKey: ['activity-feed', limit],
    queryFn: () => dashboardApi.getActivityFeed(limit),
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 3 * 60 * 1000, // 3 minutes
    refetchInterval: 2 * 60 * 1000, // Auto-refresh every 2 minutes
    retry: 2
  });
};

export const useContentAnalytics = (contentId: string) => {
  return useQuery({
    queryKey: ['content-analytics', contentId],
    queryFn: () => dashboardApi.getContentAnalytics(contentId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!contentId,
    retry: 2
  });
};

export const useNotifications = () => {
  return useQuery({
    queryKey: ['user-notifications'],
    queryFn: dashboardApi.getNotifications,
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // Auto-refresh every minute
    retry: 2
  });
};

export const useRecommendations = (contentTypes: string[], limit: number = 5) => {
  return useQuery({
    queryKey: ['content-recommendations', contentTypes, limit],
    queryFn: () => dashboardApi.getRecommendations(contentTypes, limit),
    staleTime: 15 * 60 * 1000, // 15 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    enabled: contentTypes.length > 0,
    retry: 1
  });
};