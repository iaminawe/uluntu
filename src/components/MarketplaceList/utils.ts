import React from 'react';
import { ShoppingBag, Briefcase, Monitor } from 'lucide-react';
import { ListingType, ListingCondition, FilterOptions, MarketplaceListing } from '../../types/marketplace';

// Get icon for listing type
export const getTypeIcon = (type: ListingType): React.ReactNode => {
  switch (type) {
    case 'product':
      return React.createElement(ShoppingBag, { className: "h-4 w-4" });
    case 'service':
      return React.createElement(Briefcase, { className: "h-4 w-4" });
    case 'equipment':
      return React.createElement(Monitor, { className: "h-4 w-4" });
    default:
      return React.createElement(ShoppingBag, { className: "h-4 w-4" });
  }
};

// Get display name for listing type
export const getTypeDisplayName = (type: ListingType): string => {
  switch (type) {
    case 'product':
      return 'Product';
    case 'service':
      return 'Service';
    case 'equipment':
      return 'Equipment';
    default: {
      // This is a type guard to ensure we handle the case properly
      // In reality, this should never happen as we've covered all ListingType values
      const unknownType = type as string;
      return unknownType.charAt(0).toUpperCase() + unknownType.slice(1);
    }
  }
};

// Get display name for listing condition
export const getConditionDisplayName = (condition: ListingCondition): string => {
  switch (condition) {
    case 'new':
      return 'New';
    case 'like-new':
      return 'Like New';
    case 'good':
      return 'Good';
    case 'fair':
      return 'Fair';
    case 'poor':
      return 'Poor';
    default: {
      // This is a type guard to ensure we handle the case properly
      // In reality, this should never happen as we've covered all ListingCondition values
      const unknownCondition = condition as string;
      return unknownCondition.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  }
};

// Filter listings based on filter options
export const filterListings = (
  listings: MarketplaceListing[],
  filters: FilterOptions,
  sellerId?: string
): MarketplaceListing[] => {
  return listings.filter(listing => {
    // Filter by seller if specified
    if (sellerId && listing.seller?.id !== sellerId) {
      return false;
    }
    
    // Filter by search term
    if (filters.search && !matchesSearch(listing, filters.search)) {
      return false;
    }
    
    // Filter by type
    if (filters.type !== 'all' && listing.type !== filters.type) {
      return false;
    }
    
    // Filter by condition
    if (filters.condition !== 'all' && listing.condition !== filters.condition) {
      return false;
    }
    
    // Filter by price range
    if (filters.priceRange !== 'all' && listing.price !== null && !matchesPriceRange(listing.price, filters.priceRange)) {
      return false;
    }
    
    // Filter by tags
    if (filters.tags.length > 0 && listing.tags && !hasAnyTag(listing.tags, filters.tags)) {
      return false;
    }
    
    return true;
  });
};

// Sort listings by date (newest first)
export const sortListingsByDate = (listings: MarketplaceListing[]): MarketplaceListing[] => {
  return [...listings].sort((a, b) => {
    return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
  });
};

// Helper function to check if listing matches search term
const matchesSearch = (listing: MarketplaceListing, search: string): boolean => {
  const searchLower = search.toLowerCase();
  return (
    (listing.title || '').toLowerCase().includes(searchLower) ||
    (listing.description || '').toLowerCase().includes(searchLower) ||
    (listing.location || '').toLowerCase().includes(searchLower) ||
    (Array.isArray(listing.tags) ? listing.tags : []).some((tag: string) => tag.toLowerCase().includes(searchLower))
  );
};

// Helper function to check if price matches price range
const matchesPriceRange = (price: number, range: string): boolean => {
  switch (range) {
    case 'any':
      return true;
    case 'under-50':
      return price < 50;
    case '50-100':
      return price >= 50 && price <= 100;
    case '100-500':
      return price > 100 && price <= 500;
    case '500-2000':
      return price > 500 && price <= 2000;
    case 'over-2000':
      return price > 2000;
    default:
      return true;
  }
};

// Helper function to check if listing has any of the specified tags
const hasAnyTag = (listingTags: string[], filterTags: string[]): boolean => {
  return filterTags.some(tag => listingTags.includes(tag));
};

// Format price display with appropriate unit
export const formatPrice = (price: number, type: ListingType): string => {
  return `$${price}${type === 'service' ? '/hr' : ''}`;
};
