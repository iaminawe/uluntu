import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  // UI state selectors
  selectSelectedPhotos,
  selectUploadProgress,
  selectGalleryFilters,
  selectViewMode,
  selectPhotoSize,
  selectLightboxState,
  selectIsBatchMode,
  selectBatchOperation,
  selectHasSelection,
  selectSelectionCount,
  selectActiveUploads,
  // UI state actions
  togglePhotoSelection,
  selectAllPhotos,
  clearPhotoSelection,
  setUploadProgress,
  updateUploadProgress,
  updateUploadStatus,
  removeUploadProgress,
  setFilters,
  updateFilter,
  clearFilters,
  setViewMode,
  setPhotoSize,
  openLightbox,
  closeLightbox,
  toggleBatchMode,
  setBatchOperationType,
  setBatchOperationProcessing,
} from '../store/galleryUISlice';
import {
  // React Query hooks
  useGalleries,
  useGallery,
  useGalleryPhotos,
  useCreateGallery,
  useUpdateGallery,
  useDeleteGallery,
  useUploadPhoto,
  useBatchUploadPhotos,
  useDeletePhoto,
  useBatchDeletePhotos,
  useReorderPhotos,
  useToggleGalleryLike,
  useTogglePhotoLike,
  useAddPhotoComment,
} from './useGalleryQueries';
import { Photo, PhotoUploadInput, BatchUploadFile, BatchUploadProgress } from '../types';

/**
 * Hybrid hook that combines React Query for data fetching with Redux for UI state
 * This is the main hook that components should use for gallery functionality
 */
