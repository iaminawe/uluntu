import { supabase } from '@/lib/supabase';
import { Photo, Gallery, PhotoUploadInput, GalleryFilters } from '../types';

export const galleryApi = {
  // Gallery CRUD operations
  async getAllGalleries(filters?: GalleryFilters): Promise<Gallery[]> {
    let query = supabase
      .from('user_galleries')
      .select(`
        *,
        gallery_photos!gallery_photos_gallery_id_fkey (*),
        owner:members!user_id (
          id,
          name,
          image
        )
      `)
      .order('created_at', { ascending: false });

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
      query = query.eq('owner_id', filters.ownerId);
    }

    if (filters?.dateRange) {
      query = query
        .gte('created_at', filters.dateRange.start)
        .lte('created_at', filters.dateRange.end);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching galleries:', error);
      throw error;
    }

    // Transform data to match interface
    const galleries = (data || []).map(gallery => ({
      ...gallery,
      photos: gallery.gallery_photos || [],
      createdAt: gallery.created_at,
      updatedAt: gallery.updated_at,
      ownerId: gallery.user_id,
      privacy: gallery.privacy_level === 'members_only' ? 'unlisted' : gallery.privacy_level
    }));
    
    return galleries;
  },

  async getGalleryById(id: string): Promise<Gallery | null> {
    const { data, error } = await supabase
      .from('user_galleries')
      .select(`
        *,
        gallery_photos!gallery_photos_gallery_id_fkey (*),
        owner:members!user_id (
          id,
          name,
          image
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching gallery:', error);
      throw error;
    }

    if (!data) return null;
    
    // Transform data to match interface
    return {
      ...data,
      photos: data.gallery_photos || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      ownerId: data.user_id,
      privacy: data.privacy_level === 'members_only' ? 'unlisted' : data.privacy_level
    };
  },

  async createGallery(gallery: Partial<Gallery>): Promise<Gallery> {
    const { data, error } = await supabase
      .from('user_galleries')
      .insert([gallery])
      .select()
      .single();

    if (error) {
      console.error('Error creating gallery:', error);
      throw error;
    }

    return data;
  },

  async updateGallery(id: string, updates: Partial<Gallery>): Promise<Gallery> {
    const { data, error } = await supabase
      .from('user_galleries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating gallery:', error);
      throw error;
    }

    return data;
  },

  async deleteGallery(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_galleries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting gallery:', error);
      throw error;
    }

    return true;
  },

  async getGalleryPhotos(galleryId: string): Promise<Photo[]> {
    const { data, error } = await supabase
      .from('gallery_photos')
      .select('*')
      .eq('gallery_id', galleryId)
      .eq('visibility', 'visible')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching gallery photos:', error);
      throw error;
    }

    return data || [];
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
            console.warn(`Failed to upload ${sizeType} variant:`, error);
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
        .insert([photoData])
        .select()
        .single();

      if (error) {
        console.error('Error creating photo record:', error);
        // Clean up uploaded files
        const pathsToClean = Object.values(uploadedPaths);
        if (pathsToClean.length > 0) {
          await supabase.storage.from('gallery-photos').remove(pathsToClean);
        }
        throw error;
      }

      // Set the main URL for backward compatibility
      data.url = data.medium_url || data.original_url;

      return data;

    } catch (error) {
      console.error('Error uploading photo:', error);
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
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating photo:', error);
      throw error;
    }

    return data;
  },

  async deletePhoto(id: string): Promise<boolean> {
    // Get photo to delete file
    const { data: photo, error: fetchError } = await supabase
      .from('gallery_photos')
      .select('storage_path')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching photo:', fetchError);
      throw fetchError;
    }

    // Use storage_path directly
    const filePath = photo.storage_path;

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('gallery-photos')
      .remove([filePath]);

    if (storageError) {
      console.error('Error deleting photo file:', storageError);
    }

    // Delete record
    const { error } = await supabase
      .from('gallery_photos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting photo record:', error);
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
      console.error('Error fetching photos:', fetchError);
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
        console.error('Error deleting photo files:', storageError);
      }
    }

    // Delete records
    const { error } = await supabase
      .from('gallery_photos')
      .delete()
      .in('id', photoIds);

    if (error) {
      console.error('Error deleting photo records:', error);
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
      console.error('Error reordering photos');
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
        console.error('Error incrementing view count:', error);
      }
    }
  },

  async toggleLike(galleryId: string, userId: string): Promise<boolean> {
    const { data: existing } = await supabase
      .from('gallery_likes')
      .select()
      .eq('gallery_id', galleryId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      // Unlike
      const { error } = await supabase
        .from('gallery_likes')
        .delete()
        .eq('gallery_id', galleryId)
        .eq('user_id', userId);

      if (error) throw error;
      return false;
    } else {
      // Like
      const { error } = await supabase
        .from('gallery_likes')
        .insert([{ gallery_id: galleryId, user_id: userId }]);

      if (error) throw error;
      return true;
    }
  }
};