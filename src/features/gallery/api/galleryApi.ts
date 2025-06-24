import { supabase } from '@/lib/supabase';
import { Photo, Gallery, PhotoUploadInput, GalleryFilters } from '../types';
import { logger } from '@/utils/logger';

export interface GalleriesResponse {
  galleries: Gallery[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export const galleryApi = {
  // Gallery CRUD operations
  async getAllGalleries(filters?: GalleryFilters & { page?: number; limit?: number }): Promise<GalleriesResponse> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 12;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('user_galleries')
      .select('*', { count: 'exact' })
      .eq('privacy_level', 'public')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters?.privacy) {
      const privacyMap = {
        'public': 'public',
        'private': 'private',
        'unlisted': 'members_only'
      };
      query = query.eq('privacy_level', privacyMap[filters.privacy] || filters.privacy);
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }

    if (filters?.ownerType) {
      query = query.eq('owner_type', filters.ownerType);
    }

    if (filters?.ownerId) {
      query = query.eq('user_id', filters.ownerId);
    }

    if (filters?.dateRange) {
      query = query
        .gte('created_at', filters.dateRange.start)
        .lte('created_at', filters.dateRange.end);
    }

    const { data, error, count } = await query;

    if (error) {
      logger.apiError('getAllGalleries', error);
      throw error;
    }

    // Transform data to match interface
    const galleries = (data || []).map(gallery => {
      return {
        ...gallery,
        photos: [],
        gallery_photos: [],
        cover_photo_url: null, // Will be populated separately if needed
        createdAt: gallery.created_at,
        updatedAt: gallery.updated_at,
        ownerId: gallery.user_id,
        privacy: (gallery.privacy_level === 'members_only' ? 'unlisted' : gallery.privacy_level) as 'public' | 'private' | 'unlisted',
        photo_count: gallery.photo_count || 0
      } as any;
    }) as Gallery[];
    
    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);
    
