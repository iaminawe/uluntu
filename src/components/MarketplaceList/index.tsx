import { useState, useEffect, useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';

import ListingCard from '@/features/marketplace/components/MarketplaceList/ListingCard';
import Pagination from '@/components/Pagination';
import { MarketplaceListProps } from '@/features/marketplace/components/MarketplaceList/types';
import { useMarketplaceItemsWithFilters } from '@/hooks/useMarketplaceQueries';
import { useFilteredMarketplaceListingsRedux } from '@/features/marketplace/hooks/useMarketplaceRedux';
import { MarketplaceListing } from '../../types/marketplace';

const LISTINGS_PER_PAGE = 9;

const MarketplaceList = ({ 
  initialType = 'all', 
  initialSearch = '', 
  sellerId,
  useRedux = false
}: MarketplaceListProps & { useRedux?: boolean }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Query options for API
  const queryOptions = useMemo(() => ({
    types: initialType !== 'all' ? [initialType] : undefined,
    search: initialSearch || undefined,
    seller_id: sellerId || undefined
  }), [initialType, initialSearch, sellerId]);
  
  // Get data from either Redux or direct API
  const { 
    filteredListings: reduxListings = [],
    updateFilters: updateReduxFilters,
    isLoading: reduxIsLoading,
    isError: reduxIsError,
    error: reduxError
  } = useFilteredMarketplaceListingsRedux();
  
  const { 
    data = [], 
    isLoading: queryIsLoading, 
    error: queryError 
  } = useMarketplaceItemsWithFilters(queryOptions);
  
  // Update Redux filters when component mounts or filters change
  useEffect(() => {
    if (useRedux) {
      updateReduxFilters(queryOptions);
    }
  }, [useRedux, queryOptions, updateReduxFilters]);
  
  // Update loading and error states
  useEffect(() => {
    setLoading(useRedux ? reduxIsLoading : queryIsLoading);
    
    if (useRedux && reduxIsError) {
      setError(reduxError ? String(reduxError) : 'Failed to load marketplace listings');
    } else if (!useRedux && queryError) {
      setError('Failed to load marketplace listings. Please try again later.');
    } else {
      setError(null);
    }
  }, [useRedux, reduxIsLoading, reduxIsError, reduxError, queryIsLoading, queryError]);
  
  // Get the raw database listings
  const rawListings = useRedux ? reduxListings : data;
  
  // Log the raw listings for debugging

  // Convert database listings to the format expected by ListingCard
  const formattedListings = useMemo(() => {
    // Safely handle potentially missing data
    if (!rawListings || !Array.isArray(rawListings) || rawListings.length === 0) {
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
    
    const formatted = rawListings.map((item: RawListing) => {
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
  }, [rawListings]);
  
  // Calculate pagination values
  const itemsPerPage = LISTINGS_PER_PAGE;
  const totalPages = Math.max(1, Math.ceil(formattedListings.length / itemsPerPage));
  
  // Get current page listings
  const currentListingsToDisplay = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return formattedListings.slice(startIndex, startIndex + itemsPerPage);
  }, [formattedListings, currentPage, itemsPerPage]);
  
  // Handler for pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Render loading skeleton
  if (loading) {
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
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 
                    rounded-lg p-6 text-center">
        <AlertTriangle className="h-10 w-10 text-red-500 dark:text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">Error Loading Listings</h3>
        <p className="text-red-600 dark:text-red-400">{error}</p>
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
