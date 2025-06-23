import { supabase, handleSupabaseError } from '@/shared/api/client';
import {
  PhotoPromotionRequest,
  PromotionRequestsResponse,
  CreatePromotionRequestData,
  PromotionStatus,
  PromotionType
} from '../types';

class PromotionApi {
  private tableName = 'photo_promotion_requests';

  async getPromotionRequests(params?: {
    page?: number;
    limit?: number;
    status?: PromotionStatus;
    promotionType?: PromotionType;
    requestedBy?: string;
  }): Promise<PromotionRequestsResponse> {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        promotionType,
        requestedBy,
      } = params || {};

      let query = supabase
        .from(this.tableName)
        .select(`
          *,
          photo:photos!photo_promotion_requests_photo_id_fkey(
            id,
            title,
            url,
            thumbnail_url,
            gallery:galleries!photos_gallery_id_fkey(
              id,
              title,
              slug
            )
          ),
          requester:members!photo_promotion_requests_requested_by_fkey(
            id,
            name,
            image
          ),
          reviewer:members!photo_promotion_requests_reviewed_by_fkey(
            id,
            name,
            image
          )
        `, { count: 'exact' });

      // Apply filters
      if (status) {
        query = query.eq('status', status);
      }

      if (promotionType) {
        query = query.eq('promotion_type', promotionType);
      }

      if (requestedBy) {
        query = query.eq('requested_by', requestedBy);
      }

