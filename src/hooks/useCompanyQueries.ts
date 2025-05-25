import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { Database } from '../types/supabase';

// Define Tables type to correctly access the Row property
type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T];
import { companiesApi, CompanyInput } from '../api/companiesApi';
import * as mockQueries from './useQueries';

// Configuration to switch between mock and real data
const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true';

// Type for filters, mirroring companiesApi.getAll
export interface CompanyFilters {
  search?: string;
  industries?: string[];
}

/**
 * Custom hook to fetch a list of all companies.
 * Supports fetching from Supabase or mock data based on the VITE_USE_SUPABASE environment variable.
 *
 * @returns A UseQueryResult object from Tanstack Query containing the list of companies or an error.
 */
export function useCompanies(): UseQueryResult<Tables<'companies'>['Row'][], Error> {
  // Use a consistent approach to avoid conditional hook calls
  return useQuery<Tables<'companies'>['Row'][], Error>({
    queryKey: ['companies', 'all', USE_SUPABASE ? 'supabase' : 'mock'],
    queryFn: async () => {
      if (!USE_SUPABASE) {
        // Cast to unknown first to avoid type mismatch errors
        return mockQueries.useCompanies().data as unknown as Tables<'companies'>['Row'][];
      }
      return companiesApi.getAll();
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Custom hook to fetch a list of companies based on specified filters.
 * Supports fetching from Supabase or mock data based on the VITE_USE_SUPABASE environment variable.
 *
 * @param filters - Optional filters (e.g., search term, industries) to apply to the company list.
 * @returns A UseQueryResult object from Tanstack Query containing the filtered list of companies or an error.
 */
export function useCompaniesWithFilters(filters?: CompanyFilters): UseQueryResult<Tables<'companies'>['Row'][], Error> {
  // Use a consistent approach to avoid conditional hook calls
  return useQuery<Tables<'companies'>['Row'][], Error>({
    queryKey: ['companies', 'filters', filters, USE_SUPABASE ? 'supabase' : 'mock'],
    queryFn: async () => {
      if (!USE_SUPABASE) {
        // Cast to unknown first to avoid type mismatch errors
        return mockQueries.useCompaniesWithFilters(filters).data as unknown as Tables<'companies'>['Row'][];
      }
      // If filters is undefined, call getAll without arguments, similar to useCompanies hook.
      // Otherwise, pass the filters object.
      if (filters) {
        return companiesApi.getAll(filters);
      } else {
        return companiesApi.getAll();
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Custom hook to fetch a single company by its ID.
 * Supports fetching from Supabase or mock data based on the VITE_USE_SUPABASE environment variable.
 * The hook is disabled if the ID is not provided.
 *
 * @param id - The ID of the company to fetch. Can be a string.
 * @returns A UseQueryResult object from Tanstack Query containing the company data or null if not found, or an error.
 */
export function useCompany(id?: string): UseQueryResult<Tables<'companies'>['Row'] | null, Error> {
  // Use a consistent approach to avoid conditional hook calls
  return useQuery<Tables<'companies'>['Row'] | null, Error>({
    queryKey: ['companies', id, USE_SUPABASE ? 'supabase' : 'mock'],
    queryFn: async () => {
      if (id === undefined) {
        return Promise.reject(new Error('Company ID is undefined'));
      }
      
      if (!USE_SUPABASE) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
          // If the original id string cannot be parsed into a valid number,
          // and assuming mockQueries.useCompany expects a numeric ID or a numeric string,
          // it's safer to return null or handle as an error for non-numeric string IDs.
          // For now, returning null if id is not a parseable number string.
          return null;
        }
        const mockResult = mockQueries.useCompany(numericId).data;
        return mockResult as unknown as Tables<'companies'>['Row'] | null;
      }
      
      // id is guaranteed to be a string here due to the 'enabled' option and the undefined check.
      // Assuming companiesApi.getById expects a string ID based on the new lint error.
      return companiesApi.getById(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Custom hook to create a new company.
 * Supports creating via Supabase or a mock implementation based on the VITE_USE_SUPABASE environment variable.
 * Invalidates the 'companies' query cache on success.
 *
 * @returns A UseMutationResult object from Tanstack Query for the create company operation.
 */
export function useCreateCompany(): UseMutationResult<
  Tables<'companies'>['Row'] | null,
  Error,
  CompanyInput
> {
  const queryClient = useQueryClient();
  
  // Always call useMutation to avoid conditional hook calls
  return useMutation<
    Tables<'companies'>['Row'] | null,
    Error,
    CompanyInput
  >({
    mutationFn: (companyData: CompanyInput) => {
      if (!USE_SUPABASE) {
        console.warn('Supabase is disabled, using mock create company.');
        console.log('Mock create company:', companyData);
        // Cast to unknown first to avoid type mismatch errors
        return Promise.resolve((mockQueries.mockData?.companies?.[0] || null) as unknown as Tables<'companies'>['Row'] | null);
      }
      
      return companiesApi.create(companyData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['companies', USE_SUPABASE ? 'supabase' : 'mock'] 
      });
    },
  });
}

/**
 * Custom hook to update an existing company.
 * Supports updating via Supabase or a mock implementation based on the VITE_USE_SUPABASE environment variable.
 * Invalidates relevant 'companies' query caches on success.
 *
 * @returns A UseMutationResult object from Tanstack Query for the update company operation.
 */
export function useUpdateCompany(): UseMutationResult<
  Tables<'companies'>['Row'] | null,
  Error,
  { id: string; data: Partial<CompanyInput> }
> {
  const queryClient = useQueryClient();
  
  // Always call useMutation to avoid conditional hook calls
  return useMutation<
    Tables<'companies'>['Row'] | null,
    Error,
    { id: string; data: Partial<CompanyInput> }
  >({
    mutationFn: ({ id, data }: { id: string; data: Partial<CompanyInput> }) => {
      if (!USE_SUPABASE) {
        console.warn('Supabase is disabled, using mock update company.');
        console.log('Mock update company:', { id, data });
        // Cast to unknown first to avoid type mismatch errors
        return Promise.resolve((mockQueries.mockData?.companies?.[0] || null) as unknown as Tables<'companies'>['Row'] | null);
      }
      
      return companiesApi.update(id, data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['companies', USE_SUPABASE ? 'supabase' : 'mock'] 
      });
      if (variables.id) {
        queryClient.invalidateQueries({ 
          queryKey: ['companies', variables.id, USE_SUPABASE ? 'supabase' : 'mock'] 
        });
      }
    },
  });
}

/**
 * Custom hook to delete a company by its ID.
 * Supports deleting via Supabase or a mock implementation based on the VITE_USE_SUPABASE environment variable.
 * Invalidates relevant 'companies' query caches on success.
 *
 * @returns A UseMutationResult object from Tanstack Query for the delete company operation.
 */
export function useDeleteCompany(): UseMutationResult<
  boolean,
  Error,
  string // ID
> {
  const queryClient = useQueryClient();

  // Always call useMutation to avoid conditional hook calls
  return useMutation<boolean, Error, string>({
    mutationFn: (id: string) => {
      if (!USE_SUPABASE) {
        console.warn('Supabase is disabled, using mock delete company.');
        console.log('Mock delete company:', id);
        return Promise.resolve(true);
      }
      
      return companiesApi.delete(id);
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ 
        queryKey: ['companies', USE_SUPABASE ? 'supabase' : 'mock'] 
      });
      queryClient.invalidateQueries({ queryKey: ['supabase', 'companies', id] });
    },
  });
}

/**
 * Custom hook to fetch employees (members) for a specific company.
 * Supports fetching from Supabase or mock data based on the VITE_USE_SUPABASE environment variable.
 * The hook is disabled if companyId is not provided.
 *
 * @param companyId - The ID of the company whose employees are to be fetched.
 * @returns A UseQueryResult object from Tanstack Query containing the list of company employees or an error.
 */
export function useCompanyEmployees(companyId?: string): UseQueryResult<Tables<'members'>['Row'][], Error> {
  // Always call useQuery to avoid conditional hook calls
  return useQuery<Tables<'members'>['Row'][], Error>({
    queryKey: ['companies', companyId, 'employees', USE_SUPABASE ? 'supabase' : 'mock'],
    queryFn: async () => {
      if (!companyId) {
        return [] as Tables<'members'>['Row'][];
      }
      
      if (!USE_SUPABASE) {
        // Parse the string ID to a number if it exists
        const numericId = parseInt(companyId, 10);
        // Check if numericId is a valid number before passing it to the mock function
        const validNumericId = !isNaN(numericId) ? numericId : undefined;
        // Get the mock data result
        const result = mockQueries.useCompanyEmployees(validNumericId);
        // Cast to unknown first to avoid type mismatch errors
        return result.data as unknown as Tables<'members'>['Row'][];
      }
      
      // Supabase implementation (currently returns empty array)
      console.warn(`Supabase function for useCompanyEmployees with companyId: ${companyId} is not implemented. Returning empty array.`);
      await new Promise(resolve => setTimeout(resolve, 500));
      return [] as Tables<'members'>['Row'][];
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  });
}
