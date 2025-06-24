// Re-export marketplace types from main types
export type { MarketplaceItem } from '@/types';
import type { ContentStatus } from '@/types/common';
export type { ContentStatus };

// Marketplace-specific interfaces
export interface MarketplaceFilters {
  search?: string;
  type?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  seller?: string;
  tags?: string[];
  location?: string;
  status?: ContentStatus;
}

export interface MarketplaceListingInput {
  title: string;
  description: string;
  price: number;
  type: string;
  condition: string;
  location?: string;
  images?: string[];
  tags?: string[];
  sellerId: string;
  status?: ContentStatus;
  featured?: boolean;
}