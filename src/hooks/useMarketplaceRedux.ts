import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import {
  selectAllMarketplaceListings,
  selectMarketplaceListingById,
  selectFilteredMarketplaceListings,
  selectRelatedMarketplaceListings,
  selectSellerMarketplaceListings,
  selectMarketplaceFilters,
  selectMarketplaceStatus,
  selectMarketplaceError,
  fetchMarketplaceListings,
  fetchMarketplaceListingById,
  fetchFilteredMarketplaceListings,
  fetchRelatedMarketplaceListings,
  fetchSellerMarketplaceListings,
  createMarketplaceListing,
  updateMarketplaceListing,
  deleteMarketplaceListing,
  setFilters,
  clearFilters
} from '../redux/slices/marketplaceSlice';
import { MarketplaceItemsQueryOptions } from '../types/marketplace';
import { MarketplaceItemInput } from '../api/marketplaceApi';

/**
 * Custom hook for working with marketplace listings in Redux store
 * Primary hook for marketplace listing collection operations
 */
export function useMarketplaceListingsRedux() {
  const dispatch = useAppDispatch();
  const listings = useAppSelector(selectAllMarketplaceListings);
  const status = useAppSelector(selectMarketplaceStatus);
  const error = useAppSelector(selectMarketplaceError);
  
  const fetchListings = useCallback(() => {
    return dispatch(fetchMarketplaceListings());
  }, [dispatch]);
  
  const createListing = useCallback((data: MarketplaceItemInput) => {
    return dispatch(createMarketplaceListing(data)).unwrap();
  }, [dispatch]);
  
  const updateListing = useCallback(({ id, data }: { id: string, data: Partial<MarketplaceItemInput> }) => {
    return dispatch(updateMarketplaceListing({ id, data })).unwrap();
  }, [dispatch]);
  
  const deleteListing = useCallback((id: string) => {
    return dispatch(deleteMarketplaceListing(id)).unwrap();
  }, [dispatch]);
  
  return {
    listings,
    isLoading: status === 'loading',
    isError: status === 'failed',
    error,
    fetchListings,
    createListing,
    updateListing,
    deleteListing
  };
}

/**
 * Custom hook for working with a single marketplace listing by ID
 */
export function useMarketplaceListingByIdRedux(id: string) {
  const dispatch = useAppDispatch();
  const listing = useAppSelector(selectMarketplaceListingById);
  const status = useAppSelector(selectMarketplaceStatus);
  const error = useAppSelector(selectMarketplaceError);
  
  const fetchListing = useCallback(() => {
    if (id) {
      return dispatch(fetchMarketplaceListingById(id));
    }
  }, [dispatch, id]);
  
  const updateListing = useCallback((data: Partial<MarketplaceItemInput>) => {
    if (id) {
      return dispatch(updateMarketplaceListing({ id, data })).unwrap();
    }
  }, [dispatch, id]);
  
  const deleteListing = useCallback(() => {
    if (id) {
      return dispatch(deleteMarketplaceListing(id)).unwrap();
    }
  }, [dispatch, id]);
  
  return {
    listing,
    isLoading: status === 'loading',
    isError: status === 'failed',
    error,
    fetchListing,
    updateListing,
    deleteListing
  };
}

/**
 * Custom hook for working with filtered marketplace listings
 */
export function useFilteredMarketplaceListingsRedux(initialFilters?: MarketplaceItemsQueryOptions) {
  const dispatch = useAppDispatch();
  const filteredListings = useAppSelector(selectFilteredMarketplaceListings);
  const currentFilters = useAppSelector(selectMarketplaceFilters);
  const status = useAppSelector(selectMarketplaceStatus);
  const error = useAppSelector(selectMarketplaceError);
  
  // Apply initial filters if provided
  const updateFilters = useCallback((filters: MarketplaceItemsQueryOptions) => {
    dispatch(setFilters(filters));
    return dispatch(fetchFilteredMarketplaceListings(filters));
  }, [dispatch]);
  
  // Fetch listings with current filters
  const fetchListings = useCallback(() => {
    return dispatch(fetchFilteredMarketplaceListings(currentFilters));
  }, [dispatch, currentFilters]);
  
  // Reset filters
  const resetFilters = useCallback(() => {
    dispatch(clearFilters());
    return dispatch(fetchFilteredMarketplaceListings({}));
  }, [dispatch]);
  
  return {
    filteredListings,
    filters: currentFilters,
    isLoading: status === 'loading',
    isError: status === 'failed',
    error,
    updateFilters,
    fetchListings,
    resetFilters
  };
}

/**
 * Custom hook for working with related marketplace listings
 */
export function useRelatedMarketplaceListingsRedux(id: string, limit: number = 3) {
  const dispatch = useAppDispatch();
  const relatedListings = useAppSelector(selectRelatedMarketplaceListings);
  const status = useAppSelector(selectMarketplaceStatus);
  const error = useAppSelector(selectMarketplaceError);
  
  const fetchRelatedListings = useCallback(() => {
    if (id) {
      return dispatch(fetchRelatedMarketplaceListings({ id, limit }));
    }
  }, [dispatch, id, limit]);
  
  return {
    relatedListings,
    isLoading: status === 'loading',
    isError: status === 'failed',
    error,
    fetchRelatedListings
  };
}

/**
 * Custom hook for working with marketplace listings by seller
 */
export function useSellerMarketplaceListingsRedux(sellerId: string) {
  const dispatch = useAppDispatch();
  const sellerListings = useAppSelector(selectSellerMarketplaceListings);
  const status = useAppSelector(selectMarketplaceStatus);
  const error = useAppSelector(selectMarketplaceError);
  
  const fetchSellerListings = useCallback(() => {
    if (sellerId) {
      return dispatch(fetchSellerMarketplaceListings(sellerId));
    }
  }, [dispatch, sellerId]);
  
  return {
    sellerListings,
    isLoading: status === 'loading',
    isError: status === 'failed',
    error,
    fetchSellerListings
  };
}
