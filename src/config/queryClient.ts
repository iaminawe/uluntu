import { QueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

// Query key factory for consistent cache keys
export const queryKeys = {
  // Auth
  auth: ['auth'] as const,
  user: (id: string) => ['user', id] as const,
  
  // Companies
  companies: {
    all: ['companies'] as const,
    lists: () => [...queryKeys.companies.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.companies.lists(), filters] as const,
    details: () => [...queryKeys.companies.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.companies.details(), id] as const,
  },
  
  // Members
  members: {
    all: ['members'] as const,
    lists: () => [...queryKeys.members.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.members.lists(), filters] as const,
    details: () => [...queryKeys.members.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.members.details(), id] as const,
  },
  
  // Events
  events: {
    all: ['events'] as const,
    lists: () => [...queryKeys.events.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.events.lists(), filters] as const,
    details: () => [...queryKeys.events.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.events.details(), id] as const,
  },
  
  // Resources
  resources: {
    all: ['resources'] as const,
    lists: () => [...queryKeys.resources.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.resources.lists(), filters] as const,
    details: () => [...queryKeys.resources.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.resources.details(), id] as const,
  },
  
  // Gallery
  galleries: {
    all: ['galleries'] as const,
    lists: () => [...queryKeys.galleries.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.galleries.lists(), filters] as const,
    details: () => [...queryKeys.galleries.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.galleries.details(), id] as const,
    photos: (galleryId: string) => [...queryKeys.galleries.detail(galleryId), 'photos'] as const,
  },
  
  // News
  news: ['news'] as const,
  newsWithFilters: (filters: Record<string, any>) => ['news', 'filtered', filters] as const,
  newsArticle: (id: string) => ['news', id] as const,
  featuredNews: ['news', 'featured'] as const,
  
  // Groups
  groups: ['groups'] as const,
  groupsWithFilters: (filters: Record<string, any>) => ['groups', 'filtered', filters] as const,
  group: (id: string) => ['groups', id] as const,
  featuredGroups: ['groups', 'featured'] as const,
  userGroups: ['groups', 'user'] as const,
  
  // Opportunities
  opportunities: ['opportunities'] as const,
  opportunitiesWithFilters: (filters: Record<string, any>) => ['opportunities', 'filtered', filters] as const,
  opportunity: (id: string) => ['opportunities', id] as const,
  
  // Marketplace
  marketplace: ['marketplace'] as const,
  marketplaceWithFilters: (filters: Record<string, any>) => ['marketplace', 'filtered', filters] as const,
  marketplaceItem: (id: string) => ['marketplace', id] as const,
  
  // Resources (additional convenience methods)
  resourcesWithFilters: (filters: Record<string, any>) => ['resources', 'filtered', filters] as const,
  resource: (id: string) => ['resources', id] as const,
  featuredResources: ['resources', 'featured'] as const,
} as const;

// Create optimized query client
export const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      // Data considered fresh for 5 minutes to prevent excessive refreshes
      staleTime: 5 * 60 * 1000,
      
      // Cache data for 5 minutes
      gcTime: 5 * 60 * 1000,
      
      // Refetch on window focus for important data
      refetchOnWindowFocus: (query) => {
        // Only refetch auth and user data on focus
        return query.queryKey[0] === 'auth' || query.queryKey[0] === 'user';
      },
      
      // Don't refetch on reconnect by default
      refetchOnReconnect: false,
      
      // Retry failed requests 3 times with exponential backoff
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      
      // Exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Network mode
      networkMode: 'online',
    },
    
    mutations: {
      // Show error toasts for failed mutations
      onError: (error: any) => {
        const message = error?.message || 'An error occurred';
        toast.error(message);
      },
      
      // Retry mutations once
      retry: 1,
      
      // Network mode
      networkMode: 'online',
    },
  },
});

// Prefetch helpers
export const prefetchHelpers = {
  // Prefetch company details
  prefetchCompany: async (queryClient: QueryClient, companyId: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.companies.detail(companyId),
      staleTime: 60 * 1000, // Consider fresh for 1 minute
    });
  },
  
  // Prefetch event details
  prefetchEvent: async (queryClient: QueryClient, eventId: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.events.detail(eventId),
      staleTime: 60 * 1000,
    });
  },
  
  // Prefetch resource details
  prefetchResource: async (queryClient: QueryClient, resourceId: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.resources.detail(resourceId),
      staleTime: 60 * 1000,
    });
  },
};

// Invalidation helpers
export const invalidationHelpers = {
  // Invalidate all company data
  invalidateCompanies: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.companies.all });
  },
  
  // Invalidate specific company
  invalidateCompany: (queryClient: QueryClient, companyId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.companies.detail(companyId) });
  },
  
  // Invalidate all member data
  invalidateMembers: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
  },
  
  // Invalidate specific member
  invalidateMember: (queryClient: QueryClient, memberId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.members.detail(memberId) });
  },
  
  // Smart invalidation for related data
  invalidateRelatedData: (queryClient: QueryClient, entityType: string, entityId: string) => {
    switch (entityType) {
      case 'company':
        // Invalidate company and related members
        queryClient.invalidateQueries({ queryKey: queryKeys.companies.detail(entityId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
        break;
      case 'event':
        // Invalidate event and lists
        queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(entityId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.events.lists() });
        break;
      // Add more cases as needed
    }
  },
};

// Performance monitoring
export const setupQueryPerformanceMonitoring = (queryClient: QueryClient) => {
  // Log slow queries
  queryClient.getQueryCache().subscribe((event) => {
    if (event.type === 'updated' && event.query.state.fetchStatus === 'idle') {
      // Skip performance monitoring for now due to type issues
      // TODO: Implement proper performance monitoring with correct types
    }
  });
  
  // Monitor cache hit rate
  let cacheHits = 0;
  let cacheMisses = 0;
  
  queryClient.getQueryCache().subscribe((event) => {
    if (event.type === 'added') {
      const query = event.query;
      if (query.state.data && query.state.fetchStatus !== 'fetching') {
        cacheHits++;
      } else {
        cacheMisses++;
      }
      
      // Log cache hit rate every 100 queries
      const total = cacheHits + cacheMisses;
      if (total % 100 === 0) {
        const hitRate = (cacheHits / total) * 100;
        console.log(`Cache hit rate: ${hitRate.toFixed(2)}% (${cacheHits}/${total})`);
      }
    }
  });
};