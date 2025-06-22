import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchGalleries,
  fetchGalleryById,
  createGallery,
  updateGallery,
  deleteGallery,
  uploadPhoto,
  deletePhoto,
  batchOperation,
  reorderPhotos,
  toggleLike,
  setFilters,
  clearFilters,
  togglePhotoSelection,
  selectAllPhotos,
  clearSelection,
  selectAllGalleries,
  selectCurrentGallery,
  selectSelectedPhotos,
  selectUploadProgress,
  selectGalleryFilters,
  selectGalleryStatus,
  selectGalleryError
} from '../store/gallerySlice';
import { Gallery, Photo, PhotoUploadInput, GalleryFilters, BatchOperation } from '../types';

export const useGallery = () => {
  const dispatch = useAppDispatch();
  const galleries = useAppSelector(selectAllGalleries);
  const currentGallery = useAppSelector(selectCurrentGallery);
  const selectedPhotos = useAppSelector(selectSelectedPhotos);
  const uploadProgress = useAppSelector(selectUploadProgress);
  const filters = useAppSelector(selectGalleryFilters);
  const status = useAppSelector(selectGalleryStatus);
  const error = useAppSelector(selectGalleryError);

  const loadGalleries = useCallback((galleryFilters?: GalleryFilters) => {
    return dispatch(fetchGalleries(galleryFilters));
  }, [dispatch]);

  const loadGalleryById = useCallback((id: string) => {
    return dispatch(fetchGalleryById(id));
  }, [dispatch]);

  const createNewGallery = useCallback((gallery: Partial<Gallery>) => {
    return dispatch(createGallery(gallery));
  }, [dispatch]);

  const updateExistingGallery = useCallback((id: string, updates: Partial<Gallery>) => {
    return dispatch(updateGallery({ id, updates }));
  }, [dispatch]);

  const deleteExistingGallery = useCallback((id: string) => {
    return dispatch(deleteGallery(id));
  }, [dispatch]);

  const uploadNewPhoto = useCallback((input: PhotoUploadInput) => {
    return dispatch(uploadPhoto(input));
  }, [dispatch]);

  const deleteExistingPhoto = useCallback((galleryId: string, photoId: string) => {
    return dispatch(deletePhoto({ galleryId, photoId }));
  }, [dispatch]);

  const performBatchOperation = useCallback((operation: BatchOperation) => {
    return dispatch(batchOperation(operation));
  }, [dispatch]);

  const reorderGalleryPhotos = useCallback((galleryId: string, photoOrders: { id: string; order: number }[]) => {
    return dispatch(reorderPhotos({ galleryId, photoOrders }));
  }, [dispatch]);

  const toggleGalleryLike = useCallback((galleryId: string, userId: string) => {
    return dispatch(toggleLike({ galleryId, userId }));
  }, [dispatch]);

  const updateFilters = useCallback((newFilters: GalleryFilters) => {
    dispatch(setFilters(newFilters));
  }, [dispatch]);

  const resetFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  const togglePhotoSelect = useCallback((photoId: string) => {
    dispatch(togglePhotoSelection(photoId));
  }, [dispatch]);

  const selectAll = useCallback(() => {
    dispatch(selectAllPhotos());
  }, [dispatch]);

  const clearAllSelections = useCallback(() => {
    dispatch(clearSelection());
  }, [dispatch]);

  return {
    // State
    galleries,
    currentGallery,
    selectedPhotos,
    uploadProgress,
    filters,
    status,
    error,
    isLoading: status === 'loading',

    // Actions
    loadGalleries,
    loadGalleryById,
    createNewGallery,
    updateExistingGallery,
    deleteExistingGallery,
    uploadNewPhoto,
    deleteExistingPhoto,
    performBatchOperation,
    reorderGalleryPhotos,
    toggleGalleryLike,
    updateFilters,
    resetFilters,
    togglePhotoSelect,
    selectAll,
    clearAllSelections
  };
};

// Hook for drag and drop functionality
export const usePhotoDragDrop = (onDrop: (files: File[]) => void) => {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    if (files.length > 0) {
      onDrop(files);
    }
  }, [onDrop]);

  return {
    handleDragOver,
    handleDrop
  };
};