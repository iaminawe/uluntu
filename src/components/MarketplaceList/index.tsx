import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

import ListingCard from './ListingCard';
import MarketplaceFilters from './MarketplaceFilters';
import { 
  Listing, 
  MarketplaceListProps, 
  FilterOptions, 
  SAMPLE_LISTINGS 
} from './types';
import { 
  filterListings, 
  sortListingsByDate 
} from './utils';

const MarketplaceList = ({ 
  initialType = 'all', 
  initialSearch = '', 
  sellerId 
}: MarketplaceListProps) => {
  // State for filters
  const [filters, setFilters] = useState<FilterOptions>({
    search: initialSearch,
    type: initialType,
    condition: 'all',
    priceRange: 'all',
    tags: []
  });
  
  // State for advanced filters visibility
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  
  // State for listings data
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtered listings based on current filters
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  
  // Fetch listings data (simulated)
  useEffect(() => {
    const fetchListings = async () => {
      try {
        // In a real app, this would be an API call
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Set listings from sample data
        setListings(SAMPLE_LISTINGS);
        setLoading(false);
      } catch (err) {
        setError('Failed to load marketplace listings. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchListings();
  }, []);
  
  // Apply filters when listings or filters change
  useEffect(() => {
    if (!listings.length) return;
    
    // Apply filters and sort by date
    const filtered = filterListings(listings, filters, sellerId);
    const sorted = sortListingsByDate(filtered);
    
    setFilteredListings(sorted);
  }, [listings, filters, sellerId]);
  
  // Render loading state
  if (loading) {
    return (
      <div>
        <MarketplaceFilters 
          filters={filters}
          setFilters={setFilters}
          advancedFiltersOpen={advancedFiltersOpen}
          setAdvancedFiltersOpen={setAdvancedFiltersOpen}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
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
  
  return (
    <div>
      {/* Filters */}
      <MarketplaceFilters 
        filters={filters}
        setFilters={setFilters}
        advancedFiltersOpen={advancedFiltersOpen}
        setAdvancedFiltersOpen={setAdvancedFiltersOpen}
      />
      
      {/* Results */}
      {filteredListings.length === 0 ? (
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
          <button
            onClick={() => setFilters({
              search: '',
              type: 'all',
              condition: 'all',
              priceRange: 'all',
              tags: []
            })}
            className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 
                     text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 
                     dark:hover:bg-slate-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
      
      {/* Results count */}
      {filteredListings.length > 0 && (
        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Showing {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'}
          {(filters.search || filters.type !== 'all' || filters.condition !== 'all' || filters.priceRange !== 'all') 
            ? ' matching your filters' 
            : ''}
        </div>
      )}
    </div>
  );
};

export default MarketplaceList;
