import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { GalleryFilters, UploadProgress, LightboxState } from '../types';

export interface GalleryUIState {
  // Selection state
  selectedPhotos: string[];
  selectedGalleries: string[];
  
  // Upload progress tracking
  uploadProgress: Record<string, UploadProgress>;
  
  // Filter state
  filters: GalleryFilters;
  
  // View preferences
  viewMode: 'grid' | 'list' | 'masonry';
  photoSize: 'small' | 'medium' | 'large';
  
  // Lightbox state
  lightbox: LightboxState;
  
  // Batch operation state
  isBatchMode: boolean;
  batchOperation: {
    type: 'delete' | 'move' | 'tag' | 'privacy' | null;
    isProcessing: boolean;
  };
  
  // UI state
  sidebarOpen: boolean;
  uploadDialogOpen: boolean;
  createGalleryDialogOpen: boolean;
}

const initialState: GalleryUIState = {
  selectedPhotos: [],
  selectedGalleries: [],
  uploadProgress: {},
  filters: {},
  viewMode: 'grid',
  photoSize: 'medium',
  lightbox: {
    isOpen: false,
    currentPhotoIndex: 0,
    photos: []
  },
  isBatchMode: false,
  batchOperation: {
    type: null,
    isProcessing: false
  },
  sidebarOpen: true,
  uploadDialogOpen: false,
  createGalleryDialogOpen: false
};

const galleryUISlice = createSlice({
  name: 'galleryUI',
  initialState,
  reducers: {
    // Selection actions
    togglePhotoSelection: (state, action: PayloadAction<string>) => {
      const photoId = action.payload;
      const index = state.selectedPhotos.indexOf(photoId);
      if (index > -1) {
        state.selectedPhotos.splice(index, 1);
      } else {
        state.selectedPhotos.push(photoId);
      }
    },
    
    selectAllPhotos: (state, action: PayloadAction<string[]>) => {
      state.selectedPhotos = action.payload;
    },
    
    clearPhotoSelection: (state) => {
      state.selectedPhotos = [];
    },
    
    toggleGallerySelection: (state, action: PayloadAction<string>) => {
      const galleryId = action.payload;
      const index = state.selectedGalleries.indexOf(galleryId);
      if (index > -1) {
        state.selectedGalleries.splice(index, 1);
      } else {
        state.selectedGalleries.push(galleryId);
      }
    },
    
    clearGallerySelection: (state) => {
      state.selectedGalleries = [];
    },
    
    // Upload progress actions
    setUploadProgress: (state, action: PayloadAction<UploadProgress>) => {
      state.uploadProgress[action.payload.photoId] = action.payload;
    },
    
    updateUploadProgress: (state, action: PayloadAction<{ photoId: string; progress: number }>) => {
      if (state.uploadProgress[action.payload.photoId]) {
        state.uploadProgress[action.payload.photoId].progress = action.payload.progress;
      }
    },
    
    updateUploadStatus: (state, action: PayloadAction<{ photoId: string; status: UploadProgress['status']; error?: string }>) => {
      if (state.uploadProgress[action.payload.photoId]) {
        state.uploadProgress[action.payload.photoId].status = action.payload.status;
        if (action.payload.error) {
          state.uploadProgress[action.payload.photoId].error = action.payload.error;
        }
      }
    },
    
    removeUploadProgress: (state, action: PayloadAction<string>) => {
      delete state.uploadProgress[action.payload];
    },
    
    clearAllUploadProgress: (state) => {
      state.uploadProgress = {};
    },
    
    // Filter actions
    setFilters: (state, action: PayloadAction<GalleryFilters>) => {
      state.filters = action.payload;
    },
    
    updateFilter: (state, action: PayloadAction<{ key: keyof GalleryFilters; value: any }>) => {
      state.filters[action.payload.key] = action.payload.value;
    },
    
    clearFilters: (state) => {
      state.filters = {};
    },
    
    // View preference actions
    setViewMode: (state, action: PayloadAction<GalleryUIState['viewMode']>) => {
      state.viewMode = action.payload;
    },
    
    setPhotoSize: (state, action: PayloadAction<GalleryUIState['photoSize']>) => {
      state.photoSize = action.payload;
    },
    
    // Lightbox actions
    openLightbox: (state, action: PayloadAction<{ photos: LightboxState['photos']; startIndex: number }>) => {
      state.lightbox = {
        isOpen: true,
        currentPhotoIndex: action.payload.startIndex,
        photos: action.payload.photos
      };
    },
    
    closeLightbox: (state) => {
      state.lightbox.isOpen = false;
    },
    
    setLightboxIndex: (state, action: PayloadAction<number>) => {
      state.lightbox.currentPhotoIndex = action.payload;
    },
    
    nextLightboxPhoto: (state) => {
      if (state.lightbox.currentPhotoIndex < state.lightbox.photos.length - 1) {
        state.lightbox.currentPhotoIndex++;
      }
    },
    
    previousLightboxPhoto: (state) => {
      if (state.lightbox.currentPhotoIndex > 0) {
        state.lightbox.currentPhotoIndex--;
      }
    },
    
    // Batch operation actions
    toggleBatchMode: (state) => {
      state.isBatchMode = !state.isBatchMode;
      if (!state.isBatchMode) {
        state.selectedPhotos = [];
        state.batchOperation.type = null;
      }
    },
    
    setBatchOperationType: (state, action: PayloadAction<GalleryUIState['batchOperation']['type']>) => {
      state.batchOperation.type = action.payload;
    },
    
    setBatchOperationProcessing: (state, action: PayloadAction<boolean>) => {
      state.batchOperation.isProcessing = action.payload;
    },
    
    // UI state actions
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    
    setUploadDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.uploadDialogOpen = action.payload;
    },
    
    setCreateGalleryDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.createGalleryDialogOpen = action.payload;
    },
    
    // Reset UI state
    resetUIState: (state) => {
      return initialState;
    }
  }
});

