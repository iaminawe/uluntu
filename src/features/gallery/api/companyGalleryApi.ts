import { supabase } from '@/lib/supabase';
import { Gallery, CreateGalleryInput, GalleryFilters } from '../types';
import { galleryApi } from './galleryApi';
import { entityPermissions } from '@/utils/entityPermissions';

export const companyGalleryApi = {
  /**
   * Get all galleries for a specific company
   */
  async getCompanyGalleries(companyId: string, filters?: Omit<GalleryFilters, 'ownerId' | 'ownerType'>): Promise<Gallery[]> {
    return galleryApi.getAllGalleries({
      ...filters,
      ownerType: 'company',
      ownerId: companyId
    });
  },

  /**
   * Create a new gallery for a company
   */
  async createCompanyGallery(companyId: string, galleryData: Omit<CreateGalleryInput, 'owner_type' | 'owner_id'>): Promise<Gallery> {
    // Check if user is a company admin using the new permission system
    const isCompanyAdmin = await entityPermissions.isCompanyAdmin(companyId);
    
    if (!isCompanyAdmin) {
      throw new Error('Only verified company administrators can create galleries');
    }

    return galleryApi.createGallery({
      ...galleryData,
      owner_type: 'company',
      owner_id: companyId
    });
  },

  /**
   * Check if current user can manage company galleries
   */
  async canManageCompanyGalleries(companyId: string): Promise<boolean> {
    return entityPermissions.isCompanyAdmin(companyId);
  },

  /**
   * Get company gallery statistics
   */
  async getCompanyGalleryStats(companyId: string): Promise<{
    totalGalleries: number;
    totalPhotos: number;
    totalViews: number;
    totalLikes: number;
  }> {
    try {
      const { data, error } = await supabase
        .rpc('get_gallery_stats', {
          p_owner_type: 'company',
          p_owner_id: companyId
        });

      if (error) throw error;

      return {
        totalGalleries: data?.total_galleries || 0,
        totalPhotos: data?.total_photos || 0,
        totalViews: data?.total_views || 0,
        totalLikes: data?.total_likes || 0
      };
    } catch (error) {
      console.error('Error fetching company gallery stats:', error);
      return {
        totalGalleries: 0,
        totalPhotos: 0,
        totalViews: 0,
        totalLikes: 0
      };
    }
  }
};