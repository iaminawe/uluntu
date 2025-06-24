// Common types for the opportunities feature
// Note: Use global ContentStatus for consistency across the application
import type { ContentStatus } from '@/types/common';

// Re-export for feature consumption
export type { ContentStatus };

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface APIResponse<T> {
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface FilterParams {
  search?: string;
  status?: ContentStatus;
  limit?: number;
  offset?: number;
}