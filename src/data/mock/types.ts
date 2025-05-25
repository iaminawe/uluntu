// Common type definitions for mock data
import type { EntityStatus as AppEntityStatus } from '../../types';

// Base types that can be used across mock data files
export interface BaseEntity {
  id: string | number;
  status?: AppEntityStatus | string;
  featured?: boolean | null;
  created_at?: string | null;
}

// Common social media links interface
export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  github?: string;
  website?: string;
}

// Common location interface
export interface Location {
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  latitude?: number | null;
  longitude?: number | null;
}

// Common date range interface
export interface DateRange {
  startDate: string;
  endDate?: string | null;
}