    return {
      galleries,
      totalCount,
      totalPages,
      currentPage: page
    };
  },

  async getGallery(id: string): Promise<Gallery | null> {
    const { data, error } = await supabase
      .from('user_galleries')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      logger.apiError('getGallery', error);
      throw error;
    }

    if (!data) return null;
    
    // Fetch photos separately
    const { data: photos } = await supabase
      .from('gallery_photos')
      .select('*')
      .eq('gallery_id', id)
      .eq('visibility', 'visible')
      .order('sort_order', { ascending: true });
    
    // Helper function to get public URL from storage path
    const getPublicUrl = (path: string) => {
      if (!path) return null;
      // If it's already a full URL, return as is
      if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
      }
      // Otherwise, construct the public URL
      return supabase.storage.from('gallery-photos').getPublicUrl(path).data.publicUrl;
    };
    
    // Transform photos to include public URLs
    const processedPhotos = (photos || []).map(photo => {
      // Generate public URLs for all path fields
      const processedPhoto = { ...photo };
      
      // Convert paths to URLs if they're not already
      if (photo.thumbnail_path && !photo.thumbnail_url) {
        processedPhoto.thumbnail_url = getPublicUrl(photo.thumbnail_path);
      }
      if ((photo as any).small_path && !(photo as any).small_url) {
        (processedPhoto as any).small_url = getPublicUrl((photo as any).small_path);
      }
      if (photo.medium_path && !photo.medium_url) {
        processedPhoto.medium_url = getPublicUrl(photo.medium_path);
      }
      if ((photo as any).large_path && !(photo as any).large_url) {
        (processedPhoto as any).large_url = getPublicUrl((photo as any).large_path);
      }
      if ((photo as any).original_path && !(photo as any).original_url) {
        (processedPhoto as any).original_url = getPublicUrl((photo as any).original_path);
      }
      if ((photo as any).storage_path && !(photo as any).url) {
        (processedPhoto as any).url = getPublicUrl((photo as any).storage_path);
      }
      
      return processedPhoto;
    });
    
    // Get cover photo URL
    let coverPhotoUrl = null;
    if (data.cover_photo_id && processedPhotos.length > 0) {
      const coverPhoto = processedPhotos.find(p => p.id === data.cover_photo_id);
      if (coverPhoto) {
        coverPhotoUrl = coverPhoto.thumbnail_url || (coverPhoto as any).small_url || (coverPhoto as any).url;
      }
    }
    // Fallback to first photo if no cover photo set
    if (!coverPhotoUrl && processedPhotos.length > 0) {
      coverPhotoUrl = processedPhotos[0].thumbnail_url || (processedPhotos[0] as any).small_url || (processedPhotos[0] as any).url;
    }
    
    // Transform data to match interface
    return {
      ...data,
      photos: processedPhotos as Photo[],
      gallery_photos: processedPhotos as Photo[],
      cover_photo_url: coverPhotoUrl,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      ownerId: data.user_id,
      privacy: (data.privacy_level === 'members_only' ? 'unlisted' : data.privacy_level) as 'public' | 'private' | 'unlisted'
    } as Gallery;
  },

  async createGallery(gallery: Partial<Gallery>): Promise<Gallery> {
    const { data, error } = await supabase
      .from('user_galleries')
      .insert([gallery as any])
      .select()
      .single();

    if (error) {
      logger.apiError('createGallery', error);
      throw error;
    }

    return data as Gallery;
  },

  async updateGallery(id: string, updates: Partial<Gallery>): Promise<Gallery> {
    const { data, error } = await supabase
      .from('user_galleries')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.apiError('updateGallery', error);
      throw error;
    }

    return data as Gallery;
  },

  async deleteGallery(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_galleries')
      .delete()
      .eq('id', id);

    if (error) {
      logger.apiError('deleteGallery', error);
      throw error;
    }

    return true;
  },

  async getGalleryPhotos(galleryId: string, options?: { page?: number; limit?: number }): Promise<Photo[]> {
    let query = supabase
      .from('gallery_photos')
      .select('*')
      .eq('gallery_id', galleryId)
      .eq('visibility', 'visible')
      .order('sort_order', { ascending: true });

    // Add pagination if provided
    if (options?.page && options?.limit) {
      const from = (options.page - 1) * options.limit;
      const to = from + options.limit - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;

    if (error) {
      logger.apiError('getGalleryPhotos', error);
      throw error;
    }

    return (data || []) as Photo[];
  },

  // Photo operations
  async batchUploadPhotos(inputs: PhotoUploadInput[]): Promise<{ success: Photo[]; failed: { input: PhotoUploadInput; error: string }[] }> {
    const results = {
      success: [] as Photo[],
      failed: [] as { input: PhotoUploadInput; error: string }[]
    };

    for (const input of inputs) {
      try {
        const photo = await this.uploadPhoto(input);
        results.success.push(photo);
      } catch (error) {
        results.failed.push({
          input,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  },

  async uploadPhoto(input: PhotoUploadInput): Promise<Photo> {
    const baseFileName = `${Date.now()}-${input.file.name.replace(/\.[^/.]+$/, "")}`;
    const fileExtension = input.file.name.split('.').pop() || 'jpg';
    
    // Storage paths for different sizes
    const storagePaths = {
      original: `gallery/original/${baseFileName}.${fileExtension}`,
      large: `gallery/large/${baseFileName}.${fileExtension}`,
      medium: `gallery/medium/${baseFileName}.${fileExtension}`,
      small: `gallery/small/${baseFileName}.${fileExtension}`,
      thumbnail: `gallery/thumbnail/${baseFileName}.${fileExtension}`
    };

    const uploadedPaths: Record<string, string> = {};
    const uploadedUrls: Record<string, string> = {};

    try {
      // Upload original image
      const originalFile = input.processedImages?.original || input.file;
      const { error: originalError } = await supabase.storage
        .from('gallery-photos')
        .upload(storagePaths.original, originalFile);

      if (originalError) {
        throw originalError;
      }

      uploadedPaths.original = storagePaths.original;
      uploadedUrls.original = supabase.storage
        .from('gallery-photos')
        .getPublicUrl(storagePaths.original).data.publicUrl;

      // Upload processed variants if available
      if (input.processedImages) {
        const sizePromises = Object.entries(input.processedImages).map(async ([sizeType, file]) => {
          if (!file || sizeType === 'original') return; // Original already handled
          
          const sizePath = storagePaths[sizeType as keyof typeof storagePaths];
          if (!sizePath) return;

          const { error } = await supabase.storage
            .from('gallery-photos')
            .upload(sizePath, file);

          if (error) {
            logger.warn(`Failed to upload ${sizeType} variant`, 'GALLERY', error);
            return;
          }

          uploadedPaths[sizeType] = sizePath;
          uploadedUrls[sizeType] = supabase.storage
            .from('gallery-photos')
            .getPublicUrl(sizePath).data.publicUrl;
        });

        await Promise.all(sizePromises);
      }

      // Get dimensions
      const dimensions = input.dimensions || { width: 0, height: 0, aspectRatio: 1 };

      // Create photo record with all variants
      const photoData = {
        gallery_id: input.galleryId,
        user_id: (await supabase.auth.getUser()).data.user?.id || '',
        file_name: `${baseFileName}.${fileExtension}`,
        original_file_name: input.file.name,
        file_size: originalFile.size,
        mime_type: input.file.type,
        // Storage paths
        storage_path: storagePaths.original, // Main path for compatibility
        original_path: uploadedPaths.original,
        large_path: uploadedPaths.large,
        medium_path: uploadedPaths.medium,
        small_path: uploadedPaths.small,
        thumbnail_path: uploadedPaths.thumbnail,
        // URLs
        original_url: uploadedUrls.original,
        large_url: uploadedUrls.large,
        medium_url: uploadedUrls.medium,
        small_url: uploadedUrls.small,
        thumbnail_url: uploadedUrls.thumbnail,
        // Dimensions
        width: dimensions.width,
        height: dimensions.height,
        aspect_ratio: dimensions.aspectRatio,
        // Processing metadata
        placeholder_data: input.placeholder,
        dominant_color: input.dominantColor,
        processing_status: 'completed' as const,
        // Standard fields
        title: input.title || input.file.name,
        description: input.description,
        alt_text: input.title || input.file.name,
        tags: input.tags,
        sort_order: 0,
        visibility: 'visible' as const
      };

      const { data, error } = await supabase
        .from('gallery_photos')
        .insert([photoData as any])
        .select()
        .single();

      if (error) {
        logger.apiError('uploadPhoto - createPhotoRecord', error);
        // Clean up uploaded files
        const pathsToClean = Object.values(uploadedPaths);
        if (pathsToClean.length > 0) {
          await supabase.storage.from('gallery-photos').remove(pathsToClean);
        }
        throw error;
      }

      // Set the main URL for backward compatibility
      (data as any).url = (data as any).medium_url || (data as any).original_url;

      return data as Photo;

    } catch (error) {
      logger.apiError('uploadPhoto', error);
      // Clean up any uploaded files
      const pathsToClean = Object.values(uploadedPaths);
      if (pathsToClean.length > 0) {
        await supabase.storage.from('gallery-photos').remove(pathsToClean);
      }
      throw error;
    }
  },

  async updatePhoto(id: string, updates: Partial<Photo>): Promise<Photo> {
    const { data, error } = await supabase
      .from('gallery_photos')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.apiError('updatePhoto', error);
      throw error;
    }

    return data as Photo;
  },

  async deletePhoto(id: string): Promise<boolean> {
    // Get photo to delete file
    const { data: photo, error: fetchError } = await supabase
      .from('gallery_photos')
      .select('storage_path')
      .eq('id', id)
      .single();

    if (fetchError) {
      logger.apiError('deletePhoto - fetchPhoto', fetchError);
      throw fetchError;
    }

    // Use storage_path directly
    const filePath = photo.storage_path;

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('gallery-photos')
      .remove([filePath]);

    if (storageError) {
      logger.error('Error deleting photo file', 'GALLERY', storageError);
    }

    // Delete record
    const { error } = await supabase
      .from('gallery_photos')
      .delete()
      .eq('id', id);

    if (error) {
      logger.apiError('deletePhoto - deleteRecord', error);
      throw error;
    }

    return true;
  },

  async batchDeletePhotos(photoIds: string[]): Promise<boolean> {
    // Get photos to delete files
    const { data: photos, error: fetchError } = await supabase
      .from('gallery_photos')
      .select('storage_path')
      .in('id', photoIds);

    if (fetchError) {
      logger.apiError('batchDeletePhotos - fetchPhotos', fetchError);
      throw fetchError;
    }

    // Use storage_path directly
    const filePaths = photos.map(photo => photo.storage_path);

    // Delete from storage
    if (filePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('gallery-photos')
        .remove(filePaths);

      if (storageError) {
        logger.error('Error deleting photo files', 'GALLERY', storageError);
      }
    }

    // Delete records
    const { error } = await supabase
      .from('gallery_photos')
      .delete()
      .in('id', photoIds);

    if (error) {
      logger.apiError('batchDeletePhotos - deleteRecords', error);
      throw error;
    }

    return true;
  },

  async reorderPhotos(galleryId: string, photoOrders: { id: string; order: number }[]): Promise<boolean> {
    const updates = photoOrders.map(({ id, order }) => 
      supabase
        .from('gallery_photos')
        .update({ sort_order: order })
        .eq('id', id)
        .eq('gallery_id', galleryId)
    );

    const results = await Promise.all(updates);
    const hasError = results.some(result => result.error);

    if (hasError) {
      logger.error('Error reordering photos', 'GALLERY');
      throw new Error('Failed to reorder photos');
    }

    return true;
  },

  // Gallery stats
  async incrementViewCount(galleryId: string): Promise<void> {
    // Direct update since RPC might not exist
    const { data: gallery } = await supabase
      .from('user_galleries')
      .select('view_count')
      .eq('id', galleryId)
      .single();
      
    if (gallery) {
      const { error } = await supabase
        .from('user_galleries')
        .update({ view_count: (gallery.view_count || 0) + 1 })
        .eq('id', galleryId);
        
      if (error) {
        logger.error('Error incrementing view count', 'GALLERY', error);
      }
    }
  },

  async toggleLike(galleryId: string, userId: string): Promise<boolean> {
    const { data: existing } = await (supabase as any)
      .from('gallery_likes')
      .select()
      .eq('gallery_id', galleryId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      // Unlike
      const { error } = await (supabase as any)
        .from('gallery_likes')
        .delete()
        .eq('gallery_id', galleryId)
        .eq('user_id', userId);

      if (error) throw error;
      return false;
    } else {
      // Like
      const { error } = await (supabase as any)
        .from('gallery_likes')
        .insert([{ gallery_id: galleryId, user_id: userId }]);

      if (error) throw error;
      return true;
    }
  },

  async likePhoto(photoId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: existing } = await (supabase as any)
        .from('photo_likes')
        .select()
        .eq('photo_id', photoId)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        // Unlike
        const { error } = await (supabase as any)
          .from('photo_likes')
          .delete()
          .eq('photo_id', photoId)
          .eq('user_id', user.id);

        if (error) throw error;
        return false;
      } else {
        // Like
        const { error } = await (supabase as any)
          .from('photo_likes')
          .insert([{ photo_id: photoId, user_id: user.id }]);

        if (error) throw error;
        return true;
      }
    } catch (error) {
      logger.apiError('likePhoto', error);
      throw error;
    }
  }
};