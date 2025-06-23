import { useState, useEffect, useMemo, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';

import ListingCard from './ListingCard';
import Pagination from '@/components/Pagination';
import { MarketplaceListProps } from './types';
import { useMarketplaceItemsWithFilters } from '../../hooks/useMarketplaceQueries';
import { useMarketplaceHybrid } from '../../hooks/useMarketplaceHybrid';
import { MarketplaceListing } from '../../types/marketplace';
import { useMarketplaceNavigation } from '../../hooks/useMarketplaceNavigation';

const LISTINGS_PER_PAGE = 9;

const MarketplaceList = ({ 
  initialType = 'all', 
  initialSearch = '', 
  sellerId,
  listings: parentListings,
  loading: parentLoading,
  error: parentError,
  searchTerm,
  selectedType,
  selectedCondition
}: MarketplaceListProps) => {
  const { navigateToListing } = useMarketplaceNavigation();
  const [currentPage, setCurrentPage] = useState(1);
  
  const useParentData = parentListings !== undefined;
  
  // Use hybrid hook for marketplace data only if no parent data
  const { listings, isLoading, error } = useMarketplaceHybrid();
  
  // Use parent data if provided, otherwise use hybrid hook data
  const finalListings = useParentData ? parentListings : listings;
  const finalLoading = useParentData ? parentLoading : isLoading;
  const finalError = useParentData ? parentError : error;
  
  // Filter listings based on props
  const filteredListings = useMemo(() => {
    return finalListings.filter((listing) => {
      // Type filter - use MarketplacePage props if available, otherwise initialType
      const typeFilter = selectedType || initialType;
      if (typeFilter !== 'all' && listing.type !== typeFilter) return false;
      
      // Search filter - use MarketplacePage props if available, otherwise initialSearch
      const searchFilter = searchTerm || initialSearch;
      if (searchFilter) {
        const searchLower = searchFilter.toLowerCase();
        const matchesSearch = 
          listing.title?.toLowerCase().includes(searchLower) ||
          listing.description?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      // Condition filter (if provided)
      if (selectedCondition && selectedCondition !== 'all' && listing.condition !== selectedCondition) return false;
      
      // Seller filter
      if (sellerId && listing.seller_id !== sellerId) return false;
      
      return true;
    });
  }, [finalListings, selectedType, initialType, searchTerm, initialSearch, selectedCondition, sellerId]);
  
  // Raw listings are already filtered by the hybrid hook
  
  // Log the raw listings for debugging

  // Convert database listings to the format expected by ListingCard
  const formattedListings = useMemo(() => {
    // Safely handle potentially missing data
    if (!filteredListings || !Array.isArray(filteredListings) || filteredListings.length === 0) {
      return [];
    }
    
    interface RawListing {
      id?: string | number;
      title?: string;
      description?: string;
      type?: string;
      price?: number | null;
      condition?: string | null;
      images?: string[];
      image?: string;
      createdAt?: string;
      created_at?: string;
      seller?: { id: string; name: string; image?: string };
      seller_id?: string | number;
      location?: string;
      tags?: string[] | string;
      status?: string;
      featured?: boolean;
    }
    
    const formatted = filteredListings.map((item: RawListing) => {
      // Make sure we have an item to work with
      if (!item || typeof item !== 'object') {
        return null;
      }
      
      
      const listing = {
        id: String(item.id || ''),
        title: String(item.title || ''),
        description: String(item.description || ''),
        type: String(item.type || 'product'),
        price: typeof item.price === 'number' ? item.price : null,
        condition: item.condition || null,
        // Handle images in various formats
        images: Array.isArray(item.images) ? item.images : 
                (item.image ? [item.image] : []),
        // Convert created_at to createdAt format
        createdAt: item.createdAt || item.created_at || new Date().toISOString(),
        // Create a seller object from seller_id
        seller: item.seller || { 
          id: String(item.seller_id || '0'),
          name: 'Seller',
          image: '/placeholder-avatar.png'
        },
        location: String(item.location || ''),
        // Ensure tags are in array format
        tags: Array.isArray(item.tags) ? item.tags : 
              (typeof item.tags === 'string' ? [item.tags] : []),
        status: String(item.status || 'published'),
        featured: Boolean(item.featured)
      } as MarketplaceListing;
      
      return listing;
    }).filter(Boolean) as MarketplaceListing[]; // Remove any null items
    
    return formatted;
  }, [filteredListings]);
  
  // Calculate pagination values
  const itemsPerPage = LISTINGS_PER_PAGE;
  const totalPages = Math.max(1, Math.ceil(formattedListings.length / itemsPerPage));
  
  // Get current page listings
  const currentListingsToDisplay = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return formattedListings.slice(startIndex, startIndex + itemsPerPage);
  }, [formattedListings, currentPage, itemsPerPage]);
  
  // Handler for pagination
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  // Handler for custom card click navigation
  const handleCardClick = useCallback((listing: MarketplaceListing) => {
    // Navigate to the listing detail page with analytics tracking
    navigateToListing(listing, 'marketplace_list', 'click');
  }, [navigateToListing]);
  
  // Render loading skeleton
  if (finalLoading) {
    return (
      <div className="animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(LISTINGS_PER_PAGE).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-slate-200 dark:bg-slate-700"></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-2">
                    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                  </div>
                  <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <div className="h-6 w-6 bg-slate-200 dark:bg-slate-700 rounded-full mr-2"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                  </div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Render error state
  if (finalError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 
                    rounded-lg p-6 text-center">
        <AlertTriangle className="h-10 w-10 text-red-500 dark:text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">Error Loading Listings</h3>
        <p className="text-red-600 dark:text-red-400">{finalError?.message || 'Failed to load marketplace listings'}</p>
      </div>
    );
  }
  
  // Render empty state if no listings
  if (!formattedListings.length) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full 
                      flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No listings found</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-4">
          Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }
  
  // Log the first item to help with debugging
  
  // Render listings
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentListingsToDisplay.map(listing => (
          <ListingCard 
            key={listing.id} 
            listing={listing}
            onClick={handleCardClick}
          />
        ))}
      </div>
      
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
      
      {formattedListings.length > 0 && (
        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Showing {currentListingsToDisplay.length} of {formattedListings.length} {formattedListings.length === 1 ? 'listing' : 'listings'}
        </div>
      )}
    </div>
  );
};

export default MarketplaceList;
