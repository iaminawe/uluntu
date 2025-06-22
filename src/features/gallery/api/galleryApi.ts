import { supabase } from '@/lib/supabase';
import { Photo, Gallery, PhotoUploadInput, GalleryFilters } from '../types';

export const galleryApi = {
  // Gallery CRUD operations
  async getAllGalleries(filters?: GalleryFilters): Promise<Gallery[]> {
    let query = supabase
      .from('galleries')
      .select(`
        *,
        photos (*)
      `)
      .order('created_at', { ascending: false });

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters?.privacy) {
      query = query.eq('privacy', filters.privacy);
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
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

    return data || [];
  },

  async getGalleryById(id: string): Promise<Gallery | null> {
    const { data, error } = await supabase
      .from('galleries')
      .select(`
        *,
        photos (*),
        owner:members!owner_id (
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

    return data;
  },

  async createGallery(gallery: Partial<Gallery>): Promise<Gallery> {
    const { data, error } = await supabase
      .from('galleries')
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
      .from('galleries')
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
      .from('galleries')
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
      .from('photos')
      .upload(filePath, input.file);

    if (uploadError) {
      console.error('Error uploading photo:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath);

    // Create photo record
    const photoData = {
      url: publicUrl,
      title: input.title || input.file.name,
      description: input.description,
      tags: input.tags,
      file_size: input.file.size,
      mime_type: input.file.type,
      gallery_id: input.galleryId,
      uploaded_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('photos')
      .insert([photoData])
      .select()
      .single();

    if (error) {
      console.error('Error creating photo record:', error);
      // Clean up uploaded file
      await supabase.storage.from('photos').remove([filePath]);
      throw error;
    }

    return data;
  },

  async updatePhoto(id: string, updates: Partial<Photo>): Promise<Photo> {
    const { data, error } = await supabase
      .from('photos')
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
      .from('photos')
      .select('url')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching photo:', fetchError);
      throw fetchError;
    }

    // Extract file path from URL
    const url = new URL(photo.url);
    const filePath = url.pathname.split('/').slice(-2).join('/');

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('photos')
      .remove([filePath]);

    if (storageError) {
      console.error('Error deleting photo file:', storageError);
    }

    // Delete record
    const { error } = await supabase
      .from('photos')
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
      .from('photos')
      .select('url')
      .in('id', photoIds);

    if (fetchError) {
      console.error('Error fetching photos:', fetchError);
      throw fetchError;
    }

    // Extract file paths
    const filePaths = photos.map(photo => {
      const url = new URL(photo.url);
      return url.pathname.split('/').slice(-2).join('/');
    });

    // Delete from storage
    if (filePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('photos')
        .remove(filePaths);

      if (storageError) {
        console.error('Error deleting photo files:', storageError);
      }
    }

    // Delete records
    const { error } = await supabase
      .from('photos')
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
        .from('photos')
        .update({ order })
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
    const { error } = await supabase.rpc('increment_gallery_views', {
      gallery_id: galleryId
    });

    if (error) {
      console.error('Error incrementing view count:', error);
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