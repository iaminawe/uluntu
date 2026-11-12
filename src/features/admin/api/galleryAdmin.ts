import { supabase } from '@/lib/supabase';
import type {
  AdminPhotoStats,
  AdminGalleryStats,
  PhotoModerationQueue,
  StorageAnalytics,
  AdminGalleryFilters,
  AdminPhotoFilters,
  BulkPhotoAction,
  BulkGalleryAction,
  PhotoReorderRequest,
  GalleryAccessControl,
  AdminAuditLog,
  BatchOperationResult,
  AdminGalleriesResponse,
  AdminPhotosResponse,
  ModerationQueueResponse,
  GallerySystemSettings,
  PhotoUploadValidation
} from '@/types/adminGallery';
import { logger } from '@/utils/logger';
import { adminActivityLogger } from '@/services/adminActivityLogger';
import { ApiResponse, PaginationParams } from '@/shared/api/types';

/**
 * Admin Gallery Management API
 * Provides comprehensive admin functionality for gallery and photo management
 */
export class AdminGalleryAPI {
  
  /**
   * PHOTO MANAGEMENT ENDPOINTS
   */

  /**
   * Get photos with admin metadata and filtering
   * GET /api/admin/galleries/{galleryId}/photos
   */
  async getGalleryPhotosAdmin(
    galleryId: string,
    filters?: AdminPhotoFilters & PaginationParams
  ): Promise<ApiResponse<AdminPhotosResponse>> {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      // Build the query with admin-specific data
      let query = supabase
        .from('gallery_photos')
        .select(`
          *,
          user:members!gallery_photos_user_id_fkey(id, name, email),
          gallery:user_galleries!gallery_photos_gallery_id_fkey(id, title, privacy_level),
          photo_likes(count),
          photo_comments(count)
        `, { count: 'exact' })
        .eq('gallery_id', galleryId);

      // Apply filters
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,file_name.ilike.%${filters.search}%`);
      }

      if (filters?.moderation_status) {
        query = query.eq('moderation_status', filters.moderation_status);
      }

      if (filters?.visibility) {
        query = query.eq('visibility', filters.visibility);
      }

      if (filters?.file_type) {
        query = query.ilike('mime_type', `${filters.file_type}%`);
      }

      if (filters?.created_after) {
        query = query.gte('created_at', filters.created_after);
      }

      if (filters?.created_before) {
        query = query.lte('created_at', filters.created_before);
      }

      if (filters?.min_file_size) {
        query = query.gte('file_size', filters.min_file_size);
      }

      if (filters?.max_file_size) {
        query = query.lte('file_size', filters.max_file_size);
      }

      // Sorting
      const sortBy = filters?.sort_by || 'created_at';
      const sortOrder = filters?.sort_order || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Pagination
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        logger.apiError('getGalleryPhotosAdmin', error);
        return {
          data: null,
          error: {
            message: 'Failed to fetch gallery photos',
            code: 'FETCH_ERROR',
            details: error
          },
          status: 500
        };
      }

      // Transform data to admin format
      const photos: AdminPhotoStats[] = (data || []).map(photo => ({
        id: photo.id,
        file_name: photo.file_name,
        file_size: photo.file_size,
        view_count: photo.view_count || 0,
        like_count: photo.photo_likes?.[0]?.count || 0,
        comment_count: photo.photo_comments?.[0]?.count || 0,
        download_count: 0, // TODO: Track downloads
        storage_usage: photo.file_size,
        created_at: photo.created_at,
        moderation_status: photo.moderation_status || 'pending',
        user: {
          id: photo.user.id,
          name: photo.user.name,
          email: photo.user.email
        },
        gallery: {
          id: photo.gallery.id,
          title: photo.gallery.title,
          privacy_level: photo.gallery.privacy_level
        }
      }));

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / limit);

      return {
        data: {
          photos,
          total_count: totalCount,
          current_page: page,
          total_pages: totalPages,
          has_more: page < totalPages,
          filters_applied: filters || {}
        },
        error: null,
        status: 200
      };

    } catch (error) {
      logger.apiError('getGalleryPhotosAdmin', error);
      return {
        data: null,
        error: {
          message: 'Internal server error',
          code: 'SERVER_ERROR',
          details: error
        },
        status: 500
      };
    }
  }

  /**
   * Delete individual photo with admin privileges
   * DELETE /api/admin/photos/{photoId}
   */
  async deletePhotoAdmin(photoId: string, reason?: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          data: null,
          error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
          status: 401
        };
      }

      // Get photo details for audit log
      const { data: photo, error: fetchError } = await supabase
        .from('gallery_photos')
        .select('*, user:members(name, email), gallery:user_galleries(title)')
        .eq('id', photoId)
        .single();

      if (fetchError || !photo) {
        return {
          data: null,
          error: { message: 'Photo not found', code: 'NOT_FOUND' },
          status: 404
        };
      }

      // Delete from storage first
      const { error: storageError } = await supabase.storage
        .from('gallery-photos')
        .remove([photo.storage_path]);

      if (storageError) {
        logger.warn('Failed to delete photo from storage', 'ADMIN_GALLERY', storageError);
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('gallery_photos')
        .delete()
        .eq('id', photoId);

      if (deleteError) {
        logger.apiError('deletePhotoAdmin', deleteError);
        return {
          data: null,
          error: {
            message: 'Failed to delete photo',
            code: 'DELETE_ERROR',
            details: deleteError
          },
          status: 500
        };
      }

      // Log admin action
      await adminActivityLogger.logActivity({
        adminId: user.id,
        action: 'DELETE_PHOTO',
        entityType: 'photo',
        entityId: photoId,
        details: {
          photo_name: photo.file_name,
          gallery_title: photo.gallery?.title,
          user_name: photo.user?.name,
          reason: reason
        }
      });

      return {
        data: { success: true },
        error: null,
        status: 200
      };

    } catch (error) {
      logger.apiError('deletePhotoAdmin', error);
      return {
        data: null,
        error: {
          message: 'Internal server error',
          code: 'SERVER_ERROR',
          details: error
        },
        status: 500
      };
    }
  }

  /**
   * Update photo metadata with admin privileges
   * PATCH /api/admin/photos/{photoId}
   */
  async updatePhotoAdmin(
    photoId: string, 
    updates: {
      title?: string;
      description?: string;
      tags?: string[];
      visibility?: 'visible' | 'hidden';
      moderation_status?: 'pending' | 'approved' | 'rejected' | 'flagged';
      moderation_notes?: string;
    }
  ): Promise<ApiResponse<AdminPhotoStats>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          data: null,
          error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
          status: 401
        };
      }

      // Get current photo data for audit log
      const { data: currentPhoto } = await supabase
        .from('gallery_photos')
        .select('*')
        .eq('id', photoId)
        .single();

      // Update photo
      const { data: updatedPhoto, error: updateError } = await supabase
        .from('gallery_photos')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', photoId)
        .select(`
          *,
          user:members!gallery_photos_user_id_fkey(id, name, email),
          gallery:user_galleries!gallery_photos_gallery_id_fkey(id, title, privacy_level)
        `)
        .single();

      if (updateError) {
        logger.apiError('updatePhotoAdmin', updateError);
        return {
          data: null,
          error: {
            message: 'Failed to update photo',
            code: 'UPDATE_ERROR',
            details: updateError
          },
          status: 500
        };
      }

      // Log admin action
      await adminActivityLogger.logActivity({
        adminId: user.id,
        action: 'UPDATE_PHOTO',
        entityType: 'photo',
        entityId: photoId,
        details: {
          old_values: currentPhoto,
          new_values: updates,
          photo_name: updatedPhoto.file_name
        }
      });

      // Transform to admin format
      const adminPhoto: AdminPhotoStats = {
        id: updatedPhoto.id,
        file_name: updatedPhoto.file_name,
        file_size: updatedPhoto.file_size,
        view_count: updatedPhoto.view_count || 0,
        like_count: 0, // TODO: Get actual count
        comment_count: 0, // TODO: Get actual count
        download_count: 0,
        storage_usage: updatedPhoto.file_size,
        created_at: updatedPhoto.created_at,
        moderation_status: updatedPhoto.moderation_status || 'pending',
        user: {
          id: updatedPhoto.user.id,
          name: updatedPhoto.user.name,
          email: updatedPhoto.user.email
        },
        gallery: {
          id: updatedPhoto.gallery.id,
          title: updatedPhoto.gallery.title,
          privacy_level: updatedPhoto.gallery.privacy_level
        }
      };

      return {
        data: adminPhoto,
        error: null,
        status: 200
      };

    } catch (error) {
      logger.apiError('updatePhotoAdmin', error);
      return {
        data: null,
        error: {
          message: 'Internal server error',
          code: 'SERVER_ERROR',
          details: error
        },
        status: 500
      };
    }
  }

  /**
   * Reorder photos in a gallery
   * POST /api/admin/galleries/{galleryId}/photos/reorder
   */
  async reorderGalleryPhotos(request: PhotoReorderRequest): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          data: null,
          error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
          status: 401
        };
      }

      // Validate gallery exists and user has permission
      const { data: gallery, error: galleryError } = await supabase
        .from('user_galleries')
        .select('id, title')
        .eq('id', request.gallery_id)
        .single();

      if (galleryError || !gallery) {
        return {
          data: null,
          error: { message: 'Gallery not found', code: 'NOT_FOUND' },
          status: 404
        };
      }

      // Update photo orders in batch
      const updatePromises = request.photo_orders.map(({ photo_id, sort_order }) =>
        supabase
          .from('gallery_photos')
          .update({ sort_order, updated_at: new Date().toISOString() })
          .eq('id', photo_id)
          .eq('gallery_id', request.gallery_id)
      );

      const results = await Promise.all(updatePromises);
      const hasError = results.some(result => result.error);

      if (hasError) {
        return {
          data: null,
          error: {
            message: 'Failed to reorder some photos',
            code: 'REORDER_ERROR'
          },
          status: 500
        };
      }

      // Log admin action
      await adminActivityLogger.logActivity({
        adminId: user.id,
        action: 'REORDER_PHOTOS',
        entityType: 'gallery',
        entityId: request.gallery_id,
        details: {
          gallery_title: gallery.title,
          photos_reordered: request.photo_orders.length,
          new_order: request.photo_orders
        }
      });

      return {
        data: { success: true },
        error: null,
        status: 200
      };

    } catch (error) {
      logger.apiError('reorderGalleryPhotos', error);
      return {
        data: null,
        error: {
          message: 'Internal server error',
          code: 'SERVER_ERROR',
          details: error
        },
        status: 500
      };
    }
  }

  /**
   * Bulk delete photos
   * POST /api/admin/photos/bulk-delete
   */
  async bulkDeletePhotos(photoIds: string[], reason?: string): Promise<ApiResponse<BatchOperationResult>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          data: null,
          error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
          status: 401
        };
      }

      const operationId = `bulk_delete_${Date.now()}`;
      const successfulItems: string[] = [];
      const failedItems: Array<{ id: string; error: string }> = [];

      // Get photo details for cleanup and audit
      const { data: photos, error: fetchError } = await supabase
        .from('gallery_photos')
        .select('id, file_name, storage_path, user:members(name), gallery:user_galleries(title)')
        .in('id', photoIds);

      if (fetchError) {
        return {
          data: null,
          error: {
            message: 'Failed to fetch photos for deletion',
            code: 'FETCH_ERROR',
            details: fetchError
          },
          status: 500
        };
      }

      // Delete the rows in one request, then their files in one request.
      // Rows go first so a failure never leaves a row pointing at a missing file.
      const ids = (photos || []).map(photo => photo.id);
      if (ids.length > 0) {
        const { data: deleted, error: deleteError } = await supabase
          .from('gallery_photos')
          .delete()
          .in('id', ids)
          .select('id');

        const deletedIds = new Set((deleted || []).map(row => row.id));
        for (const photo of photos || []) {
          if (deletedIds.has(photo.id)) {
            successfulItems.push(photo.id);
          } else {
            failedItems.push({
              id: photo.id,
              error: deleteError?.message || 'Photo was not deleted'
            });
          }
        }

        const paths = (photos || [])
          .filter(photo => deletedIds.has(photo.id) && photo.storage_path)
          .map(photo => photo.storage_path);
        if (paths.length > 0) {
          const { error: storageError } = await supabase.storage
            .from('gallery-photos')
            .remove(paths);

          if (storageError) {
            logger.warn(`Failed to delete ${paths.length} storage files`, 'ADMIN_GALLERY', storageError);
          }
        }
      }

      // Log admin action
      await adminActivityLogger.logActivity({
        adminId: user.id,
        action: 'BULK_DELETE_PHOTOS',
        entityType: 'photo',
        details: {
          total_requested: photoIds.length,
          successful_deletions: successfulItems.length,
          failed_deletions: failedItems.length,
          reason: reason,
          operation_id: operationId
        }
      });

      const result: BatchOperationResult = {
        success_count: successfulItems.length,
        error_count: failedItems.length,
        total_requested: photoIds.length,
        successful_items: successfulItems,
        failed_items: failedItems,
        operation_id: operationId,
        completed_at: new Date().toISOString()
      };

      return {
        data: result,
        error: null,
        status: 200
      };

    } catch (error) {
      logger.apiError('bulkDeletePhotos', error);
      return {
        data: null,
        error: {
          message: 'Internal server error',
          code: 'SERVER_ERROR',
          details: error
        },
        status: 500
      };
    }
  }

  /**
   * GALLERY MANAGEMENT ENDPOINTS
   */

  /**
   * Get all galleries with admin stats
   * GET /api/admin/galleries
   */
  async getAllGalleriesAdmin(
    filters?: AdminGalleryFilters & PaginationParams
  ): Promise<ApiResponse<AdminGalleriesResponse>> {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      // Use RPC function for complex admin query with stats
      const { data, error, count } = await supabase
        .rpc('get_admin_galleries', {
          p_filters: filters || {},
          p_limit: limit,
          p_offset: from
        });

      if (error) {
        logger.apiError('getAllGalleriesAdmin', error);
        return {
          data: null,
          error: {
            message: 'Failed to fetch galleries',
            code: 'FETCH_ERROR',
            details: error
          },
          status: 500
        };
      }

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / limit);

      return {
        data: {
          galleries: data || [],
          total_count: totalCount,
          current_page: page,
          total_pages: totalPages,
          has_more: page < totalPages,
          filters_applied: filters || {}
        },
        error: null,
        status: 200
      };

    } catch (error) {
      logger.apiError('getAllGalleriesAdmin', error);
      return {
        data: null,
        error: {
          message: 'Internal server error',
          code: 'SERVER_ERROR',
          details: error
        },
        status: 500
      };
    }
  }

  /**
   * Delete gallery and all photos
   * DELETE /api/admin/galleries/{galleryId}
   */
  async deleteGalleryAdmin(galleryId: string, reason?: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          data: null,
          error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
          status: 401
        };
      }

      // Get gallery and photo details for cleanup and audit
      const { data: gallery, error: galleryError } = await supabase
        .from('user_galleries')
        .select(`
          *,
          user:members(name, email),
          gallery_photos(id, storage_path, file_name)
        `)
        .eq('id', galleryId)
        .single();

      if (galleryError || !gallery) {
        return {
          data: null,
          error: { message: 'Gallery not found', code: 'NOT_FOUND' },
          status: 404
        };
      }

      // Delete all photos from storage
      const photoPaths = gallery.gallery_photos?.map(p => p.storage_path) || [];
      if (photoPaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('gallery-photos')
          .remove(photoPaths);

        if (storageError) {
          logger.warn('Failed to delete some photos from storage', 'ADMIN_GALLERY', storageError);
        }
      }

      // Delete gallery (cascade will delete photos)
      const { error: deleteError } = await supabase
        .from('user_galleries')
        .delete()
        .eq('id', galleryId);

      if (deleteError) {
        logger.apiError('deleteGalleryAdmin', deleteError);
        return {
          data: null,
          error: {
            message: 'Failed to delete gallery',
            code: 'DELETE_ERROR',
            details: deleteError
          },
          status: 500
        };
      }

      // Log admin action
      await adminActivityLogger.logActivity({
        adminId: user.id,
        action: 'DELETE_GALLERY',
        entityType: 'gallery',
        entityId: galleryId,
        details: {
          gallery_title: gallery.title,
          user_name: gallery.user?.name,
          photos_deleted: gallery.gallery_photos?.length || 0,
          reason: reason
        }
      });

      return {
        data: { success: true },
        error: null,
        status: 200
      };

    } catch (error) {
      logger.apiError('deleteGalleryAdmin', error);
      return {
        data: null,
        error: {
          message: 'Internal server error',
          code: 'SERVER_ERROR',
          details: error
        },
        status: 500
      };
    }
  }

  /**
   * Update gallery metadata with admin privileges
   * PATCH /api/admin/galleries/{galleryId}
   */
  async updateGalleryAdmin(
    galleryId: string,
    updates: {
      title?: string;
      description?: string;
      privacy_level?: 'public' | 'members_only' | 'private';
      visibility?: 'visible' | 'hidden' | 'archived';
      tags?: string[];
      is_featured?: boolean;
    }
  ): Promise<ApiResponse<AdminGalleryStats>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          data: null,
          error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
          status: 401
        };
      }

      // Get current gallery data for audit
      const { data: currentGallery } = await supabase
        .from('user_galleries')
        .select('*')
        .eq('id', galleryId)
        .single();

      // Update gallery
      const { data: updatedGallery, error: updateError } = await supabase
        .from('user_galleries')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', galleryId)
        .select(`
          *,
          user:members(id, name, email)
        `)
        .single();

      if (updateError) {
        logger.apiError('updateGalleryAdmin', updateError);
        return {
          data: null,
          error: {
            message: 'Failed to update gallery',
            code: 'UPDATE_ERROR',
            details: updateError
          },
          status: 500
        };
      }

      // Log admin action
      await adminActivityLogger.logActivity({
        adminId: user.id,
        action: 'UPDATE_GALLERY',
        entityType: 'gallery',
        entityId: galleryId,
        details: {
          old_values: currentGallery,
          new_values: updates,
          gallery_title: updatedGallery.title
        }
      });

      // Transform to admin format
      const adminGallery: AdminGalleryStats = {
        id: updatedGallery.id,
        title: updatedGallery.title,
        photo_count: updatedGallery.photo_count || 0,
        view_count: updatedGallery.view_count || 0,
        total_file_size: 0, // TODO: Calculate
        storage_usage: 0, // TODO: Calculate
        privacy_level: updatedGallery.privacy_level,
        visibility: updatedGallery.visibility,
        created_at: updatedGallery.created_at,
        updated_at: updatedGallery.updated_at,
        user: {
          id: updatedGallery.user.id,
          name: updatedGallery.user.name,
          email: updatedGallery.user.email
        },
        recent_activity: updatedGallery.updated_at,
        flagged_photos_count: 0 // TODO: Calculate
      };

      return {
        data: adminGallery,
        error: null,
        status: 200
      };

    } catch (error) {
      logger.apiError('updateGalleryAdmin', error);
      return {
        data: null,
        error: {
          message: 'Internal server error',
          code: 'SERVER_ERROR',
          details: error
        },
        status: 500
      };
    }
  }

  /**
   * Bulk upload photos to gallery with admin validation
   * POST /api/admin/galleries/{galleryId}/photos/upload
   */
  async bulkUploadPhotosAdmin(galleryId: string, files: File[]): Promise<ApiResponse<BatchOperationResult>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          data: null,
          error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
          status: 401
        };
      }

      // Validate gallery exists
      const { data: gallery, error: galleryError } = await supabase
        .from('user_galleries')
        .select('id, title')
        .eq('id', galleryId)
        .single();

      if (galleryError || !gallery) {
        return {
          data: null,
          error: { message: 'Gallery not found', code: 'NOT_FOUND' },
          status: 404
        };
      }

      const operationId = `bulk_upload_${Date.now()}`;
      const successfulItems: string[] = [];
      const failedItems: Array<{ id: string; error: string }> = [];

      // Process files individually
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = `${Date.now()}-${i}-${file.name}`;
        
        try {
          // Upload to storage
          const { error: uploadError, data: uploadData } = await supabase.storage
            .from('gallery-photos')
            .upload(`gallery/${fileName}`, file);

          if (uploadError) {
            failedItems.push({
              id: fileName,
              error: uploadError.message
            });
            continue;
          }

          // Create photo record
          const { error: createError, data: photoData } = await supabase
            .from('gallery_photos')
            .insert({
              gallery_id: galleryId,
              user_id: user.id,
              file_name: fileName,
              original_file_name: file.name,
              file_size: file.size,
              mime_type: file.type,
              storage_path: uploadData.path,
              title: file.name,
              visibility: 'visible',
              moderation_status: 'approved', // Admin uploads are auto-approved
              sort_order: i,
              processing_status: 'completed'
            })
            .select()
            .single();

          if (createError) {
            // Clean up uploaded file
            await supabase.storage.from('gallery-photos').remove([uploadData.path]);
            failedItems.push({
              id: fileName,
              error: createError.message
            });
          } else {
            successfulItems.push(photoData.id);
          }

        } catch (error) {
          failedItems.push({
            id: fileName,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Log admin action
      await adminActivityLogger.logActivity({
        adminId: user.id,
        action: 'BULK_UPLOAD_PHOTOS',
        entityType: 'gallery',
        entityId: galleryId,
        details: {
          gallery_title: gallery.title,
          total_files: files.length,
          successful_uploads: successfulItems.length,
          failed_uploads: failedItems.length,
          operation_id: operationId
        }
      });

      const result: BatchOperationResult = {
        success_count: successfulItems.length,
        error_count: failedItems.length,
        total_requested: files.length,
        successful_items: successfulItems,
        failed_items: failedItems,
        operation_id: operationId,
        completed_at: new Date().toISOString()
      };

      return {
        data: result,
        error: null,
        status: 200
      };

    } catch (error) {
      logger.apiError('bulkUploadPhotosAdmin', error);
      return {
        data: null,
        error: {
          message: 'Internal server error',
          code: 'SERVER_ERROR',
          details: error
        },
        status: 500
      };
    }
  }

  /**
   * Get storage analytics
   * GET /api/admin/analytics/storage
   */
  async getStorageAnalytics(): Promise<ApiResponse<StorageAnalytics>> {
    try {
      const { data, error } = await supabase
        .rpc('get_storage_analytics');

      if (error) {
        logger.apiError('getStorageAnalytics', error);
        return {
          data: null,
          error: {
            message: 'Failed to fetch storage analytics',
            code: 'FETCH_ERROR',
            details: error
          },
          status: 500
        };
      }

      return {
        data: data || {
          total_storage_used: 0,
          total_photos: 0,
          total_galleries: 0,
          average_file_size: 0,
          storage_by_user: [],
          storage_by_month: [],
          largest_files: []
        },
        error: null,
        status: 200
      };

    } catch (error) {
      logger.apiError('getStorageAnalytics', error);
      return {
        data: null,
        error: {
          message: 'Internal server error',
          code: 'SERVER_ERROR',
          details: error
        },
        status: 500
      };
    }
  }

  /**
   * Get moderation queue
   * GET /api/admin/moderation/photos
   */
  async getModerationQueue(
    filters?: { status?: 'pending' | 'under_review' | 'resolved' } & PaginationParams
  ): Promise<ApiResponse<ModerationQueueResponse>> {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .rpc('get_photo_moderation_queue', {
          p_status: filters?.status,
          p_limit: limit,
          p_offset: from
        });

      if (error) {
        logger.apiError('getModerationQueue', error);
        return {
          data: null,
          error: {
            message: 'Failed to fetch moderation queue',
            code: 'FETCH_ERROR',
            details: error
          },
          status: 500
        };
      }

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / limit);

      // Get status counts
      const { data: statusCounts } = await supabase
        .rpc('get_moderation_status_counts');

      return {
        data: {
          queue_items: data || [],
          total_pending: statusCounts?.pending || 0,
          total_under_review: statusCounts?.under_review || 0,
          current_page: page,
          total_pages: totalPages
        },
        error: null,
        status: 200
      };

    } catch (error) {
      logger.apiError('getModerationQueue', error);
      return {
        data: null,
        error: {
          message: 'Internal server error',
          code: 'SERVER_ERROR',
          details: error
        },
        status: 500
      };
    }
  }

  /**
   * Get admin audit logs
   * GET /api/admin/audit-logs
   */
  async getAuditLogs(
    filters?: {
      admin_id?: string;
      entity_type?: 'gallery' | 'photo' | 'user' | 'system';
      action?: string;
      start_date?: string;
      end_date?: string;
    } & PaginationParams
  ): Promise<ApiResponse<{ logs: AdminAuditLog[]; total: number }>> {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 50;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('admin_activity_logs')
        .select(`
          *,
          admin:members!admin_activity_logs_admin_id_fkey(name, email)
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.admin_id) {
        query = query.eq('admin_id', filters.admin_id);
      }

