import { supabase, handleSupabaseError } from './supabaseUtils';
import {
  adaptCompanyFromDatabase,
  adaptCompanyToSupabaseInsert,
  adaptCompanyToSupabaseUpdate
} from '../adapters/companyAdapter';
import { Company } from '../types';

// Helper function to adapt a list of items
function adaptItemsList<T, R>(items: T[], adapter: (item: T) => R): R[] {
  return items.map(item => adapter(item));
}

import { ContentStatus } from '../types/common';

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
      let query = supabase
        .from('companies')
        .select(`*`)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) {
        handleSupabaseError(error, 'fetching companies');
        return [];
      }

      // Filter by industries if provided
      let filteredData = data || [];
      if (filters?.industries && filters.industries.length > 0) {
        filteredData = filteredData.filter(company => 
          filters.industries!.some(industry => 
            company.industry?.includes(industry)
          )
        );
      }

      return adaptItemsList(filteredData, adaptCompanyFromDatabase);
    } catch (error) {
      handleSupabaseError(error, 'fetching companies');
      return [];
    }
  },

  async getById(id: string): Promise<Company | null> {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select(`*`)
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (error) {
        handleSupabaseError(error, 'fetching company by id');
        return null;
      }
      
      return data ? adaptCompanyFromDatabase(data) : null;
    } catch (error) {
      handleSupabaseError(error, 'fetching company by id');
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
  }
};
