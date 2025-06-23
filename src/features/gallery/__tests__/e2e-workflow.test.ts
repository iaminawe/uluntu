/**
 * End-to-End Gallery Workflow Tests
 * Tests the complete user journey from gallery creation to photo display
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { configureStore } from '@reduxjs/toolkit';
import { galleryApi } from '../api/galleryApi';
import galleryReducer, { 
  fetchGalleries, 
  createGallery, 
  uploadPhoto, 
  fetchGalleryById 
} from '../store/gallerySlice';
import { validateImageFile, generateThumbnail } from '../utils';
import { Gallery, Photo, PhotoUploadInput } from '../types';

// Mock Supabase responses
const mockSupabaseResponses = {
  galleries: [] as Gallery[],
  photos: [] as Photo[],
  uploadedFiles: [] as string[]
};

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn((table: string) => ({
      select: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({
          data: table === 'user_galleries' ? mockSupabaseResponses.galleries : mockSupabaseResponses.photos,
          error: null
        })),
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: mockSupabaseResponses.galleries[0] || null,
            error: null
          })),
          order: jest.fn(() => Promise.resolve({
            data: mockSupabaseResponses.photos,
            error: null
          }))
        }))
      })),
      insert: jest.fn((data: any[]) => ({
        select: jest.fn(() => ({
          single: jest.fn(() => {
            if (table === 'user_galleries') {
              const newGallery = { ...data[0], id: `gallery-${Date.now()}` };
              mockSupabaseResponses.galleries.push(newGallery);
              return Promise.resolve({ data: newGallery, error: null });
            } else if (table === 'gallery_photos') {
              const newPhoto = { ...data[0], id: `photo-${Date.now()}` };
              mockSupabaseResponses.photos.push(newPhoto);
              return Promise.resolve({ data: newPhoto, error: null });
            }
            return Promise.resolve({ data: null, error: null });
          })
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: mockSupabaseResponses.galleries[0], error: null }))
          }))
        }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
        in: jest.fn(() => Promise.resolve({ error: null }))
      }))
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn((path: string) => {
          mockSupabaseResponses.uploadedFiles.push(path);
          return Promise.resolve({ data: { path }, error: null });
        }),
        getPublicUrl: jest.fn((path: string) => ({
          data: { publicUrl: `https://storage.example.com/${path}` }
        })),
        remove: jest.fn((paths: string[]) => {
          paths.forEach(path => {
            const index = mockSupabaseResponses.uploadedFiles.indexOf(path);
            if (index > -1) mockSupabaseResponses.uploadedFiles.splice(index, 1);
          });
          return Promise.resolve({ error: null });
        })
      }))
    },
    auth: {
      getUser: jest.fn(() => Promise.resolve({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } }
      }))
    }
  }
}));

// Mock file operations
jest.mock('../utils', () => ({
  validateImageFile: jest.fn((file: File) => ({
    valid: file.type.startsWith('image/'),
    error: file.type.startsWith('image/') ? undefined : 'Invalid file type'
  })),
  generateThumbnail: jest.fn(() => Promise.resolve('blob:thumbnail-url')),
  formatFileSize: jest.fn((size: number) => `${Math.round(size / 1024)} KB`)
}));

// Create test store
const createTestStore = () => {
  return configureStore({
    reducer: {
      gallery: galleryReducer
    }
  });
};

describe('End-to-End Gallery Workflow', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
    // Reset mock data
    mockSupabaseResponses.galleries = [];
    mockSupabaseResponses.photos = [];
    mockSupabaseResponses.uploadedFiles = [];
    jest.clearAllMocks();
  });

  describe('Complete User Journey', () => {
    test('user creates gallery and uploads multiple photos', async () => {
      // Step 1: User creates a new gallery
      const newGallery = {
        title: 'My Trip to Mountains',
        description: 'Photos from my amazing mountain adventure',
        privacy_level: 'public' as const,
        visibility: 'visible' as const,
        tags: ['travel', 'mountains', 'adventure']
      };

      const createAction = await store.dispatch(createGallery(newGallery));
      expect(createAction.type).toBe(createGallery.fulfilled.type);
      
      const createdGallery = createAction.payload as Gallery;
      expect(createdGallery.title).toBe(newGallery.title);
      expect(mockSupabaseResponses.galleries).toHaveLength(1);

      // Step 2: User uploads batch of photos
      const photoFiles = [
        new File(['photo1-content'], 'mountain-peak.jpg', { type: 'image/jpeg' }),
        new File(['photo2-content'], 'hiking-trail.jpg', { type: 'image/jpeg' }),
        new File(['photo3-content'], 'sunset-view.jpg', { type: 'image/jpeg' }),
        new File(['photo4-content'], 'campsite.jpg', { type: 'image/jpeg' })
      ];

      const uploadPromises = photoFiles.map((file, index) => {
        const uploadInput: PhotoUploadInput = {
          file,
          title: `Photo ${index + 1}`,
          description: `Description for photo ${index + 1}`,
          tags: ['mountain', 'nature'],
          galleryId: createdGallery.id
        };
        return store.dispatch(uploadPhoto(uploadInput));
      });

      const uploadResults = await Promise.all(uploadPromises);
      
      // Verify all uploads succeeded
      uploadResults.forEach(result => {
        expect(result.type).toBe(uploadPhoto.fulfilled.type);
      });

      expect(mockSupabaseResponses.photos).toHaveLength(4);
      expect(mockSupabaseResponses.uploadedFiles).toHaveLength(4);

      // Step 3: User views the gallery with uploaded photos
      const fetchAction = await store.dispatch(fetchGalleryById(createdGallery.id));
      expect(fetchAction.type).toBe(fetchGalleryById.fulfilled.type);

      const galleryWithPhotos = fetchAction.payload as Gallery;
      expect(galleryWithPhotos.id).toBe(createdGallery.id);

      // Verify state is properly updated
      const state = store.getState();
      expect(state.gallery.currentGallery?.id).toBe(createdGallery.id);
      expect(state.gallery.status).toBe('succeeded');
    });

    test('user manages photo organization and metadata', async () => {
      // Setup: Create gallery and upload photos
      const gallery = {
        title: 'Event Photography',
        privacy_level: 'public' as const,
        visibility: 'visible' as const
      };

      const createResult = await store.dispatch(createGallery(gallery));
      const createdGallery = createResult.payload as Gallery;

      // Upload photos with different metadata
      const photoData = [
        { 
          file: new File(['content1'], 'ceremony.jpg', { type: 'image/jpeg' }),
          title: 'Wedding Ceremony',
          description: 'The beautiful ceremony moment',
          tags: ['wedding', 'ceremony', 'formal']
        },
        {
          file: new File(['content2'], 'reception.jpg', { type: 'image/jpeg' }),
          title: 'Reception Party',
          description: 'Dancing and celebration',
          tags: ['wedding', 'reception', 'party']
        },
        {
          file: new File(['content3'], 'portraits.jpg', { type: 'image/jpeg' }),
          title: 'Couple Portraits',
          description: 'Romantic couple photos',
          tags: ['wedding', 'portraits', 'couple']
        }
      ];

      for (const photo of photoData) {
        await store.dispatch(uploadPhoto({
          ...photo,
          galleryId: createdGallery.id
        }));
      }

      // Verify photos were uploaded with correct metadata
      expect(mockSupabaseResponses.photos).toHaveLength(3);
      
      const uploadedPhotos = mockSupabaseResponses.photos;
      expect(uploadedPhotos[0].title).toBe('Wedding Ceremony');
      expect(uploadedPhotos[1].title).toBe('Reception Party');
      expect(uploadedPhotos[2].title).toBe('Couple Portraits');

      // Test reordering photos
      const photoOrders = [
        { id: uploadedPhotos[2].id, order: 1 }, // Portraits first
        { id: uploadedPhotos[0].id, order: 2 }, // Ceremony second
        { id: uploadedPhotos[1].id, order: 3 }  // Reception last
      ];

      const reorderResult = await galleryApi.reorderPhotos(createdGallery.id, photoOrders);
      expect(reorderResult).toBe(true);
    });

    test('user shares gallery with different privacy levels', async () => {
      // Test public gallery
      const publicGallery = {
        title: 'Public Photo Collection',
        privacy_level: 'public' as const,
        visibility: 'visible' as const
      };

      const publicResult = await store.dispatch(createGallery(publicGallery));
      expect(publicResult.type).toBe(createGallery.fulfilled.type);

      // Test private gallery
      const privateGallery = {
        title: 'Private Family Photos',
        privacy_level: 'private' as const,
        visibility: 'visible' as const
      };

      const privateResult = await store.dispatch(createGallery(privateGallery));
      expect(privateResult.type).toBe(createGallery.fulfilled.type);

      // Test members-only gallery
      const membersGallery = {
        title: 'Community Members Gallery',
        privacy_level: 'members_only' as const,
        visibility: 'visible' as const
      };

      const membersResult = await store.dispatch(createGallery(membersGallery));
      expect(membersResult.type).toBe(createGallery.fulfilled.type);

      // Verify all galleries were created with correct privacy settings
      expect(mockSupabaseResponses.galleries).toHaveLength(3);
      expect(mockSupabaseResponses.galleries[0].privacy_level).toBe('public');
      expect(mockSupabaseResponses.galleries[1].privacy_level).toBe('private');
      expect(mockSupabaseResponses.galleries[2].privacy_level).toBe('members_only');
    });
  });

  describe('Error Recovery and Edge Cases', () => {
    test('handles partial upload failures gracefully', async () => {
      const gallery = {
        title: 'Test Gallery',
        privacy_level: 'public' as const,
        visibility: 'visible' as const
      };

      const createResult = await store.dispatch(createGallery(gallery));
      const createdGallery = createResult.payload as Gallery;

      // Mock storage failure for some uploads
      let uploadCount = 0;
      mockSupabase.storage.from.mockReturnValue({
        upload: jest.fn(() => {
          uploadCount++;
          if (uploadCount === 2) {
            // Fail the second upload
            return Promise.resolve({ 
              data: null, 
              error: { message: 'Storage quota exceeded' }
            });
          }
          return Promise.resolve({ 
            data: { path: `gallery/photo-${uploadCount}.jpg` }, 
            error: null 
          });
        }),
        getPublicUrl: jest.fn((path: string) => ({
          data: { publicUrl: `https://storage.example.com/${path}` }
        }))
      });

      const uploadFiles = [
        new File(['content1'], 'photo1.jpg', { type: 'image/jpeg' }),
        new File(['content2'], 'photo2.jpg', { type: 'image/jpeg' }),
        new File(['content3'], 'photo3.jpg', { type: 'image/jpeg' })
      ];

      const uploadPromises = uploadFiles.map((file, index) => 
        store.dispatch(uploadPhoto({
          file,
          title: `Photo ${index + 1}`,
          galleryId: createdGallery.id
        }))
      );

      const results = await Promise.allSettled(uploadPromises);
      
      // Should have one failure and two successes
      const successes = results.filter(r => r.status === 'fulfilled');
      const failures = results.filter(r => r.status === 'rejected');
      
      expect(successes).toHaveLength(2);
      expect(failures).toHaveLength(1);
    });

    test('handles large batch operations efficiently', async () => {
      const gallery = {
        title: 'Large Photo Collection',
        privacy_level: 'public' as const,
        visibility: 'visible' as const
      };

      const createResult = await store.dispatch(createGallery(gallery));
      const createdGallery = createResult.payload as Gallery;

      // Upload 20 photos in batches
      const batchSize = 5;
      const totalPhotos = 20;
      const batches = [];

      for (let i = 0; i < totalPhotos; i += batchSize) {
        const batchFiles = Array.from({ length: Math.min(batchSize, totalPhotos - i) }, (_, j) => 
          new File([`content-${i + j}`], `photo-${i + j + 1}.jpg`, { type: 'image/jpeg' })
        );

        const batchPromises = batchFiles.map(file => 
          store.dispatch(uploadPhoto({
            file,
            title: file.name,
            galleryId: createdGallery.id
          }))
        );

        batches.push(Promise.all(batchPromises));
      }

      const startTime = Date.now();
      await Promise.all(batches);
      const endTime = Date.now();

      // Should complete within reasonable time (for mock operations)
      expect(endTime - startTime).toBeLessThan(1000);
      expect(mockSupabaseResponses.photos).toHaveLength(totalPhotos);
    });

    test('validates file types and prevents malicious uploads', async () => {
      const gallery = {
        title: 'Secure Gallery',
        privacy_level: 'public' as const,
        visibility: 'visible' as const
      };

      const createResult = await store.dispatch(createGallery(gallery));
      const createdGallery = createResult.payload as Gallery;

      // Attempt to upload various file types
      const testFiles = [
        new File(['image-content'], 'valid.jpg', { type: 'image/jpeg' }),
        new File(['script-content'], 'malicious.js', { type: 'application/javascript' }),
        new File(['executable'], 'virus.exe', { type: 'application/x-msdownload' }),
        new File(['image-content'], 'valid.png', { type: 'image/png' })
      ];

      const uploadPromises = testFiles.map(file => 
        store.dispatch(uploadPhoto({
          file,
          title: file.name,
          galleryId: createdGallery.id
        }))
      );

      const results = await Promise.allSettled(uploadPromises);
      
      // Only valid image files should succeed
      const successfulUploads = results.filter(r => r.status === 'fulfilled');
      expect(successfulUploads).toHaveLength(2); // Only .jpg and .png files
    });
  });

  describe('Performance and Scalability', () => {
    test('handles concurrent gallery operations', async () => {
      // Create multiple galleries simultaneously
      const galleryPromises = Array.from({ length: 5 }, (_, i) => 
        store.dispatch(createGallery({
          title: `Concurrent Gallery ${i + 1}`,
          privacy_level: 'public' as const,
          visibility: 'visible' as const
        }))
      );

      const galleryResults = await Promise.all(galleryPromises);
      
      // All galleries should be created successfully
      expect(galleryResults.every(r => r.type === createGallery.fulfilled.type)).toBe(true);
      expect(mockSupabaseResponses.galleries).toHaveLength(5);

      // Upload photos to each gallery concurrently
      const uploadPromises = galleryResults.map((result, i) => {
        const gallery = result.payload as Gallery;
        return store.dispatch(uploadPhoto({
          file: new File([`content-${i}`], `photo-${i}.jpg`, { type: 'image/jpeg' }),
          title: `Photo for Gallery ${i + 1}`,
          galleryId: gallery.id
        }));
      });

      const uploadResults = await Promise.all(uploadPromises);
      expect(uploadResults.every(r => r.type === uploadPhoto.fulfilled.type)).toBe(true);
    });

    test('manages memory efficiently during bulk operations', async () => {
      const gallery = {
        title: 'Memory Test Gallery',
        privacy_level: 'public' as const,
        visibility: 'visible' as const
      };

      const createResult = await store.dispatch(createGallery(gallery));
      const createdGallery = createResult.payload as Gallery;

      // Simulate processing many files
      const largeFileCount = 50;
      const files = Array.from({ length: largeFileCount }, (_, i) => 
        new File([`large-content-${i}`.repeat(100)], `large-${i}.jpg`, { type: 'image/jpeg' })
      );

      // Process in smaller chunks to simulate real-world usage
      const chunkSize = 10;
      for (let i = 0; i < files.length; i += chunkSize) {
        const chunk = files.slice(i, i + chunkSize);
        const chunkPromises = chunk.map(file => 
          store.dispatch(uploadPhoto({
            file,
            title: file.name,
            galleryId: createdGallery.id
          }))
        );

        await Promise.all(chunkPromises);
      }

      expect(mockSupabaseResponses.photos).toHaveLength(largeFileCount);
    });
  });

  describe('State Management Integration', () => {
    test('maintains consistent state throughout workflow', async () => {
      // Initial state
      let state = store.getState();
      expect(state.gallery.galleries).toHaveLength(0);
      expect(state.gallery.status).toBe('idle');

      // Create gallery
      await store.dispatch(createGallery({
        title: 'State Test Gallery',
        privacy_level: 'public' as const,
        visibility: 'visible' as const
      }));

      state = store.getState();
      expect(state.gallery.galleries).toHaveLength(1);
      expect(state.gallery.currentGallery?.title).toBe('State Test Gallery');

      // Upload photo
      await store.dispatch(uploadPhoto({
        file: new File(['content'], 'test.jpg', { type: 'image/jpeg' }),
        title: 'Test Photo',
        galleryId: state.gallery.currentGallery!.id
      }));

      state = store.getState();
      expect(state.gallery.currentGallery?.photos).toHaveLength(1);

      // Fetch updated gallery
      await store.dispatch(fetchGalleries());

      state = store.getState();
      expect(state.gallery.status).toBe('succeeded');
      expect(state.gallery.error).toBeNull();
    });
  });
});