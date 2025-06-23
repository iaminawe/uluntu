import { supabase } from '@/lib/supabase';
import { Photo, Gallery, PhotoUploadInput, GalleryFilters } from '../types';
import { storageService } from '@/services/storageService';

export const galleryApiNew = {
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

    // Transform data to match interface with storage URLs
    const galleries = await Promise.all((data || []).map(async gallery => {
      const transformedGallery = {
        ...gallery,
        photos: await Promise.all((gallery.gallery_photos || []).map(async photo => ({
          ...photo,
          url: storageService.getPublicUrl('gallery-photos', photo.storage_path),
          thumbnailUrl: photo.thumbnail_path 
            ? storageService.getPublicUrl('gallery-thumbnails', photo.thumbnail_path)
            : undefined,
          mediumUrl: photo.medium_path
            ? storageService.getPublicUrl('gallery-thumbnails', photo.medium_path)
            : undefined
        }))),
        createdAt: gallery.created_at,
        updatedAt: gallery.updated_at,
        ownerId: gallery.user_id,
        privacy: gallery.privacy_level === 'members_only' ? 'unlisted' : gallery.privacy_level
      };

      return transformedGallery;
    }));
    
    return galleries;
  },

  async getGallery(id: string): Promise<Gallery | null> {
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
    
    // Transform data with storage URLs
    const transformedGallery = {
      ...data,
      photos: await Promise.all((data.gallery_photos || []).map(async photo => ({
        ...photo,
        url: storageService.getPublicUrl('gallery-photos', photo.storage_path),
        thumbnailUrl: photo.thumbnail_path 
          ? storageService.getPublicUrl('gallery-thumbnails', photo.thumbnail_path)
          : undefined,
        mediumUrl: photo.medium_path
          ? storageService.getPublicUrl('gallery-thumbnails', photo.medium_path)
          : undefined
      }))),
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      ownerId: data.user_id,
      privacy: data.privacy_level === 'members_only' ? 'unlisted' : data.privacy_level
    };

    return transformedGallery;
  },

  async createGallery(gallery: Partial<Gallery>): Promise<Gallery> {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Authentication required');
    }

    // Ensure user_id is set
    const galleryData = {
      ...gallery,
      user_id: user.id
    };

    const { data, error } = await supabase
      .from('user_galleries')
      .insert([galleryData])
      .select()
      .single();

    if (error) {
      console.error('Error creating gallery:', error);
      throw error;
    }

    return data;
  },

  async updateGallery(id: string, updates: Partial<Gallery>): Promise<Gallery> {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Authentication required');
    }

    // Update with ownership verification
    const { data, error } = await supabase
      .from('user_galleries')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating gallery:', error);
      throw error;
    }

    return data;
  },

  async deleteGallery(id: string): Promise<boolean> {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Authentication required');
    }

    // Verify ownership
    const { data: gallery, error: galleryError } = await supabase
      .from('user_galleries')
      .select('user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (galleryError || !gallery) {
      throw new Error('Gallery not found or access denied');
    }

    // Delete all gallery files from storage
    await storageService.deleteGalleryFiles(user.id, id);

    // Delete gallery record (photos will be deleted by CASCADE)
    const { error } = await supabase
      .from('user_galleries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

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

    // Add storage URLs to photos
    const photosWithUrls = (data || []).map(photo => ({
      ...photo,
      url: storageService.getPublicUrl('gallery-photos', photo.storage_path),
      thumbnailUrl: photo.thumbnail_path 
        ? storageService.getPublicUrl('gallery-thumbnails', photo.thumbnail_path)
        : undefined,
      mediumUrl: photo.medium_path
        ? storageService.getPublicUrl('gallery-thumbnails', photo.medium_path)
        : undefined
    }));

    return photosWithUrls;
  },

  // Photo operations with new storage structure
  async uploadPhoto(input: PhotoUploadInput): Promise<Photo> {
    // Initialize storage service
    await storageService.initialize();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Authentication required for photo upload');
    }

    // Validate gallery ownership
    if (input.galleryId) {
      const { data: gallery, error: galleryError } = await supabase
        .from('user_galleries')
        .select('user_id')
        .eq('id', input.galleryId)
        .eq('user_id', user.id)
        .single();

      if (galleryError || !gallery) {
        throw new Error('Gallery not found or access denied');
      }
    }

    // Upload using storage service with user folder structure
    const uploadResult = await storageService.uploadGalleryPhoto({
      userId: user.id,
      galleryId: input.galleryId || '',
      file: input.file,
      generateThumbnails: true
    });

    if (!uploadResult.success || !uploadResult.data) {
      throw new Error(uploadResult.error || 'Upload failed');
    }

    const { path: storagePath, url: publicUrl, size, mimeType } = uploadResult.data;

    // Generate thumbnail paths
    const thumbnailPath = storageService.generateThumbnailPath(storagePath, 'thumb');
    const mediumPath = storageService.generateThumbnailPath(storagePath, 'medium');

    // Create photo record with user folder structure
    const photoData = {
      gallery_id: input.galleryId,
      user_id: user.id,
      file_name: storagePath.split('/').pop() || input.file.name,
      original_file_name: input.file.name,
      file_size: size,
      mime_type: mimeType,
      storage_path: storagePath,
      thumbnail_path: thumbnailPath,
      medium_path: mediumPath,
      title: input.title || input.file.name,
      description: input.description,
      tags: input.tags || [],
      sort_order: 0,
      visibility: 'visible' as const,
      processing_status: 'completed',
      moderation_status: 'approved'
    };

    const { data, error } = await supabase
      .from('gallery_photos')
      .insert([photoData])
      .select()
      .single();

    if (error) {
      console.error('Error creating photo record:', error);
      // Clean up uploaded file using storage service
      await storageService.deleteFile('gallery-photos', storagePath);
      throw error;
    }

    // Add URLs to response
    return {
      ...data,
      url: publicUrl,
      thumbnailUrl: storageService.getPublicUrl('gallery-thumbnails', thumbnailPath),
      mediumUrl: storageService.getPublicUrl('gallery-thumbnails', mediumPath)
    };
  },

  async updatePhoto(id: string, updates: Partial<Photo>): Promise<Photo> {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Authentication required');
    }

    const { data, error } = await supabase
      .from('gallery_photos')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating photo:', error);
      throw error;
    }

    // Add URLs to response
    return {
      ...data,
      url: storageService.getPublicUrl('gallery-photos', data.storage_path),
      thumbnailUrl: data.thumbnail_path 
        ? storageService.getPublicUrl('gallery-thumbnails', data.thumbnail_path)
        : undefined,
      mediumUrl: data.medium_path
        ? storageService.getPublicUrl('gallery-thumbnails', data.medium_path)
        : undefined
    };
  },

  async deletePhoto(id: string): Promise<boolean> {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Authentication required');
    }

    // Get photo with ownership verification
    const { data: photo, error: fetchError } = await supabase
      .from('gallery_photos')
      .select('storage_path, thumbnail_path, medium_path, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      console.error('Error fetching photo:', fetchError);
      throw fetchError;
    }

    // Delete files from storage using storage service
    const deletePromises = [];
    
    if (photo.storage_path) {
      deletePromises.push(storageService.deleteFile('gallery-photos', photo.storage_path));
    }
    
    if (photo.thumbnail_path) {
      deletePromises.push(storageService.deleteFile('gallery-thumbnails', photo.thumbnail_path));
    }
    
    if (photo.medium_path) {
      deletePromises.push(storageService.deleteFile('gallery-thumbnails', photo.medium_path));
    }

    // Execute deletions in parallel
    const deleteResults = await Promise.allSettled(deletePromises);
    const hasStorageErrors = deleteResults.some(result => result.status === 'rejected');
    
    if (hasStorageErrors) {
      console.warn('Some storage files could not be deleted');
    }

    // Delete record
    const { error } = await supabase
      .from('gallery_photos')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting photo record:', error);
      throw error;
    }

    return true;
  },

  async batchDeletePhotos(photoIds: string[]): Promise<boolean> {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Authentication required');
    }

    // Get photos with ownership verification
    const { data: photos, error: fetchError } = await supabase
      .from('gallery_photos')
      .select('storage_path, thumbnail_path, medium_path, user_id')
      .in('id', photoIds)
      .eq('user_id', user.id);

    if (fetchError) {
      console.error('Error fetching photos:', fetchError);
      throw fetchError;
    }

    // Collect all file paths to delete
    const mainPaths: string[] = [];
    const thumbnailPaths: string[] = [];

    photos.forEach(photo => {
      if (photo.storage_path) mainPaths.push(photo.storage_path);
      if (photo.thumbnail_path) thumbnailPaths.push(photo.thumbnail_path);
      if (photo.medium_path) thumbnailPaths.push(photo.medium_path);
    });

    // Delete files from storage using batch operations
    const deletePromises = [];
    
    if (mainPaths.length > 0) {
      deletePromises.push(
        Promise.all(mainPaths.map(path => storageService.deleteFile('gallery-photos', path)))
      );
    }
    
    if (thumbnailPaths.length > 0) {
      deletePromises.push(
        Promise.all(thumbnailPaths.map(path => storageService.deleteFile('gallery-thumbnails', path)))
      );
    }

    // Execute deletions in parallel
    const deleteResults = await Promise.allSettled(deletePromises);
    const hasStorageErrors = deleteResults.some(result => result.status === 'rejected');
    
    if (hasStorageErrors) {
      console.warn('Some storage files could not be deleted');
    }

    // Delete records
    const { error } = await supabase
      .from('gallery_photos')
      .delete()
      .in('id', photoIds)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting photo records:', error);
      throw error;
    }

    return true;
  },

  async reorderPhotos(galleryId: string, photoOrders: { id: string; order: number }[]): Promise<boolean> {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Authentication required');
    }

    // Verify gallery ownership
    const { data: gallery, error: galleryError } = await supabase
      .from('user_galleries')
      .select('user_id')
      .eq('id', galleryId)
      .eq('user_id', user.id)
      .single();

    if (galleryError || !gallery) {
      throw new Error('Gallery not found or access denied');
    }

    const updates = photoOrders.map(({ id, order }) => 
      supabase
        .from('gallery_photos')
        .update({ sort_order: order })
        .eq('id', id)
        .eq('gallery_id', galleryId)
        .eq('user_id', user.id)
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
  },

  // Storage management functions
  async getUserStorageUsage(userId?: string): Promise<any> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Authentication required');
    }

    const targetUserId = userId || user.id;
    return await storageService.getUserStorageUsage(targetUserId);
  },

  async cleanupOrphanedFiles(): Promise<number> {
    return await storageService.cleanupOrphanedFiles();
  }
};