export const useGalleryHybrid = (galleryId?: string) => {
  const dispatch = useAppDispatch();
  
  // React Query - Data fetching
  const galleriesQuery = useGalleries();
  const galleryQuery = useGallery(galleryId);
  const photosQuery = useGalleryPhotos(galleryId);
  
  // React Query - Mutations
  const createGalleryMutation = useCreateGallery();
  const updateGalleryMutation = useUpdateGallery();
  const deleteGalleryMutation = useDeleteGallery();
  const uploadPhotoMutation = useUploadPhoto();
  const batchUploadMutation = useBatchUploadPhotos();
  const deletePhotoMutation = useDeletePhoto();
  const batchDeleteMutation = useBatchDeletePhotos();
  const reorderPhotosMutation = useReorderPhotos();
  const toggleLikeMutation = useToggleGalleryLike();
  const togglePhotoLikeMutation = useTogglePhotoLike();
  const addCommentMutation = useAddPhotoComment();
  
  // Redux - UI State
  const selectedPhotos = useAppSelector(selectSelectedPhotos);
  const uploadProgress = useAppSelector(selectUploadProgress);
  const filters = useAppSelector(selectGalleryFilters);
  const viewMode = useAppSelector(selectViewMode);
  const photoSize = useAppSelector(selectPhotoSize);
  const lightbox = useAppSelector(selectLightboxState);
  const isBatchMode = useAppSelector(selectIsBatchMode);
  const batchOperation = useAppSelector(selectBatchOperation);
  const hasSelection = useAppSelector(selectHasSelection);
  const selectionCount = useAppSelector(selectSelectionCount);
  const activeUploads = useAppSelector(selectActiveUploads);
  
  // UI Actions
  const togglePhotoSelect = useCallback((photoId: string) => {
    dispatch(togglePhotoSelection(photoId));
  }, [dispatch]);
  
  const selectAll = useCallback(() => {
    if (photosQuery.data) {
      dispatch(selectAllPhotos(photosQuery.data.map(p => p.id)));
    }
  }, [dispatch, photosQuery.data]);
  
  const clearSelection = useCallback(() => {
    dispatch(clearPhotoSelection());
  }, [dispatch]);
  
  const updateFilters = useCallback((newFilters: typeof filters) => {
    dispatch(setFilters(newFilters));
  }, [dispatch]);
  
  const resetFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);
  
  const changeViewMode = useCallback((mode: typeof viewMode) => {
    dispatch(setViewMode(mode));
  }, [dispatch]);
  
  const changePhotoSize = useCallback((size: typeof photoSize) => {
    dispatch(setPhotoSize(size));
  }, [dispatch]);
  
  const showLightbox = useCallback((photos: Photo[], startIndex: number) => {
    dispatch(openLightbox({ photos, startIndex }));
  }, [dispatch]);
  
  const hideLightbox = useCallback(() => {
    dispatch(closeLightbox());
  }, [dispatch]);
  
  const enableBatchMode = useCallback(() => {
    dispatch(toggleBatchMode());
  }, [dispatch]);
  
  // Enhanced upload with progress tracking
  const uploadPhoto = useCallback(async (input: PhotoUploadInput) => {
    const tempId = `temp-${Date.now()}`;
    
    // Set initial progress
    dispatch(setUploadProgress({
      photoId: tempId,
      fileName: input.file.name,
      progress: 0,
      status: 'uploading'
    }));
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        dispatch(updateUploadProgress({ photoId: tempId, progress: 50 }));
      }, 500);
      
      const photo = await uploadPhotoMutation.mutateAsync(input);
      
      clearInterval(progressInterval);
      
      // Update to completed
      dispatch(updateUploadStatus({
        photoId: tempId,
        status: 'completed'
      }));
      
      // Remove progress after delay
      setTimeout(() => {
        dispatch(removeUploadProgress(tempId));
      }, 2000);
      
      return photo;
    } catch (error) {
      dispatch(updateUploadStatus({
        photoId: tempId,
        status: 'error',
        error: error instanceof Error ? error.message : 'Upload failed'
      }));
      throw error;
    }
  }, [dispatch, uploadPhotoMutation]);
  
  // Batch operations with UI state management
  const performBatchDelete = useCallback(async () => {
    if (!galleryId || selectedPhotos.length === 0) return;
    
    dispatch(setBatchOperationProcessing(true));
    
    try {
      await batchDeleteMutation.mutateAsync({
        photoIds: selectedPhotos,
        galleryId
      });
      
      dispatch(clearPhotoSelection());
      dispatch(toggleBatchMode());
    } finally {
      dispatch(setBatchOperationProcessing(false));
    }
  }, [dispatch, batchDeleteMutation, selectedPhotos, galleryId]);
  
  // Computed values
  const selectedPhotoObjects = useMemo(() => {
    if (!photosQuery.data) return [];
    return photosQuery.data.filter(photo => selectedPhotos.includes(photo.id));
  }, [photosQuery.data, selectedPhotos]);
  
  const isPhotoSelected = useCallback((photoId: string) => {
    return selectedPhotos.includes(photoId);
  }, [selectedPhotos]);
  
  // Batch upload progress calculation
  const batchUploadProgress = useMemo((): BatchUploadProgress => {
    const uploads = Object.values(uploadProgress);
    const totalFiles = uploads.length;
    const completedFiles = uploads.filter(u => u.status === 'completed').length;
    const failedFiles = uploads.filter(u => u.status === 'error').length;
    const currentlyUploading = uploads.filter(u => u.status === 'uploading' || u.status === 'processing').length;
    
    const overallProgress = totalFiles > 0
      ? uploads.reduce((sum, u) => sum + u.progress, 0) / totalFiles
      : 0;
    
    return {
      totalFiles,
      completedFiles,
      failedFiles,
      overallProgress,
      currentlyUploading,
      isComplete: totalFiles > 0 && completedFiles + failedFiles === totalFiles,
      hasErrors: failedFiles > 0
    };
  }, [uploadProgress]);
  
  return {
    // Data from React Query
    galleries: galleriesQuery.data || [],
    gallery: galleryQuery.data,
    photos: photosQuery.data || [],
    isLoading: galleriesQuery.isLoading || galleryQuery.isLoading || photosQuery.isLoading,
    error: galleriesQuery.error || galleryQuery.error || photosQuery.error,
    
    // UI State from Redux
    selectedPhotos,
    selectedPhotoObjects,
    uploadProgress,
    batchUploadProgress,
    filters,
    viewMode,
    photoSize,
    lightbox,
    isBatchMode,
    batchOperation,
    hasSelection,
    selectionCount,
    activeUploads,
    
    // Actions
    togglePhotoSelect,
    selectAll,
    clearSelection,
    isPhotoSelected,
    updateFilters,
    resetFilters,
    changeViewMode,
    changePhotoSize,
    showLightbox,
    hideLightbox,
    enableBatchMode,
    
    // Data mutations with UI integration
    createGallery: createGalleryMutation.mutateAsync,
    updateGallery: updateGalleryMutation.mutateAsync,
    deleteGallery: deleteGalleryMutation.mutateAsync,
    uploadPhoto,
    deletePhoto: deletePhotoMutation.mutateAsync,
    performBatchDelete,
    reorderPhotos: reorderPhotosMutation.mutateAsync,
    toggleLike: toggleLikeMutation.mutateAsync,
    togglePhotoLike: togglePhotoLikeMutation.mutateAsync,
    addPhotoComment: addCommentMutation.mutateAsync,
    
    // Mutation states
    isCreating: createGalleryMutation.isPending,
    isUpdating: updateGalleryMutation.isPending,
    isDeleting: deleteGalleryMutation.isPending || batchDeleteMutation.isPending,
    isUploading: uploadPhotoMutation.isPending || batchUploadMutation.isPending,
  };
};