      // Apply sorting (newest first)
      query = query.order('requested_at', { ascending: false });

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw handleSupabaseError(error);
      }

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        data: data as PhotoPromotionRequest[],
        page,
        limit,
        total: count || 0,
        totalPages,
      };
    } catch (error) {
      console.error('Error fetching promotion requests:', error);
      throw error;
    }
  }

  async getPromotionRequestById(id: string): Promise<PhotoPromotionRequest> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          photo:photos!photo_promotion_requests_photo_id_fkey(
            id,
            title,
            url,
            thumbnail_url,
            description,
            tags,
            gallery:galleries!photos_gallery_id_fkey(
              id,
              title,
              slug
            ),
            uploader:members!photos_uploaded_by_fkey(
              id,
              name,
              image
            )
          ),
          requester:members!photo_promotion_requests_requested_by_fkey(
            id,
            name,
            image
          ),
          reviewer:members!photo_promotion_requests_reviewed_by_fkey(
            id,
            name,
            image
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw handleSupabaseError(error);
      }

      return data as PhotoPromotionRequest;
    } catch (error) {
      console.error('Error fetching promotion request by ID:', error);
      throw error;
    }
  }

  async createPromotionRequest(requestData: CreatePromotionRequestData): Promise<PhotoPromotionRequest> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if there's already a pending request for this photo and promotion type
      const { data: existingRequest } = await supabase
        .from(this.tableName)
        .select('id')
        .eq('photo_id', requestData.photoId)
        .eq('promotion_type', requestData.promotionType)
        .eq('status', 'pending')
        .single();

      if (existingRequest) {
        throw new Error('A promotion request for this photo and type is already pending');
      }

      const newRequest = {
        ...requestData,
        requested_by: user.id,
        requested_at: new Date().toISOString(),
        status: 'pending' as PromotionStatus,
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .insert(newRequest)
        .select(`
          *,
          photo:photos!photo_promotion_requests_photo_id_fkey(
            id,
            title,
            url,
            thumbnail_url
          ),
          requester:members!photo_promotion_requests_requested_by_fkey(
            id,
            name,
            image
          )
        `)
        .single();

      if (error) {
        throw handleSupabaseError(error);
      }

      return data as PhotoPromotionRequest;
    } catch (error) {
      console.error('Error creating promotion request:', error);
      throw error;
    }
  }

  async approvePromotionRequest(
    id: string, 
    reviewNotes?: string,
    metadata?: Record<string, any>
  ): Promise<PhotoPromotionRequest> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get the promotion request to check promotion type
      const request = await this.getPromotionRequestById(id);

      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          status: 'approved' as PromotionStatus,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes,
          metadata: metadata || request.metadata,
        })
        .eq('id', id)
        .select(`
          *,
          photo:photos!photo_promotion_requests_photo_id_fkey(
            id,
            title,
            url,
            thumbnail_url
          ),
          requester:members!photo_promotion_requests_requested_by_fkey(
            id,
            name,
            image
          ),
          reviewer:members!photo_promotion_requests_reviewed_by_fkey(
            id,
            name,
            image
          )
        `)
        .single();

      if (error) {
        throw handleSupabaseError(error);
      }

      // Execute the promotion based on type
      await this.executePromotion(data as PhotoPromotionRequest);

      return data as PhotoPromotionRequest;
    } catch (error) {
      console.error('Error approving promotion request:', error);
      throw error;
    }
  }

  async rejectPromotionRequest(id: string, reviewNotes: string): Promise<PhotoPromotionRequest> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          status: 'rejected' as PromotionStatus,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes,
        })
        .eq('id', id)
        .select(`
          *,
          photo:photos!photo_promotion_requests_photo_id_fkey(
            id,
            title,
            url,
            thumbnail_url
          ),
          requester:members!photo_promotion_requests_requested_by_fkey(
            id,
            name,
            image
          ),
          reviewer:members!photo_promotion_requests_reviewed_by_fkey(
            id,
            name,
            image
          )
        `)
        .single();

      if (error) {
        throw handleSupabaseError(error);
      }

      return data as PhotoPromotionRequest;
    } catch (error) {
      console.error('Error rejecting promotion request:', error);
      throw error;
    }
  }

  async cancelPromotionRequest(id: string): Promise<boolean> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if user owns the request
      const { data: request } = await supabase
        .from(this.tableName)
        .select('requested_by, status')
        .eq('id', id)
        .single();

      if (!request) {
        throw new Error('Promotion request not found');
      }

      if (request.requested_by !== user.id) {
        throw new Error('You can only cancel your own promotion requests');
      }

      if (request.status !== 'pending') {
        throw new Error('Can only cancel pending promotion requests');
      }

      const { error } = await supabase
        .from(this.tableName)
        .update({
          status: 'cancelled' as PromotionStatus,
        })
        .eq('id', id);

      if (error) {
        throw handleSupabaseError(error);
      }

      return true;
    } catch (error) {
      console.error('Error cancelling promotion request:', error);
      throw error;
    }
  }

  async getActivePromotions(promotionType?: PromotionType): Promise<PhotoPromotionRequest[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select(`
          *,
          photo:photos!photo_promotion_requests_photo_id_fkey(
            id,
            title,
            url,
            thumbnail_url,
            description
          )
        `)
        .eq('status', 'active');

      if (promotionType) {
        query = query.eq('promotion_type', promotionType);
      }

      // Check if promotion is still within date range
      const now = new Date().toISOString();
      query = query.or(`scheduled_end.is.null,scheduled_end.gte.${now}`);

      const { data, error } = await query;

      if (error) {
        throw handleSupabaseError(error);
      }

      return data as PhotoPromotionRequest[];
    } catch (error) {
      console.error('Error fetching active promotions:', error);
      throw error;
    }
  }

  async deactivateExpiredPromotions(): Promise<number> {
    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          status: 'expired' as PromotionStatus,
        })
        .eq('status', 'active')
        .not('scheduled_end', 'is', null)
        .lt('scheduled_end', now)
        .select('id');

      if (error) {
        throw handleSupabaseError(error);
      }

      return data?.length || 0;
    } catch (error) {
      console.error('Error deactivating expired promotions:', error);
      return 0;
    }
  }

  private async executePromotion(request: PhotoPromotionRequest): Promise<void> {
    try {
      switch (request.promotionType) {
        case 'page_header':
          await this.executePageHeaderPromotion(request);
          break;
        case 'featured_gallery':
          await this.executeFeaturedGalleryPromotion(request);
          break;
        case 'homepage_hero':
          await this.executeHomepageHeroPromotion(request);
          break;
        case 'social_media':
          await this.executeSocialMediaPromotion(request);
          break;
        default:
          console.warn(`Unknown promotion type: ${request.promotionType}`);
      }

      // Update status to active
      await supabase
        .from(this.tableName)
        .update({
          status: 'active' as PromotionStatus,
        })
        .eq('id', request.id);

    } catch (error) {
      console.error('Error executing promotion:', error);
      throw error;
    }
  }

  private async executePageHeaderPromotion(request: PhotoPromotionRequest): Promise<void> {
    // This would integrate with the page header assignment API
    const { pageHeaderAssignmentApi } = await import('./pageHeaderApi');
    
    await pageHeaderAssignmentApi.createAssignment({
      photoId: request.photoId,
      pagePath: request.targetLocation,
      pageTitle: request.metadata?.pageTitle || 'Page Header',
      startDate: request.scheduledStart,
      endDate: request.scheduledEnd,
      priority: request.metadata?.priority || 1,
    });
  }

  private async executeFeaturedGalleryPromotion(request: PhotoPromotionRequest): Promise<void> {
    // Mark photo as featured in its gallery
    await supabase
      .from('photos')
      .update({ featured: true })
      .eq('id', request.photoId);
  }

  private async executeHomepageHeroPromotion(request: PhotoPromotionRequest): Promise<void> {
    // This would integrate with homepage hero management
    console.log('Executing homepage hero promotion for photo:', request.photoId);
    // Implementation would depend on how homepage heroes are managed
  }

  private async executeSocialMediaPromotion(request: PhotoPromotionRequest): Promise<void> {
    // This would integrate with social media posting APIs
    console.log('Executing social media promotion for photo:', request.photoId);
    // Implementation would depend on social media integration
  }
}

export const promotionApi = new PromotionApi();