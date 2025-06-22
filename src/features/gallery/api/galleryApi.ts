import { supabase } from '@/lib/supabase';
import { Photo, Gallery, PhotoUploadInput, GalleryFilters } from '../types';

export const galleryApi = {
  // Gallery CRUD operations
  async getAllGalleries(filters?: GalleryFilters): Promise<Gallery[]> {
    let query = supabase
      .from('user_galleries')
      .select(`
        *,
        gallery_photos (*),
        owner:members!user_id (
          id,
          name,
          image
        ),
        group:groups!owner_id (
          id,
          name,
          slug,
          hero_image
        ),
        company:companies!owner_id (
          id,
          name,
          slug,
          logo
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
        gallery_photos (*),
        owner:members!user_id (
          id,
          name,
          image
        ),
        group:groups!owner_id (
          id,
          name,
          slug,
          hero_image
        ),
        company:companies!owner_id (
          id,
          name,
          slug,
          logo
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

  // Photo operations
  async uploadPhoto(input: PhotoUploadInput): Promise<Photo> {
    const fileName = `${Date.now()}-${input.file.name}`;
    const filePath = `gallery/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('gallery-photos')
      .upload(filePath, input.file);

    if (uploadError) {
      console.error('Error uploading photo:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('gallery-photos')
      .getPublicUrl(filePath);

    // Create photo record
    const photoData = {
      gallery_id: input.galleryId,
      user_id: '', // This should be set from auth context
      file_name: fileName,
      original_file_name: input.file.name,
      file_size: input.file.size,
      mime_type: input.file.type,
      storage_path: filePath,
      title: input.title || input.file.name,
      description: input.description,
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
      // Clean up uploaded file
      await supabase.storage.from('gallery-photos').remove([filePath]);
      throw error;
    }

    return data;
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