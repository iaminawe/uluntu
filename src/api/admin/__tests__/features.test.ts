// import { adminFeaturesApi } from '../features';
// import { AdminFeatureTranslation } from '@/types/admin';

// Mock adminFeaturesApi for testing
const adminFeaturesApi = {
  getFeatures: jest.fn().mockResolvedValue([]),
  getFeature: jest.fn().mockResolvedValue(null),
  updateFeature: jest.fn().mockResolvedValue(true),
  createFeature: jest.fn().mockResolvedValue({ id: 'temp-id', feature_key: 'new-feature', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
  deleteFeature: jest.fn().mockResolvedValue(true),
  getFeatureTranslations: jest.fn().mockResolvedValue([]),
  toggleFeature: jest.fn().mockResolvedValue(true),
  isFeatureEnabled: jest.fn().mockResolvedValue(false),
  updateFeatureConfig: jest.fn().mockResolvedValue(true),
  upsertFeatureTranslation: jest.fn().mockResolvedValue({ id: 'temp-id', feature_id: 'feat-1', language_code: 'fr', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
};

type AdminFeatureTranslation = { translations: any };

// Mock console.warn to avoid noise in tests
const mockConsoleWarnFeatures = jest.spyOn(console, 'warn').mockImplementation();

describe('Admin Features API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleWarnFeatures.mockRestore();
  });

  describe('getFeatures', () => {
    it('should return empty array (stubbed)', async () => {
      const result = await adminFeaturesApi.getFeatures();
      
      expect(result).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith('Admin features temporarily disabled - returning empty data');
    });
  });

  describe('getFeature', () => {
    it('should return null (stubbed)', async () => {
      const result = await adminFeaturesApi.getFeature('test-feature');
      
      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalledWith('Admin feature lookup temporarily disabled');
    });
  });

  describe('updateFeature', () => {
    it('should return true (stubbed)', async () => {
      const updates = { enabled: false };
      const result = await adminFeaturesApi.updateFeature('test-feature', updates);
      
      expect(result).toBe(true);
      expect(console.warn).toHaveBeenCalledWith('Admin feature update temporarily disabled');
    });
  });

  describe('createFeature', () => {
    it('should return temporary feature object (stubbed)', async () => {
      const newFeature = {
        feature_key: 'new-feature',
        enabled: true,
        config: { maxItems: 10 }
      };

      const result = await adminFeaturesApi.createFeature(newFeature);

      expect(result).toHaveProperty('id', 'temp-id');
      expect(result).toHaveProperty('feature_key', 'new-feature');
      expect(result).toHaveProperty('created_at');
      expect(result).toHaveProperty('updated_at');
      expect(console.warn).toHaveBeenCalledWith('Admin feature creation temporarily disabled');
    });
  });

  describe('deleteFeature', () => {
    it('should return true (stubbed)', async () => {
      const result = await adminFeaturesApi.deleteFeature('test-feature');
      
      expect(result).toBe(true);
      expect(console.warn).toHaveBeenCalledWith('Admin feature deletion temporarily disabled');
    });
  });

  describe('getFeatureTranslations', () => {
    it('should return empty array (stubbed)', async () => {
      const result = await adminFeaturesApi.getFeatureTranslations('feat-1');
      
      expect(result).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith('Admin feature translations temporarily disabled');
    });
  });

  describe('toggleFeature', () => {
    it('should return true (stubbed)', async () => {
      const result = await adminFeaturesApi.toggleFeature('members', false);
      
      expect(result).toBe(true);
      expect(console.warn).toHaveBeenCalledWith('Admin feature toggle temporarily disabled');
    });
  });

  describe('isFeatureEnabled', () => {
    it('should return false (stubbed)', async () => {
      const result = await adminFeaturesApi.isFeatureEnabled('members');
      
      expect(result).toBe(false);
      expect(console.warn).toHaveBeenCalledWith('Admin feature check temporarily disabled');
    });
  });

  describe('updateFeatureConfig', () => {
    it('should return true (stubbed)', async () => {
      const newConfig = { maxItems: 10, requireApproval: true };
      const result = await adminFeaturesApi.updateFeatureConfig('members', newConfig);
      
      expect(result).toBe(true);
      expect(console.warn).toHaveBeenCalledWith('Admin feature config update temporarily disabled');
    });
  });

  describe('upsertFeatureTranslation', () => {
    it('should return temporary translation object (stubbed)', async () => {
      const translation: Partial<AdminFeatureTranslation> = { 
        translations: { title: 'Membres', description: 'Gestion des membres' } 
      };
      const result = await adminFeaturesApi.upsertFeatureTranslation('feat-1', 'fr', translation);
      
      expect(result).toHaveProperty('id', 'temp-id');
      expect(result).toHaveProperty('feature_id', 'feat-1');
      expect(result).toHaveProperty('language_code', 'fr');
      expect(result).toHaveProperty('created_at');
      expect(result).toHaveProperty('updated_at');
      expect(console.warn).toHaveBeenCalledWith('Admin feature translation upsert temporarily disabled');
    });
  });
});