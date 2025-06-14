import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchOpportunities,
  fetchOpportunityById,
  fetchFilteredOpportunities,
  fetchFeaturedOpportunities,
  fetchCompanyOpportunities,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  setFilters,
  clearFilters,
  selectAllOpportunities,
  selectCurrentOpportunity,
  selectFilteredOpportunities,
  selectFeaturedOpportunities,
  selectCompanyOpportunities,
  selectOpportunitiesStatus,
  selectOpportunitiesError,
  selectOpportunitiesFilters,
  OpportunityFilters
} from '../store/opportunitiesSlice';
import { OpportunityInput } from '../api/opportunitiesApi';

/**
 * Custom hook for accessing and manipulating the opportunities collection
 * @returns Object containing opportunities data and actions
 */
export function useOpportunitiesRedux() {
  const dispatch = useAppDispatch();
  const opportunities = useAppSelector(selectAllOpportunities);
  const status = useAppSelector(selectOpportunitiesStatus);
  const error = useAppSelector(selectOpportunitiesError);
  
  const isLoading = status === 'loading';
  const isSuccess = status === 'succeeded';
  const isError = status === 'failed';
  
  // Load opportunities if needed
  const loadOpportunities = () => {
    if (status === 'idle') {
      dispatch(fetchOpportunities());
    }
  };

  return {
    opportunities,
    isLoading,
    isSuccess,
    isError,
    error,
    loadOpportunities,
    createOpportunity: (opportunity: OpportunityInput) => dispatch(createOpportunity(opportunity)),
    updateOpportunity: (id: string, data: Partial<OpportunityInput>) => dispatch(updateOpportunity({ id, data })),
    deleteOpportunity: (id: string) => dispatch(deleteOpportunity(id)),
  };
}

/**
 * Custom hook for working with a single opportunity by ID
 * @param id The ID of the opportunity to fetch
 * @returns Object containing opportunity data and actions
 */
export function useOpportunityRedux(id?: string) {
  const dispatch = useAppDispatch();
  const opportunity = useAppSelector(selectCurrentOpportunity);
  const status = useAppSelector(selectOpportunitiesStatus);
  const error = useAppSelector(selectOpportunitiesError);
  
  const isLoading = status === 'loading';
  const isSuccess = status === 'succeeded';
  const isError = status === 'failed';

  // Load opportunity if we have an ID
  useEffect(() => {
    if (id && status === 'idle') {
      dispatch(fetchOpportunityById(id));
    }
  }, [id, status, dispatch]);

  return {
    opportunity,
    isLoading,
    isSuccess,
    isError,
    error,
    refreshOpportunity: id ? () => dispatch(fetchOpportunityById(id)) : () => {},
    updateOpportunity: (data: Partial<OpportunityInput>) => id ? dispatch(updateOpportunity({ id, data })) : Promise.resolve(),
    deleteOpportunity: id ? () => dispatch(deleteOpportunity(id)) : () => Promise.resolve(),
  };
}

/**
 * Custom hook for working with filtered opportunities
 * @param initialFilters Optional initial filters to apply
 * @returns Object containing filtered opportunities data and filter actions
 */
export function useFilteredOpportunitiesRedux(initialFilters?: OpportunityFilters) {
  const dispatch = useAppDispatch();
  const opportunities = useAppSelector(selectFilteredOpportunities);
  const currentFilters = useAppSelector(selectOpportunitiesFilters);
  const status = useAppSelector(selectOpportunitiesStatus);
  const error = useAppSelector(selectOpportunitiesError);
  
  const isLoading = status === 'loading';
  const isSuccess = status === 'succeeded';
  const isError = status === 'failed';
  
  // Set initial filters if provided
  useEffect(() => {
    if (initialFilters) {
      dispatch(setFilters(initialFilters));
    }
  }, []);

  // Apply filters when they change
  useEffect(() => {
    dispatch(fetchFilteredOpportunities(currentFilters));
  }, [dispatch, JSON.stringify(currentFilters)]);

  // Helper for updating just certain filters without affecting others
  const updateFilters = (newFilters: Partial<OpportunityFilters>) => {
    dispatch(setFilters({ ...currentFilters, ...newFilters }));
  };

  // Pagination logic
  const getPaginatedOpportunities = useMemo(() => {
    return (page: number, itemsPerPage: number) => {
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return opportunities.slice(startIndex, endIndex);
    };
  }, [opportunities]);

  return {
    opportunities,
    filters: currentFilters,
    isLoading,
    isSuccess,
    isError,
    error,
    updateFilters,
    setSearchTerm: (search?: string) => updateFilters({ search }),
    setType: (type?: string[]) => updateFilters({ type }),
    setRemote: (remote?: boolean) => updateFilters({ remote }),
    setLocation: (location?: string[]) => updateFilters({ location }),
    setStatus: (status?: string) => updateFilters({ status }),
    clearAllFilters: () => dispatch(clearFilters()),
    getPaginatedOpportunities,
    totalOpportunities: opportunities.length
  };
}

/**
 * Custom hook for working with featured opportunities
 * @param limit Optional limit for the number of featured opportunities to fetch
 * @returns Object containing featured opportunities data
 */
export function useFeaturedOpportunitiesRedux(limit: number = 3) {
  const dispatch = useAppDispatch();
  const opportunities = useAppSelector(selectFeaturedOpportunities);
  const status = useAppSelector(selectOpportunitiesStatus);
  const error = useAppSelector(selectOpportunitiesError);
  
  const isLoading = status === 'loading';
  const isSuccess = status === 'succeeded';
  const isError = status === 'failed';

  // Load featured opportunities
  useEffect(() => {
    dispatch(fetchFeaturedOpportunities(limit));
  }, [limit, dispatch]);

  return {
    opportunities,
    isLoading,
    isSuccess,
    isError,
    error,
    refreshFeatured: () => dispatch(fetchFeaturedOpportunities(limit))
  };
}

/**
 * Custom hook for working with a company's opportunities
 * @param companyId The ID of the company whose opportunities to fetch
 * @returns Object containing company opportunities data
 */
export function useCompanyOpportunitiesRedux(companyId?: string) {
  const dispatch = useAppDispatch();
  const opportunities = useAppSelector(selectCompanyOpportunities);
  const status = useAppSelector(selectOpportunitiesStatus);
  const error = useAppSelector(selectOpportunitiesError);
  
  const isLoading = status === 'loading';
  const isSuccess = status === 'succeeded';
  const isError = status === 'failed';

  // Load company opportunities if we have a company ID
  useEffect(() => {
    if (companyId) {
      dispatch(fetchCompanyOpportunities(companyId));
    }
  }, [companyId, dispatch]);

  return {
    opportunities,
    isLoading,
    isSuccess,
    isError,
    error,
    refreshCompanyOpportunities: companyId ? () => dispatch(fetchCompanyOpportunities(companyId)) : () => {}
  };
}
