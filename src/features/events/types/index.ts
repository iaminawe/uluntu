// Re-export Event types from main types
export type { Event } from '@/types';
export type { ContentStatus } from '@/types/common';

// Event-specific interfaces
export interface EventInput {
  title: string;
  description: string;
  date: string;
  end_date?: string;
  location?: string;
  max_attendees?: number;
  organizer_id: string; // Required field
  url?: string;
  image?: string;
  status?: 'draft' | 'published' | 'archived' | 'pending';
}

export interface EventFilters {
  search?: string;
  location?: string;
  status?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}