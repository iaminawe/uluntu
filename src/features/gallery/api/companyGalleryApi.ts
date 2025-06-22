import { supabase } from '@/lib/supabase';
import { Gallery, CreateGalleryInput, GalleryFilters } from '../types';
import { galleryApi } from './galleryApi';

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
    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!member) {
      throw new Error('Member not found');
    }

    // Check if user is a company admin
    const { data: membership } = await supabase
      .from('company_members')
      .select('role')
      .eq('company_id', companyId)
      .eq('member_id', member.id)
      .eq('is_verified', true)
      .single();

    if (!membership || membership.role !== 'admin') {
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
        .from('company_members')
        .select('role')
        .eq('company_id', companyId)
        .eq('member_id', member.id)
        .eq('is_verified', true)
        .single();

      return membership?.role === 'admin';
    } catch (error) {
      console.error('Error checking company gallery permissions:', error);
      return false;
    }
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