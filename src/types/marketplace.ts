// Marketplace Types
import { ContentStatus } from './common';

// Basic marketplace listing types
export type ListingType = 'product' | 'service' | 'equipment' | 'event';
export type ListingCondition = 'new' | 'like-new' | 'good' | 'fair' | 'poor' | 'used';
export type ListingPriceRange = 'all' | 'under-50' | '50-100' | '100-250' | '250-500' | '500-plus';

// Marketplace filter options
export interface FilterOptions {
  search: string;
  type: ListingType | 'all';
  condition: ListingCondition | 'all';
  priceRange: ListingPriceRange;
  tags: string[];
}

// Contact method options
export type ContactMethod = 'email' | 'phone' | 'both';

// Base marketplace listing type used by MarketplaceList component
export interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  type: ListingType;
  price: number;
  condition?: ListingCondition;
  location?: string;
  tags: string[];
  images: string[];
  createdAt: string;
  seller: {
    id: string;
    name: string;
    image: string;
  };
  status?: ContentStatus;
  featured?: boolean;
  // Contact information fields
  contactEmail?: string;
  contactPhone?: string;
  contactMethod?: ContactMethod;
  showContactInfo?: boolean;
  like_count?: number;
  comment_count?: number;
}

// Mock data type matching Supabase schema
export interface MockMarketplaceListing {
  id: string;
  title: string;
  description: string;
  type: string;
  price: number | null;
  condition?: string;
  location?: string;
  tags: string[];
  status: ContentStatus;
  featured: boolean;
  seller_id?: string;
  seller?: { 
    id: string | number;
    name?: string;
    image?: string;
  };
  images?: string[];
  image?: string; // For backward compatibility with some mock data
  created_at?: string;
  updated_at?: string;
}

// Query options for marketplace API
export interface MarketplaceItemsQueryOptions {
  search?: string;
  seller_id?: string;
  types?: string[];
  condition?: string;
  featured?: boolean;
}
