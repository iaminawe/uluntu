import { supabase } from '@/lib/supabase';
import { Gallery, CreateGalleryInput, GalleryFilters } from '../types';
import { galleryApi } from './galleryApi';
import { entityPermissions } from '@/utils/entityPermissions';

export const groupGalleryApi = {
  /**
   * Get all galleries for a specific group
   */
  async getGroupGalleries(groupId: string, filters?: Omit<GalleryFilters, 'ownerId' | 'ownerType'>): Promise<Gallery[]> {
    return galleryApi.getAllGalleries({
      ...filters,
      ownerType: 'group',
      ownerId: groupId
    });
  },

  /**
   * Create a new gallery for a group
   */
  async createGroupGallery(groupId: string, galleryData: Omit<CreateGalleryInput, 'owner_type' | 'owner_id'>): Promise<Gallery> {
    // Check if user is a group admin using the new permission system
    const isGroupAdmin = await entityPermissions.isGroupAdmin(groupId);
    
    if (!isGroupAdmin) {
      throw new Error('Only group administrators can create galleries');
    }

    return galleryApi.createGallery({
      ...galleryData,
      owner_type: 'group',
      owner_id: groupId
    });
  },

  /**
   * Check if current user can manage group galleries
   */
  async canManageGroupGalleries(groupId: string): Promise<boolean> {
    return entityPermissions.isGroupAdmin(groupId);
  },

  /**
   * Get group gallery statistics
   */
  async getGroupGalleryStats(groupId: string): Promise<{
    totalGalleries: number;
    totalPhotos: number;
    totalViews: number;
    totalLikes: number;
  }> {
    try {
      const { data, error } = await supabase
        .rpc('get_gallery_stats', {
          p_owner_type: 'group',
          p_owner_id: groupId
        });

      if (error) throw error;

      return {
        totalGalleries: data?.total_galleries || 0,
        totalPhotos: data?.total_photos || 0,
        totalViews: data?.total_views || 0,
        totalLikes: data?.total_likes || 0
      };
    } catch (error) {
      console.error('Error fetching group gallery stats:', error);
      return {
        totalGalleries: 0,
        totalPhotos: 0,
        totalViews: 0,
        totalLikes: 0
      };
    }
  }
};