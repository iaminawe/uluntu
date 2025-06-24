import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { galleryApi } from '../api/galleryApi';
import { Gallery, Photo, PhotoUploadInput, GalleryFilters, CreateGalleryInput, UpdateGalleryInput } from '../types';
import { GalleriesResponse } from '../api/galleryApi';
import { IS_SUPABASE_ENABLED } from '@/config/env';
import { GalleryErrorHandler } from '../utils/errorHandler';

// Toggle between Supabase and mock data
const USE_SUPABASE = IS_SUPABASE_ENABLED;

// Query keys factory for better organization
export const galleryQueryKeys = {
  all: ['galleries'] as const,
  lists: () => [...galleryQueryKeys.all, 'list'] as const,
  list: (filters?: GalleryFilters & { page?: number; limit?: number }) => [...galleryQueryKeys.lists(), { filters }] as const,
  details: () => [...galleryQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...galleryQueryKeys.details(), id] as const,
  photos: (galleryId: string) => [...galleryQueryKeys.all, 'photos', galleryId] as const,
};

/**
 * Fetch all galleries with optional filters and pagination
 */
export function useGalleries(filters?: GalleryFilters & { page?: number; limit?: number }): UseQueryResult<GalleriesResponse, Error> {
  return useQuery<GalleriesResponse, Error>({
    queryKey: galleryQueryKeys.list(filters),
    queryFn: async () => {
      if (!USE_SUPABASE) {
        // Mock data implementation
        const mockGalleries: Gallery[] = [
          {
            id: '1',
            user_id: 'user-1',
            title: 'Nature Photography',
            description: 'Beautiful landscapes and wildlife',
            slug: 'nature-photography',
            privacy_level: 'public',
            visibility: 'visible',
            sort_order: 0,
            photo_count: 12,
            view_count: 150,
            is_featured: true,
            tags: ['nature', 'landscape', 'wildlife'],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            photos: [],
            stats: {
              viewCount: 150,
              likeCount: 45,
              commentCount: 8,
              downloadCount: 23
            }
          }
        ];
        
        // Apply filters to mock data
        let filtered = [...mockGalleries];
        if (filters?.search) {
          const searchLower = filters.search.toLowerCase();
          filtered = filtered.filter(g => 
            g.title.toLowerCase().includes(searchLower) ||
            g.description?.toLowerCase().includes(searchLower)
          );
        }
        if (filters?.tags && filters.tags.length > 0) {
          filtered = filtered.filter(g => 
            g.tags?.some(tag => filters.tags?.includes(tag))
          );
        }
        
        // Mock pagination
        const page = filters?.page || 1;
        const limit = filters?.limit || 12;
        const totalCount = filtered.length;
        const totalPages = Math.ceil(totalCount / limit);
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginatedGalleries = filtered.slice(start, end);
        
        return {
          galleries: paginatedGalleries,
          totalCount,
          totalPages,
          currentPage: page
        };
      }
      
      return galleryApi.getAllGalleries(filters);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch a single gallery by ID
 */
export function useGallery(id?: string): UseQueryResult<Gallery | null, Error> {
  return useQuery<Gallery | null, Error>({
    queryKey: galleryQueryKeys.detail(id!),
    queryFn: async () => {
      if (!id) return null;
      
      if (!USE_SUPABASE) {
        // Mock implementation
        return {
          id,
          user_id: 'user-1',
          title: 'Nature Photography',
          description: 'Beautiful landscapes and wildlife',
          slug: 'nature-photography',
          privacy_level: 'public' as const,
          visibility: 'visible' as const,
          sort_order: 0,
          photo_count: 12,
          view_count: 150,
          is_featured: true,
          tags: ['nature', 'landscape', 'wildlife'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          photos: [],
          stats: {
            viewCount: 150,
            likeCount: 45,
            commentCount: 8,
            downloadCount: 23
          }
        };
      }
      
      const gallery = await galleryApi.getGallery(id);
      
      // Increment view count in background
      if (gallery) {
        galleryApi.incrementViewCount(id).catch(console.error);
      }
      
      return gallery;
    },
    enabled: !!id,
  });
}

/**
 * Fetch photos for a specific gallery
 */
export function useGalleryPhotos(galleryId?: string): UseQueryResult<Photo[], Error> {
  return useQuery<Photo[], Error>({
    queryKey: galleryQueryKeys.photos(galleryId!),
    queryFn: async () => {
      if (!galleryId) return [];
      
      if (!USE_SUPABASE) {
        // Mock photos
        return [
          {
            id: '1',
            gallery_id: galleryId,
            user_id: 'user-1',
            file_name: 'sunset.jpg',
            original_file_name: 'IMG_001.jpg',
            file_size: 2048000,
            mime_type: 'image/jpeg',
            storage_path: 'gallery/sunset.jpg',
            url: 'https://via.placeholder.com/800x600',
            width: 800,
            height: 600,
            title: 'Mountain Sunset',
            tags: ['sunset', 'mountain'],
            sort_order: 0,
            visibility: 'visible' as const,
            created_at: new Date().toISOString(),
          }
        ];
      }
      
      return galleryApi.getGalleryPhotos(galleryId);
    },
    enabled: !!galleryId,
  });
}

/**
 * Create a new gallery
 */
export function useCreateGallery(): UseMutationResult<Gallery, Error, CreateGalleryInput> {
  const queryClient = useQueryClient();
  
  return useMutation<Gallery, Error, CreateGalleryInput>({
    mutationFn: async (input) => {
      if (!USE_SUPABASE) {
        // Mock creation
        const newGallery: Gallery = {
          id: Date.now().toString(),
          user_id: 'user-1',
          title: input.title,
          description: input.description,
          slug: input.title.toLowerCase().replace(/\s+/g, '-'),
          privacy_level: input.privacy_level,
          visibility: input.visibility,
          sort_order: 0,
          photo_count: 0,
          view_count: 0,
          is_featured: false,
          tags: input.tags || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          photos: []
        };
        return Promise.resolve(newGallery);
      }
      
      return galleryApi.createGallery(input);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: galleryQueryKeys.lists() });
      GalleryErrorHandler.showSuccess(`Gallery "${data.title}" created successfully!`);
    }
  });
}

/**
 * Update an existing gallery
 */
export function useUpdateGallery(): UseMutationResult<Gallery, Error, { id: string; updates: UpdateGalleryInput }> {
  const queryClient = useQueryClient();
  
  return useMutation<Gallery, Error, { id: string; updates: UpdateGalleryInput }>({
    mutationFn: async ({ id, updates }) => {
      if (!USE_SUPABASE) {
        // Mock update
        const mockGallery: Gallery = {
          id,
          user_id: 'user-1',
          title: updates.title || 'Updated Gallery',
          description: updates.description,
          slug: 'updated-gallery',
          privacy_level: updates.privacy_level || 'public',
          visibility: updates.visibility || 'visible',
          sort_order: 0,
          photo_count: 0,
          view_count: 0,
          is_featured: false,
          tags: updates.tags || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          photos: []
        };
        return Promise.resolve(mockGallery);
      }
      
      return galleryApi.updateGallery(id, updates);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: galleryQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: galleryQueryKeys.detail(data.id) });
      GalleryErrorHandler.showSuccess('Gallery updated successfully!');
    }
  });
}

/**
 * Delete a gallery
 */
export function useDeleteGallery(): UseMutationResult<boolean, Error, string> {
  const queryClient = useQueryClient();
  
  return useMutation<boolean, Error, string>({
    mutationFn: async (id) => {
      if (!USE_SUPABASE) {
        return Promise.resolve(true);
      }
      
      return galleryApi.deleteGallery(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: galleryQueryKeys.lists() });
      queryClient.removeQueries({ queryKey: galleryQueryKeys.detail(id) });
      GalleryErrorHandler.showSuccess('Gallery deleted successfully!');
    }
  });
}

