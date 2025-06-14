import { supabase, handleSupabaseError } from '@/api/supabaseUtils';
import {
  adaptOpportunityFromDatabase,
  adaptOpportunityToDatabase
} from '../utils/opportunityAdapter';
import { Opportunity } from '../types';

// Helper function to adapt a list of items
function adaptItemsList<T, R>(items: T[], adapter: (item: T) => R): R[] {
  return items.map(item => adapter(item));
}

// Define the input type for opportunity data passed from the application
export interface OpportunityInput {
  title: string;
  description?: string | null;
  type?: 'full-time' | 'part-time' | 'contract' | 'volunteer' | null;
  location?: string | null;
  remote?: boolean | null;
  salary?: string | null;
  deadline?: string | null;
  company?: {
    id: string;
    name: string;
    logo: string; // Making logo required to match the Opportunity type
  } | null;
  status?: 'draft' | 'published' | 'archived' | null;
  featured?: boolean | null;
}

export const opportunitiesApi = {
  async getAll(filters?: { 
    search?: string; 
    type?: string[]; 
    remote?: boolean; 
    location?: string[] 
  }): Promise<Opportunity[]> {
    try {
      let query = supabase
        .from('opportunities')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      // Apply filters if provided
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
      }

      if (filters?.type && filters.type.length > 0) {
        query = query.in('type', filters.type);
      }

      if (filters?.remote !== undefined) {
        query = query.eq('remote', filters.remote);
      }

      if (filters?.location && filters.location.length > 0) {
        // Use 'ilike' for location search to allow for partial matches
        const locationConditions = filters.location.map(loc => `location.ilike.%${loc}%`);
        query = query.or(locationConditions.join(','));
      }

      const { data, error } = await query;

      if (error) {
        handleSupabaseError(error, 'fetching opportunities');
        return [];
      }
      
      return adaptItemsList(data || [], adaptOpportunityFromDatabase);
    } catch (error) {
      handleSupabaseError(error, 'fetching opportunities');
      return [];
    }
  },

  async getById(id: string): Promise<Opportunity | null> {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        handleSupabaseError(error, `fetching opportunity with id ${id}`);
        return null;
      }
      
      return data ? adaptOpportunityFromDatabase(data) : null;
    } catch (error) {
      handleSupabaseError(error, `fetching opportunity with id ${id}`);
      return null;
    }
  },

  async create(opportunityData: OpportunityInput): Promise<Opportunity | null> {
    try {
      // Map OpportunityInput to what adaptOpportunityToDatabase expects
      const opportunityWithCorrectFormat: Partial<Opportunity> = {
        title: opportunityData.title,
        description: opportunityData.description === null ? undefined : opportunityData.description,
        type: opportunityData.type === null ? undefined : opportunityData.type,
        location: opportunityData.location === null ? undefined : opportunityData.location,
        remote: opportunityData.remote === null ? undefined : opportunityData.remote,
        salary: opportunityData.salary === null ? undefined : opportunityData.salary,
        deadline: opportunityData.deadline === null ? undefined : opportunityData.deadline,
        company: opportunityData.company === null ? undefined : opportunityData.company,
        status: opportunityData.status === null ? undefined : opportunityData.status,
        featured: opportunityData.featured === null ? undefined : opportunityData.featured
      };
      
      const supabaseData = adaptOpportunityToDatabase(opportunityWithCorrectFormat);
      
      const { data, error } = await supabase
        .from('opportunities')
        .insert(supabaseData)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'creating opportunity');
        return null;
      }
      
      return data ? adaptOpportunityFromDatabase(data) : null;
    } catch (error) {
      handleSupabaseError(error, 'creating opportunity');
      return null;
    }
  },

  async update(id: string, opportunityData: Partial<OpportunityInput>): Promise<Opportunity | null> {
    try {
      // Map Partial<OpportunityInput> to what adaptOpportunityToDatabase expects
      const opportunityWithCorrectFormat: Partial<Opportunity> = {};
      
      if (opportunityData.title !== undefined) opportunityWithCorrectFormat.title = opportunityData.title === null ? '' : opportunityData.title;
      if (opportunityData.description !== undefined) opportunityWithCorrectFormat.description = opportunityData.description === null ? undefined : opportunityData.description;
      if (opportunityData.type !== undefined) opportunityWithCorrectFormat.type = opportunityData.type === null ? undefined : opportunityData.type;
      if (opportunityData.location !== undefined) opportunityWithCorrectFormat.location = opportunityData.location === null ? undefined : opportunityData.location;
      if (opportunityData.remote !== undefined) opportunityWithCorrectFormat.remote = opportunityData.remote === null ? undefined : opportunityData.remote;
      if (opportunityData.salary !== undefined) opportunityWithCorrectFormat.salary = opportunityData.salary === null ? undefined : opportunityData.salary;
      if (opportunityData.deadline !== undefined) opportunityWithCorrectFormat.deadline = opportunityData.deadline === null ? undefined : opportunityData.deadline;
      if (opportunityData.company !== undefined) opportunityWithCorrectFormat.company = opportunityData.company === null ? undefined : opportunityData.company;
      if (opportunityData.status !== undefined) opportunityWithCorrectFormat.status = opportunityData.status === null ? undefined : opportunityData.status;
      if (opportunityData.featured !== undefined) opportunityWithCorrectFormat.featured = opportunityData.featured === null ? undefined : opportunityData.featured;
      
      const supabaseData = adaptOpportunityToDatabase(opportunityWithCorrectFormat);
      
      const { data, error } = await supabase
        .from('opportunities')
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, `updating opportunity with id ${id}`);
        return null;
      }
      
      return data ? adaptOpportunityFromDatabase(data) : null;
    } catch (error) {
      handleSupabaseError(error, `updating opportunity with id ${id}`);
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id);

      if (error) {
        handleSupabaseError(error, `deleting opportunity with id ${id}`);
        return false;
      }
      return true;
    } catch (error) {
      handleSupabaseError(error, `deleting opportunity with id ${id}`);
      return false;
    }
  },

  async remove(id: string): Promise<boolean> {
    return this.delete(id);
  },

  async getFeatured(limit: number = 3): Promise<Opportunity[]> {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('status', 'published')
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        handleSupabaseError(error, 'fetching featured opportunities');
        return [];
      }
      
      return adaptItemsList(data || [], adaptOpportunityFromDatabase);
    } catch (error) {
      handleSupabaseError(error, 'fetching featured opportunities');
      return [];
    }
  },

  async getByCompany(companyId: string): Promise<Opportunity[]> {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('status', 'published')
        .eq('posted_by', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        handleSupabaseError(error, `fetching opportunities for company ${companyId}`);
        return [];
      }
      
      return adaptItemsList(data || [], adaptOpportunityFromDatabase);
    } catch (error) {
      handleSupabaseError(error, `fetching opportunities for company ${companyId}`);
      return [];
    }
  }
};
