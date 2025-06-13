import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchResources,
  fetchResourceById,
  fetchFilteredResources,
  fetchGroupResources,
  createResource,
  updateResource,
  deleteResource,
  setFilters,
  clearFilters,
  selectAllResources,
  selectCurrentResource,
  selectFilteredResources,
  selectGroupResources,
  selectResourcesStatus,
  selectResourcesError,
  selectResourcesFilters,
  ResourceFilters
} from '@/features/resources/store/resourcesSlice';
import { ResourceInput } from '@/features/resources/api/resourcesApi';

/**
 * Custom hook for accessing and manipulating the resources collection
 * @returns Object containing resources data and actions
 */
export function useResourcesRedux() {
  const dispatch = useAppDispatch();
  const resources = useAppSelector(selectAllResources);
  const status = useAppSelector(selectResourcesStatus);
  const error = useAppSelector(selectResourcesError);
  
  // If we have resources, don't show loading even if status is loading
  const isLoading = status === 'loading' && resources.length === 0;
  const isSuccess = status === 'succeeded';
  const isError = status === 'failed';
  
  // Load resources 
  const loadResources = () => {
    dispatch(fetchResources());
  };

  return {
    resources,
    isLoading,
    isSuccess,
    isError,
    error,
    loadResources,
    createResource: (resource: ResourceInput) => dispatch(createResource(resource)),
    updateResource: (id: string, data: Partial<ResourceInput>) => dispatch(updateResource({ id, data })),
    deleteResource: (id: string) => dispatch(deleteResource(id)),
  };
}

/**
 * Custom hook for working with a single resource by ID
 * @param id The ID of the resource to fetch
 * @returns Object containing resource data and actions
 */
export function useResourceRedux(id?: string) {
  const dispatch = useAppDispatch();
  const resource = useAppSelector(selectCurrentResource);
  const status = useAppSelector(selectResourcesStatus);
  const error = useAppSelector(selectResourcesError);
  
  const isLoading = status === 'loading' && !resource;
  const isSuccess = status === 'succeeded';
  const isError = status === 'failed';

  // Load resource if we have an ID
  useEffect(() => {
    if (id) {
      dispatch(fetchResourceById(id));
    }
  }, [id, dispatch]);

  return {
    resource,
    isLoading,
    isSuccess,
    isError,
    error,
    refreshResource: id ? () => dispatch(fetchResourceById(id)) : () => {},
    updateResource: (data: Partial<ResourceInput>) => id ? dispatch(updateResource({ id, data })) : Promise.resolve(),
    deleteResource: id ? () => dispatch(deleteResource(id)) : () => Promise.resolve(),
  };
}

/**
 * Custom hook for working with filtered resources
 * @param initialFilters Optional initial filters to apply
 * @returns Object containing filtered resources data and filter actions
 */
export function useFilteredResourcesRedux(initialFilters?: ResourceFilters) {
  const dispatch = useAppDispatch();
  const resources = useAppSelector(selectFilteredResources);
  const currentFilters = useAppSelector(selectResourcesFilters);
  const status = useAppSelector(selectResourcesStatus);
  const error = useAppSelector(selectResourcesError);
  
  // If we have filtered resources, don't show loading even if status is loading
  const isLoading = status === 'loading' && resources.length === 0;
  const isSuccess = status === 'succeeded';
  const isError = status === 'failed';
  
  // Set initial filters if provided
  useEffect(() => {
    if (initialFilters) {
      dispatch(setFilters(initialFilters));
    }
  }, []);

  // Apply filters when they change
  useEffect(() => {
    dispatch(fetchFilteredResources(currentFilters));
  }, [dispatch, JSON.stringify(currentFilters)]);

  // Helper for updating just certain filters without affecting others
  const updateFilters = (newFilters: Partial<ResourceFilters>) => {
    dispatch(setFilters({ ...currentFilters, ...newFilters }));
  };

  // Pagination logic
  const getPaginatedResources = useMemo(() => {
    return (page: number, itemsPerPage: number) => {
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return resources.slice(startIndex, endIndex);
    };
  }, [resources]);

  return {
    resources,
    filters: currentFilters,
    isLoading,
    isSuccess,
    isError,
    error,
    updateFilters,
    setSearchTerm: (search?: string) => updateFilters({ search }),
    setTypes: (types?: string[]) => updateFilters({ types }),
    setTags: (tags?: string[]) => updateFilters({ tags }),
    clearAllFilters: () => dispatch(clearFilters()),
    getPaginatedResources,
    totalResources: resources.length
  };
}

/**
 * Custom hook for working with resources associated with a specific group
 * @param groupId The ID of the group
 * @returns Object containing group resources data and actions
 */
export function useGroupResourcesRedux(groupId?: string) {
  const dispatch = useAppDispatch();
  const resources = useAppSelector(selectGroupResources);
  const status = useAppSelector(selectResourcesStatus);
  const error = useAppSelector(selectResourcesError);
  
  const isLoading = status === 'loading' && resources.length === 0;
  const isSuccess = status === 'succeeded';
  const isError = status === 'failed';

  // Load group resources if we have a group ID
  useEffect(() => {
    if (groupId && status === 'idle') {
      dispatch(fetchGroupResources(groupId));
    }
  }, [groupId, status, dispatch]);

  return {
    resources,
    isLoading,
    isSuccess,
    isError,
    error,
    refreshGroupResources: groupId ? () => dispatch(fetchGroupResources(groupId)) : () => {},
  };
}
