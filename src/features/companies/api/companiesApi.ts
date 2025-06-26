import { supabase, handleSupabaseError } from '@/shared/api';
import {
  adaptCompanyFromDatabase,
  adaptCompanyToSupabaseInsert,
  adaptCompanyToSupabaseUpdate
} from '../utils/companyAdapter';
import { Company, CompanyMember, CompanyEmployee } from '../types';
import { ContentStatus } from '../types/common';
import { parseCompanyParam } from '../utils/slugUtils';

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
          slug: item.slug || undefined, // Include slug field
          cover_image: item.cover_image || '',
          industry: Array.isArray(item.industry) ? item.industry : [],
          size: item.size || '',
          founded: item.founded || '',
          location: item.location || '',
          website: item.website || '',
          status: (item.status as ContentStatus) || 'draft',
          featured: item.featured || false,
          created_at: item.created_at || null,
          social: (item.social as any) || null
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
    const mockCompanies: Company[] = [
      {
        id: '1',
        name: 'Tech Innovators',
        slug: 'tech-innovators',
        description: 'Leading technology solutions provider specializing in AI and machine learning.',
        logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=200&fit=crop&q=80',
        cover_image: 'https://images.unsplash.com/photo-1497366754035-f200581a8e4a?w=1200&h=600&fit=crop&q=80',
        industry: ['Technology', 'AI', 'Software'],
        size: '50-100',
        founded: '2015',
        location: 'Nelson, BC',
        website: 'https://example.com',
        status: 'published' as ContentStatus,
        featured: true,
        created_at: '2023-01-01T00:00:00.000Z'
      },
      {
        id: '2',
        name: 'Green Solutions',
        slug: 'green-solutions',
        description: 'Sustainable technology company focused on renewable energy solutions.',
        logo: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=200&h=200&fit=crop&q=80',
        cover_image: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=1200&h=600&fit=crop&q=80',
        industry: ['CleanTech', 'Energy', 'Sustainability'],
        size: '10-50',
        founded: '2018',
        location: 'Rossland, BC',
        website: 'https://example.com',
        status: 'published' as ContentStatus,
        featured: false,
        created_at: '2023-02-01T00:00:00.000Z'
      },
      {
        id: '3',
        name: 'Digital Creators',
        slug: 'digital-creators',
        description: 'Digital agency specializing in web development and design.',
        logo: 'https://images.unsplash.com/photo-1567446537708-ac4aa75c9c28?w=200&h=200&fit=crop&q=80',
        cover_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop&q=80',
        industry: ['Design', 'Web Development', 'Marketing'],
        size: '1-10',
        founded: '2020',
        location: 'Castlegar, BC',
        website: 'https://example.com',
        status: 'published' as ContentStatus,
        featured: true,
        created_at: '2023-03-01T00:00:00.000Z'
      }
    ];
    
    return mockCompanies;
  },

  async getById(id: string): Promise<Company | null> {
    try {
      console.log('[companiesApi.getById] Fetching company with ID:', id);
      logger.debug('Fetching company by ID', 'COMPANIES', { id });
      
      const { data, error } = await supabase
        .from('companies')
        .select(`*`)
        .eq('id', id)
        // Removed status filter to show all companies
        .single();

      console.log('[companiesApi.getById] Supabase response:', { data, error });

      if (error) {
        console.error('[companiesApi.getById] Supabase error:', error);
        logger.apiError('getById - company', error);
        // Return null instead of throwing an error to prevent app crashes
        return null;
      }
      
      logger.debug('Company fetched', 'COMPANIES', { id, found: !!data });
      const result = data ? adaptCompanyFromDatabase(data) : null;
      console.log('[companiesApi.getById] Adapted result:', result);
      return result;
    } catch (error) {
      console.error('[companiesApi.getById] Catch error:', error);
      logger.apiError('getById', error);
      // Return null instead of throwing an error to prevent app crashes
      return null;
    }
  },

  async getBySlug(slug: string): Promise<Company | null> {
    try {
      logger.debug('Fetching company by slug', 'COMPANIES', { slug });
      
      const { data, error } = await supabase
        .from('companies')
        .select(`*`)
        .eq('slug', slug)
        .single();

      if (error) {
        logger.apiError('getBySlug - company', error);
        return null;
      }
      
      logger.debug('Company fetched by slug', 'COMPANIES', { slug, found: !!data });
      return data ? adaptCompanyFromDatabase(data) : null;
    } catch (error) {
      logger.apiError('getBySlug', error);
      return null;
    }
  },

  async getByIdOrSlug(idOrSlug: string): Promise<Company | null> {
    try {
      console.log('[companiesApi.getByIdOrSlug] Called with:', idOrSlug);
      const { type, value } = parseCompanyParam(idOrSlug);
      console.log('[companiesApi.getByIdOrSlug] Parsed as:', { type, value });
      
      if (type === 'id') {
        const result = await this.getById(value);
        console.log('[companiesApi.getByIdOrSlug] getById result:', result);
        return result;
      } else {
        const result = await this.getBySlug(value);
        console.log('[companiesApi.getByIdOrSlug] getBySlug result:', result);
        return result;
      }
    } catch (error) {
      console.error('[companiesApi.getByIdOrSlug] Error:', error);
      logger.apiError('getByIdOrSlug', error);
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
        .from('company_members')
        .insert({
          company_id: companyId,
          member_id: memberId,
          role: employeeData?.role || null,
          joined_date: new Date().toISOString()
        })
        .select('*')
        .single();

      if (error) {
        handleSupabaseError(error, 'adding company employee');
        return null;
      }

      if (!data) return null;

      return {
        company_id: data.company_id,
        member_id: data.member_id,
        role: data.role,
        joined_date: data.joined_date,
        member: undefined
      };
    } catch (error) {
      logger.apiError('addCompanyEmployee', error);
      return null;
    }
  },

  async updateCompanyEmployee(companyId: string, memberId: string, updates: Partial<CompanyEmployee>): Promise<CompanyEmployee | null> {
    try {
      const { data, error } = await supabase
        .from('company_members')
        .update({
          role: updates.role
        })
        .eq('company_id', companyId)
        .eq('member_id', memberId)
        .select('*')
        .single();

      if (error) {
        handleSupabaseError(error, 'updating company employee');
        return null;
      }

      if (!data) return null;

      return {
        company_id: data.company_id,
        member_id: data.member_id,
        role: data.role,
        joined_date: data.joined_date,
        member: undefined
      };
    } catch (error) {
      logger.apiError('updateCompanyEmployee', error);
      return null;
    }
  },

  async removeCompanyEmployee(companyId: string, memberId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('company_members')
        .delete()
        .eq('company_id', companyId)
        .eq('member_id', memberId);

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
        .from('company_members')
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
        company_id: employee.company_id,
        member_id: employee.member_id,
        role: employee.role,
        joined_date: employee.joined_date,
        member: (employee as any).member ? {
          id: (employee as any).member.id,
          name: (employee as any).member.name,
          full_name: (employee as any).member.name,
          bio: (employee as any).member.bio,
          location: (employee as any).member.location,
          image: (employee as any).member.image,
          avatar_url: (employee as any).member.image
        } : undefined
      }));
    } catch (error) {
      logger.apiError('getCompanyEmployees', error);
      return [];
    }
  }
};