/**
 * Upload a photo to a gallery
 */
export function useUploadPhoto(): UseMutationResult<Photo, Error, PhotoUploadInput> {
  const queryClient = useQueryClient();
  
  return useMutation<Photo, Error, PhotoUploadInput>({
    mutationFn: async (input) => {
      if (!USE_SUPABASE) {
        // Mock upload
        const mockPhoto: Photo = {
          id: Date.now().toString(),
          gallery_id: input.galleryId || '',
          user_id: 'user-1',
          file_name: input.file.name,
          original_file_name: input.file.name,
          file_size: input.file.size,
          mime_type: input.file.type,
          storage_path: `gallery/${input.file.name}`,
          url: URL.createObjectURL(input.file),
          width: 800,
          height: 600,
          title: input.title || input.file.name,
          description: input.description,
          tags: input.tags,
          sort_order: 0,
          visibility: 'visible' as const,
          created_at: new Date().toISOString(),
        };
        return Promise.resolve(mockPhoto);
      }
      
      return galleryApi.uploadPhoto(input);
    },
    onSuccess: (data) => {
      if (data.gallery_id) {
        queryClient.invalidateQueries({ queryKey: galleryQueryKeys.photos(data.gallery_id) });
        queryClient.invalidateQueries({ queryKey: galleryQueryKeys.detail(data.gallery_id) });
      }
    },
  });
}

/**
 * Batch upload photos
 */
export function useBatchUploadPhotos(): UseMutationResult<
  { success: Photo[]; failed: { input: PhotoUploadInput; error: string }[] },
  Error,
  PhotoUploadInput[]
