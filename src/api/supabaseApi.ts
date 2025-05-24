import { supabase } from '../lib/supabase';
import { 
  adaptMemberFromSupabase, 
  adaptMemberToSupabase,
  adaptCompanyFromSupabase,
  adaptCompanyToSupabase,
  adaptEventFromSupabase,
  adaptEventToSupabase,
  adaptGroupFromSupabase,
  adaptGroupToSupabase,
  adaptResourceFromSupabase,
  adaptResourceToSupabase,
  adaptMarketplaceItemFromSupabase,
  adaptMarketplaceItemToSupabase,
  adaptOpportunityFromSupabase,
  adaptOpportunityToSupabase,
  adaptListFromSupabase
} from '../adapters/dataAdapters';

// Error handling utility
function handleSupabaseError(error: any): never {
  console.error('Supabase API Error:', error);
  throw new Error(error.message || 'An error occurred while fetching data');
}

// Members API
export const membersApi = {
  async getAll(filters?: { search?: string; skills?: string[] }) {
    try {
      let query = supabase
        .from('members')
        .select(`
          *,
          member_skills(skill),
          member_social_links(platform, url),
          company_members(
            companies(id, name, logo)
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,title.ilike.%${filters.search}%,bio.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) handleSupabaseError(error);

      // Filter by skills if provided
      let filteredData = data || [];
      if (filters?.skills && filters.skills.length > 0) {
        filteredData = filteredData.filter(member => 
          member.member_skills?.some((skill: any) => 
            filters.skills!.includes(skill.skill)
          )
        );
      }

      return adaptListFromSupabase(filteredData, adaptMemberFromSupabase);
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('members')
        .select(`
          *,
          member_skills(skill),
          member_social_links(platform, url),
          company_members(
            companies(id, name, logo)
          )
        `)
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (error) handleSupabaseError(error);
      return data ? adaptMemberFromSupabase(data) : null;
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async create(memberData: any) {
    try {
      const supabaseData = adaptMemberToSupabase(memberData);
      const { data, error } = await supabase
        .from('members')
        .insert(supabaseData)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data ? adaptMemberFromSupabase(data) : null;
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async update(id: string, memberData: any) {
    try {
      const supabaseData = adaptMemberToSupabase(memberData);
      const { data, error } = await supabase
        .from('members')
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data ? adaptMemberFromSupabase(data) : null;
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id);

      if (error) handleSupabaseError(error);
      return true;
    } catch (error) {
      handleSupabaseError(error);
    }
  }
};

// Companies API
export const companiesApi = {
  async getAll(filters?: { search?: string; industries?: string[] }) {
    try {
      let query = supabase
        .from('companies')
        .select(`
          *,
          company_members(
            members(id, name, title, image, bio)
          )
        `)
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
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select(`
          *,
          company_members(
            members(id, name, title, image, bio)
          )
        `)
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (error) handleSupabaseError(error);
      return data ? adaptCompanyFromSupabase(data) : null;
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async create(companyData: any) {
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
    }
  },

  async update(id: string, companyData: any) {
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
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) handleSupabaseError(error);
      return true;
    } catch (error) {
      handleSupabaseError(error);
    }
  }
};

// Events API
export const eventsApi = {
  async getAll(filters?: { 
    search?: string; 
    types?: ('in-person' | 'online' | 'hybrid')[]; 
    dateRange?: 'upcoming' | 'month' | 'three-months' | 'all';
  }) {
    try {
      let query = supabase
        .from('events')
        .select(`
          *,
          event_sessions(*),
          members!events_organizer_id_fkey(id, name, image, title)
        `)
        .eq('status', 'published')
        .order('start_date', { ascending: true });

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.types && filters.types.length > 0) {
        query = query.in('type', filters.types);
      }

      // Date filtering
      const now = new Date().toISOString();
      switch (filters?.dateRange) {
        case 'upcoming':
          query = query.gte('start_date', now);
          break;
        case 'month':
          const oneMonth = new Date();
          oneMonth.setMonth(oneMonth.getMonth() + 1);
          query = query.gte('start_date', now).lte('start_date', oneMonth.toISOString());
          break;
        case 'three-months':
          const threeMonths = new Date();
          threeMonths.setMonth(threeMonths.getMonth() + 3);
          query = query.gte('start_date', now).lte('start_date', threeMonths.toISOString());
          break;
        default:
          // 'all' - no date filter
          break;
      }

      const { data, error } = await query;
      if (error) handleSupabaseError(error);
      return adaptListFromSupabase(data || [], adaptEventFromSupabase);
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_sessions(*),
          members!events_organizer_id_fkey(id, name, image, title),
          event_attendees(
            members(id, name, image)
          )
        `)
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (error) handleSupabaseError(error);
      return data ? adaptEventFromSupabase(data) : null;
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async create(eventData: any) {
    try {
      const supabaseData = adaptEventToSupabase(eventData);
      const { data, error } = await supabase
        .from('events')
        .insert(supabaseData)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data ? adaptEventFromSupabase(data) : null;
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async update(id: string, eventData: any) {
    try {
      const supabaseData = adaptEventToSupabase(eventData);
      const { data, error } = await supabase
        .from('events')
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data ? adaptEventFromSupabase(data) : null;
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) handleSupabaseError(error);
      return true;
    } catch (error) {
      handleSupabaseError(error);
    }
  }
};

// Groups API
export const groupsApi = {
  async getAll(filters?: { search?: string; visibility?: string[] }) {
    try {
      let query = supabase
        .from('groups')
        .select(`
          *,
          group_members!inner(
            members(id, name, image)
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.visibility && filters.visibility.length > 0) {
        query = query.in('visibility', filters.visibility);
      }

      const { data, error } = await query;
      if (error) handleSupabaseError(error);
      return adaptListFromSupabase(data || [], adaptGroupFromSupabase);
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          group_members(
            members(id, name, image, title),
            role,
            joined_date
          ),
          events!events_group_id_fkey(
            id, title, start_date, description, image
          ),
          resources!resources_group_id_fkey(
            id, title, type, url, created_at, description
          )
        `)
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (error) handleSupabaseError(error);
      return data ? adaptGroupFromSupabase(data) : null;
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async update(id: string, groupData: any) {
    try {
      const supabaseData = adaptGroupToSupabase(groupData);
      const { data, error } = await supabase
        .from('groups')
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data ? adaptGroupFromSupabase(data) : null;
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', id);

      if (error) handleSupabaseError(error);
      return true;
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async create(groupData: any) {
    try {
      const supabaseData = adaptGroupToSupabase(groupData);
      const { data, error } = await supabase
        .from('groups')
        .insert(supabaseData)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data ? adaptGroupFromSupabase(data) : null;
    } catch (error) {
      handleSupabaseError(error);
    }
  }
};

// Resources API
export const resourcesApi = {
  async getAll(filters?: { search?: string; types?: string[]; tags?: string[] }) {
    try {
      let query = supabase
        .from('resources')
        .select(`
          *,
          members!resources_contributor_id_fkey(id, name),
          resource_tags(tag),
          groups(id, name)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.types && filters.types.length > 0) {
        query = query.in('type', filters.types);
      }

      const { data, error } = await query;
      if (error) handleSupabaseError(error);

      // Filter by tags if provided
      let filteredData = data || [];
      if (filters?.tags && filters.tags.length > 0) {
        filteredData = filteredData.filter(resource => 
          resource.resource_tags?.some((tag: any) => 
            filters.tags!.includes(tag.tag)
          )
        );
      }

      return adaptListFromSupabase(filteredData, adaptResourceFromSupabase);
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select(`
          *,
          members!resources_contributor_id_fkey(id, name, image),
          resource_tags(tag),
          groups(id, name)
        `)
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (error) handleSupabaseError(error);
      return data ? adaptResourceFromSupabase(data) : null;
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async create(resourceData: any) {
    try {
      const supabaseData = adaptResourceToSupabase(resourceData);
      const { data, error } = await supabase
        .from('resources')
        .insert(supabaseData)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data ? adaptResourceFromSupabase(data) : null;
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async update(id: string, resourceData: any) {
    try {
      const supabaseData = adaptResourceToSupabase(resourceData);
      const { data, error } = await supabase
        .from('resources')
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data ? adaptResourceFromSupabase(data) : null;
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);

      if (error) handleSupabaseError(error);
      return true;
    } catch (error) {
      handleSupabaseError(error);
    }
  }
};

// Marketplace API
export const marketplaceApi = {
  async getAll(filters?: { search?: string; types?: string[] }) {
    try {
      let query = supabase
        .from('marketplace_listings')
        .select(`
          *,
          members!marketplace_listings_seller_id_fkey(id, name, image)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.types && filters.types.length > 0) {
        query = query.in('type', filters.types);
      }

      const { data, error } = await query;
      if (error) handleSupabaseError(error);
      return adaptListFromSupabase(data || [], adaptMarketplaceItemFromSupabase);
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select(`
          *,
          members!marketplace_listings_seller_id_fkey(id, name, image)
        `)
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (error) handleSupabaseError(error);
      return data ? adaptMarketplaceItemFromSupabase(data) : null;
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async getRelated(itemId: string, limit: number = 3) {
    try {
      // Get current item details
      const { data: currentItem } = await supabase
        .from('marketplace_listings')
        .select('type')
        .eq('id', itemId)
        .single();

      if (!currentItem) return [];

      // Find related items
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select(`
          *,
          members!marketplace_listings_seller_id_fkey(id, name, image)
        `)
        .eq('status', 'published')
        .neq('id', itemId)
        .eq('type', currentItem.type)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) handleSupabaseError(error);
      return adaptListFromSupabase(data || [], adaptMarketplaceItemFromSupabase);
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async create(itemData: any) {
    try {
      const supabaseData = adaptMarketplaceItemToSupabase(itemData);
      const { data, error } = await supabase
        .from('marketplace_listings')
        .insert(supabaseData)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data ? adaptMarketplaceItemFromSupabase(data) : null;
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async update(id: string, itemData: any) {
    try {
      const supabaseData = adaptMarketplaceItemToSupabase(itemData);
      const { data, error } = await supabase
        .from('marketplace_listings')
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data ? adaptMarketplaceItemFromSupabase(data) : null;
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .delete()
        .eq('id', id);

      if (error) handleSupabaseError(error);
      return true;
    } catch (error) {
      handleSupabaseError(error);
    }
  }
};

// Opportunities API
export const opportunitiesApi = {
  async getAll(filters?: { search?: string; types?: string[]; remote?: boolean }) {
    try {
      let query = supabase
        .from('opportunities')
        .select(`
          *,
          companies(id, name, logo)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.types && filters.types.length > 0) {
        query = query.in('type', filters.types);
      }

      if (filters?.remote !== undefined) {
        query = query.eq('remote', filters.remote);
      }

      const { data, error } = await query;
      if (error) handleSupabaseError(error);
      return adaptListFromSupabase(data || [], adaptOpportunityFromSupabase);
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          companies(id, name, logo, description, website)
        `)
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (error) handleSupabaseError(error);
      return data ? adaptOpportunityFromSupabase(data) : null;
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async create(opportunityData: any) {
    try {
      const supabaseData = adaptOpportunityToSupabase(opportunityData);
      const { data, error } = await supabase
        .from('opportunities')
        .insert(supabaseData)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data ? adaptOpportunityFromSupabase(data) : null;
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async update(id: string, opportunityData: any) {
    try {
      const supabaseData = adaptOpportunityToSupabase(opportunityData);
      const { data, error } = await supabase
        .from('opportunities')
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data ? adaptOpportunityFromSupabase(data) : null;
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id);

      if (error) handleSupabaseError(error);
      return true;
    } catch (error) {
      handleSupabaseError(error);
    }
  }
};
