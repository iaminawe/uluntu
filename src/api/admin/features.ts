import { supabase } from '@/lib/supabase';
import { AdminFeature, AdminFeatureTranslation } from '@/types/admin';

export const adminFeaturesApi = {
  // Get all features
  async getFeatures() {
    const { data, error } = await supabase
      .from('admin_features')
      .select('*')
      .order('feature_key');

    if (error) throw error;
    return data as AdminFeature[];
  },

  // Get single feature
  async getFeature(featureKey: string) {
    const { data, error } = await supabase
      .from('admin_features')
      .select('*')
      .eq('feature_key', featureKey)
      .single();

    if (error) throw error;
    return data as AdminFeature;
  },

  // Update feature
  async updateFeature(featureKey: string, updates: Partial<AdminFeature>) {
    const { data, error } = await supabase
      .from('admin_features')
      .update(updates)
      .eq('feature_key', featureKey)
      .select()
      .single();

    if (error) throw error;
    return data as AdminFeature;
  },

  // Toggle feature
  async toggleFeature(featureKey: string, enabled: boolean) {
    return this.updateFeature(featureKey, { enabled });
  },

  // Update feature config
  async updateFeatureConfig(featureKey: string, config: Record<string, any>) {
    return this.updateFeature(featureKey, { config });
  },

  // Get feature translations
  async getFeatureTranslations(featureId: string) {
    const { data, error } = await supabase
      .from('admin_feature_translations')
      .select('*')
      .eq('feature_id', featureId)
      .order('language_code');

    if (error) throw error;
    return data as AdminFeatureTranslation[];
  },

  // Get translations for a specific language
  async getFeatureTranslation(featureId: string, languageCode: string) {
    const { data, error } = await supabase
      .from('admin_feature_translations')
      .select('*')
      .eq('feature_id', featureId)
      .eq('language_code', languageCode)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignore not found
    return data as AdminFeatureTranslation | null;
  },

  // Create or update translations
  async upsertFeatureTranslation(
    featureId: string,
    languageCode: string,
    translations: Record<string, any>
  ) {
    const { data, error } = await supabase
      .from('admin_feature_translations')
      .upsert({
        feature_id: featureId,
        language_code: languageCode,
        translations
      })
      .select()
      .single();

    if (error) throw error;
    return data as AdminFeatureTranslation;
  },

  // Delete translations
  async deleteFeatureTranslation(featureId: string, languageCode: string) {
    const { error } = await supabase
      .from('admin_feature_translations')
      .delete()
      .eq('feature_id', featureId)
      .eq('language_code', languageCode);

    if (error) throw error;
  },

  // Check if feature is enabled
  async isFeatureEnabled(featureKey: string): Promise<boolean> {
    try {
      const feature = await this.getFeature(featureKey);
      return feature?.enabled || false;
    } catch {
      return false; // Default to disabled if error
    }
  }
};