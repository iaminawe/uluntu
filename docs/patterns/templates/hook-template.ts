import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { [feature]Api } from '../api/[feature]Api';
import {
  // Selectors
  selectAll[Feature]Items,
  selectFiltered[Feature]Items,
  select[Feature]ItemById,
  select[Feature]Filters,
  select[Feature]Status,
  select[Feature]Error,
  select[Feature]Pagination,
  // Actions
  fetch[Feature]Items,
  fetch[Feature]ItemById,
  fetchFiltered[Feature]Items,
  create[Feature]Item,
  update[Feature]Item,
  delete[Feature]Item,
  setFilters,
  clearFilters,
  setCurrentItem,
  clearError,
  setPage,
  setPageSize
} from '../store/[feature]Slice';
import { [Feature]Input } from '../api/[feature]Api';
import { [Feature]Filters } from '../types';

/**
 * Custom hook for working with [feature] items collection
 * Primary hook for [feature] listing operations
 */
export function use[Feature]ItemsRedux() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectAll[Feature]Items);
  const status = useAppSelector(select[Feature]Status);
  const error = useAppSelector(select[Feature]Error);
  const { totalCount, currentPage, pageSize } = useAppSelector(select[Feature]Pagination);
  
  // Fetch items
  const fetchItems = useCallback(() => {
    return dispatch(fetch[Feature]Items());
  }, [dispatch]);
  
  // CRUD operations
  const createItem = useCallback((data: [Feature]Input) => {
    return dispatch(create[Feature]Item(data)).unwrap();
  }, [dispatch]);
  
  const updateItem = useCallback((id: string, data: Partial<[Feature]Input>) => {
    return dispatch(update[Feature]Item({ id, data })).unwrap();
  }, [dispatch]);
  
  const deleteItem = useCallback((id: string) => {
    return dispatch(delete[Feature]Item(id)).unwrap();
  }, [dispatch]);
  
  // Clear error
  const clearItemsError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);
  
  // Pagination
  const changePage = useCallback((page: number) => {
    dispatch(setPage(page));
    fetchItems();
  }, [dispatch, fetchItems]);
  
  const changePageSize = useCallback((size: number) => {
    dispatch(setPageSize(size));
    dispatch(setPage(1)); // Reset to first page
    fetchItems();
  }, [dispatch, fetchItems]);
  
  // Computed values
  const totalPages = useMemo(() => 
    Math.ceil(totalCount / pageSize), 
    [totalCount, pageSize]
  );
  
  const hasNextPage = useMemo(() => 
    currentPage < totalPages, 
    [currentPage, totalPages]
  );
  
  const hasPreviousPage = useMemo(() => 
    currentPage > 1, 
    [currentPage]
  );
  
  // Fetch on mount if needed
  useEffect(() => {
    if (status === 'idle') {
      console.log('[use[Feature]ItemsRedux] Fetching initial data');
      fetchItems();
    }
  }, [status, fetchItems]);
  
  return {
    // Data
    items,
    totalCount,
    
    // Status
    isLoading: status === 'loading',
    isError: status === 'failed',
    isSuccess: status === 'succeeded',
    error,
    
    // Actions
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    clearError: clearItemsError,
    
    // Pagination
    currentPage,
    pageSize,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    changePage,
    changePageSize
  };
}

/**
 * Custom hook for working with a single [feature] item by ID
 */
export function use[Feature]ItemByIdRedux(id: string | undefined) {
  const dispatch = useAppDispatch();
  const item = useAppSelector(select[Feature]ItemById);
  const status = useAppSelector(select[Feature]Status);
  const error = useAppSelector(select[Feature]Error);
  
  // Fetch item
  const fetchItem = useCallback(() => {
    if (id) {
      return dispatch(fetch[Feature]ItemById(id));
    }
  }, [dispatch, id]);
  
  // Update item
  const updateItem = useCallback((data: Partial<[Feature]Input>) => {
    if (id) {
      return dispatch(update[Feature]Item({ id, data })).unwrap();
    }
    throw new Error('Cannot update item without ID');
  }, [dispatch, id]);
  
  // Delete item
  const deleteItem = useCallback(() => {
    if (id) {
      return dispatch(delete[Feature]Item(id)).unwrap();
    }
    throw new Error('Cannot delete item without ID');
  }, [dispatch, id]);
  
  // Clear current item
  const clearCurrentItem = useCallback(() => {
    dispatch(setCurrentItem(null));
  }, [dispatch]);
  
  // Fetch on mount or ID change
  useEffect(() => {
    if (id && (!item || item.id !== id)) {
      console.log(`[use[Feature]ItemByIdRedux] Fetching item: ${id}`);
      fetchItem();
    }
  }, [id, item, fetchItem]);
  
  // Clear item on unmount
  useEffect(() => {
    return () => {
      console.log('[use[Feature]ItemByIdRedux] Clearing current item on unmount');
      clearCurrentItem();
    };
  }, [clearCurrentItem]);
  
  return {
    item,
    isLoading: status === 'loading',
    isError: status === 'failed',
    isSuccess: status === 'succeeded',
    error,
    fetchItem,
    updateItem,
    deleteItem,
    clearCurrentItem
  };
}

