import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { topicsApi } from '../api/topicsApi';
import { updateFilters, selectTopicsFilters } from '../store/topicsUISlice';
import { filterTopics, sortTopics } from '../utils/topicAdapter';
import type { Topic, TopicWithAnalytics, TopicFormData, TopicEntityType } from '../types';

export const topicsQueryKeys = {
  all: ['topics'] as const,
  lists: () => [...topicsQueryKeys.all, 'list'] as const,
  list: (filters?: string) => [...topicsQueryKeys.lists(), { filters }] as const,
  details: () => [...topicsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...topicsQueryKeys.details(), id] as const,
  bySlug: (slug: string) => [...topicsQueryKeys.all, 'slug', slug] as const,
  analytics: () => [...topicsQueryKeys.all, 'analytics'] as const,
  entityTopics: (entityType: TopicEntityType, entityId: string) => 
    [...topicsQueryKeys.all, 'entity', entityType, entityId] as const,
  contentCounts: (slug: string) => [...topicsQueryKeys.all, 'counts', slug] as const,
};

// Main hybrid hook for topics list
export function useTopicsHybrid() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectTopicsFilters);
  const queryClient = useQueryClient();

  const topicsQuery = useQuery({
    queryKey: topicsQueryKeys.lists(),
    queryFn: () => topicsApi.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const topics = topicsQuery.data || [];
  const filteredTopics = filterTopics(topics, filters.search);
  const sortedTopics = sortTopics(
    filteredTopics, 
    filters.sortBy === 'name' ? 'name' : 'sortOrder'
  );

  const setSearchTerm = (search?: string) => {
    dispatch(updateFilters({ search }));
  };

  const setSortBy = (sortBy: 'name' | 'sortOrder') => {
    dispatch(updateFilters({ sortBy }));
  };

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: topicsQueryKeys.all });
  };

  return {
    topics: sortedTopics,
    isLoading: topicsQuery.isLoading,
    error: topicsQuery.error,
    refetch,
    filters,
    setSearchTerm,
    setSortBy,
  };
}

// Hook for topic analytics
export function useTopicAnalytics() {
  return useQuery({
    queryKey: topicsQueryKeys.analytics(),
    queryFn: () => topicsApi.getWithAnalytics(),
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for individual topic by ID
export function useTopicById(id: string) {
  return useQuery({
    queryKey: topicsQueryKeys.detail(id),
    queryFn: () => topicsApi.getById(id),
    enabled: !!id,
  });
}

// Hook for individual topic by slug
export function useTopicBySlug(slug: string) {
  return useQuery({
    queryKey: topicsQueryKeys.bySlug(slug),
    queryFn: () => topicsApi.getBySlug(slug),
    enabled: !!slug,
  });
}

// Hook for entity topics
export function useEntityTopics(entityType: TopicEntityType, entityId: string) {
  return useQuery({
    queryKey: topicsQueryKeys.entityTopics(entityType, entityId),
    queryFn: () => topicsApi.getTopicsForEntity(entityType, entityId),
    enabled: !!entityId,
  });
}

// Hook for topic content counts
export function useTopicContentCounts(slug: string) {
  return useQuery({
    queryKey: topicsQueryKeys.contentCounts(slug),
    queryFn: () => topicsApi.getTopicContentCounts(slug),
    enabled: !!slug,
  });
}

// Mutations
export function useCreateTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (topicData: TopicFormData) => topicsApi.create(topicData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: topicsQueryKeys.all });
    },
  });
}

export function useUpdateTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TopicFormData> }) => 
      topicsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: topicsQueryKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: topicsQueryKeys.lists() });
    },
  });
}

export function useDeleteTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => topicsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: topicsQueryKeys.all });
    },
  });
}

export function useSetEntityTopics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      entityType, 
      entityId, 
      topicIds 
    }: { 
      entityType: TopicEntityType; 
      entityId: string; 
      topicIds: string[] 
    }) => topicsApi.setTopicsForEntity(entityType, entityId, topicIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: topicsQueryKeys.entityTopics(variables.entityType, variables.entityId) 
      });
      queryClient.invalidateQueries({ queryKey: topicsQueryKeys.analytics() });
    },
  });
}