// Export actions
export const {
  togglePhotoSelection,
  selectAllPhotos,
  clearPhotoSelection,
  toggleGallerySelection,
  clearGallerySelection,
  setUploadProgress,
  updateUploadProgress,
  updateUploadStatus,
  removeUploadProgress,
  clearAllUploadProgress,
  setFilters,
  updateFilter,
  clearFilters,
  setViewMode,
  setPhotoSize,
  openLightbox,
  closeLightbox,
  setLightboxIndex,
  nextLightboxPhoto,
  previousLightboxPhoto,
  toggleBatchMode,
  setBatchOperationType,
  setBatchOperationProcessing,
  toggleSidebar,
  setSidebarOpen,
  setUploadDialogOpen,
  setCreateGalleryDialogOpen,
  resetUIState
} = galleryUISlice.actions;

// Selectors
export const selectSelectedPhotos = (state: RootState) => state.galleryUI.selectedPhotos;
export const selectSelectedGalleries = (state: RootState) => state.galleryUI.selectedGalleries;
export const selectUploadProgress = (state: RootState) => state.galleryUI.uploadProgress;
export const selectGalleryFilters = (state: RootState) => state.galleryUI.filters;
export const selectViewMode = (state: RootState) => state.galleryUI.viewMode;
export const selectPhotoSize = (state: RootState) => state.galleryUI.photoSize;
export const selectLightboxState = (state: RootState) => state.galleryUI.lightbox;
export const selectIsBatchMode = (state: RootState) => state.galleryUI.isBatchMode;
export const selectBatchOperation = (state: RootState) => state.galleryUI.batchOperation;
export const selectSidebarOpen = (state: RootState) => state.galleryUI.sidebarOpen;
export const selectUploadDialogOpen = (state: RootState) => state.galleryUI.uploadDialogOpen;
export const selectCreateGalleryDialogOpen = (state: RootState) => state.galleryUI.createGalleryDialogOpen;

// Computed selectors
export const selectHasSelection = (state: RootState) => state.galleryUI.selectedPhotos.length > 0;
export const selectSelectionCount = (state: RootState) => state.galleryUI.selectedPhotos.length;
export const selectActiveUploads = (state: RootState) => 
  Object.values(state.galleryUI.uploadProgress).filter(p => p.status === 'uploading' || p.status === 'processing');

export default galleryUISlice.reducer;