// Central export point for shared API utilities
export { supabase, handleSupabaseError, adaptItemsList } from './client';
export type { ApiResponse, ApiError, PaginationParams, FilterParams } from './types';
export { withAuth, withErrorHandling, withRetry } from './middleware';
export { API_CONFIG } from './config';