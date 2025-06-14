import { supabase, handleSupabaseError } from './supabaseUtils';
import {
  adaptCompanyFromDatabase,
  adaptCompanyToSupabaseInsert,
  adaptCompanyToSupabaseUpdate
} from '@/adapters/companyAdapter';
import { Company, CompanyMember, CompanyEmployee } from '../types';
import { ContentStatus } from '../types/common';

// Helper function to adapt a list of items
function adaptItemsList<T, R>(items: T[], adapter: (item: T) => R): R[] {
  return items.map(item => adapter(item));
}

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
      console.log('Fetching companies from Supabase...');
      
      let query = supabase
        .from('companies')
        .select(`*`)
        // Removed status filter to show all companies
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Supabase error fetching companies:', error);
        // Return mock data instead of an empty array
        return this.getMockCompanies();
      }

      if (!data || data.length === 0) {
        console.log('No companies found in Supabase, returning mock data');
        return this.getMockCompanies();
      }

      console.log('Companies fetched successfully:', data.length, 'companies found');
      
      // Filter by industries if provided
      let filteredData = data;
      if (filters?.industries && filters.industries.length > 0) {
        filteredData = filteredData.filter(company => 
          filters.industries!.some(industry => 
            company.industry?.includes(industry)
          )
        );
      }

      return adaptItemsList(filteredData, adaptCompanyFromDatabase);
    } catch (error) {
      console.error('Error in companiesApi.getAll:', error);
      // Return mock data instead of an empty array
      return this.getMockCompanies();
    }
  },
  
  // Mock data for testing when Supabase is not available or returns no data
  getMockCompanies(): Company[] {
    console.log('Returning mock companies data');
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
      console.log(`Fetching company with ID: ${id}...`);
      
      const { data, error } = await supabase
        .from('companies')
        .select(`*`)
        .eq('id', id)
        // Removed status filter to show all companies
        .single();

      if (error) {
        console.error(`Supabase error fetching company with ID ${id}:`, error);
        // Return null instead of throwing an error to prevent app crashes
        return null;
      }
      
      console.log(`Company with ID ${id} fetched successfully:`, data ? 'found' : 'not found');
      return data ? adaptCompanyFromDatabase(data) : null;
    } catch (error) {
      console.error(`Error in companiesApi.getById for ID ${id}:`, error);
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
        .select(`
          *,
          member:members(*)
        `)
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
        member: data.member ? {
          id: data.member.id,
          name: data.member.name,
          title: data.member.title || '',
          company: data.member.company || undefined,
          location: data.member.location || undefined,
          image: data.member.image || '',
          bio: data.member.bio || undefined,
          intro: data.member.intro || undefined,
          skills: data.member.skills || undefined,
          joinDate: data.member.join_date || data.member.created_at,
          social: data.member.social || undefined,
          status: data.member.status || 'published',
          created_at: data.member.created_at,
          updated_at: data.member.updated_at || undefined,
          featured: data.member.featured || false
        } : undefined
      };
    } catch (error) {
      console.error('Error adding company employee:', error);
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
        .select(`
          *,
          member:members(*)
        `)
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
        member: data.member ? {
          id: data.member.id,
          name: data.member.name,
          title: data.member.title || '',
          company: data.member.company || undefined,
          location: data.member.location || undefined,
          image: data.member.image || '',
          bio: data.member.bio || undefined,
          intro: data.member.intro || undefined,
          skills: data.member.skills || undefined,
          joinDate: data.member.join_date || data.member.created_at,
          social: data.member.social || undefined,
          status: data.member.status || 'published',
          created_at: data.member.created_at,
          updated_at: data.member.updated_at || undefined,
          featured: data.member.featured || false
        } : undefined
      };
    } catch (error) {
      console.error('Error updating company employee:', error);
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
      console.error('Error removing company employee:', error);
      return false;
    }
  },

  async getCompanyEmployees(companyId: string, filters?: CompanyEmployeeFilters): Promise<CompanyEmployee[]> {
    try {
      console.log(`Fetching employees for company ID: ${companyId}...`);
      
      let query = supabase
        .from('company_employees')
        .select(`
          *,
          member:members(*)
        `)
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
        console.error(`Supabase error fetching employees for company ${companyId}:`, error);
        handleSupabaseError(error, `fetching employees for company ${companyId}`);
        // Return empty array instead of throwing to prevent app crashes
        return [];
      }
      
      console.log(`Employees for company ${companyId} fetched:`, data?.length || 0, 'employees found');
      
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
      console.error(`Error in companiesApi.getCompanyEmployees for company ${companyId}:`, error);
      return [];
    }
  }
};