/**
 * Custom hook for working with filtered [feature] items
 */
export function useFiltered[Feature]ItemsRedux(initialFilters?: [Feature]Filters) {
  const dispatch = useAppDispatch();
  const filteredItems = useAppSelector(selectFiltered[Feature]Items);
  const currentFilters = useAppSelector(select[Feature]Filters);
  const status = useAppSelector(select[Feature]Status);
  const error = useAppSelector(select[Feature]Error);
  
  // Apply filters
  const applyFilters = useCallback((filters: [Feature]Filters) => {
    console.log('[useFiltered[Feature]ItemsRedux] Applying filters:', filters);
    dispatch(setFilters(filters));
    return dispatch(fetchFiltered[Feature]Items(filters));
  }, [dispatch]);
  
  // Update specific filter
  const updateFilter = useCallback((key: keyof [Feature]Filters, value: any) => {
    const newFilters = { ...currentFilters, [key]: value };
    return applyFilters(newFilters);
  }, [currentFilters, applyFilters]);
  
  // Reset filters
  const resetFilters = useCallback(() => {
    console.log('[useFiltered[Feature]ItemsRedux] Resetting filters');
    dispatch(clearFilters());
    return dispatch(fetchFiltered[Feature]Items({}));
  }, [dispatch]);
  
  // Toggle filter value (for multi-select filters)
  const toggleFilterValue = useCallback((key: keyof [Feature]Filters, value: any) => {
    const currentValue = currentFilters[key] as any[];
    const newValue = currentValue?.includes(value)
      ? currentValue.filter(v => v !== value)
      : [...(currentValue || []), value];
    
    return updateFilter(key, newValue);
  }, [currentFilters, updateFilter]);
  
  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.keys(currentFilters).some(key => {
      const value = currentFilters[key as keyof [Feature]Filters];
      return value !== undefined && value !== '' && value !== 'all';
    });
  }, [currentFilters]);
  
  // Apply initial filters on mount
  useEffect(() => {
    if (initialFilters && status === 'idle') {
      console.log('[useFiltered[Feature]ItemsRedux] Applying initial filters');
      applyFilters(initialFilters);
    }
  }, [initialFilters, status, applyFilters]);
  
  return {
    // Data
    filteredItems,
    filters: currentFilters,
    hasActiveFilters,
    
    // Status
    isLoading: status === 'loading',
    isError: status === 'failed',
    isSuccess: status === 'succeeded',
    error,
    
    // Actions
    applyFilters,
    updateFilter,
    toggleFilterValue,
    resetFilters
  };
}

/**
 * Custom hook for [feature] search functionality
 */
export function use[Feature]Search() {
  const dispatch = useAppDispatch();
  const { applyFilters, filters, filteredItems, isLoading } = useFiltered[Feature]ItemsRedux();
  
  // Perform search
  const search = useCallback((query: string) => {
    console.log('[use[Feature]Search] Searching for:', query);
    return applyFilters({ ...filters, search: query });
  }, [filters, applyFilters]);
  
  // Clear search
  const clearSearch = useCallback(() => {
    const { search, ...otherFilters } = filters;
    return applyFilters(otherFilters);
  }, [filters, applyFilters]);
  
  return {
    searchResults: filteredItems,
    searchQuery: filters.search || '',
    isSearching: isLoading,
    search,
    clearSearch
  };
}

/**
 * Custom hook for related [feature] items
 */
export function useRelated[Feature]ItemsRedux(itemId: string | undefined, limit: number = 3) {
  const dispatch = useAppDispatch();
  const [relatedItems, setRelatedItems] = useState<[Feature]Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch related items
  const fetchRelatedItems = useCallback(async () => {
    if (!itemId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // You could create a separate thunk for this or use the API directly
      const items = await [feature]Api.getRelated(itemId, limit);
      setRelatedItems(items);
    } catch (err) {
      console.error('[useRelated[Feature]ItemsRedux] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch related items');
    } finally {
      setIsLoading(false);
    }
  }, [itemId, limit]);
  
  // Fetch on mount or when dependencies change
  useEffect(() => {
    if (itemId) {
      fetchRelatedItems();
    }
  }, [itemId, fetchRelatedItems]);
  
  return {
    relatedItems,
    isLoading,
    error,
    fetchRelatedItems
  };
}