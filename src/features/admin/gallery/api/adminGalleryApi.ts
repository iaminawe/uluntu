// Admin Gallery API
// Extends the existing gallery API with admin-specific functionality

import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import {
  AdminGalleryView,
  AdminPhotoView,
  AdminGalleryFilters,
  AdminPhotoFilters,
  AdminGalleriesResponse,
  AdminPhotosResponse,
  BulkGalleryOperation,
  BulkPhotoOperation,
  ModerationQueueItem,
  ModerationDecision,
  GalleryAnalytics,
  AdminDashboardStats,
  AdminGalleryFormData,
  AdminPhotoFormData
} from '../types';

class AdminGalleryApi {
  private baseTableName = 'user_galleries';
  private photoTableName = 'gallery_photos';
  private moderationTableName = 'moderation_queue';

  // Gallery Management
  async getAdminGalleries(params?: {
    page?: number;
    limit?: number;
    filters?: AdminGalleryFilters;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<AdminGalleriesResponse> {
    try {
      const {
        page = 1,
        limit = 24,
        filters = {},
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = params || {};

      // Build the query with all necessary joins
      let query = supabase
        .from('admin_galleries') // Use the admin view
        .select(`
          *,
          owner:members!user_galleries_user_id_fkey(
            id,
            name,
            email,
            avatar_url
          ),
          stats:gallery_stats(
            view_count,
            like_count,
            comment_count,
            download_count
          )
        `, { count: 'exact' });

      // Apply filters
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.privacyLevel && filters.privacyLevel.length > 0) {
        query = query.in('privacy_level', filters.privacyLevel);
      }

      if (filters.visibility && filters.visibility.length > 0) {
        query = query.in('visibility', filters.visibility);
      }

      if (filters.ownerType && filters.ownerType.length > 0) {
        query = query.in('owner_type', filters.ownerType);
      }

      if (filters.moderationStatus && filters.moderationStatus.length > 0) {
        query = query.in('moderation_status', filters.moderationStatus);
      }

      if (filters.featured !== undefined) {
        query = query.eq('is_featured', filters.featured);
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }

      if (filters.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.start)
          .lte('created_at', filters.dateRange.end);
      }

      if (filters.lastActivityRange) {
        query = query
          .gte('updated_at', filters.lastActivityRange.start)
          .lte('updated_at', filters.lastActivityRange.end);
      }

      if (filters.minPhotoCount !== undefined) {
        query = query.gte('photo_count', filters.minPhotoCount);
      }

      if (filters.maxPhotoCount !== undefined) {
        query = query.lte('photo_count', filters.maxPhotoCount);
      }

      if (filters.viewCountRange) {
        query = query
          .gte('view_count', filters.viewCountRange.min)
          .lte('view_count', filters.viewCountRange.max);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        logger.apiError('getAdminGalleries', error);
        throw error;
      }

      // Get aggregation data
      const aggregations = await this.getGalleryAggregations(filters);

      return {
        galleries: (data || []) as AdminGalleryView[],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        currentPage: page,
        filters,
        aggregations
      };
    } catch (error) {
      logger.apiError('getAdminGalleries', error);
      throw error;
    }
  }

  async getAdminGallery(id: string): Promise<AdminGalleryView | null> {
    try {
      const { data, error } = await supabase
        .from('admin_galleries')
        .select(`
          *,
          owner:members!user_galleries_user_id_fkey(
            id,
            name,
            email,
            avatar_url
          ),
          photos:gallery_photos(
            id,
            title,
            thumbnail_url,
            sort_order,
            visibility,
            created_at
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        logger.apiError('getAdminGallery', error);
        throw error;
      }

      return data as AdminGalleryView;
    } catch (error) {
      logger.apiError('getAdminGallery', error);
      throw error;
    }
  }

  // Photo Management
  async getAdminGalleryPhotos(galleryId: string, params?: {
    page?: number;
    limit?: number;
    filters?: AdminPhotoFilters;
  }): Promise<AdminPhotosResponse> {
    try {
      const {
        page = 1,
        limit = 50,
        filters = {}
      } = params || {};

      let query = supabase
        .from('admin_photos') // Use the admin view
        .select(`
          *,
          uploader:members!gallery_photos_user_id_fkey(
            id,
            name,
            email,
            avatar_url
          )
        `, { count: 'exact' })
        .eq('gallery_id', galleryId);

      // Apply filters
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.visibility && filters.visibility.length > 0) {
        query = query.in('visibility', filters.visibility);
      }

      if (filters.moderationStatus && filters.moderationStatus.length > 0) {
        query = query.in('moderation_status', filters.moderationStatus);
      }

      if (filters.processingStatus && filters.processingStatus.length > 0) {
        query = query.in('processing_status', filters.processingStatus);
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }

      if (filters.uploadDateRange) {
        query = query
          .gte('created_at', filters.uploadDateRange.start)
          .lte('created_at', filters.uploadDateRange.end);
      }

      if (filters.fileSizeRange) {
        query = query
          .gte('file_size', filters.fileSizeRange.min)
          .lte('file_size', filters.fileSizeRange.max);
      }

      if (filters.dimensionsRange) {
        if (filters.dimensionsRange.minWidth) {
          query = query.gte('width', filters.dimensionsRange.minWidth);
        }
        if (filters.dimensionsRange.maxWidth) {
          query = query.lte('width', filters.dimensionsRange.maxWidth);
        }
        if (filters.dimensionsRange.minHeight) {
          query = query.gte('height', filters.dimensionsRange.minHeight);
        }
        if (filters.dimensionsRange.maxHeight) {
          query = query.lte('height', filters.dimensionsRange.maxHeight);
        }
      }

      // Apply sorting
      const sortBy = filters.sortBy || 'sort_order';
      const sortOrder = filters.sortOrder || 'asc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        logger.apiError('getAdminGalleryPhotos', error);
        throw error;
      }

      // Get aggregation data
      const aggregations = await this.getPhotoAggregations(galleryId, filters);

      return {
        photos: (data || []) as AdminPhotoView[],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        currentPage: page,
        filters,
        aggregations
      };
    } catch (error) {
      logger.apiError('getAdminGalleryPhotos', error);
      throw error;
    }
  }

  // Bulk Operations
  async bulkUpdateGalleries(operation: BulkGalleryOperation): Promise<{
    success: string[];
    failed: Array<{ id: string; error: string }>;
  }> {
    try {
      const { data, error } = await supabase.rpc('admin_bulk_update_galleries', {
        gallery_ids: operation.galleryIds,
        operation_type: operation.type,
        payload: operation.payload || {}
      });

      if (error) {
        logger.apiError('bulkUpdateGalleries', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.apiError('bulkUpdateGalleries', error);
      throw error;
    }
  }

  async bulkUpdatePhotos(operation: BulkPhotoOperation): Promise<{
    success: string[];
    failed: Array<{ id: string; error: string }>;
  }> {
    try {
      const { data, error } = await supabase.rpc('admin_bulk_update_photos', {
        photo_ids: operation.photoIds,
        operation_type: operation.type,
        payload: operation.payload || {}
      });

      if (error) {
        logger.apiError('bulkUpdatePhotos', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.apiError('bulkUpdatePhotos', error);
      throw error;
    }
  }

  // Moderation
  async getModerationQueue(params?: {
    entityType?: 'gallery' | 'photo';
    status?: 'pending' | 'approved' | 'rejected';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    page?: number;
    limit?: number;
  }): Promise<{
    items: ModerationQueueItem[];
    totalCount: number;
    totalPages: number;
  }> {
    try {
      const {
        entityType,
        status = 'pending',
        priority,
        page = 1,
        limit = 25
      } = params || {};

      let query = supabase
        .from(this.moderationTableName)
        .select(`
          *,
          submitted_by_user:members!moderation_queue_submitted_by_fkey(
            id,
            name,
            email,
            avatar_url
          ),
          reviewed_by_user:members!moderation_queue_reviewed_by_fkey(
            id,
            name,
            email,
            avatar_url
          )
        `, { count: 'exact' })
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (entityType) {
        query = query.eq('entity_type', entityType);
      }

      if (priority) {
        query = query.eq('priority', priority);
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        logger.apiError('getModerationQueue', error);
        throw error;
      }

      return {
        items: (data || []) as ModerationQueueItem[],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      logger.apiError('getModerationQueue', error);
      throw error;
    }
  }

  async processModeration(decision: ModerationDecision): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('process_moderation_decision', {
        item_id: decision.itemId,
        action: decision.action,
        notes: decision.notes,
        additional_actions: decision.additionalActions || {}
      });

      if (error) {
        logger.apiError('processModeration', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.apiError('processModeration', error);
      throw error;
    }
  }

  // Analytics
  async getGalleryAnalytics(galleryId: string, timeframe: string): Promise<GalleryAnalytics> {
    try {
      const { data, error } = await supabase.rpc('get_gallery_analytics', {
        gallery_id: galleryId,
        timeframe
      });

      if (error) {
        logger.apiError('getGalleryAnalytics', error);
        throw error;
      }

      return data as GalleryAnalytics;
    } catch (error) {
      logger.apiError('getGalleryAnalytics', error);
      throw error;
    }
  }

  async getAdminDashboardStats(): Promise<AdminDashboardStats> {
    try {
      const { data, error } = await supabase.rpc('get_admin_dashboard_stats');

      if (error) {
        logger.apiError('getAdminDashboardStats', error);
        throw error;
      }

      return data as AdminDashboardStats;
    } catch (error) {
      logger.apiError('getAdminDashboardStats', error);
      throw error;
    }
  }

  // CRUD Operations
  async createAdminGallery(formData: AdminGalleryFormData): Promise<AdminGalleryView> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const galleryData = {
        title: formData.title,
        description: formData.description,
        slug: formData.slug,
        privacy_level: formData.privacyLevel,
        visibility: formData.visibility,
        is_featured: formData.featured,
        tags: formData.tags,
        user_id: formData.ownerId || user.user.id,
        owner_type: formData.ownerType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sort_order: 0,
        view_count: 0,
        photo_count: 0
      };

      const { data, error } = await supabase
        .from(this.baseTableName)
        .insert([galleryData])
        .select()
        .single();

      if (error) {
        logger.apiError('createAdminGallery', error);
        throw error;
      }

      return data as AdminGalleryView;
    } catch (error) {
      logger.apiError('createAdminGallery', error);
      throw error;
    }
  }

  async updateAdminGallery(id: string, formData: AdminGalleryFormData): Promise<AdminGalleryView> {
    try {
      const updates = {
        title: formData.title,
        description: formData.description,
        slug: formData.slug,
        privacy_level: formData.privacyLevel,
        visibility: formData.visibility,
        is_featured: formData.featured,
        tags: formData.tags,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(this.baseTableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.apiError('updateAdminGallery', error);
        throw error;
      }

      return data as AdminGalleryView;
    } catch (error) {
      logger.apiError('updateAdminGallery', error);
      throw error;
    }
  }

  async deleteAdminGallery(id: string): Promise<boolean> {
    try {
      // First get all photos to delete from storage
      const { data: photos } = await supabase
        .from(this.photoTableName)
        .select('storage_path, thumbnail_path, medium_path, large_path, original_path')
        .eq('gallery_id', id);

      // Delete files from storage
      if (photos && photos.length > 0) {
        const filePaths = photos.flatMap(photo => [
          photo.storage_path,
          photo.thumbnail_path,
          photo.medium_path,
          photo.large_path,
          photo.original_path
        ].filter(Boolean));

        if (filePaths.length > 0) {
          const { error: storageError } = await supabase.storage
            .from('gallery-photos')
            .remove(filePaths);

          if (storageError) {
            logger.warn('Error deleting gallery files from storage', 'ADMIN_GALLERY', storageError);
          }
        }
      }

      // Delete gallery (photos will be cascade deleted)
      const { error } = await supabase
        .from(this.baseTableName)
        .delete()
        .eq('id', id);

      if (error) {
        logger.apiError('deleteAdminGallery', error);
        throw error;
      }

      return true;
    } catch (error) {
      logger.apiError('deleteAdminGallery', error);
      throw error;
    }
  }

  async updateAdminPhoto(id: string, formData: AdminPhotoFormData): Promise<AdminPhotoView> {
    try {
      const updates = {
        title: formData.title,
        description: formData.description,
        alt_text: formData.altText,
        caption: formData.caption,
        tags: formData.tags,
        visibility: formData.visibility,
        sort_order: formData.sortOrder,
        metadata: formData.metadata,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(this.photoTableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.apiError('updateAdminPhoto', error);
        throw error;
      }

      return data as AdminPhotoView;
    } catch (error) {
      logger.apiError('updateAdminPhoto', error);
      throw error;
    }
  }

  // Private helper methods
  private async getGalleryAggregations(filters: AdminGalleryFilters) {
    try {
      const { data, error } = await supabase.rpc('get_gallery_aggregations', { filters });

      if (error) {
        logger.warn('Error getting gallery aggregations', 'ADMIN_GALLERY', error);
        return {
          byPrivacyLevel: {},
          byModerationStatus: {},
          byOwnerType: {},
          totalPhotos: 0,
          totalViews: 0
        };
      }

      return data;
    } catch (error) {
      logger.warn('Error getting gallery aggregations', 'ADMIN_GALLERY', error);
      return {
        byPrivacyLevel: {},
        byModerationStatus: {},
        byOwnerType: {},
        totalPhotos: 0,
        totalViews: 0
      };
    }
  }

  private async getPhotoAggregations(galleryId: string, filters: AdminPhotoFilters) {
    try {
      const { data, error } = await supabase.rpc('get_photo_aggregations', { 
        gallery_id: galleryId,
        filters 
      });

      if (error) {
        logger.warn('Error getting photo aggregations', 'ADMIN_GALLERY', error);
        return {
          byModerationStatus: {},
          byProcessingStatus: {},
          totalFileSize: 0,
          averageFileSize: 0
        };
      }

      return data;
    } catch (error) {
      logger.warn('Error getting photo aggregations', 'ADMIN_GALLERY', error);
      return {
        byModerationStatus: {},
        byProcessingStatus: {},
        totalFileSize: 0,
        averageFileSize: 0
      };
    }
  }
}

export const adminGalleryApi = new AdminGalleryApi();