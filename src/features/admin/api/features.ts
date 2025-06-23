/* eslint-disable @typescript-eslint/no-unused-vars */
import { AdminFeature, AdminFeatureTranslation } from '@/types/admin';

export const adminFeaturesApi = {
  // Get all features - temporarily return empty data until DB is set up
  async getFeatures() {
    console.warn('Admin features temporarily disabled - returning empty data');
    return [] as AdminFeature[];
  },

  // Get single feature - temporarily stub
  async getFeature(_featureKey: string) {
    console.warn('Admin feature lookup temporarily disabled');
    return null;
  },

  // Update feature - temporarily stub
  async updateFeature(_featureKey: string, _updates: Partial<AdminFeature>) {
    console.warn('Admin feature update temporarily disabled');
    return true;
  },

  // Create feature - temporarily stub
  async createFeature(feature: Omit<AdminFeature, 'id' | 'created_at' | 'updated_at'>) {
    console.warn('Admin feature creation temporarily disabled');
    return { id: 'temp-id', ...feature, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as AdminFeature;
  },

  // Delete feature - temporarily stub
  async deleteFeature(_featureKey: string) {
    console.warn('Admin feature deletion temporarily disabled');
    return true;
  },

  // Get feature translations - temporarily stub
  async getFeatureTranslations(_featureId: string) {
    console.warn('Admin feature translations temporarily disabled');
    return [] as AdminFeatureTranslation[];
  },

  // Toggle feature - temporarily stub
  async toggleFeature(_featureKey: string, _enabled: boolean) {
    console.warn('Admin feature toggle temporarily disabled');
    return true;
  },

  // Check if feature is enabled - temporarily stub
  async isFeatureEnabled(_featureKey: string) {
    console.warn('Admin feature check temporarily disabled');
    return false;
  },

  // Update feature config - temporarily stub
  async updateFeatureConfig(_featureKey: string, _config: Record<string, unknown>) {
    console.warn('Admin feature config update temporarily disabled');
    return true;
  },

  // Upsert feature translation - temporarily stub
  async upsertFeatureTranslation(featureId: string, languageCode: string, translation: Partial<AdminFeatureTranslation>) {
    console.warn('Admin feature translation upsert temporarily disabled');
    return { 
      id: 'temp-id', 
      feature_id: featureId, 
      language_code: languageCode, 
      ...translation,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as AdminFeatureTranslation;
  }
};