import { supabase, handleSupabaseError } from '@/api/supabaseUtils';
import {
  adaptOpportunityFromDatabase,
  adaptOpportunityToDatabase,
  adaptOpportunityInputToDatabase,
  adaptExtendedOpportunityFromDatabase,
  ExtendedOpportunity
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
  type?: 'job' | 'volunteer' | 'funding' | 'community' | null;
  organization?: string | null;
  location?: string | null;
  remote?: boolean | null;
  compensation?: string | null; // Maps to salary in some places, compensation in database
  deadline?: string | null;
  contactEmail?: string | null;
  website?: string | null;
  image?: string | null;
  requirements?: string[] | null;
  responsibilities?: string[] | null;
  benefits?: string[] | null;
  status?: 'draft' | 'published' | 'archived' | null;
  featured?: boolean | null;
  postedBy?: string | null; // Member ID who posted this opportunity
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

  async getExtendedById(id: string): Promise<ExtendedOpportunity | null> {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        handleSupabaseError(error, `fetching extended opportunity with id ${id}`);
        return null;
      }
      
      return data ? adaptExtendedOpportunityFromDatabase(data) : null;
    } catch (error) {
      handleSupabaseError(error, `fetching extended opportunity with id ${id}`);
      return null;
    }
  },

  async create(opportunityData: OpportunityInput): Promise<Opportunity | null> {
    try {
      const supabaseData = adaptOpportunityInputToDatabase(opportunityData);
      
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
      // For updates, we need to only include fields that are actually being updated
      const updateData: any = {};
      
      if (opportunityData.title !== undefined) updateData.title = opportunityData.title;
      if (opportunityData.description !== undefined) updateData.description = opportunityData.description;
      if (opportunityData.type !== undefined) updateData.type = opportunityData.type;
      if (opportunityData.organization !== undefined) updateData.organization = opportunityData.organization;
      if (opportunityData.location !== undefined) updateData.location = opportunityData.location;
      if (opportunityData.remote !== undefined) updateData.remote = opportunityData.remote;
      if (opportunityData.compensation !== undefined) updateData.compensation = opportunityData.compensation;
      if (opportunityData.deadline !== undefined) updateData.deadline = opportunityData.deadline;
      if (opportunityData.contactEmail !== undefined) updateData.contact_email = opportunityData.contactEmail;
      if (opportunityData.website !== undefined) updateData.website = opportunityData.website;
      if (opportunityData.image !== undefined) updateData.image = opportunityData.image;
      if (opportunityData.requirements !== undefined) updateData.requirements = opportunityData.requirements;
      if (opportunityData.responsibilities !== undefined) updateData.responsibilities = opportunityData.responsibilities;
      if (opportunityData.benefits !== undefined) updateData.benefits = opportunityData.benefits;
      if (opportunityData.status !== undefined) updateData.status = opportunityData.status;
      if (opportunityData.featured !== undefined) updateData.featured = opportunityData.featured;
      if (opportunityData.postedBy !== undefined) updateData.posted_by = opportunityData.postedBy;
      
      const { data, error } = await supabase
        .from('opportunities')
        .update(updateData)
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
