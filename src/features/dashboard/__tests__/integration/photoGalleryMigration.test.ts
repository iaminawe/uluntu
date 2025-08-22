/**
 * Photo Gallery Migration Integration Tests
 * Tests migration of photo gallery functionality to dashboard
 */

import { describe, test, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { galleryMigrationService } from '../../services/galleryMigrationService';
import { userDashboardApi } from '../../api/userDashboardApi';
import { supabase } from '@/lib/supabase';

// Mock dependencies
jest.mock('../../api/userDashboardApi');
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    storage: {
      from: jest.fn(),
      move: jest.fn(),
      copy: jest.fn()
    },
    rpc: jest.fn()
  }
}));

const mockApi = userDashboardApi as jest.Mocked<typeof userDashboardApi>;
const mockSupabase = supabase as jest.Mocked<typeof supabase>;

const mockLegacyPhotos = [
  {
    id: 'photo-1',
    title: 'Sunset Beach',
    description: 'Beautiful sunset at the beach',
    url: '/legacy-gallery/sunset.jpg',
    thumbnail: '/legacy-gallery/thumbs/sunset.jpg',
    user_id: 'user-123',
    created_at: '2024-01-15T10:00:00Z',
    tags: ['sunset', 'beach'],
    album_id: 'album-1',
    views: 45,
    likes: 12,
    metadata: {
      camera: 'Canon EOS R5',
      settings: {
        aperture: 'f/8',
        shutter: '1/125',
        iso: 100
      },
      location: {
        lat: 49.2827,
        lng: -123.1207,
        name: 'Vancouver, BC'
      }
    }
  },
  {
    id: 'photo-2',
    title: 'Mountain View',
    description: 'View from the summit',
    url: '/legacy-gallery/mountain.jpg',
    thumbnail: '/legacy-gallery/thumbs/mountain.jpg',
    user_id: 'user-123',
    created_at: '2024-01-10T14:30:00Z',
    tags: ['mountain', 'hiking'],
    album_id: 'album-1',
    views: 67,
    likes: 18
  }
];

const mockLegacyAlbums = [
  {
    id: 'album-1',
    title: 'Nature Photography',
    description: 'My favorite nature shots',
    user_id: 'user-123',
    created_at: '2024-01-01T00:00:00Z',
    privacy: 'public',
    cover_photo_id: 'photo-1'
  }
];

const mockMigratedPhotos = [
  {
    id: 'photo-1',
    title: 'Sunset Beach',
    description: 'Beautiful sunset at the beach',
    url: '/dashboard-gallery/sunset.jpg',
    thumbnail: '/dashboard-gallery/thumbs/sunset.jpg',
    user_id: 'user-123',
    created_at: '2024-01-15T10:00:00Z',
    migrated_from: '/legacy-gallery/sunset.jpg',
    migrated_at: new Date().toISOString(),
    legacy_id: 'photo-1',
    collection_id: 'collection-1'
  }
];

