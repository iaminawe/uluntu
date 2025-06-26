// Common types for the application

// Status types - Standardized to ContentStatus for all entities
export type ContentStatus = 'draft' | 'published' | 'archived' | 'pending';

// Base entity interface - Standardized to string IDs
export interface BaseEntity {
  id: string;
  status?: ContentStatus;
  featured?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Common social media links interface
export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  github?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  discord?: string;
  twitch?: string;
  steam?: string;
  medium?: string;
  behance?: string;
  dribbble?: string;
  vimeo?: string;
  producthunt?: string;
  [key: string]: string | undefined; // Allow additional social platforms
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