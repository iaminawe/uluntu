import { useQuery, UseQueryResult, useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query';

// Mock data service
import * as mockQueries from './useQueries';
import { Company, CompanyEmployee } from '../types';

// Supabase API services
import { companiesApi, CompanyInput } from '@/features/companies/api/companiesApi';

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
/**
 * Custom hook to add a new employee to a company.
 * @returns A UseMutationResult object from Tanstack Query for the add employee operation.
 */
export function useAddCompanyEmployee(): UseMutationResult<
  CompanyEmployee | null,
  Error,
  { companyId: string; memberId: string; employeeData?: Partial<CompanyEmployee> }
> {
  const queryClient = useQueryClient();
  
  return useMutation<
    CompanyEmployee | null,
    Error,
    { companyId: string; memberId: string; employeeData?: Partial<CompanyEmployee> }
  >({
    mutationFn: async ({ companyId, memberId, employeeData }) => {
      if (!USE_SUPABASE) {
        // Mock implementation
        const mockEmployee: CompanyEmployee = {
          id: Date.now().toString(),
          company_id: companyId,
          member_id: memberId,
          role: employeeData?.role,
          department: employeeData?.department,
          start_date: employeeData?.start_date || new Date().toISOString().split('T')[0],
          is_current: employeeData?.is_current ?? true,
          created_at: new Date().toISOString()
        };
        return Promise.resolve(mockEmployee);
      }
      
      return companiesApi.addCompanyEmployee(companyId, memberId, employeeData);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['company', variables.companyId, 'employees'] 
      });
    }
  });
}

/**
 * Custom hook to update a company employee.
 * @returns A UseMutationResult object from Tanstack Query for the update employee operation.
 */
export function useUpdateCompanyEmployee(): UseMutationResult<
  CompanyEmployee | null,
  Error,
  { employeeId: string; updates: Partial<CompanyEmployee> }
> {
  const queryClient = useQueryClient();
  
  return useMutation<
    CompanyEmployee | null,
    Error,
    { employeeId: string; updates: Partial<CompanyEmployee> }
  >({
    mutationFn: async ({ employeeId, updates }) => {
      if (!USE_SUPABASE) {
        // Mock implementation
        const mockEmployee: CompanyEmployee = {
          id: employeeId,
          company_id: updates.company_id || 'company-1',
          member_id: updates.member_id || 'member-1',
          role: updates.role,
          department: updates.department,
          start_date: updates.start_date,
          end_date: updates.end_date,
          is_current: updates.is_current ?? true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return Promise.resolve(mockEmployee);
      }
      
      return companiesApi.updateCompanyEmployee(employeeId, updates);
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ 
          queryKey: ['company', data.company_id, 'employees'] 
        });
      }
    }
  });
}

/**
 * Custom hook to remove an employee from a company.
 * @returns A UseMutationResult object from Tanstack Query for the remove employee operation.
 */
export function useRemoveCompanyEmployee(): UseMutationResult<
  boolean,
  Error,
  string
> {
  const queryClient = useQueryClient();
  
  return useMutation<
    boolean,
    Error,
    string
  >({
    mutationFn: async (employeeId) => {
      if (!USE_SUPABASE) {
        return Promise.resolve(true);
      }
      
      return companiesApi.removeCompanyEmployee(employeeId);
    },
    onSuccess: () => {
      // Invalidate all company employee queries since we don't have companyId
      queryClient.invalidateQueries({ 
        queryKey: ['company'] 
      });
    }
  });
}

export function useCompanyEmployees(companyId?: string, filters?: { department?: string; currentOnly?: boolean }): UseQueryResult<CompanyEmployee[], Error> {
  return useQuery<CompanyEmployee[], Error>({
    queryKey: ['company', companyId, 'employees', filters, USE_SUPABASE ? 'supabase' : 'mock'],
    queryFn: async () => {
      if (!companyId) {
        return [];
      }

      if (USE_SUPABASE) {
        const employees = await companiesApi.getCompanyEmployees(companyId, filters);
        return employees;
      }

      try {
        // For mock data, we need to create mock CompanyEmployee data
        // since the mock queries might return a different format
        let mockEmployees: CompanyEmployee[] = [
          {
            id: '1',
            company_id: companyId,
            member_id: 'member-1',
            role: 'Software Engineer',
            department: 'Engineering',
            start_date: '2023-01-15',
            is_current: true,
            created_at: new Date().toISOString(),
            member: {
              id: 'member-1',
              name: 'John Doe',
              title: 'Senior Software Engineer',
              company: 'Tech Innovators',
              location: 'Nelson, BC',
              image: 'https://via.placeholder.com/150',
              bio: 'Experienced software engineer with a passion for building scalable applications.',
              skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
              joinDate: '2023-01-15',
              status: 'published',
              created_at: new Date().toISOString(),
              featured: false
            }
          },
          {
            id: '2',
            company_id: companyId,
            member_id: 'member-2',
            role: 'Product Manager',
            department: 'Product',
            start_date: '2022-06-01',
            is_current: true,
            created_at: new Date().toISOString(),
            member: {
              id: 'member-2',
              name: 'Jane Smith',
              title: 'Product Manager',
              company: 'Tech Innovators',
              location: 'Vancouver, BC',
              image: 'https://via.placeholder.com/150',
              intro: 'Product leader focused on user-centric design and agile methodologies.',
              skills: ['Product Strategy', 'Agile', 'User Research'],
              joinDate: '2022-06-01',
              status: 'published',
              created_at: new Date().toISOString(),
              featured: false
            }
          }
        ];
        
        // Apply filters
        if (filters?.currentOnly) {
          mockEmployees = mockEmployees.filter(emp => emp.is_current);
        }
        if (filters?.department) {
          mockEmployees = mockEmployees.filter(emp => emp.department === filters.department);
        }
        
        return mockEmployees;
      } catch (error) {
        console.error(`Error fetching employees for company ID ${companyId}:`, error);
        return [];
      }
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  });
}
