import { useState, useEffect, useCallback } from 'react';
import { galleryApiNew } from '../api/galleryApiNew';
import { storageService } from '@/services/storageService';
import { Gallery, Photo, PhotoUploadInput, GalleryFilters } from '../types';

export interface UseGalleryStorageOptions {
  autoInitialize?: boolean;
  enableAutoCleanup?: boolean;
}

export interface StorageUsage {
  totalFiles: number;
  totalSizeBytes: number;
  totalSizeMB: number;
  photosCount: number;
  thumbnailsCount: number;
  tempFilesCount: number;
}

export function useGalleryStorageNew(options: UseGalleryStorageOptions = {}) {
  const { autoInitialize = true, enableAutoCleanup = true } = options;

  // State
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [currentGallery, setCurrentGallery] = useState<Gallery | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [storageUsage, setStorageUsage] = useState<StorageUsage | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize storage service
  const initializeStorage = useCallback(async () => {
    try {
      await storageService.initialize();
      setInitialized(true);
      
      if (enableAutoCleanup) {
        // Run cleanup in background
        storageService.cleanupOrphanedFiles().catch(console.error);
      }
    } catch (err: any) {
      console.error('Failed to initialize storage:', err);
      setError(err.message);
    }
  }, [enableAutoCleanup]);

  // Load galleries
  const loadGalleries = useCallback(async (filters?: GalleryFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const galleriesData = await galleryApiNew.getAllGalleries(filters);
      setGalleries(galleriesData);
    } catch (err: any) {
      console.error('Failed to load galleries:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load specific gallery
  const loadGallery = useCallback(async (galleryId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const gallery = await galleryApiNew.getGallery(galleryId);
      setCurrentGallery(gallery);
      
      if (gallery?.photos) {
        setPhotos(gallery.photos);
      }
    } catch (err: any) {
      console.error('Failed to load gallery:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load gallery photos
  const loadGalleryPhotos = useCallback(async (galleryId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const photosData = await galleryApiNew.getGalleryPhotos(galleryId);
      setPhotos(photosData);
    } catch (err: any) {
      console.error('Failed to load gallery photos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create gallery
  const createGallery = useCallback(async (galleryData: Partial<Gallery>) => {
    setLoading(true);
    setError(null);
    
    try {
      const newGallery = await galleryApiNew.createGallery(galleryData);
      setGalleries(prev => [newGallery, ...prev]);
      return newGallery;
    } catch (err: any) {
      console.error('Failed to create gallery:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update gallery
  const updateGallery = useCallback(async (galleryId: string, updates: Partial<Gallery>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedGallery = await galleryApiNew.updateGallery(galleryId, updates);
      
      setGalleries(prev => 
        prev.map(g => g.id === galleryId ? updatedGallery : g)
      );
      
      if (currentGallery?.id === galleryId) {
        setCurrentGallery(updatedGallery);
      }
      
      return updatedGallery;
    } catch (err: any) {
      console.error('Failed to update gallery:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentGallery]);

  // Delete gallery
  const deleteGallery = useCallback(async (galleryId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await galleryApiNew.deleteGallery(galleryId);
      
      setGalleries(prev => prev.filter(g => g.id !== galleryId));
      
      if (currentGallery?.id === galleryId) {
        setCurrentGallery(null);
        setPhotos([]);
      }
      
      return true;
    } catch (err: any) {
      console.error('Failed to delete gallery:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentGallery]);

  // Upload photos
  const uploadPhotos = useCallback(async (files: File[], galleryId: string, options?: {
    onProgress?: (progress: any) => void;
    generateThumbnails?: boolean;
  }) => {
    setUploading(true);
    setError(null);
    
    const uploadedPhotos: Photo[] = [];
    const errors: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          options?.onProgress?.({
            current: i + 1,
            total: files.length,
            fileName: file.name,
            status: 'uploading'
          });

          const uploadInput: PhotoUploadInput = {
            file,
            galleryId,
            title: file.name.split('.')[0],
            tags: []
          };

          const photo = await galleryApiNew.uploadPhoto(uploadInput);
          uploadedPhotos.push(photo);

          options?.onProgress?.({
            current: i + 1,
            total: files.length,
            fileName: file.name,
            status: 'completed'
          });

        } catch (fileError: any) {
          console.error(`Failed to upload ${file.name}:`, fileError);
          errors.push(`${file.name}: ${fileError.message}`);
          
          options?.onProgress?.({
            current: i + 1,
            total: files.length,
            fileName: file.name,
            status: 'error',
            error: fileError.message
          });
        }
      }

      // Update photos list
      if (uploadedPhotos.length > 0) {
        setPhotos(prev => [...uploadedPhotos, ...prev]);
        
        // Update gallery photo count
        if (currentGallery) {
          setCurrentGallery(prev => prev ? {
            ...prev,
            photo_count: (prev.photo_count || 0) + uploadedPhotos.length
          } : null);
        }
      }

      if (errors.length > 0) {
        setError(`Some uploads failed: ${errors.join(', ')}`);
      }

      return {
        successful: uploadedPhotos,
        errors
      };

    } catch (err: any) {
      console.error('Batch upload failed:', err);
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [currentGallery]);

  // Delete photo
  const deletePhoto = useCallback(async (photoId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await galleryApiNew.deletePhoto(photoId);
      
      setPhotos(prev => prev.filter(p => p.id !== photoId));
      
      // Update gallery photo count
      if (currentGallery) {
        setCurrentGallery(prev => prev ? {
          ...prev,
          photo_count: Math.max((prev.photo_count || 0) - 1, 0)
        } : null);
      }
      
      return true;
    } catch (err: any) {
      console.error('Failed to delete photo:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentGallery]);

  // Delete multiple photos
  const deletePhotos = useCallback(async (photoIds: string[]) => {
    setLoading(true);
    setError(null);
    
    try {
      await galleryApiNew.batchDeletePhotos(photoIds);
      
      setPhotos(prev => prev.filter(p => !photoIds.includes(p.id)));
      
      // Update gallery photo count
      if (currentGallery) {
        setCurrentGallery(prev => prev ? {
          ...prev,
          photo_count: Math.max((prev.photo_count || 0) - photoIds.length, 0)
        } : null);
      }
      
      return true;
    } catch (err: any) {
      console.error('Failed to delete photos:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentGallery]);

  // Update photo
  const updatePhoto = useCallback(async (photoId: string, updates: Partial<Photo>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedPhoto = await galleryApiNew.updatePhoto(photoId, updates);
      
      setPhotos(prev => 
        prev.map(p => p.id === photoId ? updatedPhoto : p)
      );
      
      return updatedPhoto;
    } catch (err: any) {
      console.error('Failed to update photo:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reorder photos
  const reorderPhotos = useCallback(async (galleryId: string, photoOrders: { id: string; order: number }[]) => {
    setLoading(true);
    setError(null);
    
    try {
      await galleryApiNew.reorderPhotos(galleryId, photoOrders);
      
      // Update local state
      setPhotos(prev => {
        const orderMap = new Map(photoOrders.map(po => [po.id, po.order]));
        return prev
          .map(p => ({ ...p, sort_order: orderMap.get(p.id) ?? p.sort_order }))
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      });
      
      return true;
    } catch (err: any) {
      console.error('Failed to reorder photos:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get storage usage
  const loadStorageUsage = useCallback(async (userId?: string) => {
    try {
      const usage = await galleryApiNew.getUserStorageUsage(userId);
      setStorageUsage(usage);
      return usage;
    } catch (err: any) {
      console.error('Failed to load storage usage:', err);
      setError(err.message);
    }
  }, []);

  // Cleanup orphaned files
  const cleanupOrphanedFiles = useCallback(async () => {
    try {
      const cleanedCount = await galleryApiNew.cleanupOrphanedFiles();
      
      // Refresh storage usage after cleanup
      await loadStorageUsage();
      
      return cleanedCount;
    } catch (err: any) {
      console.error('Failed to cleanup orphaned files:', err);
      setError(err.message);
      return 0;
    }
  }, [loadStorageUsage]);

  // Get file URLs
  const getFileUrl = useCallback((bucket: string, path: string) => {
    return storageService.getPublicUrl(bucket, path);
  }, []);

  const getThumbnailUrl = useCallback((originalPath: string, size: 'thumb' | 'medium' = 'thumb') => {
    const thumbnailPath = storageService.generateThumbnailPath(originalPath, size);
    return storageService.getPublicUrl('gallery-thumbnails', thumbnailPath);
  }, []);

  // Initialize on mount
  useEffect(() => {
    if (autoInitialize && !initialized) {
      initializeStorage();
    }
  }, [autoInitialize, initialized, initializeStorage]);

  return {
    // State
    galleries,
    currentGallery,
    photos,
    storageUsage,
    loading,
    uploading,
    error,
    initialized,

    // Gallery operations
    loadGalleries,
    loadGallery,
    createGallery,
    updateGallery,
    deleteGallery,

    // Photo operations
    loadGalleryPhotos,
    uploadPhotos,
    deletePhoto,
    deletePhotos,
    updatePhoto,
    reorderPhotos,

    // Storage operations
    loadStorageUsage,
    cleanupOrphanedFiles,
    getFileUrl,
    getThumbnailUrl,
    initializeStorage,

    // Utility
    clearError: () => setError(null),
    clearPhotos: () => setPhotos([]),
    clearGalleries: () => setGalleries([]),
    clearCurrentGallery: () => setCurrentGallery(null)
  };
}