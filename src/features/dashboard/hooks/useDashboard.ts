import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';
import { ContentFilters, ContentType } from '../types';
import { useAuth } from '@/features/auth/hooks/useAuth';

export const useDashboardOverview = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['dashboard', 'overview', user?.id],
    queryFn: () => dashboardApi.getOverview(),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useUserContent = (contentType: ContentType, filters: ContentFilters) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['dashboard', 'content', user?.id, contentType, filters],
    queryFn: () => dashboardApi.getUserContent(filters),
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
};

export const useActivityStream = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['dashboard', 'activity', user?.id],
    queryFn: () => dashboardApi.getActivityFeed(),
    enabled: !!user?.id,
    staleTime: 60 * 1000,
    retry: 1,
  });
};

export const useContentStats = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['dashboard', 'stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const overview = await dashboardApi.getOverview();
      return {
        totalContent: overview.totalContent,
        contentSummary: overview.contentSummary,
        recentActivity: overview.recentActivity,
      };
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
};