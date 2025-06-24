import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { marketplaceApi } from '../api/marketplaceApi';
import { 
  selectMarketplaceFilters,
  selectSelectedListingId,
  selectMarketplaceViewMode,
  selectMarketplaceSortBy,
  selectMarketplaceSortOrder,
  selectMarketplacePriceRange,
  selectExpandedListings,
  updateFilters,
  clearFilters,
  setSelectedListing,
  setViewMode,
  setSortBy,
  setSortOrder,
  setPriceRange,
  toggleListingExpanded,
} from '../store/marketplaceUISlice';
import { MarketplaceListing } from '../types/marketplace';
import { queryKeys } from '@/config/queryClient';

export function useMarketplaceHybrid() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  
  // UI state from Redux
  const filters = useAppSelector(selectMarketplaceFilters);
  const selectedListingId = useAppSelector(selectSelectedListingId);
  const viewMode = useAppSelector(selectMarketplaceViewMode);
  const sortBy = useAppSelector(selectMarketplaceSortBy);
  const sortOrder = useAppSelector(selectMarketplaceSortOrder);
  const priceRange = useAppSelector(selectMarketplacePriceRange);
  const expandedListings = useAppSelector(selectExpandedListings);
  
  // React Query for server state
  const listingsQuery = useQuery({
    queryKey: queryKeys.marketplaceWithFilters(filters),
    queryFn: () => marketplaceApi.getAll(filters as any),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const featuredQuery = useQuery({
    queryKey: ['marketplace', 'featured'],
    queryFn: () => marketplaceApi.getAll({ featured: true } as any),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
  
  // Get single listing
  const getListing = (id: string) => {
    return useQuery({
      queryKey: queryKeys.marketplaceItem(id),
      queryFn: () => marketplaceApi.getById(id),
      enabled: !!id,
    });
  };
  
  // Get listings by seller
  const getListingsBySeller = (sellerId: string) => {
    return useQuery({
      queryKey: ['marketplace', 'seller', sellerId],
      queryFn: () => marketplaceApi.getAll({ sellerId: sellerId } as any),
      enabled: !!sellerId,
    });
  };
  
  // Get related listings
  const getRelatedListings = (id: string, limit = 3) => {
    return useQuery({
      queryKey: ['marketplace', 'related', id],
      queryFn: async () => {
        // Get the current listing first
        const currentListing = await marketplaceApi.getById(id);
        if (!currentListing) return [];
        
        // Get all listings and filter similar ones
        const allListings = await marketplaceApi.getAll({} as any);
        
        return allListings
          .filter((listing: any) => listing.id !== id) // Exclude current listing
          .filter((listing: any) => 
            listing.type === currentListing.type || // Same type
            (listing as any).category === (currentListing as any).category // Same category
          )
          .slice(0, limit);
      },
      enabled: !!id,
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  };
  
  // Mutations
  const createListing = useMutation({
    mutationFn: (data: Partial<MarketplaceListing>) => marketplaceApi.create(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.marketplace });
    },
  });
  
  const updateListing = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MarketplaceListing> }) => 
      marketplaceApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.marketplace });
      queryClient.invalidateQueries({ queryKey: queryKeys.marketplaceItem(id) });
    },
  });
  
  const deleteListing = useMutation({
    mutationFn: (id: string) => marketplaceApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.marketplace });
    },
  });
  
  // UI actions
  const setSearchTerm = (search?: string) => {
    dispatch(updateFilters({ search }));
  };
  
  const setTypeFilter = (type?: string[]) => {
    dispatch(updateFilters({ type }));
  };
  
  const setConditionFilter = (condition?: string[]) => {
    dispatch(updateFilters({ condition }));
  };
  
  const setLocationFilter = (location?: string[]) => {
    dispatch(updateFilters({ location }));
  };
  
  const setSellerFilter = (seller_id?: string) => {
    dispatch(updateFilters({ seller_id }));
  };
  
  const updatePriceRange = (range: [number, number]) => {
    dispatch(setPriceRange(range));
  };
  
  const resetFilters = () => {
    dispatch(clearFilters());
  };
  
  // Sort listings
  const sortedListings = [...(listingsQuery.data || [])].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date((a as any).createdAt || a.datePosted || '').getTime() - 
                    new Date((b as any).createdAt || b.datePosted || '').getTime();
        break;
      case 'price':
        comparison = (a.price || 0) - (b.price || 0);
        break;
      case 'title':
        comparison = (a.title || '').localeCompare(b.title || '');
        break;
      case 'condition':
        comparison = ((a as any).condition || '').localeCompare((b as any).condition || '');
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  
  return {
    // Data
    listings: sortedListings,
    featuredListings: featuredQuery.data || [],
    isLoading: listingsQuery.isLoading,
    isFeaturedLoading: featuredQuery.isLoading,
    error: listingsQuery.error,
    
    // UI state
    filters,
    selectedListingId,
    viewMode,
    sortBy,
    sortOrder,
    priceRange,
    expandedListings,
    
    // Actions
    setSearchTerm,
    setTypeFilter,
    setConditionFilter,
    setLocationFilter,
    setSellerFilter,
    updatePriceRange,
    resetFilters,
    setSelectedListing: (id: string | null) => dispatch(setSelectedListing(id)),
    setViewMode: (mode: 'grid' | 'list') => dispatch(setViewMode(mode)),
    setSortBy: (by: 'date' | 'price' | 'title' | 'condition') => dispatch(setSortBy(by)),
    setSortOrder: (order: 'asc' | 'desc') => dispatch(setSortOrder(order)),
    toggleListingExpanded: (id: string) => dispatch(toggleListingExpanded(id)),
    
    // Queries
    getListing,
    getListingsBySeller,
    getRelatedListings,
    refetch: listingsQuery.refetch,
    
    // Mutations
    createListing,
    updateListing,
    deleteListing,
  };
}