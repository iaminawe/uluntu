import { adminFeaturesApi } from '../features';
import { supabase } from '@/lib/supabase';

// Mock supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn()
  }
}));

describe('Admin Features API', () => {
  const mockFrom = supabase.from as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getFeatures', () => {
    it('should fetch all features ordered by feature_key', async () => {
      const mockFeatures = [
        { id: '1', feature_key: 'members', enabled: true, config: {} },
        { id: '2', feature_key: 'events', enabled: false, config: {} }
      ];

      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockFeatures,
            error: null
          })
        })
      });

      const result = await adminFeaturesApi.getFeatures();

      expect(mockFrom).toHaveBeenCalledWith('admin_features');
      expect(result).toEqual(mockFeatures);
    });

    it('should throw error when fetch fails', async () => {
      const mockError = new Error('Database error');

      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: null,
            error: mockError
          })
        })
      });

      await expect(adminFeaturesApi.getFeatures()).rejects.toThrow('Database error');
    });
  });

  describe('toggleFeature', () => {
    it('should toggle feature enabled status', async () => {
      const mockUpdatedFeature = { 
        id: '1', 
        feature_key: 'members', 
        enabled: false, 
        config: {} 
      };

      mockFrom.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockUpdatedFeature,
                error: null
              })
            })
          })
        })
      });

      const result = await adminFeaturesApi.toggleFeature('members', false);

      expect(mockFrom).toHaveBeenCalledWith('admin_features');
      expect(result).toEqual(mockUpdatedFeature);
    });
  });

  describe('isFeatureEnabled', () => {
    it('should return true for enabled features', async () => {
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { feature_key: 'members', enabled: true },
              error: null
            })
          })
        })
      });

      const result = await adminFeaturesApi.isFeatureEnabled('members');
      expect(result).toBe(true);
    });

    it('should return false for disabled features', async () => {
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { feature_key: 'events', enabled: false },
              error: null
            })
          })
        })
      });

      const result = await adminFeaturesApi.isFeatureEnabled('events');
      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockRejectedValue(new Error('Database error'))
          })
        })
      });

      const result = await adminFeaturesApi.isFeatureEnabled('members');
      expect(result).toBe(false);
    });
  });

  describe('updateFeatureConfig', () => {
    it('should update feature configuration', async () => {
      const newConfig = { maxItems: 10, requireApproval: true };
      const mockUpdatedFeature = {
        id: '1',
        feature_key: 'members',
        enabled: true,
        config: newConfig
      };

      mockFrom.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockUpdatedFeature,
                error: null
              })
            })
          })
        })
      });

      const result = await adminFeaturesApi.updateFeatureConfig('members', newConfig);

      expect(result.config).toEqual(newConfig);
    });
  });

  describe('Feature Translations', () => {
    describe('getFeatureTranslations', () => {
      it('should fetch translations for a feature', async () => {
        const mockTranslations = [
          { id: '1', feature_id: 'feat-1', language_code: 'en', translations: { title: 'Members' } },
          { id: '2', feature_id: 'feat-1', language_code: 'es', translations: { title: 'Miembros' } }
        ];

        mockFrom.mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: mockTranslations,
                error: null
              })
            })
          })
        });

        const result = await adminFeaturesApi.getFeatureTranslations('feat-1');

        expect(result).toEqual(mockTranslations);
        expect(result).toHaveLength(2);
      });
    });

    describe('upsertFeatureTranslation', () => {
      it('should create or update translations', async () => {
        const translations = { title: 'Membres', description: 'Gestion des membres' };
        const mockTranslation = {
          id: '1',
          feature_id: 'feat-1',
          language_code: 'fr',
          translations
        };

        mockFrom.mockReturnValue({
          upsert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockTranslation,
                error: null
              })
            })
          })
        });

        const result = await adminFeaturesApi.upsertFeatureTranslation('feat-1', 'fr', translations);

        expect(result).toEqual(mockTranslation);
        expect(mockFrom).toHaveBeenCalledWith('admin_feature_translations');
      });
    });
  });
});