import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { opportunitiesApi } from '../api/opportunitiesApi';
import { 
  selectOpportunityFilters,
  selectSelectedOpportunityId,
  selectOpportunitiesViewMode,
  selectOpportunitiesSortBy,
  selectOpportunitiesSortOrder,
  selectShowRemoteOnly,
  selectExpandedOpportunities,
  updateFilters,
  clearFilters,
  setSelectedOpportunity,
  setViewMode,
  setSortBy,
  setSortOrder,
  setShowRemoteOnly,
  toggleOpportunityExpanded,
} from '../store/opportunitiesUISlice';
import { Opportunity } from '../types';
import { queryKeys } from '@/config/queryClient';

export function useOpportunitiesHybrid() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  
  // UI state from Redux
  const filters = useAppSelector(selectOpportunityFilters);
  const selectedOpportunityId = useAppSelector(selectSelectedOpportunityId);
  const viewMode = useAppSelector(selectOpportunitiesViewMode);
  const sortBy = useAppSelector(selectOpportunitiesSortBy);
  const sortOrder = useAppSelector(selectOpportunitiesSortOrder);
  const showRemoteOnly = useAppSelector(selectShowRemoteOnly);
  const expandedOpportunities = useAppSelector(selectExpandedOpportunities);
  
  // React Query for server state
  const opportunitiesQuery = useQuery({
    queryKey: queryKeys.opportunitiesWithFilters(filters),
    queryFn: () => opportunitiesApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const featuredQuery = useQuery({
    queryKey: ['opportunities', 'featured'],
    queryFn: () => opportunitiesApi.getAll({ status: 'active', featured: true }),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
  
  // Get single opportunity
  const getOpportunity = (id: string) => {
    return useQuery({
      queryKey: queryKeys.opportunity(id),
      queryFn: () => opportunitiesApi.getById(id),
      enabled: !!id,
    });
  };
  
  // Get opportunities by company
  const getOpportunitiesByCompany = (companyId: string) => {
    return useQuery({
      queryKey: ['opportunities', 'company', companyId],
      queryFn: () => opportunitiesApi.getAll({ company_id: companyId }),
      enabled: !!companyId,
    });
  };
  
  // Mutations
  const createOpportunity = useMutation({
    mutationFn: (data: Partial<Opportunity>) => opportunitiesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities });
    },
  });
  
  const updateOpportunity = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Opportunity> }) => 
      opportunitiesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities });
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunity(id) });
    },
  });
  
  const deleteOpportunity = useMutation({
    mutationFn: (id: string) => opportunitiesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities });
    },
  });
  
  // UI actions
  const setSearchTerm = (search?: string) => {
    dispatch(updateFilters({ search }));
  };
  
  const setTypeFilter = (type?: string[]) => {
    dispatch(updateFilters({ type }));
  };
  
  const setLocationFilter = (location?: string[]) => {
    dispatch(updateFilters({ location }));
  };
  
  const setStatusFilter = (status?: string) => {
    dispatch(updateFilters({ status }));
  };
  
  const setRemoteFilter = (remote?: boolean) => {
    dispatch(updateFilters({ remote }));
    dispatch(setShowRemoteOnly(!!remote));
  };
  
  const resetFilters = () => {
    dispatch(clearFilters());
  };
  
  // Sort opportunities
  const sortedOpportunities = [...(opportunitiesQuery.data || [])].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.created_at || '').getTime() - 
                    new Date(b.created_at || '').getTime();
        break;
      case 'title':
        comparison = (a.title || '').localeCompare(b.title || '');
        break;
      case 'company':
        comparison = (a.company?.name || '').localeCompare(b.company?.name || '');
        break;
      case 'type':
        comparison = (a.type || '').localeCompare(b.type || '');
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  
  return {
    // Data
    opportunities: sortedOpportunities,
    featuredOpportunities: featuredQuery.data || [],
    isLoading: opportunitiesQuery.isLoading,
    isFeaturedLoading: featuredQuery.isLoading,
    error: opportunitiesQuery.error,
    
    // UI state
    filters,
    selectedOpportunityId,
    viewMode,
    sortBy,
    sortOrder,
    showRemoteOnly,
    expandedOpportunities,
    
    // Actions
    setSearchTerm,
    setTypeFilter,
    setLocationFilter,
    setStatusFilter,
    setRemoteFilter,
    resetFilters,
    setSelectedOpportunity: (id: string | null) => dispatch(setSelectedOpportunity(id)),
    setViewMode: (mode: 'grid' | 'list') => dispatch(setViewMode(mode)),
    setSortBy: (by: 'date' | 'title' | 'company' | 'type') => dispatch(setSortBy(by)),
    setSortOrder: (order: 'asc' | 'desc') => dispatch(setSortOrder(order)),
    setShowRemoteOnly: (show: boolean) => dispatch(setShowRemoteOnly(show)),
    toggleOpportunityExpanded: (id: string) => dispatch(toggleOpportunityExpanded(id)),
    
    // Queries
    getOpportunity,
    getOpportunitiesByCompany,
    refetch: opportunitiesQuery.refetch,
    
    // Mutations
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
  };
}