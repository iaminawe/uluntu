import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminGalleryApi } from '../api/galleryAdmin';
import { adminGalleryValidation } from '../api/galleryValidation';
import type {
  AdminGalleryFilters,
  AdminPhotoFilters,
  BulkPhotoAction,
  BulkGalleryAction,
  PhotoReorderRequest,
  AdminGalleriesResponse,
  AdminPhotosResponse,
  ModerationQueueResponse,
  StorageAnalytics,
  BatchOperationResult
} from '@/types/adminGallery';
import { PaginationParams } from '@/shared/api/types';
import { logger } from '@/utils/logger';
import { useState } from 'react';

/**
 * Admin Gallery Management Hooks
 * Provides React Query hooks for admin gallery operations
 */

// Gallery Management Hooks
export const useAdminGalleries = (
  filters?: AdminGalleryFilters & PaginationParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['admin-galleries', filters],
    queryFn: () => adminGalleryApi.getAllGalleriesAdmin(filters),
    enabled: options?.enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
};

export const useDeleteGalleryAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ galleryId, reason }: { galleryId: string; reason?: string }) =>
      adminGalleryApi.deleteGalleryAdmin(galleryId, reason),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['admin-galleries'] });
      queryClient.invalidateQueries({ queryKey: ['admin-photos'] });
      queryClient.invalidateQueries({ queryKey: ['storage-analytics'] });
    },
    onError: (error) => {
      logger.error('Failed to delete gallery', 'ADMIN_GALLERY_HOOKS', error);
    }
  });
};

export const useUpdateGalleryAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      galleryId, 
      updates 
    }: { 
      galleryId: string; 
      updates: {
        title?: string;
        description?: string;
        privacy_level?: 'public' | 'members_only' | 'private';
        visibility?: 'visible' | 'hidden' | 'archived';
        tags?: string[];
        is_featured?: boolean;
      }
    }) => adminGalleryApi.updateGalleryAdmin(galleryId, updates),
    onSuccess: (result, variables) => {
      // Update specific gallery in cache
      queryClient.invalidateQueries({ queryKey: ['admin-galleries'] });
      queryClient.setQueryData(
        ['admin-gallery', variables.galleryId],
        result.data
      );
    },
    onError: (error) => {
      logger.error('Failed to update gallery', 'ADMIN_GALLERY_HOOKS', error);
    }
  });
};

// Photo Management Hooks
export const useAdminGalleryPhotos = (
  galleryId: string,
  filters?: AdminPhotoFilters & PaginationParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['admin-gallery-photos', galleryId, filters],
    queryFn: () => adminGalleryApi.getGalleryPhotosAdmin(galleryId, filters),
    enabled: options?.enabled && !!galleryId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useDeletePhotoAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ photoId, reason }: { photoId: string; reason?: string }) =>
      adminGalleryApi.deletePhotoAdmin(photoId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery-photos'] });
      queryClient.invalidateQueries({ queryKey: ['admin-galleries'] });
      queryClient.invalidateQueries({ queryKey: ['storage-analytics'] });
    },
    onError: (error) => {
      logger.error('Failed to delete photo', 'ADMIN_GALLERY_HOOKS', error);
    }
  });
};

export const useUpdatePhotoAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      photoId, 
      updates 
    }: { 
      photoId: string; 
      updates: {
        title?: string;
        description?: string;
        tags?: string[];
        visibility?: 'visible' | 'hidden';
        moderation_status?: 'pending' | 'approved' | 'rejected' | 'flagged';
        moderation_notes?: string;
      }
    }) => adminGalleryApi.updatePhotoAdmin(photoId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery-photos'] });
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
    },
    onError: (error) => {
      logger.error('Failed to update photo', 'ADMIN_GALLERY_HOOKS', error);
    }
  });
};

export const useReorderGalleryPhotos = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: PhotoReorderRequest) =>
      adminGalleryApi.reorderGalleryPhotos(request),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['admin-gallery-photos', variables.gallery_id] 
      });
    },
    onError: (error) => {
      logger.error('Failed to reorder photos', 'ADMIN_GALLERY_HOOKS', error);
    }
  });
};

