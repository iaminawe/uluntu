import { UseQueryResult, UseMutationResult } from '@tanstack/react-query';

/**
 * Creates a mock UseQueryResult with all required properties
 * @param overrides - Partial overrides for the query result
 * @returns Complete UseQueryResult mock
 */
export function createMockQueryResult<TData = any, TError = any>(
  overrides: Partial<UseQueryResult<TData, TError>> = {}
): UseQueryResult<TData, TError> {
  const defaults: UseQueryResult<TData, TError> = {
    data: undefined,
    error: null,
    isError: false,
    isLoading: false,
    isSuccess: true,
    isPending: false,
    isLoadingError: false,
    isRefetchError: false,
    isRefetching: false,
    isFetching: false,
    isFetched: true,
    isFetchedAfterMount: true,
    isPlaceholderData: false,
    isPreviousData: false,
    isStale: false,
    dataUpdatedAt: Date.now(),
    errorUpdatedAt: 0,
    failureCount: 0,
    failureReason: null,
    errorUpdateCount: 0,
    refetch: jest.fn().mockResolvedValue({ data: undefined } as any),
    remove: jest.fn(),
    fetchStatus: 'idle' as const,
    status: 'success' as const,
  };

  // Merge defaults with overrides
  const result = { ...defaults, ...overrides };

  // Update derived states based on data/error/loading
  if (result.isLoading) {
    result.isPending = true;
    result.status = 'pending';
    result.fetchStatus = 'fetching';
    result.isSuccess = false;
    result.isFetched = false;
  }

  if (result.error) {
    result.isError = true;
    result.isSuccess = false;
    result.status = 'error';
  }

  if (result.data !== undefined) {
    result.isSuccess = true;
    result.status = 'success';
  }

  return result;
}

/**
 * Creates a mock UseMutationResult with all required properties
 * @param overrides - Partial overrides for the mutation result
 * @returns Complete UseMutationResult mock
 */
export function createMockMutationResult<TData = any, TError = any, TVariables = any, TContext = any>(
  overrides: Partial<UseMutationResult<TData, TError, TVariables, TContext>> = {}
): UseMutationResult<TData, TError, TVariables, TContext> {
  const defaults: UseMutationResult<TData, TError, TVariables, TContext> = {
    data: undefined,
    error: null,
    isError: false,
    isIdle: true,
    isPending: false,
    isSuccess: false,
    failureCount: 0,
    failureReason: null,
    isPaused: false,
    reset: jest.fn(),
    status: 'idle' as const,
    variables: undefined,
    submittedAt: 0,
    mutate: jest.fn(),
    mutateAsync: jest.fn().mockResolvedValue(undefined),
  };

  return { ...defaults, ...overrides };
}

/**
 * Helper to create a loading query result
 */
export function createLoadingQueryResult<TData = any>(): UseQueryResult<TData, any> {
  return createMockQueryResult<TData>({
    isLoading: true,
    data: undefined,
  });
}

/**
 * Helper to create an error query result
 */
export function createErrorQueryResult<TData = any>(error: any): UseQueryResult<TData, any> {
  return createMockQueryResult<TData>({
    error,
    isError: true,
    data: undefined,
  });
}

/**
 * Helper to create a successful query result with data
 */
export function createSuccessQueryResult<TData = any>(data: TData): UseQueryResult<TData, any> {
  return createMockQueryResult<TData>({
    data,
    isSuccess: true,
  });
}