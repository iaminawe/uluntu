import { useState, useEffect, useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';

import ListingCard from './ListingCard';
import Pagination from '../Pagination'; // Import Pagination
import {
  MarketplaceListProps,
  FilterOptions
} from './types';
import {
  filterListings,
  sortListingsByDate
} from './utils';
import { useMarketplaceItemsWithFilters } from '../../hooks/useQueries';
import { useFilteredMarketplaceListingsRedux } from '../../hooks/useMarketplaceRedux';
import { MarketplaceListing, ListingType, ListingCondition } from '../../types/marketplace';

const LISTINGS_PER_PAGE = 9;

const MarketplaceList = ({ 
  initialType = 'all', 
  initialSearch = '', 
  sellerId,
  useRedux = false
}: MarketplaceListProps & { useRedux?: boolean }) => {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredListings, setFilteredListings] = useState<MarketplaceListing[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Construct filters object based on props for useMarketplaceItemsWithFilters and local filtering
  // This `filters` object definition is moved up to be accessible by the dependency array of useEffect for resetting currentPage
  const filters: FilterOptions = useMemo(() => ({
    search: initialSearch,
    type: initialType,
    condition: 'all', // Assuming 'all' is default and ActionBar would update these if implemented for MarketplaceList
    priceRange: 'all', // Assuming 'all' is default
    tags: [] // Assuming empty is default
  }), [initialSearch, initialType]);
  
  // Redux implementation
  const { 
    filteredListings: reduxListings,
    updateFilters: updateReduxFilters,
    isLoading: reduxIsLoading,
    isError: reduxIsError,
    error: reduxError
  } = useFilteredMarketplaceListingsRedux();
  
  // Traditional React Query implementation
  const { 
    data, 
    isLoading: queryIsLoading, 
    error: queryError 
  } = useMarketplaceItemsWithFilters({
    types: filters.type !== 'all' ? [filters.type] : undefined, // Use 'types' array instead of 'type' to match MarketplaceItemsQueryOptions
    search: filters.search || undefined,
    seller_id: sellerId || undefined // Use seller_id to match MarketplaceItemsQueryOptions
  });
  
  // Update Redux filters when component filters change (if using Redux)
  useEffect(() => {
    if (useRedux) {
      updateReduxFilters({
        search: filters.search || undefined,
        types: filters.type !== 'all' ? [filters.type] : undefined,
        seller_id: sellerId || undefined
      });
    }
  }, [useRedux, filters, sellerId, updateReduxFilters]);
  
  // Choose which loading and error states to use
  const isLoading = useRedux ? reduxIsLoading : queryIsLoading;
  const queryErrorMessage = queryError ? 'Failed to load marketplace listings. Please try again later.' : null;
  const reduxErrorMessage = reduxError ? String(reduxError) : (reduxIsError ? 'Failed to load marketplace listings' : null);
  
  useEffect(() => {
    if (isLoading) {
      setLoading(true);
    } else if (useRedux ? reduxErrorMessage : queryErrorMessage) {
      setError(useRedux ? reduxErrorMessage : queryErrorMessage);
      setLoading(false);
    } else if (useRedux ? reduxListings : data) {
      // Choose which data source to use
      const sourceData = useRedux ? reduxListings : data;
      
      // Convert from API MarketplaceListing to local MarketplaceListing format if needed
      const formattedListings = sourceData.map(item => ({
        id: String(item.id),
        title: item.title || '',
        description: item.description || '',
        type: (item.type as ListingType) || 'product',
        price: typeof item.price === 'number' ? item.price : 0,
        condition: item.condition as ListingCondition,
        location: item.location || '',
        tags: Array.isArray(item.tags) ? item.tags : [],
        images: Array.isArray(item.images) ? item.images : [],
        createdAt: item.createdAt || new Date().toISOString(),
        seller: {
          id: String(item.seller?.id || '0'),
          name: 'Seller', // You may need to fetch seller info separately
          image: '/placeholder-avatar.png'
        },
        status: item.status,
        featured: item.featured
      }));
      
      setListings(formattedListings);
      setLoading(false);
    }
  }, [data, isLoading, queryError]);
  
  useEffect(() => {
    if (!listings) return; // Guard against listings being undefined initially
    
    const localFiltered = filterListings(listings, filters, sellerId);
    const sorted = sortListingsByDate(localFiltered);
    
    setFilteredListings(sorted);
    setCurrentPage(1); // Reset page when underlying filtered data changes
  }, [listings, filters, sellerId]); // filters object is now stable unless props change

  // Pagination logic
  const totalListings = filteredListings.length;
  const totalPages = Math.ceil(totalListings / LISTINGS_PER_PAGE);
  const startIndex = (currentPage - 1) * LISTINGS_PER_PAGE;
  const endIndex = startIndex + LISTINGS_PER_PAGE;
  const currentListingsToDisplay = filteredListings.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  if (loading) {
    return (
      <div>
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
  
  return (
    <div>
      {currentListingsToDisplay.length === 0 && !loading ? (
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
          {/* Removed redundant message as ActionBar is on MarketplacePage not here */}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentListingsToDisplay.map(listing => (
            <ListingCard 
              key={listing.id} 
              listing={listing} 
            />
          ))}
        </div>
      )}
      
      {totalPages > 1 && (
         <Pagination
           currentPage={currentPage}
           totalPages={totalPages}
           onPageChange={handlePageChange}
         />
      )}
      
      {filteredListings.length > 0 && !loading && (
        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Showing {currentListingsToDisplay.length} of {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'}
          {(filters.search || filters.type !== 'all' || filters.condition !== 'all' || filters.priceRange !== 'all') 
            ? ' matching your filters' 
            : ''}
        </div>
      )}
    </div>
  );
};

export default MarketplaceList;
