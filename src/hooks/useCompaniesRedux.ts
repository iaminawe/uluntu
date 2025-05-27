import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import {
  fetchCompanies,
  fetchCompanyById,
  fetchFilteredCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  setFilters,
  clearFilters,
  selectAllCompanies,
  selectCurrentCompany,
  selectFilteredCompanies,
  selectCompaniesStatus,
  selectCompaniesError,
  selectCompaniesFilters,
  CompanyFilters
} from '../redux/slices/companiesSlice';
import { CompanyInput } from '../api/companiesApi';

/**
 * Custom hook for accessing and manipulating the companies collection
 * @returns Object containing companies data and actions
 */
export function useCompaniesRedux() {
  const dispatch = useAppDispatch();
  const companies = useAppSelector(selectAllCompanies);
  const status = useAppSelector(selectCompaniesStatus);
  const error = useAppSelector(selectCompaniesError);
  
  const isLoading = status === 'loading';
  const isSuccess = status === 'succeeded';
  const isError = status === 'failed';
  
  // Load companies if needed
  const loadCompanies = () => {
    if (status === 'idle') {
      dispatch(fetchCompanies());
    }
  };

  return {
    companies,
    isLoading,
    isSuccess,
    isError,
    error,
    loadCompanies,
    createCompany: (company: CompanyInput) => dispatch(createCompany(company)),
    updateCompany: (id: string, data: Partial<CompanyInput>) => dispatch(updateCompany({ id, data })),
    deleteCompany: (id: string) => dispatch(deleteCompany(id)),
  };
}

/**
 * Custom hook for working with a single company by ID
 * @param id The ID of the company to fetch
 * @returns Object containing company data and actions
 */
export function useCompanyRedux(id?: string) {
  const dispatch = useAppDispatch();
  const company = useAppSelector(selectCurrentCompany);
  const status = useAppSelector(selectCompaniesStatus);
  const error = useAppSelector(selectCompaniesError);
  
  const isLoading = status === 'loading';
  const isSuccess = status === 'succeeded';
  const isError = status === 'failed';

  // Load company if we have an ID
  useEffect(() => {
    if (id && status === 'idle') {
      dispatch(fetchCompanyById(id));
    }
  }, [id, status, dispatch]);

  return {
    company,
    isLoading,
    isSuccess,
    isError,
    error,
    refreshCompany: id ? () => dispatch(fetchCompanyById(id)) : () => {},
    updateCompany: (data: Partial<CompanyInput>) => id ? dispatch(updateCompany({ id, data })) : Promise.resolve(),
    deleteCompany: id ? () => dispatch(deleteCompany(id)) : () => Promise.resolve(),
  };
}

/**
 * Custom hook for working with filtered companies
 * @param initialFilters Optional initial filters to apply
 * @returns Object containing filtered companies data and filter actions
 */
export function useFilteredCompaniesRedux(initialFilters?: CompanyFilters) {
  const dispatch = useAppDispatch();
  const companies = useAppSelector(selectFilteredCompanies);
  const currentFilters = useAppSelector(selectCompaniesFilters);
  const status = useAppSelector(selectCompaniesStatus);
  const error = useAppSelector(selectCompaniesError);
  
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
    dispatch(fetchFilteredCompanies(currentFilters));
  }, [dispatch, JSON.stringify(currentFilters)]);

  // Helper for updating just certain filters without affecting others
  const updateFilters = (newFilters: Partial<CompanyFilters>) => {
    dispatch(setFilters({ ...currentFilters, ...newFilters }));
  };

  // Pagination logic
  const getPaginatedCompanies = useMemo(() => {
    return (page: number, itemsPerPage: number) => {
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return companies.slice(startIndex, endIndex);
    };
  }, [companies]);

  return {
    companies,
    filters: currentFilters,
    isLoading,
    isSuccess,
    isError,
    error,
    updateFilters,
    setSearchTerm: (search?: string) => updateFilters({ search }),
    setIndustries: (industries?: string[]) => updateFilters({ industries }),
    clearAllFilters: () => dispatch(clearFilters()),
    getPaginatedCompanies,
    totalCompanies: companies.length
  };
}
