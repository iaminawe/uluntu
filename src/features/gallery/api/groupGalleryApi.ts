import { supabase } from '@/lib/supabase';
import { Gallery, CreateGalleryInput, GalleryFilters } from '../types';
import { galleryApi } from './galleryApi';

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
    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!member) {
      throw new Error('Member not found');
    }

    // Check if user is a group admin
    const { data: membership } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('member_id', member.id)
      .eq('status', 'active')
      .single();

    if (!membership || membership.role !== 'admin') {
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
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return false;

      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.user.id)
        .single();

      if (!member) return false;

      const { data: membership } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('member_id', member.id)
        .eq('status', 'active')
        .single();

      return membership?.role === 'admin';
    } catch (error) {
      console.error('Error checking group gallery permissions:', error);
      return false;
    }
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