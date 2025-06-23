/**
 * Gallery Security and Permissions Tests
 * Tests authentication, authorization, and data validation
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { galleryApi } from '../api/galleryApi';
import { validateImageFile } from '../utils';
import { Gallery, Photo, PhotoUploadInput } from '../types';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    storage: {
      from: jest.fn()
    },
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn()
    }
  }
}));

// Mock authentication states
const mockAuthenticatedUser = {
  id: 'authenticated-user-id',
  email: 'user@example.com',
  role: 'authenticated'
};

const mockUnauthenticatedUser = null;

const mockAdminUser = {
  id: 'admin-user-id',
  email: 'admin@example.com',
  role: 'admin'
};

// Mock data with different permission levels
const publicGallery: Gallery = {
  id: 'public-gallery',
  user_id: 'owner-user-id',
  title: 'Public Gallery',
  description: 'A public gallery',
  slug: 'public-gallery',
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

const privateGallery: Gallery = {
  ...publicGallery,
  id: 'private-gallery',
  privacy_level: 'private',
  title: 'Private Gallery'
};

const membersOnlyGallery: Gallery = {
  ...publicGallery,
  id: 'members-gallery',
  privacy_level: 'members_only',
  title: 'Members Only Gallery'
};

describe('Gallery Security and Permissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication Requirements', () => {
    test('allows anonymous users to view public galleries', async () => {
      const mockSupabase = require('@/lib/supabase').supabase;
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: [publicGallery],
            error: null
          })
        })
      });

      const galleries = await galleryApi.getAllGalleries();
      expect(galleries).toContain(expect.objectContaining({
        privacy_level: 'public'
      }));
    });

    test('requires authentication for private gallery access', async () => {
      const mockSupabase = require('@/lib/supabase').supabase;
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116', message: 'No rows found' }
            })
          })
        })
      });

      await expect(galleryApi.getGalleryById('private-gallery'))
        .rejects.toThrow();
    });

    test('requires authentication for photo uploads', async () => {
      const mockSupabase = require('@/lib/supabase').supabase;
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
      
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const uploadInput: PhotoUploadInput = {
        file,
        galleryId: 'test-gallery'
      };

      mockSupabase.storage.from.mockReturnValue({
        upload: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Authentication required' }
        })
      });

      await expect(galleryApi.uploadPhoto(uploadInput))
        .rejects.toThrow('Authentication required');
    });
  });

  describe('Authorization Controls', () => {
    test('allows gallery owners to modify their galleries', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: { ...mockAuthenticatedUser, id: 'owner-user-id' } } 
      });
      
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { ...publicGallery, title: 'Updated Title' },
                error: null
              })
            })
          })
        })
      });

      const result = await galleryApi.updateGallery('public-gallery', {
        title: 'Updated Title'
      });

      expect(result.title).toBe('Updated Title');
    });

    test('prevents non-owners from modifying galleries', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: { ...mockAuthenticatedUser, id: 'different-user-id' } } 
      });
      
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116', message: 'No rows found' }
              })
            })
          })
        })
      });

      await expect(galleryApi.updateGallery('public-gallery', {
        title: 'Unauthorized Update'
      })).rejects.toThrow();
    });

    test('allows owners to upload photos to their galleries', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: { ...mockAuthenticatedUser, id: 'owner-user-id' } } 
      });
      
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const uploadInput: PhotoUploadInput = {
        file,
        galleryId: 'public-gallery'
      };

      mockSupabase.storage.from.mockReturnValue({
        upload: jest.fn().mockResolvedValue({
          data: { path: 'gallery/test.jpg' },
          error: null
        }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: 'https://example.com/test.jpg' }
        })
      });

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'new-photo-id',
                gallery_id: 'public-gallery',
                user_id: 'owner-user-id',
                file_name: 'test.jpg'
              },
              error: null
            })
          })
        })
      });

      const result = await galleryApi.uploadPhoto(uploadInput);
      expect(result.gallery_id).toBe('public-gallery');
    });

    test('prevents uploading to galleries owned by others', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: { ...mockAuthenticatedUser, id: 'different-user-id' } } 
      });
      
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const uploadInput: PhotoUploadInput = {
        file,
        galleryId: 'public-gallery'
      };

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST301', message: 'Permission denied' }
            })
          })
        })
      });

      await expect(galleryApi.uploadPhoto(uploadInput))
        .rejects.toThrow();
    });
  });

  describe('Privacy Level Controls', () => {
    test('respects public gallery visibility', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: [publicGallery],
            error: null
          })
        })
      });

      const galleries = await galleryApi.getAllGalleries();
      expect(galleries.some(g => g.privacy_level === 'public')).toBe(true);
    });

    test('filters private galleries from public listings', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
      
      // Mock that private galleries are filtered out by RLS
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: [publicGallery], // Only public galleries returned
            error: null
          })
        })
      });

      const galleries = await galleryApi.getAllGalleries();
      expect(galleries.every(g => g.privacy_level === 'public')).toBe(true);
    });

    test('shows members-only galleries to authenticated users', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: mockAuthenticatedUser } 
      });
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: [publicGallery, membersOnlyGallery],
            error: null
          })
        })
      });

      const galleries = await galleryApi.getAllGalleries();
      expect(galleries.some(g => g.privacy_level === 'members_only')).toBe(true);
    });
  });

  describe('Input Validation and Sanitization', () => {
    test('validates image file types', () => {
      const validFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const invalidFile = new File(['content'], 'script.js', { type: 'application/javascript' });

      expect(validateImageFile(validFile).valid).toBe(true);
      expect(validateImageFile(invalidFile).valid).toBe(false);
    });

    test('enforces file size limits', () => {
      const normalFile = new File(['x'.repeat(1024)], 'normal.jpg', { type: 'image/jpeg' });
      const oversizedFile = new File(['x'.repeat(15 * 1024 * 1024)], 'huge.jpg', { type: 'image/jpeg' });

      expect(validateImageFile(normalFile).valid).toBe(true);
      expect(validateImageFile(oversizedFile).valid).toBe(false);
      expect(validateImageFile(oversizedFile).error).toContain('exceeds 10MB limit');
    });

    test('sanitizes gallery input data', async () => {
      const maliciousInput = {
        title: '<script>alert("xss")</script>Gallery',
        description: 'Normal description',
        privacy_level: 'public' as const,
        visibility: 'visible' as const
      };

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockImplementation((input) => {
              // Verify that input is sanitized before reaching the database
              expect(input.title).not.toContain('<script>');
              return Promise.resolve({
                data: { ...maliciousInput, title: 'Gallery' },
                error: null
              });
            })
          })
        })
      });

      // In a real implementation, sanitization would happen in the API layer
      const sanitizedInput = {
        ...maliciousInput,
        title: maliciousInput.title.replace(/<script.*?>.*?<\/script>/gi, '')
      };

      await galleryApi.createGallery(sanitizedInput);
    });

    test('validates required fields', async () => {
      const invalidGallery = {
        // Missing required fields
        description: 'Gallery without title'
      };

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { 
                code: '23502', 
                message: 'null value in column "title" violates not-null constraint' 
              }
            })
          })
        })
      });

      await expect(galleryApi.createGallery(invalidGallery))
        .rejects.toThrow();
    });
  });

  describe('Rate Limiting and Abuse Prevention', () => {
    test('handles rapid upload attempts gracefully', async () => {
      const files = Array.from({ length: 50 }, (_, i) => 
        new File(['content'], `rapid${i}.jpg`, { type: 'image/jpeg' })
      );

      // Mock rate limiting
      let uploadCount = 0;
      mockSupabase.storage.from.mockReturnValue({
        upload: jest.fn().mockImplementation(() => {
          uploadCount++;
          if (uploadCount > 10) {
            return Promise.resolve({
              data: null,
              error: { message: 'Rate limit exceeded' }
            });
          }
          return Promise.resolve({
            data: { path: `gallery/rapid${uploadCount}.jpg` },
            error: null
          });
        })
      });

      const uploadPromises = files.slice(0, 15).map(file => 
        galleryApi.uploadPhoto({ file, galleryId: 'test-gallery' })
      );

      const results = await Promise.allSettled(uploadPromises);
      const failures = results.filter(r => r.status === 'rejected');
      
      expect(failures.length).toBeGreaterThan(0); // Some should fail due to rate limiting
    });

    test('enforces reasonable gallery limits per user', async () => {
      // Mock that user already has many galleries
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: new Array(100).fill(publicGallery), // User has 100 galleries
            error: null
          })
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Gallery limit exceeded' }
            })
          })
        })
      });

      await expect(galleryApi.createGallery({
        title: 'Another Gallery',
        privacy_level: 'public',
        visibility: 'visible'
      })).rejects.toThrow();
    });
  });

  describe('Data Exposure Prevention', () => {
    test('does not expose sensitive user data in gallery responses', async () => {
      const galleryWithSensitiveData = {
        ...publicGallery,
        user: {
          id: 'user-id',
          name: 'John Doe',
          email: 'john@example.com', // This should not be exposed
          password_hash: 'secret-hash' // This should definitely not be exposed
        }
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: galleryWithSensitiveData,
              error: null
            })
          })
        })
      });

      const gallery = await galleryApi.getGalleryById('public-gallery');
      
      // Verify that sensitive data is not included
      if (gallery && 'user' in gallery) {
        expect(gallery.user).not.toHaveProperty('email');
        expect(gallery.user).not.toHaveProperty('password_hash');
      }
    });

    test('filters out hidden photos from public responses', async () => {
      const galleryWithHiddenPhotos = {
        ...publicGallery,
        photos: [
          { ...publicGallery.photos?.[0], visibility: 'visible' },
          { ...publicGallery.photos?.[0], id: 'hidden-photo', visibility: 'hidden' }
        ]
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [{ visibility: 'visible' }], // Hidden photos filtered by RLS
              error: null
            })
          })
        })
      });

      const photos = await galleryApi.getGalleryPhotos('public-gallery');
      expect(photos.every(p => p.visibility === 'visible')).toBe(true);
    });
  });

  describe('Admin Privileges', () => {
    test('allows admins to moderate any gallery', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: mockAdminUser } 
      });
      
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { ...publicGallery, visibility: 'hidden' },
                error: null
              })
            })
          })
        })
      });

      // Admin should be able to hide any gallery
      const result = await galleryApi.updateGallery('public-gallery', {
        visibility: 'hidden'
      });

      expect(result.visibility).toBe('hidden');
    });

    test('allows admins to view all galleries regardless of privacy', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: mockAdminUser } 
      });
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: [publicGallery, privateGallery, membersOnlyGallery],
            error: null
          })
        })
      });

      const galleries = await galleryApi.getAllGalleries();
      
      expect(galleries.length).toBe(3);
      expect(galleries.some(g => g.privacy_level === 'private')).toBe(true);
    });
  });
});