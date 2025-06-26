import { useQuery, UseQueryResult, useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query';

// Mock data imports are handled dynamically in query functions
import { Company as GlobalCompany, CompanyEmployee } from '../types';

// Supabase API services
import { companiesApi, CompanyInput } from '@/features/companies/api/companiesApi';
import { Company as FeatureCompany } from '@/features/companies/types/index';
import { IS_SUPABASE_ENABLED } from '@/config/env';

// Type adapter to convert between feature and global Company types
function adaptFeatureCompanyToGlobal(featureCompany: FeatureCompany): GlobalCompany {
  return {
    id: featureCompany.id,
    name: featureCompany.name,
    description: featureCompany.description,
    logo: featureCompany.logo,
    slug: featureCompany.slug,
    website: featureCompany.website || undefined,
    location: featureCompany.location,
    founded: featureCompany.founded,
    size: featureCompany.size,
    industry: featureCompany.industry,
    status: featureCompany.status as any,
    featured: featureCompany.featured || false,
    coverImage: featureCompany.cover_image || undefined,
    created_at: featureCompany.created_at || new Date().toISOString(),
    employees: [] // Add default empty array for compatibility
  };
}

// Toggle between Supabase and mock data
const USE_SUPABASE = IS_SUPABASE_ENABLED;

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
export function useCompanies(): UseQueryResult<GlobalCompany[], Error> {
  return useQuery<GlobalCompany[], Error>({
    queryKey: ['companies', 'all', USE_SUPABASE ? 'supabase' : 'mock'],
    queryFn: async (): Promise<GlobalCompany[]> => {
      if (!USE_SUPABASE) {
        // Import mock data directly instead of using hooks
        const { companies: mockCompanies } = await import('../data/mock/companies');
        return mockCompanies;
      }
      const companies = await companiesApi.getAll();
      return companies.map(adaptFeatureCompanyToGlobal);
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
export function useCompaniesWithFilters(filters?: CompanyFilters): UseQueryResult<GlobalCompany[], Error> {
  return useQuery<GlobalCompany[], Error>({
    queryKey: ['companies', 'filters', filters, USE_SUPABASE ? 'supabase' : 'mock'],
    queryFn: async (): Promise<GlobalCompany[]> => {
      if (!USE_SUPABASE) {
        // Import mock data directly and apply filters
        const { companies: mockCompanies } = await import('../data/mock/companies');
        let filteredCompanies = [...mockCompanies];
        
        // Apply search filter
        if (filters?.search) {
          const searchLower = filters.search.toLowerCase();
          filteredCompanies = filteredCompanies.filter(company => 
            company.name.toLowerCase().includes(searchLower) ||
            company.description.toLowerCase().includes(searchLower)
          );
        }
        
        // Apply industry filter
        if (filters?.industries && filters.industries.length > 0) {
          filteredCompanies = filteredCompanies.filter(company =>
            filters.industries!.some(industry => 
              company.industry.includes(industry)
            )
          );
        }
        
        return filteredCompanies;
      }
      const companies = await companiesApi.getAll(filters);
      return companies.map(adaptFeatureCompanyToGlobal);
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
export function useCompany(id?: string): UseQueryResult<GlobalCompany | null, Error> {
  return useQuery<GlobalCompany | null, Error>({
    queryKey: ['companies', id, USE_SUPABASE ? 'supabase' : 'mock'],
    queryFn: async (): Promise<GlobalCompany | null> => {
      if (!id) {
        return null;
      }

      if (!USE_SUPABASE) {
        // Import mock data directly
        const { companies: mockCompanies } = await import('../data/mock/companies');
        const company = mockCompanies.find(c => c.id === id);
        return company || null;
      }

      try {
        const company = await companiesApi.getById(id);
        return company ? adaptFeatureCompanyToGlobal(company) : null;
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
 * Custom hook to fetch a single company by its slug.
 * Supports fetching from Supabase or mock data based on the VITE_USE_SUPABASE environment variable.
 * The hook is disabled if the slug is not provided.
 *
 * @param slug - The slug of the company to fetch.
 * @returns A UseQueryResult object from Tanstack Query containing the company data or null if not found, or an error.
 */
export function useCompanyBySlug(slug?: string): UseQueryResult<GlobalCompany | null, Error> {
  return useQuery<GlobalCompany | null, Error>({
    queryKey: ['companies', 'slug', slug, USE_SUPABASE ? 'supabase' : 'mock'],
    queryFn: async (): Promise<GlobalCompany | null> => {
      if (!slug) {
        return null;
      }

      if (!USE_SUPABASE) {
        // Import mock data directly
        const { companies: mockCompanies } = await import('../data/mock/companies');
        const company = mockCompanies.find(c => 
          c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') === slug
        );
        return company || null;
      }

      try {
        const company = await companiesApi.getBySlug(slug);
        return company ? adaptFeatureCompanyToGlobal(company) : null;
      } catch (error) {
        console.error(`Error fetching company with slug ${slug}:`, error);
        return null;
      }
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Custom hook to fetch a single company by either ID or slug.
 * Automatically detects whether the parameter is an ID (UUID) or a slug.
 * Supports fetching from Supabase or mock data based on the VITE_USE_SUPABASE environment variable.
 * The hook is disabled if the parameter is not provided.
 *
 * @param idOrSlug - The ID or slug of the company to fetch.
 * @returns A UseQueryResult object from Tanstack Query containing the company data or null if not found, or an error.
 */
export function useCompanyByIdOrSlug(idOrSlug?: string): UseQueryResult<GlobalCompany | null, Error> {
  console.log('[useCompanyByIdOrSlug] Called with:', idOrSlug);
  return useQuery<GlobalCompany | null, Error>({
    queryKey: ['companies', 'id-or-slug', idOrSlug, USE_SUPABASE ? 'supabase' : 'mock'],
    queryFn: async (): Promise<GlobalCompany | null> => {
      console.log('[useCompanyByIdOrSlug queryFn] idOrSlug:', idOrSlug);
      if (!idOrSlug) {
        console.log('[useCompanyByIdOrSlug queryFn] No idOrSlug provided, returning null');
        return null;
      }

      if (!USE_SUPABASE) {
        console.log('[useCompanyByIdOrSlug queryFn] Using mock data');
        // For mock data, directly access the mock companies array
        const { companies: mockCompanies } = await import('../data/mock/companies');
        
        // Try ID first
        const companyById = mockCompanies.find(c => c.id === idOrSlug);
        if (companyById) {
          console.log('[useCompanyByIdOrSlug queryFn] Found company by ID:', companyById);
          return companyById;
        }
        
        // Try as slug
        const companyBySlug = mockCompanies.find(c => 
          c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') === idOrSlug
        );
        if (companyBySlug) {
          console.log('[useCompanyByIdOrSlug queryFn] Found company by slug:', companyBySlug);
          return companyBySlug;
        }
        
        console.log('[useCompanyByIdOrSlug queryFn] No company found in mock data');
        return null;
      }

      try {
        console.log('[useCompanyByIdOrSlug queryFn] Calling companiesApi.getByIdOrSlug');
        const company = await companiesApi.getByIdOrSlug(idOrSlug);
        console.log('[useCompanyByIdOrSlug queryFn] API returned:', company);
        const result = company ? adaptFeatureCompanyToGlobal(company) : null;
        console.log('[useCompanyByIdOrSlug queryFn] Adapted result:', result);
        return result;
      } catch (error) {
        console.error(`[useCompanyByIdOrSlug queryFn] Error fetching company with ID or slug ${idOrSlug}:`, error);
        return null;
      }
    },
    enabled: !!idOrSlug,
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
export function useCreateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (companyData: CompanyInput) => {
      if (!USE_SUPABASE) {
        // Create a mock company with the data provided
        const newCompany: GlobalCompany = {
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
export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CompanyInput> }) => {
      if (!USE_SUPABASE) {
        // Import mock data directly
        const { companies: mockCompanies } = await import('../data/mock/companies');
        const currentCompany = mockCompanies.find(c => c.id === id);

        if (!currentCompany) {
          return null;
        }

        // Create an updated version of the company with the new data
        const updatedCompany: GlobalCompany = {
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
export function useAddCompanyEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ companyId, memberId, employeeData }: {
      companyId: string;
      memberId: string;
      employeeData?: Partial<CompanyEmployee>;
    }) => {
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
export function useUpdateCompanyEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ employeeId, updates }: {
      employeeId: string;
      updates: Partial<CompanyEmployee>;
    }) => {
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
      
      // Note: API expects (companyId, memberId, updates) but we only have employeeId
      // This needs to be fixed in the API or we need to restructure this call
      return companiesApi.updateCompanyEmployee(
        updates.company_id || 'unknown', 
        updates.member_id || 'unknown', 
        updates
      );
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
      
      // Note: API expects (companyId, memberId) but we only have employeeId
      // This is a design issue that needs to be addressed
      throw new Error('Cannot remove employee with only employeeId - API requires companyId and memberId');
    },
    onSuccess: () => {
      // Invalidate all company employee queries since we don't have companyId
      queryClient.invalidateQueries({ 
        queryKey: ['company'] 
      });
    }
  });
}

export function useCompanyEmployees(companyId?: string, filters?: { department?: string; currentOnly?: boolean }) {
  return useQuery({
    queryKey: ['company', companyId, 'employees', filters, USE_SUPABASE ? 'supabase' : 'mock'],
    queryFn: async (): Promise<CompanyEmployee[]> => {
      if (!companyId) {
        return [];
      }

      if (USE_SUPABASE) {
        const employees = await companiesApi.getCompanyEmployees(companyId, filters);
        return employees as CompanyEmployee[];
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
