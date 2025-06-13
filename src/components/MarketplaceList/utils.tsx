import { 
  Listing, 
  ListingType, 
  ListingCondition,
  ListingPriceRange,
  FilterOptions 
} from '@/features/marketplace/components/MarketplaceList/types';
import { Package, Briefcase, Monitor } from 'lucide-react';

// Get appropriate icon for listing type
export const getTypeIcon = (type: ListingType) => {
  switch (type) {
    case 'product':
      return <Package className="h-5 w-5" />;
    case 'service':
      return <Briefcase className="h-5 w-5" />;
    case 'equipment':
      return <Monitor className="h-5 w-5" />;
  }
};

// Get a friendly display name for listing type
export const getTypeDisplayName = (type: ListingType): string => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};

// Get a friendly display name for listing condition
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
    default:
      return condition;
  }
};

// Format price display with appropriate unit
export const formatPrice = (price: number, type: ListingType): string => {
  return `$${price}${type === 'service' ? '/hr' : ''}`;
};

// Format date to a readable format
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};

// Check if a listing is within a price range
export const isInPriceRange = (price: number, range: ListingPriceRange): boolean => {
  switch (range) {
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
    case 'any':
    default:
      return true;
  }
};

// Filter listings based on filter options
export const filterListings = (
  listings: Listing[],
  filters: FilterOptions,
  sellerId?: number
): Listing[] => {
  return listings.filter(listing => {
    // Filter by seller if specified
    if (sellerId && listing.seller.id !== sellerId) {
      return false;
    }
    
    // Filter by search term
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const titleMatches = listing.title.toLowerCase().includes(searchLower);
      const descriptionMatches = listing.description.toLowerCase().includes(searchLower);
      const tagsMatch = listing.tags.some(tag => tag.toLowerCase().includes(searchLower));
      
      if (!titleMatches && !descriptionMatches && !tagsMatch) {
        return false;
      }
    }
    
    // Filter by type
    if (filters.type !== 'all' && listing.type !== filters.type) {
      return false;
    }
    
    // Filter by condition
    if (filters.condition !== 'all') {
      if (!listing.condition) return false;
      if (listing.condition !== filters.condition) return false;
    }
    
    // Filter by price range
    if (filters.priceRange !== 'all' && !isInPriceRange(listing.price, filters.priceRange)) {
      return false;
    }
    
    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag => 
        listing.tags.some(listingTag => 
          listingTag.toLowerCase().includes(tag.toLowerCase())
        )
      );
      
      if (!hasMatchingTag) {
        return false;
      }
    }
    
    return true;
  });
};

// Sort listings by date (newest first)
export const sortListingsByDate = (listings: Listing[]): Listing[] => {
  return [...listings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};
