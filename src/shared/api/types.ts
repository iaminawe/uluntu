// Common API types used across features

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  status: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface FilterParams {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BatchOperation<T> {
  ids: string[];
  operation: 'update' | 'delete';
  data?: Partial<T>;
}

export interface ApiMetadata {
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
  hasMore?: boolean;
}