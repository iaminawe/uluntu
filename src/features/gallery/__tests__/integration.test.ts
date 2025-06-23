/**
 * Gallery System Integration Tests
 * Tests the complete gallery workflow from upload to display
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { galleryApi } from '../api/galleryApi';
import { validateImageFile, generateThumbnail, formatFileSize } from '../utils';
import { PhotoUploadInput, Gallery, Photo } from '../types';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          order: jest.fn(() => ({ data: [], error: null }))
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({ data: mockGallery, error: null }))
          }))
        })),
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => ({ data: mockGallery, error: null }))
            }))
          }))
        })),
        delete: jest.fn(() => ({
          eq: jest.fn(() => ({ error: null }))
        })),
        or: jest.fn(() => ({ data: [mockGallery], error: null })),
        contains: jest.fn(() => ({ data: [mockGallery], error: null })),
        gte: jest.fn(() => ({
          lte: jest.fn(() => ({ data: [mockGallery], error: null }))
        }))
      }))
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(() => ({ data: { path: 'test-path' }, error: null })),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://test.com/image.jpg' } })),
        remove: jest.fn(() => ({ error: null }))
      }))
    }
  }
}));

// Mock data
const mockGallery: Gallery = {
  id: 'test-gallery-id',
  user_id: 'test-user-id',
  title: 'Test Gallery',
  description: 'A test gallery',
  slug: 'test-gallery',
  privacy_level: 'public',
  visibility: 'visible',
  sort_order: 0,
  photo_count: 0,
  view_count: 0,
  is_featured: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  photos: []
};

const mockPhoto: Photo = {
  id: 'test-photo-id',
  gallery_id: 'test-gallery-id',
  user_id: 'test-user-id',
  file_name: 'test-image.jpg',
  original_file_name: 'test-image.jpg',
  file_size: 1024000,
  mime_type: 'image/jpeg',
  storage_path: 'gallery/test-image.jpg',
  thumbnail_path: 'gallery/thumbnails/test-image.jpg',
  medium_path: 'gallery/medium/test-image.jpg',
  title: 'Test Image',
  description: 'A test image',
  alt_text: 'Test image alt text',
  tags: ['test', 'image'],
  width: 1920,
  height: 1080,
  sort_order: 0,
  visibility: 'visible',
  created_at: new Date().toISOString()
};

// Mock File object
class MockFile extends File {
  constructor(
    bits: BlobPart[],
    filename: string,
    options?: FilePropertyBag
  ) {
    super(bits, filename, options);
  }
}

describe('Gallery System Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Image Validation', () => {
    test('validates supported image formats', () => {
      const jpegFile = new MockFile([''], 'test.jpg', { type: 'image/jpeg' });
      const pngFile = new MockFile([''], 'test.png', { type: 'image/png' });
      const webpFile = new MockFile([''], 'test.webp', { type: 'image/webp' });
      const invalidFile = new MockFile([''], 'test.txt', { type: 'text/plain' });

      expect(validateImageFile(jpegFile).valid).toBe(true);
      expect(validateImageFile(pngFile).valid).toBe(true);
      expect(validateImageFile(webpFile).valid).toBe(true);
      expect(validateImageFile(invalidFile).valid).toBe(false);
      expect(validateImageFile(invalidFile).error).toContain('Invalid file type');
    });

    test('validates file size limits', () => {
      const smallFile = new MockFile(['x'.repeat(1000)], 'small.jpg', { type: 'image/jpeg' });
      const largeFile = new MockFile(['x'.repeat(15 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });

      expect(validateImageFile(smallFile).valid).toBe(true);
      expect(validateImageFile(largeFile).valid).toBe(false);
      expect(validateImageFile(largeFile).error).toContain('exceeds 10MB limit');
    });
  });

  describe('Utility Functions', () => {
    test('formats file sizes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });

    test('formats partial file sizes correctly', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB'); // 1.5 KB
      expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB'); // 2.5 MB
    });
  });

  describe('Gallery API Operations', () => {
    test('creates a new gallery', async () => {
      const newGallery = {
        title: 'New Test Gallery',
        description: 'A new test gallery',
        privacy_level: 'public' as const,
        visibility: 'visible' as const
      };

      const result = await galleryApi.createGallery(newGallery);
      expect(result).toEqual(mockGallery);
    });

    test('fetches all galleries with filters', async () => {
      const filters = {
        search: 'test',
        privacy: 'public' as const,
        tags: ['test']
      };

      const result = await galleryApi.getAllGalleries(filters);
      expect(Array.isArray(result)).toBe(true);
    });

    test('fetches a specific gallery by ID', async () => {
      const result = await galleryApi.getGalleryById('test-gallery-id');
      expect(result).toEqual(expect.objectContaining({
        id: 'test-gallery-id'
      }));
    });

    test('updates gallery information', async () => {
      const updates = {
        title: 'Updated Gallery Title',
        description: 'Updated description'
      };

      const result = await galleryApi.updateGallery('test-gallery-id', updates);
      expect(result).toEqual(mockGallery);
    });

    test('deletes a gallery', async () => {
      const result = await galleryApi.deleteGallery('test-gallery-id');
      expect(result).toBe(true);
    });
  });

  describe('Photo Operations', () => {
    test('uploads a single photo', async () => {
      const file = new MockFile(['test content'], 'test.jpg', { type: 'image/jpeg' });
      const uploadInput: PhotoUploadInput = {
        file,
        title: 'Test Photo',
        description: 'A test photo upload',
        tags: ['test', 'upload'],
        galleryId: 'test-gallery-id'
      };

      const result = await galleryApi.uploadPhoto(uploadInput);
      expect(result).toEqual(expect.objectContaining({
        gallery_id: 'test-gallery-id',
        title: 'Test Photo'
      }));
    });

    test('batch uploads multiple photos', async () => {
      const files = [
        new MockFile(['content1'], 'test1.jpg', { type: 'image/jpeg' }),
        new MockFile(['content2'], 'test2.jpg', { type: 'image/jpeg' }),
        new MockFile(['content3'], 'test3.jpg', { type: 'image/jpeg' })
      ];

      const uploadPromises = files.map((file, index) => 
        galleryApi.uploadPhoto({
          file,
          title: `Test Photo ${index + 1}`,
          galleryId: 'test-gallery-id'
        })
      );

      const results = await Promise.all(uploadPromises);
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toEqual(expect.objectContaining({
          gallery_id: 'test-gallery-id'
        }));
      });
    });

    test('batch deletes multiple photos', async () => {
      const photoIds = ['photo1', 'photo2', 'photo3'];
      const result = await galleryApi.batchDeletePhotos(photoIds);
      expect(result).toBe(true);
    });

    test('reorders photos in gallery', async () => {
      const photoOrders = [
        { id: 'photo1', order: 2 },
        { id: 'photo2', order: 1 },
        { id: 'photo3', order: 3 }
      ];

      const result = await galleryApi.reorderPhotos('test-gallery-id', photoOrders);
      expect(result).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('handles upload errors gracefully', async () => {
      // Mock an upload error
      const mockSupabase = require('@/lib/supabase').supabase;
      mockSupabase.storage.from.mockReturnValueOnce({
        upload: jest.fn(() => ({ error: new Error('Upload failed') }))
      });

      const file = new MockFile(['content'], 'test.jpg', { type: 'image/jpeg' });
      const uploadInput: PhotoUploadInput = {
        file,
        galleryId: 'test-gallery-id'
      };

      await expect(galleryApi.uploadPhoto(uploadInput)).rejects.toThrow('Upload failed');
    });

    test('handles network errors during gallery fetch', async () => {
      const mockSupabase = require('@/lib/supabase').supabase;
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({ error: new Error('Network error') }))
          }))
        }))
      });

      await expect(galleryApi.getGalleryById('test-id')).rejects.toThrow('Network error');
    });
  });

  describe('Performance Considerations', () => {
    test('handles large batch operations efficiently', async () => {
      const start = Date.now();
      
      // Simulate uploading 20 photos
      const files = Array.from({ length: 20 }, (_, i) => 
        new MockFile(['content'], `test${i}.jpg`, { type: 'image/jpeg' })
      );

      const uploadPromises = files.map((file, index) => 
        galleryApi.uploadPhoto({
          file,
          title: `Performance Test ${index + 1}`,
          galleryId: 'test-gallery-id'
        })
      );

      await Promise.all(uploadPromises);
      const duration = Date.now() - start;
      
      // Should complete batch operations reasonably quickly
      expect(duration).toBeLessThan(5000); // 5 seconds
    });
  });

  describe('Data Validation', () => {
    test('validates gallery data structure', () => {
      const gallery = mockGallery;
      
      expect(gallery).toEqual(expect.objectContaining({
        id: expect.any(String),
        user_id: expect.any(String),
        title: expect.any(String),
        privacy_level: expect.stringMatching(/^(public|members_only|private)$/),
        visibility: expect.stringMatching(/^(visible|hidden|archived)$/),
        created_at: expect.any(String),
        updated_at: expect.any(String)
      }));
    });

    test('validates photo data structure', () => {
      const photo = mockPhoto;
      
      expect(photo).toEqual(expect.objectContaining({
        id: expect.any(String),
        gallery_id: expect.any(String),
        user_id: expect.any(String),
        file_name: expect.any(String),
        original_file_name: expect.any(String),
        file_size: expect.any(Number),
        mime_type: expect.any(String),
        storage_path: expect.any(String),
        visibility: expect.stringMatching(/^(visible|hidden)$/),
        created_at: expect.any(String)
      }));
    });
  });
});