      if (filters?.entity_type) {
        query = query.eq('entity_type', filters.entity_type);
      }

      if (filters?.action) {
        query = query.eq('action', filters.action);
      }

      if (filters?.start_date) {
        query = query.gte('created_at', filters.start_date);
      }

      if (filters?.end_date) {
        query = query.lte('created_at', filters.end_date);
      }

      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        logger.apiError('getAuditLogs', error);
        return {
          data: null,
          error: {
            message: 'Failed to fetch audit logs',
            code: 'FETCH_ERROR',
            details: error
          },
          status: 500
        };
      }

      const logs: AdminAuditLog[] = (data || []).map(log => ({
        id: log.id,
        admin_id: log.admin_id,
        admin_name: log.admin?.name || 'Unknown',
        admin_email: log.admin?.email || 'Unknown',
        action: log.action,
        entity_type: log.entity_type,
        entity_id: log.entity_id,
        entity_name: log.entity_name,
        details: log.details || {},
        ip_address: log.ip_address,
        user_agent: log.user_agent,
        created_at: log.created_at
      }));

      return {
        data: {
          logs,
          total: count || 0
        },
        error: null,
        status: 200
      };

    } catch (error) {
      logger.apiError('getAuditLogs', error);
      return {
        data: null,
        error: {
          message: 'Internal server error',
          code: 'SERVER_ERROR',
          details: error
        },
        status: 500
      };
    }
  }
}

// Export singleton instance
export const adminGalleryApi = new AdminGalleryAPI();