describe('Photo Gallery Migration Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    } as any);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Legacy Gallery Detection', () => {
    test('identifies users with legacy gallery content', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'legacy_photos') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({
              data: mockLegacyPhotos,
              error: null
            })
          } as any;
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({ data: [], error: null })
        } as any;
      });

      const hasLegacyContent = await galleryMigrationService.checkLegacyContent('user-123');

      expect(hasLegacyContent).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('legacy_photos');
    });

    test('returns false when no legacy content exists', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      } as any));

      const hasLegacyContent = await galleryMigrationService.checkLegacyContent('user-123');

      expect(hasLegacyContent).toBe(false);
    });

    test('handles database errors during legacy content check', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        })
      } as any));

      await expect(galleryMigrationService.checkLegacyContent('user-123'))
        .rejects.toThrow('Failed to check legacy content');
    });
  });

  describe('Migration Process', () => {
    test('migrates photos from legacy gallery to dashboard', async () => {
      // Mock legacy photos fetch
      mockSupabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: mockLegacyPhotos,
          error: null
        })
      } as any));

      // Mock albums fetch
      mockSupabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: mockLegacyAlbums,
          error: null
        })
      } as any));

      // Mock successful migration insert
      mockSupabase.from.mockImplementationOnce(() => ({
        insert: jest.fn().mockResolvedValue({
          data: mockMigratedPhotos,
          error: null
        })
      } as any));

      // Mock storage operations
      mockSupabase.storage.from.mockReturnValue({
        copy: jest.fn().mockResolvedValue({ data: true, error: null }),
        remove: jest.fn().mockResolvedValue({ data: true, error: null })
      } as any);

      const result = await galleryMigrationService.migrateUserGallery('user-123');

      expect(result.success).toBe(true);
      expect(result.migratedPhotos).toBe(2);
      expect(result.migratedAlbums).toBe(1);
      expect(result.errors).toHaveLength(0);
    });

    test('handles photo metadata migration', async () => {
      mockSupabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [mockLegacyPhotos[0]], // Photo with metadata
          error: null
        })
      } as any));

      mockSupabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      } as any));

      mockSupabase.from.mockImplementationOnce(() => ({
        insert: jest.fn().mockImplementation((data) => {
          expect(data[0]).toMatchObject({
            title: 'Sunset Beach',
            metadata: expect.objectContaining({
              camera: 'Canon EOS R5',
              location: expect.objectContaining({
                name: 'Vancouver, BC'
              })
            })
          });
          return Promise.resolve({ data: [data[0]], error: null });
        })
      } as any));

      const result = await galleryMigrationService.migrateUserGallery('user-123');

      expect(result.success).toBe(true);
    });

    test('preserves photo relationships and collections', async () => {
      mockSupabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: mockLegacyPhotos,
          error: null
        })
      } as any));

      mockSupabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: mockLegacyAlbums,
          error: null
        })
      } as any));

      // Mock collection creation
      mockSupabase.from.mockImplementationOnce(() => ({
        insert: jest.fn().mockResolvedValue({
          data: [{ id: 'collection-1', title: 'Nature Photography' }],
          error: null
        })
      } as any));

      // Mock photo insertion with collection reference
      mockSupabase.from.mockImplementationOnce(() => ({
        insert: jest.fn().mockImplementation((photos) => {
          photos.forEach((photo: any) => {
            expect(photo).toHaveProperty('collection_id', 'collection-1');
          });
          return Promise.resolve({ data: photos, error: null });
        })
      } as any));

      const result = await galleryMigrationService.migrateUserGallery('user-123');

      expect(result.success).toBe(true);
      expect(result.migratedAlbums).toBe(1);
    });

    test('handles partial migration failures gracefully', async () => {
      mockSupabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: mockLegacyPhotos,
          error: null
        })
      } as any));

      mockSupabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      } as any));

      // Mock storage failure for one photo
      mockSupabase.storage.from.mockReturnValue({
        copy: jest.fn()
          .mockResolvedValueOnce({ data: true, error: null })
          .mockResolvedValueOnce({ data: null, error: { message: 'Storage error' } })
      } as any);

      const result = await galleryMigrationService.migrateUserGallery('user-123');

      expect(result.success).toBe(true); // Partial success
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Storage error');
    });
  });

  describe('Storage Migration', () => {
    test('copies files from legacy storage to new location', async () => {
      const mockCopy = jest.fn().mockResolvedValue({ data: true, error: null });
      
      mockSupabase.storage.from.mockReturnValue({
        copy: mockCopy
      } as any);

      await galleryMigrationService.migratePhotoStorage(
        '/legacy-gallery/sunset.jpg',
        '/dashboard-gallery/user-123/sunset.jpg'
      );

      expect(mockCopy).toHaveBeenCalledWith(
        '/legacy-gallery/sunset.jpg',
        '/dashboard-gallery/user-123/sunset.jpg'
      );
    });

    test('generates thumbnails for migrated photos', async () => {
      const mockGenerateThumbnail = jest.fn().mockResolvedValue('/dashboard-gallery/thumbs/sunset.jpg');
      jest.doMock('../../services/thumbnailService', () => ({
        generateThumbnail: mockGenerateThumbnail
      }));

      const result = await galleryMigrationService.migratePhotoWithThumbnail({
        ...mockLegacyPhotos[0],
        url: '/dashboard-gallery/user-123/sunset.jpg'
      });

      expect(mockGenerateThumbnail).toHaveBeenCalled();
      expect(result.thumbnail).toBe('/dashboard-gallery/thumbs/sunset.jpg');
    });

    test('handles storage errors during migration', async () => {
      mockSupabase.storage.from.mockReturnValue({
        copy: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Storage quota exceeded' }
        })
      } as any);

      await expect(galleryMigrationService.migratePhotoStorage(
        '/legacy-gallery/sunset.jpg',
        '/dashboard-gallery/user-123/sunset.jpg'
      )).rejects.toThrow('Storage quota exceeded');
    });

    test('organizes migrated files in user-specific directories', async () => {
      const mockCopy = jest.fn().mockResolvedValue({ data: true, error: null });
      
      mockSupabase.storage.from.mockReturnValue({
        copy: mockCopy
      } as any);

      await galleryMigrationService.migratePhotoStorage(
        '/legacy-gallery/photo.jpg',
        '/dashboard-gallery/user-123/photo.jpg'
      );

      expect(mockCopy).toHaveBeenCalledWith(
        '/legacy-gallery/photo.jpg',
        '/dashboard-gallery/user-123/photo.jpg'
      );
    });
  });

  describe('Data Integrity', () => {
    test('validates migrated data integrity', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'legacy_photos') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({
              data: mockLegacyPhotos,
              error: null
            })
          } as any;
        } else if (table === 'dashboard_photos') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({
              data: mockMigratedPhotos,
              error: null
            })
          } as any;
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({ data: [], error: null })
        } as any;
      });

      const isValid = await galleryMigrationService.validateMigration('user-123');

      expect(isValid).toBe(true);
    });

    test('detects missing photos after migration', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'legacy_photos') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({
              data: mockLegacyPhotos, // 2 photos
              error: null
            })
          } as any;
        } else if (table === 'dashboard_photos') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({
              data: [mockMigratedPhotos[0]], // Only 1 photo migrated
              error: null
            })
          } as any;
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({ data: [], error: null })
        } as any;
      });

      const isValid = await galleryMigrationService.validateMigration('user-123');

      expect(isValid).toBe(false);
    });

    test('verifies file integrity after storage migration', async () => {
      const mockExists = jest.fn().mockResolvedValue({ data: true, error: null });
      
      mockSupabase.storage.from.mockReturnValue({
        list: mockExists
      } as any);

      const exists = await galleryMigrationService.verifyStorageIntegrity(
        '/dashboard-gallery/user-123/sunset.jpg'
      );

      expect(exists).toBe(true);
    });
  });

  describe('Rollback and Recovery', () => {
    test('rolls back migration on critical errors', async () => {
      const mockDelete = jest.fn().mockResolvedValue({ data: null, error: null });
      const mockRemove = jest.fn().mockResolvedValue({ data: null, error: null });
      
      mockSupabase.from.mockImplementation(() => ({
        delete: mockDelete,
        eq: jest.fn().mockReturnThis()
      } as any));
      
      mockSupabase.storage.from.mockReturnValue({
        remove: mockRemove
      } as any);

      await galleryMigrationService.rollbackMigration('user-123', 'migration-session-123');

      expect(mockDelete).toHaveBeenCalled();
      expect(mockRemove).toHaveBeenCalled();
    });

    test('creates recovery points during migration', async () => {
      const mockInsert = jest.fn().mockResolvedValue({ data: [{}], error: null });
      
      mockSupabase.from.mockImplementation(() => ({
        insert: mockInsert
      } as any));

      await galleryMigrationService.createRecoveryPoint('user-123', {
        step: 'photo-migration',
        processed: 5,
        total: 10,
        timestamp: new Date().toISOString()
      });

      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'user-123',
        migration_data: expect.objectContaining({
          step: 'photo-migration',
          processed: 5
        })
      });
    });

    test('resumes migration from recovery point', async () => {
      const recoveryPoint = {
        user_id: 'user-123',
        migration_data: {
          step: 'photo-migration',
          processed: 5,
          total: 10,
          completed_ids: ['photo-1', 'photo-2', 'photo-3', 'photo-4', 'photo-5']
        }
      };
      
      mockSupabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [recoveryPoint],
          error: null
        })
      } as any));

      const remainingPhotos = await galleryMigrationService.resumeMigration('user-123');

      expect(remainingPhotos).toHaveLength(5); // Remaining photos
    });
  });

  describe('Migration Performance', () => {
    test('processes photos in batches to prevent timeouts', async () => {
      const largePhotoSet = Array(50).fill(null).map((_, i) => ({
        ...mockLegacyPhotos[0],
        id: `photo-${i}`,
        title: `Photo ${i}`
      }));

      mockSupabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: largePhotoSet,
          error: null
        })
      } as any));

      const batchProcessor = jest.spyOn(galleryMigrationService, 'processBatch');
      
      await galleryMigrationService.migrateUserGallery('user-123', { batchSize: 10 });

      expect(batchProcessor).toHaveBeenCalledTimes(5); // 50 photos / 10 per batch
    });

    test('tracks migration progress', async () => {
      const progressCallback = jest.fn();
      
      mockSupabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: mockLegacyPhotos,
          error: null
        })
      } as any));

      await galleryMigrationService.migrateUserGallery('user-123', {
        onProgress: progressCallback
      });

      expect(progressCallback).toHaveBeenCalledWith({
        step: 'photos',
        processed: 2,
        total: 2,
        percentage: 100
      });
    });

    test('handles concurrent migrations safely', async () => {
      const lockService = jest.fn();
      jest.doMock('../../services/migrationLockService', () => ({
        acquireLock: lockService.mockResolvedValue(true),
        releaseLock: lockService.mockResolvedValue(true)
      }));

      await galleryMigrationService.migrateUserGallery('user-123');

      expect(lockService).toHaveBeenCalledWith('user-123', 'gallery-migration');
    });
  });

  describe('Legacy Data Cleanup', () => {
    test('archives legacy data after successful migration', async () => {
      const mockUpdate = jest.fn().mockResolvedValue({ data: [], error: null });
      
      mockSupabase.from.mockImplementation(() => ({
        update: mockUpdate,
        eq: jest.fn().mockReturnThis()
      } as any));

      await galleryMigrationService.archiveLegacyData('user-123');

      expect(mockUpdate).toHaveBeenCalledWith({
        status: 'archived',
        archived_at: expect.any(String)
      });
    });

    test('preserves legacy data during migration period', async () => {
      const gracePeriod = 30; // days
      const recentMigration = new Date();
      recentMigration.setDate(recentMigration.getDate() - 15); // 15 days ago

      const shouldPreserve = await galleryMigrationService.shouldPreserveLegacyData(
        'user-123',
        recentMigration.toISOString(),
        gracePeriod
      );

      expect(shouldPreserve).toBe(true);
    });

    test('cleans up legacy data after grace period', async () => {
      const gracePeriod = 30; // days
      const oldMigration = new Date();
      oldMigration.setDate(oldMigration.getDate() - 45); // 45 days ago

      const shouldPreserve = await galleryMigrationService.shouldPreserveLegacyData(
        'user-123',
        oldMigration.toISOString(),
        gracePeriod
      );

      expect(shouldPreserve).toBe(false);
    });
  });

  describe('Migration Analytics', () => {
    test('tracks migration success rates', async () => {
      const mockInsert = jest.fn().mockResolvedValue({ data: [{}], error: null });
      
      mockSupabase.from.mockImplementation(() => ({
        insert: mockInsert
      } as any));

      await galleryMigrationService.recordMigrationMetrics('user-123', {
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        photosProcessed: 15,
        photosSuccessful: 14,
        errors: 1,
        avgProcessingTime: 2.5
      });

      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'user-123',
        metrics: expect.objectContaining({
          successRate: expect.closeTo(93.33, 1),
          photosProcessed: 15
        })
      });
    });

    test('identifies common migration issues', async () => {
      const migrationErrors = [
        { type: 'storage_quota', message: 'Storage quota exceeded' },
        { type: 'file_corruption', message: 'File corrupted during transfer' },
        { type: 'storage_quota', message: 'Storage quota exceeded' }
      ];

      const analysis = galleryMigrationService.analyzeMigrationErrors(migrationErrors);

      expect(analysis.mostCommon).toBe('storage_quota');
      expect(analysis.recommendations).toContain('Consider upgrading storage plan');
    });
  });
});