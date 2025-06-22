import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { galleryApi } from '../api/galleryApi';
import { RootState } from '@/store';
import { Gallery, Photo, PhotoUploadInput, GalleryFilters, UploadProgress, BatchOperation } from '../types';

export interface GalleryState {
  galleries: Gallery[];
  currentGallery: Gallery | null;
  selectedPhotos: string[];
  uploadProgress: Record<string, UploadProgress>;
  filters: GalleryFilters;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: GalleryState = {
  galleries: [],
  currentGallery: null,
  selectedPhotos: [],
  uploadProgress: {},
  filters: {},
  status: 'idle',
  error: null
};

// Async thunks
export const fetchGalleries = createAsyncThunk(
  'gallery/fetchGalleries',
  async (filters?: GalleryFilters, { rejectWithValue }) => {
    try {
      const galleries = await galleryApi.getAllGalleries(filters);
      return { galleries, filters };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch galleries');
    }
  }
);

export const fetchGalleryById = createAsyncThunk(
  'gallery/fetchGalleryById',
  async (id: string, { rejectWithValue }) => {
    try {
      const gallery = await galleryApi.getGalleryById(id);
      if (!gallery) {
        throw new Error('Gallery not found');
      }
      // Increment view count
      galleryApi.incrementViewCount(id).catch(console.error);
      return gallery;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch gallery');
    }
  }
);

export const createGallery = createAsyncThunk(
  'gallery/createGallery',
  async (gallery: Partial<Gallery>, { rejectWithValue }) => {
    try {
      const newGallery = await galleryApi.createGallery(gallery);
      return newGallery;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create gallery');
    }
  }
);

export const updateGallery = createAsyncThunk(
  'gallery/updateGallery',
  async ({ id, updates }: { id: string; updates: Partial<Gallery> }, { rejectWithValue }) => {
    try {
      const updatedGallery = await galleryApi.updateGallery(id, updates);
      return updatedGallery;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update gallery');
    }
  }
);

export const deleteGallery = createAsyncThunk(
  'gallery/deleteGallery',
  async (id: string, { rejectWithValue }) => {
    try {
      await galleryApi.deleteGallery(id);
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete gallery');
    }
  }
);

export const uploadPhoto = createAsyncThunk(
  'gallery/uploadPhoto',
  async (input: PhotoUploadInput, { dispatch, rejectWithValue }) => {
    const tempId = `temp-${Date.now()}`;
    
    try {
      // Set initial upload progress
      dispatch(setUploadProgress({
        photoId: tempId,
        fileName: input.file.name,
        progress: 0,
        status: 'uploading'
      }));

      // Simulate progress updates (in real app, use XMLHttpRequest or fetch with progress)
      const progressInterval = setInterval(() => {
        dispatch(updateUploadProgress({ photoId: tempId, progress: 50 }));
      }, 500);

      const photo = await galleryApi.uploadPhoto(input);
      
      clearInterval(progressInterval);
      
      // Update progress to completed
      dispatch(setUploadProgress({
        photoId: tempId,
        fileName: input.file.name,
        progress: 100,
        status: 'completed'
      }));

      // Clear progress after delay
      setTimeout(() => {
        dispatch(removeUploadProgress(tempId));
      }, 2000);

      return photo;
    } catch (error) {
      dispatch(setUploadProgress({
        photoId: tempId,
        fileName: input.file.name,
        progress: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Upload failed'
      }));
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to upload photo');
    }
  }
);

export const deletePhoto = createAsyncThunk(
  'gallery/deletePhoto',
  async ({ galleryId, photoId }: { galleryId: string; photoId: string }, { rejectWithValue }) => {
    try {
      await galleryApi.deletePhoto(photoId);
      return { galleryId, photoId };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete photo');
    }
  }
);

export const batchOperation = createAsyncThunk(
  'gallery/batchOperation',
  async (operation: BatchOperation, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const currentGalleryId = state.gallery.currentGallery?.id;

      switch (operation.type) {
        case 'delete':
          await galleryApi.batchDeletePhotos(operation.photoIds);
          return { type: 'delete', photoIds: operation.photoIds, galleryId: currentGalleryId };
        
        case 'move':
          // Implementation depends on your backend
          throw new Error('Move operation not implemented');
        
        case 'tag':
          // Implementation depends on your backend
          throw new Error('Tag operation not implemented');
        
        case 'privacy':
          // Implementation depends on your backend
          throw new Error('Privacy operation not implemented');
        
        default:
          throw new Error('Unknown operation type');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Batch operation failed');
    }
  }
);

export const reorderPhotos = createAsyncThunk(
  'gallery/reorderPhotos',
  async ({ galleryId, photoOrders }: { galleryId: string; photoOrders: { id: string; order: number }[] }, { rejectWithValue }) => {
    try {
      await galleryApi.reorderPhotos(galleryId, photoOrders);
      return { galleryId, photoOrders };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to reorder photos');
    }
  }
);

export const toggleLike = createAsyncThunk(
  'gallery/toggleLike',
  async ({ galleryId, userId }: { galleryId: string; userId: string }, { rejectWithValue }) => {
    try {
      const liked = await galleryApi.toggleLike(galleryId, userId);
      return { galleryId, liked };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to toggle like');
    }
  }
);

// Create the gallery slice
const gallerySlice = createSlice({
  name: 'gallery',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<GalleryFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    togglePhotoSelection: (state, action: PayloadAction<string>) => {
      const photoId = action.payload;
      const index = state.selectedPhotos.indexOf(photoId);
      if (index > -1) {
        state.selectedPhotos.splice(index, 1);
      } else {
        state.selectedPhotos.push(photoId);
      }
    },
    selectAllPhotos: (state) => {
      if (state.currentGallery) {
        state.selectedPhotos = state.currentGallery.photos.map(p => p.id);
      }
    },
    clearSelection: (state) => {
      state.selectedPhotos = [];
    },
    setUploadProgress: (state, action: PayloadAction<UploadProgress>) => {
      state.uploadProgress[action.payload.photoId] = action.payload;
    },
    updateUploadProgress: (state, action: PayloadAction<{ photoId: string; progress: number }>) => {
      if (state.uploadProgress[action.payload.photoId]) {
        state.uploadProgress[action.payload.photoId].progress = action.payload.progress;
      }
    },
    removeUploadProgress: (state, action: PayloadAction<string>) => {
      delete state.uploadProgress[action.payload];
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchGalleries
      .addCase(fetchGalleries.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchGalleries.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.galleries = action.payload.galleries;
        state.filters = action.payload.filters || {};
      })
      .addCase(fetchGalleries.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // fetchGalleryById
      .addCase(fetchGalleryById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchGalleryById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentGallery = action.payload;
        // Update in galleries array if exists
        const index = state.galleries.findIndex(g => g.id === action.payload.id);
        if (index > -1) {
          state.galleries[index] = action.payload;
        }
      })
      .addCase(fetchGalleryById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // createGallery
      .addCase(createGallery.fulfilled, (state, action) => {
        state.galleries.unshift(action.payload);
        state.currentGallery = action.payload;
      })
      
      // updateGallery
      .addCase(updateGallery.fulfilled, (state, action) => {
        const index = state.galleries.findIndex(g => g.id === action.payload.id);
        if (index > -1) {
          state.galleries[index] = action.payload;
        }
        if (state.currentGallery?.id === action.payload.id) {
          state.currentGallery = action.payload;
        }
      })
      
      // deleteGallery
      .addCase(deleteGallery.fulfilled, (state, action) => {
        state.galleries = state.galleries.filter(g => g.id !== action.payload);
        if (state.currentGallery?.id === action.payload) {
          state.currentGallery = null;
        }
      })
      
      // uploadPhoto
      .addCase(uploadPhoto.fulfilled, (state, action) => {
        if (state.currentGallery && action.payload.galleryId === state.currentGallery.id) {
          state.currentGallery.photos.push(action.payload);
        }
      })
      
      // deletePhoto
      .addCase(deletePhoto.fulfilled, (state, action) => {
        if (state.currentGallery && action.payload.galleryId === state.currentGallery.id) {
          state.currentGallery.photos = state.currentGallery.photos.filter(
            p => p.id !== action.payload.photoId
          );
        }
        // Remove from selection
        state.selectedPhotos = state.selectedPhotos.filter(id => id !== action.payload.photoId);
      })
      
      // batchOperation
      .addCase(batchOperation.fulfilled, (state, action) => {
        if (action.payload.type === 'delete' && state.currentGallery) {
          state.currentGallery.photos = state.currentGallery.photos.filter(
            p => !action.payload.photoIds.includes(p.id)
          );
          state.selectedPhotos = [];
        }
      })
      
      // reorderPhotos
      .addCase(reorderPhotos.fulfilled, (state, action) => {
        if (state.currentGallery && action.payload.galleryId === state.currentGallery.id) {
          // Update photo order in current gallery
          action.payload.photoOrders.forEach(({ id, order }) => {
            const photo = state.currentGallery!.photos.find(p => p.id === id);
            if (photo) {
              photo.order = order;
            }
          });
          // Sort photos by order
          state.currentGallery.photos.sort((a, b) => (a.order || 0) - (b.order || 0));
        }
      })
      
      // toggleLike
      .addCase(toggleLike.fulfilled, (state, action) => {
        const gallery = state.galleries.find(g => g.id === action.payload.galleryId);
        if (gallery && gallery.stats) {
          gallery.stats.likeCount += action.payload.liked ? 1 : -1;
        }
        if (state.currentGallery?.id === action.payload.galleryId && state.currentGallery.stats) {
          state.currentGallery.stats.likeCount += action.payload.liked ? 1 : -1;
        }
      });
  }
});

// Export actions and reducer
export const {
  setFilters,
  clearFilters,
  togglePhotoSelection,
  selectAllPhotos,
  clearSelection,
  setUploadProgress,
  updateUploadProgress,
  removeUploadProgress
} = gallerySlice.actions;

// Export selectors
export const selectAllGalleries = (state: RootState) => state.gallery.galleries;
export const selectCurrentGallery = (state: RootState) => state.gallery.currentGallery;
export const selectSelectedPhotos = (state: RootState) => state.gallery.selectedPhotos;
export const selectUploadProgress = (state: RootState) => state.gallery.uploadProgress;
export const selectGalleryFilters = (state: RootState) => state.gallery.filters;
export const selectGalleryStatus = (state: RootState) => state.gallery.status;
export const selectGalleryError = (state: RootState) => state.gallery.error;

export default gallerySlice.reducer;