import { useQuery, UseQueryResult, useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query';

// Mock data service
import * as mockQueries from '../hooks/useQueries';
import { Company, Member } from '../types';

// Supabase API services
import { companiesApi, CompanyInput } from '../api/companiesApi';
import { membersApi } from '../api/membersApi';

// Toggle between Supabase and mock data
const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true';

// Type for filters to keep compatibility with the API
interface CompanyFilters {
  search?: string;
  industries?: string[];
}

// We're using the CompanyInput from companiesApi.ts

/**
 * Custom hook to fetch a list of all companies.
 * Supports fetching from Supabase or mock data based on the VITE_USE_SUPABASE environment variable.
 *
 * @returns A UseQueryResult object from Tanstack Query containing the list of companies or an error.
 */
export function useCompanies(): UseQueryResult<Company[], Error> {
  return useQuery<Company[], Error>({
    queryKey: ['companies', 'all', USE_SUPABASE ? 'supabase' : 'mock'],
    queryFn: async () => {
      if (!USE_SUPABASE) {
        return mockQueries.useCompanies().data || [];
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
export function useCompaniesWithFilters(filters?: CompanyFilters): UseQueryResult<Company[], Error> {
  return useQuery<Company[], Error>({
    queryKey: ['companies', 'filters', filters, USE_SUPABASE ? 'supabase' : 'mock'],
    queryFn: async () => {
      if (!USE_SUPABASE) {
        return mockQueries.useCompaniesWithFilters(filters).data || [];
      }
      return companiesApi.getAll(filters);
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
export function useCompany(id?: string): UseQueryResult<Company | null, Error> {
  return useQuery<Company | null, Error>({
    queryKey: ['companies', id, USE_SUPABASE ? 'supabase' : 'mock'],
    queryFn: async () => {
      if (!id) {
        return null;
      }

      if (!USE_SUPABASE) {
        // For mock data, convert any null to undefined for proper type compatibility
        const result = mockQueries.useCompany(id).data;
        return result || null;
      }

      try {
        const company = await companiesApi.getById(id);
        return company;
      } catch (error) {
        console.error(`Error fetching company with ID ${id}:`, error);
        return null;
      }
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
export function useCreateCompany(): UseMutationResult<Company | null, Error, CompanyInput> {
  const queryClient = useQueryClient();
  return useMutation<Company | null, Error, CompanyInput>({
    mutationFn: async (companyData: CompanyInput) => {
      if (!USE_SUPABASE) {
        // Create a mock company with the data provided
        const newCompany: Company = {
          id: Date.now().toString(),
          name: companyData.name,
          description: companyData.description,
          logo: companyData.logo || '',
          industry: companyData.industry || [],
          size: companyData.size,
          founded: companyData.founded,
          location: companyData.location || '',
          website: companyData.website || undefined, // Convert null to undefined for type compatibility
          featured: companyData.featured || false,
          created_at: new Date().toISOString(),
        };

        return Promise.resolve(newCompany);
      }

      try {
        const company = await companiesApi.create(companyData);
        return company;
      } catch (error) {
        console.error('Error creating company:', error);
        return null;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
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
export function useUpdateCompany(): UseMutationResult<Company | null, Error, { id: string; data: Partial<CompanyInput> }> {
  const queryClient = useQueryClient();
  return useMutation<Company | null, Error, { id: string; data: Partial<CompanyInput> }>({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CompanyInput> }) => {
      if (!USE_SUPABASE) {
        const result = mockQueries.useCompany(id);
        const currentCompany = result.data;

        if (!currentCompany) {
          return null;
        }

        // Create an updated version of the company with the new data
        const updatedCompany: Company = {
          ...currentCompany,
          name: data.name || currentCompany.name,
          description: data.description || currentCompany.description,
          founded: data.founded || currentCompany.founded,
          industry: data.industry || currentCompany.industry,
          size: data.size || currentCompany.size,
          logo: data.logo !== undefined ? data.logo : currentCompany.logo,
          website: data.website !== undefined ? data.website : (currentCompany.website || undefined), // Convert null to undefined
          featured: data.featured !== undefined ? data.featured : currentCompany.featured,
          location: data.location !== undefined ? data.location : currentCompany.location,
        };

        return Promise.resolve(updatedCompany);
      }

      try {
        const company = await companiesApi.update(id, data);
        return company;
      } catch (error) {
        console.error(`Error updating company with ID ${id}:`, error);
        return null;
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companies', USE_SUPABASE ? 'supabase' : 'mock'] });
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

  return useMutation<boolean, Error, string>({
    mutationFn: (id: string) => {
      if (!USE_SUPABASE) {
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
export function useCompanyEmployees(companyId?: string): UseQueryResult<Member[], Error> {
  return useQuery<Member[], Error>({
    queryKey: ['company', companyId, 'employees', USE_SUPABASE ? 'supabase' : 'mock'],
    queryFn: async () => {
      if (!companyId) {
        return [];
      }

      if (USE_SUPABASE) {
        try {
          // Use the proper Supabase API for company employees
          return await membersApi.getByCompany(companyId);
        } catch (error) {
          console.error(`Error fetching employees for company ID ${companyId}:`, error);
          return [];
        }
      }

      try {
        // Use string ID consistently throughout the application
        const result = mockQueries.useCompanyEmployees(companyId);
        return result?.data || [];
      } catch (error) {
        console.error(`Error fetching employees for company ID ${companyId}:`, error);
        return [];
      }
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  });
}
