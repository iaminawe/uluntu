import { supabase, handleSupabaseError } from './supabaseUtils';
import {
  adaptCompanyFromSupabase,
  adaptCompanyToSupabase,
  adaptListFromSupabase
} from '../adapters/dataAdapters';

// TODO: Consider importing specific Supabase row types for 'data' variables
// e.g., import { Tables } from '../types/supabase';
// type CompanyTableRow = Tables<'companies'>;

// Define the input type for company data passed from the application
export interface CompanyInput {
  name: string;
  description: string;
  logo: string;
  coverImage?: string | null; // Maps to Supabase 'cover_image'
  industry: string[];
  size: string;
  founded: string; // Year as string, maps to Supabase 'founded'
  location: string;
  website?: string | null;
  status?: string; // e.g., 'published', 'draft', maps to Supabase 'status'
  featured?: boolean | null; // maps to Supabase 'featured'
}

export const companiesApi = {
  async getAll(filters?: { search?: string; industries?: string[] }) {
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
      if (error) handleSupabaseError(error);

      // Filter by industries if provided
      let filteredData = data || [];
      if (filters?.industries && filters.industries.length > 0) {
        filteredData = filteredData.filter(company => 
          filters.industries!.some(industry => 
            company.industry?.includes(industry)
          )
        );
      }

      return adaptListFromSupabase(filteredData, adaptCompanyFromSupabase);
    } catch (error) {
      handleSupabaseError(error);
      // return [];
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select(`*`)
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (error) handleSupabaseError(error);
      return data ? adaptCompanyFromSupabase(data) : null;
    } catch (error) {
      handleSupabaseError(error);
      // return null;
    }
  },

  async create(companyData: CompanyInput) { // Input is App-specific, adapted to Supabase Insert type
    try {
      const supabaseData = adaptCompanyToSupabase(companyData);
      const { data, error } = await supabase
        .from('companies')
        .insert(supabaseData)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data ? adaptCompanyFromSupabase(data) : null;
    } catch (error) {
      handleSupabaseError(error);
      // return null;
    }
  },

  async update(id: string, companyData: Partial<CompanyInput>) { // Input is App-specific, adapted to Supabase Update type
    try {
      const supabaseData = adaptCompanyToSupabase(companyData);
      const { data, error } = await supabase
        .from('companies')
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data ? adaptCompanyFromSupabase(data) : null;
    } catch (error) {
      handleSupabaseError(error);
      // return null;
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) handleSupabaseError(error);
      return !error; // Return true if no error, false otherwise
    } catch (error) {
      handleSupabaseError(error);
      return false;
    }
  }
};