> {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (inputs: PhotoUploadInput[]) => {
      if (!USE_SUPABASE) {
        // Mock batch upload
        const results = {
          success: inputs.map((input, idx) => ({
            id: `${Date.now()}-${idx}`,
            gallery_id: input.galleryId || '',
            user_id: 'user-1',
            file_name: input.file.name,
            original_file_name: input.file.name,
            file_size: input.file.size,
            mime_type: input.file.type,
            storage_path: `gallery/${input.file.name}`,
            url: URL.createObjectURL(input.file),
            width: 800,
            height: 600,
            title: input.title || input.file.name,
            tags: input.tags,
            sort_order: idx,
            visibility: 'visible' as const,
            created_at: new Date().toISOString(),
          } as Photo)),
          failed: [] as { input: PhotoUploadInput; error: string }[]
        };
        return Promise.resolve(results);
      }
      
      return galleryApi.batchUploadPhotos(inputs);
    },
    onSuccess: (data) => {
      // Invalidate affected galleries
      const galleryIds = new Set(data.success.map(photo => photo.gallery_id));
      galleryIds.forEach(galleryId => {
        queryClient.invalidateQueries({ queryKey: galleryQueryKeys.photos(galleryId) });
        queryClient.invalidateQueries({ queryKey: galleryQueryKeys.detail(galleryId) });
      });
    },
  });
}

/**
 * Delete a photo
 */
export function useDeletePhoto(): UseMutationResult<boolean, Error, { photoId: string; galleryId: string }> {
  const queryClient = useQueryClient();
  
  return useMutation<boolean, Error, { photoId: string; galleryId: string }>({
    mutationFn: async ({ photoId }) => {
      if (!USE_SUPABASE) {
        return Promise.resolve(true);
      }
      
      return galleryApi.deletePhoto(photoId);
    },
    onSuccess: (_, { galleryId }) => {
      queryClient.invalidateQueries({ queryKey: galleryQueryKeys.photos(galleryId) });
      queryClient.invalidateQueries({ queryKey: galleryQueryKeys.detail(galleryId) });
    },
  });
}

/**
 * Batch delete photos
 */
export function useBatchDeletePhotos(): UseMutationResult<boolean, Error, { photoIds: string[]; galleryId: string }> {
  const queryClient = useQueryClient();
  
  return useMutation<boolean, Error, { photoIds: string[]; galleryId: string }>({
    mutationFn: async ({ photoIds }) => {
      if (!USE_SUPABASE) {
        return Promise.resolve(true);
      }
      
      return galleryApi.batchDeletePhotos(photoIds);
    },
    onSuccess: (_, { galleryId }) => {
      queryClient.invalidateQueries({ queryKey: galleryQueryKeys.photos(galleryId) });
      queryClient.invalidateQueries({ queryKey: galleryQueryKeys.detail(galleryId) });
    },
  });
}

/**
 * Reorder photos in a gallery
 */
export function useReorderPhotos(): UseMutationResult<
  boolean,
  Error,
  { galleryId: string; photoOrders: { id: string; order: number }[] }
> {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ galleryId, photoOrders }) => {
      if (!USE_SUPABASE) {
        return Promise.resolve(true);
      }
      
      return galleryApi.reorderPhotos(galleryId, photoOrders);
    },
    onSuccess: (_, { galleryId }) => {
      queryClient.invalidateQueries({ queryKey: galleryQueryKeys.photos(galleryId) });
    },
  });
}

/**
 * Toggle like on a gallery
 */
export function useToggleGalleryLike(): UseMutationResult<boolean, Error, { galleryId: string; userId: string }> {
  const queryClient = useQueryClient();
  
  return useMutation<boolean, Error, { galleryId: string; userId: string }>({
    mutationFn: async ({ galleryId, userId }) => {
      if (!USE_SUPABASE) {
        return Promise.resolve(true);
      }
      
      return galleryApi.toggleLike(galleryId, userId);
    },
    onSuccess: (_, { galleryId }) => {
      queryClient.invalidateQueries({ queryKey: galleryQueryKeys.detail(galleryId) });
    },
  });
}

/**
 * Toggle like on a photo
 */
export function useTogglePhotoLike(): UseMutationResult<boolean, Error, string> {
  const queryClient = useQueryClient();
  
  return useMutation<boolean, Error, string>({
    mutationFn: async (photoId) => {
      if (!USE_SUPABASE) {
        return Promise.resolve(true);
      }
      
      return galleryApi.likePhoto(photoId);
    },
    onSuccess: () => {
      // Invalidate all photo queries since we don't track gallery ID here
      queryClient.invalidateQueries({ queryKey: galleryQueryKeys.all });
    },
  });
}