// Bulk Operations Hooks
export const useBulkDeletePhotos = () => {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<{
    isLoading: boolean;
    processed: number;
    total: number;
  }>({ isLoading: false, processed: 0, total: 0 });

  const mutation = useMutation({
    mutationFn: async ({ photoIds, reason }: { photoIds: string[]; reason?: string }) => {
      setProgress({ isLoading: true, processed: 0, total: photoIds.length });
      
      try {
        const result = await adminGalleryApi.bulkDeletePhotos(photoIds, reason);
        setProgress({ isLoading: false, processed: photoIds.length, total: photoIds.length });
        return result;
      } catch (error) {
        setProgress({ isLoading: false, processed: 0, total: photoIds.length });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery-photos'] });
      queryClient.invalidateQueries({ queryKey: ['admin-galleries'] });
      queryClient.invalidateQueries({ queryKey: ['storage-analytics'] });
    },
    onError: (error) => {
      logger.error('Failed to bulk delete photos', 'ADMIN_GALLERY_HOOKS', error);
    }
  });

  return {
    ...mutation,
    progress,
    resetProgress: () => setProgress({ isLoading: false, processed: 0, total: 0 })
  };
};

export const useBulkUploadPhotos = () => {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<{
    isLoading: boolean;
    processed: number;
    total: number;
  }>({ isLoading: false, processed: 0, total: 0 });

  const mutation = useMutation({
    mutationFn: async ({ galleryId, files }: { galleryId: string; files: File[] }) => {
      setProgress({ isLoading: true, processed: 0, total: files.length });
      
      try {
        const result = await adminGalleryApi.bulkUploadPhotosAdmin(galleryId, files);
        setProgress({ isLoading: false, processed: files.length, total: files.length });
        return result;
      } catch (error) {
        setProgress({ isLoading: false, processed: 0, total: files.length });
        throw error;
      }
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['admin-gallery-photos', variables.galleryId] 
      });
      queryClient.invalidateQueries({ queryKey: ['admin-galleries'] });
      queryClient.invalidateQueries({ queryKey: ['storage-analytics'] });
    },
    onError: (error) => {
      logger.error('Failed to bulk upload photos', 'ADMIN_GALLERY_HOOKS', error);
    }
  });

  return {
    ...mutation,
    progress,
    resetProgress: () => setProgress({ isLoading: false, processed: 0, total: 0 })
  };
};

// Analytics Hooks
export const useStorageAnalytics = () => {
  return useQuery({
    queryKey: ['storage-analytics'],
    queryFn: () => adminGalleryApi.getStorageAnalytics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  });
};

// Moderation Hooks
export const useModerationQueue = (
  filters?: { status?: 'pending' | 'under_review' | 'resolved' } & PaginationParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['moderation-queue', filters],
    queryFn: () => adminGalleryApi.getModerationQueue(filters),
    enabled: options?.enabled,
    staleTime: 60 * 1000, // 1 minute
  });
};

// Audit Log Hooks
export const useAuditLogs = (
  filters?: {
    admin_id?: string;
    entity_type?: 'gallery' | 'photo' | 'user' | 'system';
    action?: string;
    start_date?: string;
    end_date?: string;
  } & PaginationParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['admin-audit-logs', filters],
    queryFn: () => adminGalleryApi.getAuditLogs(filters),
    enabled: options?.enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Validation Hooks
export const useValidatePhotoUpload = () => {
  return useMutation({
    mutationFn: ({ file, galleryId }: { file: File; galleryId?: string }) =>
      adminGalleryValidation.validatePhotoUpload(file, galleryId),
  });
};

export const useValidateBulkOperation = () => {
  return useMutation({
    mutationFn: ({ itemCount, operationType }: { itemCount: number; operationType: string }) =>
      adminGalleryValidation.validateBulkOperation(itemCount, operationType),
  });
};

export const useValidateGalleryUpdate = () => {
  return useMutation({
    mutationFn: (updates: {
      title?: string;
      description?: string;
      privacy_level?: string;
      visibility?: string;
      tags?: string[];
    }) => adminGalleryValidation.validateGalleryUpdate(updates),
  });
};

export const useValidatePhotoUpdate = () => {
  return useMutation({
    mutationFn: (updates: {
      title?: string;
      description?: string;
      tags?: string[];
      visibility?: string;
      moderation_status?: string;
    }) => adminGalleryValidation.validatePhotoUpdate(updates),
  });
};

// Selection Management Hook (for bulk operations UI)
export const useAdminSelection = <T extends { id: string }>() => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const toggleItem = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleAll = (items: T[]) => {
    const itemIds = items.map(item => item.id);
    
    if (selectAll) {
      setSelectedItems(new Set());
      setSelectAll(false);
    } else {
      setSelectedItems(new Set(itemIds));
      setSelectAll(true);
    }
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
    setSelectAll(false);
  };

  const isSelected = (id: string) => selectedItems.has(id);
  
  const selectedCount = selectedItems.size;
  
  const selectedArray = Array.from(selectedItems);

  return {
    selectedItems: selectedArray,
    selectedCount,
    selectAll,
    isSelected,
    toggleItem,
    toggleAll,
    clearSelection,
    hasSelection: selectedCount > 0
  };
};