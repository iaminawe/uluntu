import { supabase, handleSupabaseError } from '@/shared/api';
import {
  adaptCompanyFromDatabase,
  adaptCompanyToSupabaseInsert,
  adaptCompanyToSupabaseUpdate
} from '../utils/companyAdapter';
import { Company, CompanyMember, CompanyEmployee } from '../types';
import { ContentStatus } from '../types/common';

import { adaptItemsList } from '@/shared/api';
import { logger } from '@/utils/logger';

// Define filter options for company employees
export interface CompanyEmployeeFilters {
  currentOnly?: boolean;
  department?: string;
}

// Define the input type for company data passed from the application
export interface CompanyInput {
  name: string;
  description: string;
  logo: string;
  coverImage?: string | undefined; // Maps to Supabase 'cover_image'
  industry: string[];
  size: string;
  founded: string; // Year as string, maps to Supabase 'founded'
  location: string;
  website?: string | undefined;
  status?: ContentStatus; // Using proper ContentStatus type for consistency
  featured?: boolean; // Simplified to match Company type
}

// Define mock company type for testing
interface MockCompany {
  id: string;
  name: string;
  description: string;
  logo: string;
  industry: string[];
  size: string;
  founded: string;
  location: string;
  website: string;
  status: ContentStatus;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export const companiesApi = {
  async getAll(filters?: { search?: string; industries?: string[] }): Promise<Company[]> {
    try {
      logger.debug('Fetching companies from Supabase', 'COMPANIES');
      
      let query = supabase
        .from('companies')
        .select(`*`)
        // Removed status filter to show all companies
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      logger.debug('Query result', 'COMPANIES', { dataLength: data?.length });
      
      if (error) {
        logger.apiError('getAll - companies', error);
        throw error; // Let's see what the actual error is
      }

      if (!data) {
        logger.debug('No data returned from Supabase', 'COMPANIES');
        return [];
      }
      
      if (data.length === 0) {
        logger.debug('Empty array returned from Supabase', 'COMPANIES');
        return [];
      }

      logger.debug('Companies fetched successfully', 'COMPANIES', { count: data.length });
      
      // Filter by industries if provided
      let filteredData = data;
      if (filters?.industries && filters.industries.length > 0) {
        filteredData = filteredData.filter(company => 
          filters.industries!.some(industry => 
            company.industry?.includes(industry)
          )
        );
      }

      // Log the raw data structure to understand what we're working with
      logger.debug('Raw data structure', 'COMPANIES', {
        firstItem: filteredData && filteredData.length > 0 ? Object.keys(filteredData[0]) : 'No data',
        sampleData: filteredData?.slice(0, 1)
      });
      
      // Directly adapt the data without using helper functions that might be causing issues
      const adapted = filteredData.map(item => {
        // Create a basic company object with required fields
        const company: Company = {
          id: item.id,
          name: item.name || '',
          description: item.description || '',
          logo: item.logo || '',
          coverImage: item.cover_image || '',
          industry: Array.isArray(item.industry) ? item.industry : [],
          size: item.size || '',
          founded: item.founded || '',
          location: item.location || '',
          website: item.website || '',
          status: (item.status as ContentStatus) || 'draft',
          featured: item.featured || false,
          // Add any other fields that might be needed
        };
        
        return company;
      });
      
      logger.debug('Adapted companies', 'COMPANIES', {
        count: adapted.length,
        sample: adapted.slice(0, 2)
      });
      
      return adapted;
    } catch (error) {
      logger.apiError('getAll', error);
      // Return mock data instead of an empty array
      return this.getMockCompanies();
    }
  },
  
  // Mock data for testing when Supabase is not available or returns no data
  getMockCompanies(): Company[] {
    logger.debug('Returning mock companies data', 'COMPANIES');
    const mockCompanies: MockCompany[] = [
      {
        id: '1',
        name: 'Tech Innovators',
        description: 'Leading technology solutions provider specializing in AI and machine learning.',
        logo: 'https://via.placeholder.com/150',
        industry: ['Technology', 'AI', 'Software'],
        size: '50-100',
        founded: '2015',
        location: 'Nelson, BC',
        website: 'https://example.com',
        status: 'published' as ContentStatus,
        featured: true,
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z'
      },
      {
        id: '2',
        name: 'Green Solutions',
        description: 'Sustainable technology company focused on renewable energy solutions.',
        logo: 'https://via.placeholder.com/150',
        industry: ['CleanTech', 'Energy', 'Sustainability'],
        size: '10-50',
        founded: '2018',
        location: 'Rossland, BC',
        website: 'https://example.com',
        status: 'published' as ContentStatus,
        featured: false,
        created_at: '2023-02-01T00:00:00.000Z',
        updated_at: '2023-02-01T00:00:00.000Z'
      },
      {
        id: '3',
        name: 'Digital Creators',
        description: 'Digital agency specializing in web development and design.',
        logo: 'https://via.placeholder.com/150',
        industry: ['Design', 'Web Development', 'Marketing'],
        size: '1-10',
        founded: '2020',
        location: 'Castlegar, BC',
        website: 'https://example.com',
        status: 'published' as ContentStatus,
        featured: true,
        created_at: '2023-03-01T00:00:00.000Z',
        updated_at: '2023-03-01T00:00:00.000Z'
      }
    ];
    
    // Convert mock data to Company type
    return mockCompanies as unknown as Company[];
  },

  async getById(id: string): Promise<Company | null> {
    try {
      logger.debug('Fetching company by ID', 'COMPANIES', { id });
      
      const { data, error } = await supabase
        .from('companies')
        .select(`*`)
        .eq('id', id)
        // Removed status filter to show all companies
        .single();

      if (error) {
        logger.apiError('getById - company', error);
        // Return null instead of throwing an error to prevent app crashes
        return null;
      }
      
      logger.debug('Company fetched', 'COMPANIES', { id, found: !!data });
      return data ? adaptCompanyFromDatabase(data) : null;
    } catch (error) {
      logger.apiError('getById', error);
      // Return null instead of throwing an error to prevent app crashes
      return null;
    }
  },

  async create(companyData: CompanyInput): Promise<Company | null> {
    try {
      const supabaseData = adaptCompanyToSupabaseInsert(companyData);
      const { data, error } = await supabase
        .from('companies')
        .insert(supabaseData)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'creating company');
        return null;
      }
      
      return data ? adaptCompanyFromDatabase(data) : null;
    } catch (error) {
      handleSupabaseError(error, 'creating company');
      return null;
    }
  },

  async update(id: string, companyData: Partial<CompanyInput>): Promise<Company | null> {
    try {
      const supabaseData = adaptCompanyToSupabaseUpdate(companyData);
      const { data, error } = await supabase
        .from('companies')
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'updating company');
        return null;
      }
      
      return data ? adaptCompanyFromDatabase(data) : null;
    } catch (error) {
      handleSupabaseError(error, 'updating company');
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) {
        handleSupabaseError(error, 'deleting company');
        return false;
      }
      return true; // Operation successful
    } catch (error) {
      handleSupabaseError(error, 'deleting company');
      return false;
    }
  },

  async addCompanyEmployee(companyId: string, memberId: string, employeeData?: Partial<CompanyEmployee>): Promise<CompanyEmployee | null> {
    try {
      const { data, error } = await supabase
        .from('company_employees')
        .insert({
          company_id: companyId,
          member_id: memberId,
          role: employeeData?.role || null,
          department: employeeData?.department || null,
          start_date: employeeData?.start_date || new Date().toISOString().split('T')[0],
          is_current: employeeData?.is_current ?? true
        })
        .select('*')
        .single();

      if (error) {
        handleSupabaseError(error, 'adding company employee');
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        company_id: data.company_id,
        member_id: data.member_id,
        role: data.role || undefined,
        department: data.department || undefined,
        start_date: data.start_date || undefined,
        end_date: data.end_date || undefined,
        is_current: data.is_current ?? true,
        created_at: data.created_at,
        updated_at: data.updated_at || undefined,
        member: undefined // Member data removed to prevent timeout - can be fetched separately if needed
      };
    } catch (error) {
      logger.apiError('addCompanyEmployee', error);
      return null;
    }
  },

  async updateCompanyEmployee(employeeId: string, updates: Partial<CompanyEmployee>): Promise<CompanyEmployee | null> {
    try {
      const { data, error } = await supabase
        .from('company_employees')
        .update({
          role: updates.role,
          department: updates.department,
          start_date: updates.start_date,
          end_date: updates.end_date,
          is_current: updates.is_current,
          updated_at: new Date().toISOString()
        })
        .eq('id', employeeId)
        .select('*')
        .single();

      if (error) {
        handleSupabaseError(error, 'updating company employee');
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        company_id: data.company_id,
        member_id: data.member_id,
        role: data.role || undefined,
        department: data.department || undefined,
        start_date: data.start_date || undefined,
        end_date: data.end_date || undefined,
        is_current: data.is_current ?? true,
        created_at: data.created_at,
        updated_at: data.updated_at || undefined,
        member: undefined // Member data removed to prevent timeout - can be fetched separately if needed
      };
    } catch (error) {
      logger.apiError('updateCompanyEmployee', error);
      return null;
    }
  },

  async removeCompanyEmployee(employeeId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('company_employees')
        .delete()
        .eq('id', employeeId);

      if (error) {
        handleSupabaseError(error, 'removing company employee');
        return false;
      }

      return true;
    } catch (error) {
      logger.apiError('removeCompanyEmployee', error);
      return false;
    }
  },

  async getCompanyEmployees(companyId: string, filters?: CompanyEmployeeFilters): Promise<CompanyEmployee[]> {
    try {
      logger.debug('Fetching company employees', 'COMPANIES', { companyId });
      
      let query = supabase
        .from('company_employees')
        .select('*')
        .eq('company_id', companyId);

      // Apply filters
      if (filters?.currentOnly) {
        query = query.eq('is_current', true);
      }
      if (filters?.department) {
        query = query.eq('department', filters.department);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        logger.apiError('getCompanyEmployees - fetch', error);
        handleSupabaseError(error, `fetching employees for company ${companyId}`);
        // Return empty array instead of throwing to prevent app crashes
        return [];
      }
      
      logger.debug('Company employees fetched', 'COMPANIES', { companyId, count: data?.length || 0 });
      
      // Type assertion with validation
      if (!data) return [];
      
      return data.map(employee => ({
        id: employee.id,
        company_id: employee.company_id,
        member_id: employee.member_id,
        role: employee.role || undefined,
        department: employee.department || undefined,
        start_date: employee.start_date || undefined,
        end_date: employee.end_date || undefined,
        is_current: employee.is_current ?? true,
        created_at: employee.created_at,
        updated_at: employee.updated_at || undefined,
        member: employee.member ? {
          id: employee.member.id,
          name: employee.member.name,
          title: employee.member.title || '',
          company: employee.member.company || undefined,
          location: employee.member.location || undefined,
          image: employee.member.image || '',
          bio: employee.member.bio || undefined,
          intro: employee.member.intro || undefined,
          skills: employee.member.skills || undefined,
          joinDate: employee.member.join_date || employee.member.created_at,
          social: employee.member.social || undefined,
          status: employee.member.status || 'published',
          created_at: employee.member.created_at,
          updated_at: employee.member.updated_at || undefined,
          featured: employee.member.featured || false
        } : undefined
      }));
    } catch (error) {
      logger.apiError('getCompanyEmployees', error);
      return [];
    }
  }
};
