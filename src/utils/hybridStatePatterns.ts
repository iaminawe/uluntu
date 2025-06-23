import { useCallback, useEffect, useRef } from 'react';
import { UseQueryResult, UseMutationResult } from '@tanstack/react-query';

/**
 * Common patterns and utilities for the hybrid Redux + React Query architecture
 */

/**
 * Sync React Query data with Redux for complex filtering/sorting
 * Use this when you need to perform complex client-side operations on server data
 */
export function useSyncQueryToRedux<T>(
  queryResult: UseQueryResult<T>,
  syncAction: (data: T) => void,
  dependencies: any[] = []
) {
  const previousDataRef = useRef<T>();
  
  useEffect(() => {
    if (queryResult.data && queryResult.data !== previousDataRef.current) {
      syncAction(queryResult.data);
      previousDataRef.current = queryResult.data;
    }
  }, [queryResult.data, syncAction, ...dependencies]);
}

/**
 * Combine multiple queries with loading states
 * Useful for components that need data from multiple sources
 */
export function useCombinedQueries(queries: UseQueryResult<any>[]) {
  const isLoading = queries.some(q => q.isLoading);
  const isError = queries.some(q => q.isError);
  const errors = queries.filter(q => q.error).map(q => q.error);
  const isSuccess = queries.every(q => q.isSuccess);
  
  return {
    isLoading,
    isError,
    errors,
    isSuccess,
    refetchAll: () => Promise.all(queries.map(q => q.refetch()))
  };
}

/**
 * Optimistic updates pattern for mutations
 * Updates UI immediately while mutation is in progress
 */
export function useOptimisticUpdate<TData, TVariables>(
  mutation: UseMutationResult<TData, Error, TVariables>,
  {
    onMutate,
    onSuccess,
    onError
  }: {
    onMutate?: (variables: TVariables) => void | Promise<void>;
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
  }
) {
  const mutateWithOptimism = useCallback(async (variables: TVariables) => {
    // Optimistically update UI
    if (onMutate) {
      await onMutate(variables);
    }
    
    try {
      const result = await mutation.mutateAsync(variables);
      if (onSuccess) {
        onSuccess(result, variables);
      }
      return result;
    } catch (error) {
      if (onError) {
        onError(error as Error, variables);
      }
      throw error;
    }
  }, [mutation, onMutate, onSuccess, onError]);
  
  return {
    ...mutation,
    mutateWithOptimism
  };
}

/**
 * Debounced filter updates
 * Prevents excessive API calls when filters change rapidly
 */
export function useDebouncedFilter<T extends Record<string, any>>(
  initialFilters: T,
  delay: number = 500
) {
  const [filters, setFilters] = useState(initialFilters);
  const [debouncedFilters, setDebouncedFilters] = useState(initialFilters);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setDebouncedFilters(filters);
    }, delay);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [filters, delay]);
  
  return {
    filters,
    debouncedFilters,
    setFilters,
    updateFilter: (key: keyof T, value: any) => {
      setFilters(prev => ({ ...prev, [key]: value }));
    },
    resetFilters: () => setFilters(initialFilters)
  };
}

/**
 * Pagination helper for hybrid state
 * Manages pagination state while fetching data with React Query
 */
export function usePaginationState(initialPage = 1, initialPageSize = 20) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  
  const goToPage = useCallback((newPage: number) => {
    setPage(Math.max(1, newPage));
  }, []);
  
  const nextPage = useCallback(() => {
    setPage(p => p + 1);
  }, []);
  
  const previousPage = useCallback(() => {
    setPage(p => Math.max(1, p - 1));
  }, []);
  
  const changePageSize = useCallback((newSize: number) => {
    setPageSize(newSize);
    setPage(1); // Reset to first page when page size changes
  }, []);
  
  return {
    page,
    pageSize,
    goToPage,
    nextPage,
    previousPage,
    changePageSize,
    offset: (page - 1) * pageSize,
    limit: pageSize
  };
}

/**
 * Selection state management pattern
 * Common pattern for managing multi-select UI state
 */
export function useSelectionState<T extends { id: string }>() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const toggle = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);
  
  const selectAll = useCallback((items: T[]) => {
    setSelectedIds(new Set(items.map(item => item.id)));
  }, []);
  
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);
  
  const isSelected = useCallback((id: string) => {
    return selectedIds.has(id);
  }, [selectedIds]);
  
  return {
    selectedIds: Array.from(selectedIds),
    selectedCount: selectedIds.size,
    hasSelection: selectedIds.size > 0,
    toggle,
    selectAll,
    clearSelection,
    isSelected
  };
}

/**
 * Upload progress tracking pattern
 * Manages file upload progress state
 */
export interface UploadProgress {
  id: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export function useUploadProgress() {
  const [uploads, setUploads] = useState<Map<string, UploadProgress>>(new Map());
  
  const addUpload = useCallback((id: string, fileName: string) => {
    setUploads(prev => {
      const next = new Map(prev);
      next.set(id, {
        id,
        fileName,
        progress: 0,
        status: 'pending'
      });
      return next;
    });
  }, []);
  
  const updateProgress = useCallback((id: string, progress: number) => {
    setUploads(prev => {
      const next = new Map(prev);
      const upload = next.get(id);
      if (upload) {
        next.set(id, {
          ...upload,
          progress,
          status: progress === 100 ? 'completed' : 'uploading'
        });
      }
      return next;
    });
  }, []);
  
  const setError = useCallback((id: string, error: string) => {
    setUploads(prev => {
      const next = new Map(prev);
      const upload = next.get(id);
      if (upload) {
        next.set(id, {
          ...upload,
          status: 'error',
          error
        });
      }
      return next;
    });
  }, []);
  
  const removeUpload = useCallback((id: string) => {
    setUploads(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);
  
  const clearCompleted = useCallback(() => {
    setUploads(prev => {
      const next = new Map(prev);
      Array.from(next.entries()).forEach(([id, upload]) => {
        if (upload.status === 'completed') {
          next.delete(id);
        }
      });
      return next;
    });
  }, []);
  
  return {
    uploads: Array.from(uploads.values()),
    activeUploads: Array.from(uploads.values()).filter(u => u.status === 'uploading'),
    addUpload,
    updateProgress,
    setError,
    removeUpload,
    clearCompleted
  };
}

// Add missing import
import { useState } from 'react';