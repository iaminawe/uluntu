import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { resourcesApi } from '../api/resourcesApi';
import { 
  selectResourcesFilters,
  selectSelectedResourceId,
  selectResourcesViewMode,
  selectResourcesSortBy,
  selectResourcesSortOrder,
  updateFilters,
  clearFilters,
  setSelectedResource,
  setViewMode,
  setSortBy,
  setSortOrder,
} from '../store/resourcesUISlice';
import { Resource } from '@/types';
import { queryKeys } from '@/config/queryClient';

export function useResourcesHybrid() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  
  // UI state from Redux
  const filters = useAppSelector(selectResourcesFilters);
  const selectedResourceId = useAppSelector(selectSelectedResourceId);
  const viewMode = useAppSelector(selectResourcesViewMode);
  const sortBy = useAppSelector(selectResourcesSortBy);
  const sortOrder = useAppSelector(selectResourcesSortOrder);
  
  // React Query for server state
  const resourcesQuery = useQuery({
    queryKey: queryKeys.resourcesWithFilters(filters),
    queryFn: () => resourcesApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const featuredQuery = useQuery({
    queryKey: queryKeys.featuredResources,
    queryFn: () => resourcesApi.getAll({ featured: true }),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
  
  // Get single resource by ID
  const getResource = (id: string) => {
    return useQuery({
      queryKey: queryKeys.resource(id),
      queryFn: () => resourcesApi.getById(id),
      enabled: !!id,
    });
  };
  
  // Get related resources
  const getRelatedResources = (resourceId: string, limit: number = 3) => {
    return useQuery({
      queryKey: ['resources', 'related', resourceId, limit],
      queryFn: () => resourcesApi.getRelated(resourceId, limit),
      enabled: !!resourceId,
    });
  };
  
  // Mutations
  const createResource = useMutation({
    mutationFn: (data: Partial<Resource>) => resourcesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resources });
    },
  });
  
  const updateResource = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Resource> }) => 
      resourcesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resources });
      queryClient.invalidateQueries({ queryKey: queryKeys.resource(id) });
    },
  });
  
  const deleteResource = useMutation({
    mutationFn: (id: string) => resourcesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resources });
    },
  });
  
  // UI actions
  const setSearchTerm = useCallback((search?: string) => {
    dispatch(updateFilters({ search }));
  }, [dispatch]);
  
  const setTypes = useCallback((types?: string[]) => {
    dispatch(updateFilters({ types }));
  }, [dispatch]);
  
  const setCategory = useCallback((category?: string) => {
    dispatch(updateFilters({ category }));
  }, [dispatch]);
  
  const setFeaturedFilter = useCallback((featured?: boolean) => {
    dispatch(updateFilters({ featured }));
  }, [dispatch]);
  
  const resetFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);
  
  // Sort and filter resources
  const sortedResources = [...(resourcesQuery.data || [])].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.created_at || '').getTime() - 
                    new Date(b.created_at || '').getTime();
        break;
      case 'title':
        comparison = (a.title || '').localeCompare(b.title || '');
        break;
      case 'type':
        comparison = (a.type || '').localeCompare(b.type || '');
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  
  return {
    // Data
    resources: sortedResources,
    featuredResources: featuredQuery.data || [],
    isLoading: resourcesQuery.isLoading,
    isFeaturedLoading: featuredQuery.isLoading,
    error: resourcesQuery.error,
    
    // UI state
    filters,
    selectedResourceId,
    viewMode,
    sortBy,
    sortOrder,
    
    // Actions
    setSearchTerm,
    setTypes,
    setCategory,
    setFeaturedFilter,
    resetFilters,
    setSelectedResource: useCallback((id: string | null) => dispatch(setSelectedResource(id)), [dispatch]),
    setViewMode: useCallback((mode: 'grid' | 'list') => dispatch(setViewMode(mode)), [dispatch]),
    setSortBy: useCallback((by: 'date' | 'title' | 'type') => dispatch(setSortBy(by)), [dispatch]),
    setSortOrder: useCallback((order: 'asc' | 'desc') => dispatch(setSortOrder(order)), [dispatch]),
    
    // Queries
    getResource,
    getRelatedResources,
    refetch: resourcesQuery.refetch,
    
    // Mutations
    createResource,
    updateResource,
    deleteResource,
  };
}