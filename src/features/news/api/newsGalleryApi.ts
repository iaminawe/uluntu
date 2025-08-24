import { supabase, handleSupabaseError } from '@/shared/api';
import { Gallery } from '@/features/gallery/types';

// Types for news gallery attachments
export interface NewsGallery {
  id: string;
  news_id: string;
  gallery_id: string;
  display_order: number;
  featured: boolean;
  caption?: string;
  attached_by?: string;
  created_at: string;
  updated_at?: string;
  
  // Gallery details (joined data)
  gallery?: Gallery & {
    owner_name?: string;
    owner_image?: string;
  };
}

export interface AttachGalleryInput {
  news_id: string;
  gallery_id: string;
  display_order?: number;
  featured?: boolean;
  caption?: string;
}

export interface UpdateGalleryAttachmentInput {
  display_order?: number;
  featured?: boolean;
  caption?: string;
}

export interface AttachableGallery extends Gallery {
  owner_name?: string;
  owner_image?: string;
  is_attached: boolean;
}

export const newsGalleryApi = {
  /**
   * Attach a gallery to a news article
   */
  async attachGallery(entityId: string, galleryId: string, galleryType?: string): Promise<NewsGallery | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('news_galleries')
        .insert({
          news_id: entityId,
          gallery_id: galleryId,
          display_order: 0,
          featured: false,
          attached_by: user?.id
        })
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'attaching gallery to news article');
        return null;
      }
      
      return data ? {
        ...data,
        created_at: data.created_at || new Date().toISOString()
      } as NewsGallery : null;
    } catch (error) {
      handleSupabaseError(error, 'attaching gallery to news article');
      return null;
    }
  },

  /**
   * Detach a gallery from a news article
   */
  async detachGallery(entityId: string, galleryId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('news_galleries')
        .delete()
        .eq('news_id', entityId)
        .eq('gallery_id', galleryId);

      if (error) {
        handleSupabaseError(error, 'detaching gallery from news article');
        return false;
      }
      
      return true;
    } catch (error) {
      handleSupabaseError(error, 'detaching gallery from news article');
      return false;
    }
  },

  /**
   * Get all galleries attached to a news article
   */
  async getEntityGalleries(entityId: string): Promise<NewsGallery[]> {
    try {
      const { data, error } = await supabase.rpc('get_news_galleries', {
        news_uuid: entityId
      });

      if (error) {
        handleSupabaseError(error, `fetching galleries for news article ${entityId}`);
        return [];
      }
      
      return (data || []).map((item: any) => ({
        id: item.id,
        news_id: entityId,
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
          updated_at: item.updated_at || new Date().toISOString(),
          user_id: item.gallery_owner_id || '',
          sort_order: 0,
          view_count: 0,
          is_featured: false
        } : undefined
      } as NewsGallery));
    } catch (error) {
      handleSupabaseError(error, `fetching galleries for news article ${entityId}`);
      return [];
    }
  },

  /**
   * Update the display order of galleries for a news article
   */
  async updateGalleryOrder(entityId: string, galleryOrders: { id: string; order: number }[]): Promise<boolean> {
    try {
      const updates = galleryOrders.map(({ id, order }) => 
        supabase
          .from('news_galleries')
          .update({ display_order: order })
          .eq('id', id)
          .eq('news_id', entityId)
      );

      const results = await Promise.all(updates);
      const hasError = results.some(result => result.error);

      if (hasError) {
        console.error('Error reordering news galleries');
        throw new Error('Failed to reorder news galleries');
      }

      return true;
    } catch (error) {
      handleSupabaseError(error, 'reordering news galleries');
      return false;
    }
  },

  /**
   * Set a gallery as featured for a news article
   */
  async setFeaturedGallery(entityId: string, galleryId: string): Promise<boolean> {
    try {
      // First, remove featured status from all galleries for this news article
      await supabase
        .from('news_galleries')
        .update({ featured: false })
        .eq('news_id', entityId);

      // Then set the specified gallery as featured
      const { error } = await supabase
        .from('news_galleries')
        .update({ featured: true })
        .eq('news_id', entityId)
        .eq('gallery_id', galleryId);

      if (error) {
        handleSupabaseError(error, 'setting featured gallery for news article');
        return false;
      }

      return true;
    } catch (error) {
      handleSupabaseError(error, 'setting featured gallery for news article');
      return false;
    }
  },

  /**
   * Get attachable galleries for a news article (not already attached)
   */
  async getAttachableGalleries(entityId: string): Promise<AttachableGallery[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      const { data, error } = await supabase.rpc('get_attachable_galleries_for_news', {
        news_uuid: entityId,
        user_uuid: userId
      });

      if (error) {
        handleSupabaseError(error, `fetching attachable galleries for news article ${entityId}`);
        return [];
      }
      
      return (data || []).map((item: any) => ({
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
        user_id: item.owner_id || '',
        visibility: 'visible' as const,
        sort_order: 0,
        view_count: 0,
        is_featured: false,
        updated_at: item.created_at
      }));
    } catch (error) {
      handleSupabaseError(error, `fetching attachable galleries for news article ${entityId}`);
      return [];
    }
  }
};