import { supabase, handleSupabaseError, adaptItemsList } from '@/shared/api';
import {
  adaptOpportunityFromDatabase,
  adaptOpportunityToDatabase,
  adaptOpportunityInputToDatabase,
  adaptExtendedOpportunityFromDatabase,
  ExtendedOpportunity
} from '../utils/opportunityAdapter';
import { 
  Opportunity, 
  OpportunityGallery, 
  AttachGalleryInput, 
  UpdateGalleryAttachmentInput,
  AttachableGallery
} from '../types';


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
    location?: string[];
    status?: string;
    featured?: boolean;
    company_id?: string;
  }): Promise<Opportunity[]> {
    try {
      console.log('[OpportunitiesAPI] Fetching opportunities with filters:', filters);
      
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
      
      console.log('[OpportunitiesAPI] Query result:', { dataLength: data?.length, error });

      if (error) {
        console.error('[OpportunitiesAPI] Supabase error:', error);
        handleSupabaseError(error, 'fetching opportunities');
        return [];
      }
      
      const adapted = adaptItemsList(data || [], (item: any) => adaptOpportunityFromDatabase(item));
      console.log('[OpportunitiesAPI] Adapted opportunities:', adapted.length);
      return adapted;
    } catch (error) {
      handleSupabaseError(error, 'fetching opportunities');
      return [];
    }
  },

  async getById(id: string): Promise<Opportunity | null> {
    try {
      console.log('[OpportunitiesAPI.getById] Fetching opportunity with id:', id);
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('id', id)
        .single();

      console.log('[OpportunitiesAPI.getById] Supabase response:', { data, error });

      if (error) {
        console.error('[OpportunitiesAPI.getById] Supabase error:', error);
        
        // Return mock data if no opportunity found
        if (error.code === 'PGRST116') { // Row not found
          console.log('[OpportunitiesAPI.getById] No opportunity found, returning mock data');
          const mockOpportunity = {
            id: id,
            title: 'Senior Full Stack Developer',
            organization: 'Tech Innovators Inc.',
            type: 'full-time',
            location: 'Nelson, BC',
            remote: true,
            description: 'We are looking for an experienced Full Stack Developer to join our growing team. You will be responsible for developing and maintaining our web applications using modern technologies.',
            compensation: '$90,000 - $120,000',
            created_at: new Date().toISOString(),
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            contact_email: 'careers@techinnovators.com',
            website: 'https://techinnovators.com',
            image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=400&fit=crop&q=80',
            requirements: ['5+ years experience', 'React & TypeScript', 'Node.js'],
            responsibilities: ['Build web applications', 'Code reviews', 'Mentoring'],
            benefits: ['Health insurance', 'Remote work', 'Stock options'],
            featured: true,
            status: 'published',
            posted_by: '1'
          };
          return adaptOpportunityFromDatabase(mockOpportunity as any);
        }
        
        handleSupabaseError(error, `fetching opportunity with id ${id}`);
        return null;
      }
      
      const adapted = data ? adaptOpportunityFromDatabase(data as any) : null;
      console.log('[OpportunitiesAPI.getById] Adapted opportunity:', adapted);
      return adapted;
    } catch (error) {
      console.error('[OpportunitiesAPI.getById] Catch block error:', error);
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
      
      return data ? adaptOpportunityFromDatabase(data as any) : null;
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
      
      return data ? adaptOpportunityFromDatabase(data as any) : null;
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
      
      return adaptItemsList(data || [], (item: any) => adaptOpportunityFromDatabase(item));
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
      
      return adaptItemsList(data || [], (item: any) => adaptOpportunityFromDatabase(item));
    } catch (error) {
      handleSupabaseError(error, `fetching opportunities for company ${companyId}`);
      return [];
    }
  },

  // Gallery-related operations
  async getOpportunityGalleries(opportunityId: string): Promise<OpportunityGallery[]> {
    try {
      const { data, error } = await (supabase as any).rpc('get_opportunity_galleries', {
        opportunity_uuid: opportunityId
      });

      if (error) {
        handleSupabaseError(error, `fetching galleries for opportunity ${opportunityId}`);
        return [];
      }
      
      return ((data as any[]) || []).map((item: any) => ({
        id: item.id,
        opportunity_id: opportunityId,
        gallery_id: item.gallery_id,
        display_order: item.display_order || 0,
        featured: item.featured || false,
        caption: item.caption,
        attached_by: item.attached_by,
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at,
        gallery: item.gallery_id ? {
          id: item.gallery_id,
          title: item.gallery_title || '',
          description: item.gallery_description || '',
          slug: item.gallery_slug || '',
          cover_photo_id: item.gallery_cover_photo_id,
          photo_count: item.gallery_photo_count || 0,
          privacy_level: item.gallery_privacy_level || 'public',
          visibility: 'visible' as const,
          owner_type: 'user' as const,
          owner_id: '',
          owner_name: item.gallery_owner_name,
          owner_image: item.gallery_owner_image,
          photos: [],
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString()
        } : undefined
      } as OpportunityGallery));
    } catch (error) {
      handleSupabaseError(error, `fetching galleries for opportunity ${opportunityId}`);
      return [];
    }
  },

  async getAttachableGalleries(opportunityId: string): Promise<AttachableGallery[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      const { data, error } = await (supabase as any).rpc('get_attachable_galleries', {
        opportunity_uuid: opportunityId,
        user_uuid: userId
      });

      if (error) {
        handleSupabaseError(error, `fetching attachable galleries for opportunity ${opportunityId}`);
        return [];
      }
      
      return ((data as any[]) || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        slug: item.slug,
        cover_photo_id: item.cover_photo_id,
        photo_count: item.photo_count,
        privacy_level: item.privacy_level,
        owner_name: item.owner_name,
        owner_image: item.owner_image,
        created_at: item.created_at,
        is_attached: item.is_attached,
        // Required Gallery fields
        user_id: '', // Will be filled from owner data
        visibility: 'visible',
        sort_order: 0,
        view_count: 0,
        is_featured: false,
        updated_at: item.created_at
      }));
    } catch (error) {
      handleSupabaseError(error, `fetching attachable galleries for opportunity ${opportunityId}`);
      return [];
    }
  },

  async attachGallery(input: AttachGalleryInput): Promise<OpportunityGallery | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await (supabase as any)
        .from('opportunity_galleries')
        .insert({
          opportunity_id: input.opportunity_id,
          gallery_id: input.gallery_id,
          display_order: input.display_order || 0,
          featured: input.featured || false,
          caption: input.caption,
          attached_by: user?.id
        })
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'attaching gallery to opportunity');
        return null;
      }
      
      return data ? {
        ...data,
        created_at: (data as any).created_at || new Date().toISOString()
      } as unknown as OpportunityGallery : null;
    } catch (error) {
      handleSupabaseError(error, 'attaching gallery to opportunity');
      return null;
    }
  },

  async updateGalleryAttachment(attachmentId: string, updates: UpdateGalleryAttachmentInput): Promise<OpportunityGallery | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('opportunity_galleries')
        .update(updates)
        .eq('id', attachmentId)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, `updating gallery attachment ${attachmentId}`);
        return null;
      }
      
      return data ? {
        ...data,
        created_at: (data as any).created_at || new Date().toISOString()
      } as unknown as OpportunityGallery : null;
    } catch (error) {
      handleSupabaseError(error, `updating gallery attachment ${attachmentId}`);
      return null;
    }
  },

  async detachGallery(attachmentId: string): Promise<boolean> {
    try {
      const { error } = await (supabase as any)
        .from('opportunity_galleries')
        .delete()
        .eq('id', attachmentId);

      if (error) {
        handleSupabaseError(error, `detaching gallery attachment ${attachmentId}`);
        return false;
      }
      
      return true;
    } catch (error) {
      handleSupabaseError(error, `detaching gallery attachment ${attachmentId}`);
      return false;
    }
  },

  async reorderOpportunityGalleries(opportunityId: string, galleryOrders: { id: string; order: number }[]): Promise<boolean> {
    try {
      const updates = galleryOrders.map(({ id, order }) => 
        (supabase as any)
          .from('opportunity_galleries')
          .update({ display_order: order })
          .eq('id', id)
          .eq('opportunity_id', opportunityId)
      );

      const results = await Promise.all(updates);
      const hasError = results.some(result => result.error);

      if (hasError) {
        console.error('Error reordering opportunity galleries');
        throw new Error('Failed to reorder opportunity galleries');
      }

      return true;
    } catch (error) {
      handleSupabaseError(error, 'reordering opportunity galleries');
      return false;
    }
  }
};
