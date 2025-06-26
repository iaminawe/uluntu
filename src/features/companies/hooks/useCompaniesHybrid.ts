import { useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useQueryClient } from '@tanstack/react-query';
import {
  useCompanies,
  useCompaniesWithFilters,
  useCompany,
  useCompanyByIdOrSlug,
  useCreateCompany,
  useUpdateCompany,
  useDeleteCompany,
} from '@/hooks/useCompanyQueries';
import {
  setFilters,
  clearFilters,
  updateFilters,
  selectCompaniesFilters,
  CompanyFilters
} from '../store/companiesUISlice';
import { CompanyInput } from '../api/companiesApi';
import { queryKeys, invalidationHelpers } from '@/config/queryClient';

/**
 * Hybrid hook for companies that combines React Query for data fetching
 * with Redux for UI state management (filters, selections, etc.)
 */
export function useCompaniesHybrid() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const filters = useAppSelector(selectCompaniesFilters);
  
  // Use React Query for data fetching
  const hasFilters = Object.keys(filters).length > 0;
  const allCompaniesQuery = useCompanies();
  const filteredCompaniesQuery = useCompaniesWithFilters(filters);
  
  // Choose the appropriate query based on whether we have filters
  const companiesQuery = hasFilters ? filteredCompaniesQuery : allCompaniesQuery;
  
  // Create mutation
  const createMutation = useCreateCompany();
  
  // Enhanced createCompany with better success handling
  const createCompany = useCallback(async (companyData: CompanyInput) => {
    try {
      const result = await createMutation.mutateAsync(companyData);
      // Invalidate related queries
      invalidationHelpers.invalidateCompanies(queryClient);
      return result;
    } catch (error) {
      throw error;
    }
  }, [createMutation, queryClient]);

  // Filter actions (Redux) - memoized to prevent infinite loops
  const updateFiltersAction = useCallback((newFilters: Partial<CompanyFilters>) => {
    dispatch(updateFilters(newFilters));
  }, [dispatch]);

  const setSearchTerm = useCallback((search?: string) => {
    updateFiltersAction({ search });
  }, [updateFiltersAction]);

  const setIndustries = useCallback((industries?: string[]) => {
    updateFiltersAction({ industries });
  }, [updateFiltersAction]);

  const clearAllFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  // Pagination logic (client-side for now)
  const getPaginatedCompanies = useMemo(() => {
    return (page: number, itemsPerPage: number) => {
      const companies = companiesQuery.data || [];
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return companies.slice(startIndex, endIndex);
    };
  }, [companiesQuery.data]);

  return {
    // Data from React Query
    companies: companiesQuery.data || [],
    isLoading: companiesQuery.isLoading,
    isError: companiesQuery.isError,
    error: companiesQuery.error,
    refetch: companiesQuery.refetch,
    
    // UI state from Redux
    filters,
    
    // Actions
    createCompany,
    updateFilters: updateFiltersAction,
    setSearchTerm,
    setIndustries,
    clearAllFilters,
    
    // Pagination
    getPaginatedCompanies,
    totalCompanies: companiesQuery.data?.length || 0,
    
    // Mutation states
    isCreating: createMutation.isPending,
    createError: createMutation.error,
  };
}

/**
 * Hybrid hook for a single company
 */
export function useCompanyHybrid(id?: string) {
  const queryClient = useQueryClient();
  
  // Use React Query for data fetching
  const companyQuery = useCompany(id);
  
  // Mutations
  const updateMutation = useUpdateCompany();
  const deleteMutation = useDeleteCompany();

  // Enhanced update with better error handling
  const updateCompany = async (data: Partial<CompanyInput>) => {
    if (!id) throw new Error('Company ID is required');
    
    try {
      const result = await updateMutation.mutateAsync({ id, data });
      // Invalidate related queries
      invalidationHelpers.invalidateCompany(queryClient, id);
      return result;
    } catch (error) {
      throw error;
    }
  };

  // Enhanced delete with better error handling
  const deleteCompany = async () => {
    if (!id) throw new Error('Company ID is required');
    
    try {
      const result = await deleteMutation.mutateAsync(id);
      // Invalidate related queries
      invalidationHelpers.invalidateCompanies(queryClient);
      return result;
    } catch (error) {
      throw error;
    }
  };

  return {
    // Data from React Query
    company: companyQuery.data,
    isLoading: companyQuery.isLoading,
    isError: companyQuery.isError,
    error: companyQuery.error,
    refetch: companyQuery.refetch,
    
    // Actions
    updateCompany,
    deleteCompany,
    
    // Mutation states
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
  };
}

/**
 * Hybrid hook for a single company by ID or slug
 * Automatically detects whether the parameter is an ID or slug
 */
export function useCompanyByIdOrSlugHybrid(idOrSlug?: string) {
  const queryClient = useQueryClient();
  
  // Use React Query for data fetching
  const companyQuery = useCompanyByIdOrSlug(idOrSlug);
  
  // Mutations
  const updateMutation = useUpdateCompany();
  const deleteMutation = useDeleteCompany();

  // Enhanced update with better error handling
  const updateCompany = async (data: Partial<CompanyInput>) => {
    if (!idOrSlug || !companyQuery.data) throw new Error('Company not found');
    
    const companyId = companyQuery.data.id;
    
    try {
      const result = await updateMutation.mutateAsync({ id: companyId, data });
      // Invalidate related queries
      invalidationHelpers.invalidateCompany(queryClient, companyId);
      return result;
    } catch (error) {
      throw error;
    }
  };

  // Enhanced delete with better error handling
  const deleteCompany = async () => {
    if (!idOrSlug || !companyQuery.data) throw new Error('Company not found');
    
    const companyId = companyQuery.data.id;
    
    try {
      const result = await deleteMutation.mutateAsync(companyId);
      // Invalidate related queries
      invalidationHelpers.invalidateCompanies(queryClient);
      return result;
    } catch (error) {
      throw error;
    }
  };

  return {
    // Data from React Query
    company: companyQuery.data,
    isLoading: companyQuery.isLoading,
    isError: companyQuery.isError,
    error: companyQuery.error,
    refetch: companyQuery.refetch,
    
    // Actions
    updateCompany,
    deleteCompany,
    
    // Mutation states
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
  };
}

/**
 * Simplified filters-only hook for components that only need filter state
 */
export function useCompanyFilters() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectCompaniesFilters);

  const updateFiltersAction = (newFilters: Partial<CompanyFilters>) => {
    dispatch(updateFilters(newFilters));
  };

  const setSearchTerm = (search?: string) => {
    updateFiltersAction({ search });
  };

  const setIndustries = (industries?: string[]) => {
    updateFiltersAction({ industries });
  };

  const clearAllFilters = () => {
    dispatch(clearFilters());
  };

  return {
    filters,
    updateFilters: updateFiltersAction,
    setSearchTerm,
    setIndustries,
    clearAllFilters,
  };
}