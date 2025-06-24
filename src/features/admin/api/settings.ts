import { supabase } from '@/lib/supabase';
import type {
  ApplicationSetting,
  FeatureToggle,
  SettingsHistory,
  UpdateSettingRequest,
  UpdateFeatureToggleRequest,
  SettingsResponse,
  PublicSettings,
  SettingsExport,
  SettingsImport,
} from '@/types/settings';

/**
 * Settings API for managing application settings and feature toggles
 */
export class SettingsAPI {
  // Public settings methods (accessible to all users)
  
  /**
   * Get all public settings grouped by category
   */
  async getPublicSettings(): Promise<PublicSettings> {
    try {
      const { data, error } = await supabase.rpc('get_public_settings');
      
      if (error) throw error;
      
      // Group settings by category
      const grouped: PublicSettings = {};
      
      data?.forEach((setting: any) => {
        if (!grouped[setting.category]) {
          grouped[setting.category] = {};
        }
        
        // Handle both old and new function signatures
        const key = setting.setting_key || setting.key;
        const value = setting.setting_value || setting.value;
        const type = setting.data_type || 'string';
        
        grouped[setting.category][key] = {
          value: value,
          type: type,
        };
      });
      
      return grouped;
    } catch (error) {
      console.error('Error fetching public settings:', error);
      // Return empty object instead of throwing to prevent app crash
      return {};
    }
  }

  /**
   * Check if a feature is enabled for the current user
   */
  async isFeatureEnabled(featureKey: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('is_feature_enabled', {
        feature_key_param: featureKey,
      });
      
      if (error) {
        console.warn(`Feature toggle function not available for ${featureKey}:`, error);
        // Fallback: check feature_toggles table directly
        return this.checkFeatureToggleDirect(featureKey);
      }
      
      return data || false;
    } catch (error) {
      console.error('Error checking feature toggle:', error);
      // Fallback: check feature_toggles table directly
      return this.checkFeatureToggleDirect(featureKey);
    }
  }

  /**
   * Fallback method to check feature toggle directly from table
   */
  private async checkFeatureToggleDirect(featureKey: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('feature_toggles')
        .select('enabled')
        .eq('feature_key', featureKey)
        .single();
      
      if (error || !data) {
        return false;
      }
      
      return data.enabled || false;
    } catch (error) {
      console.warn(`Could not check feature ${featureKey} directly:`, error);
      return false;
    }
  }

  /**
   * Get all enabled features for the current user
   */
  async getEnabledFeatures(): Promise<Record<string, boolean>> {
    try {
      const { data, error } = await supabase
        .from('feature_toggles')
        .select('feature_key, enabled, enabled_for_users, enabled_for_roles');
      
      if (error) throw error;
      
      const features: Record<string, boolean> = {};
      
      // Use direct evaluation instead of calling isFeatureEnabled to avoid loops
      for (const feature of data || []) {
        // Simple enabled check - can be enhanced with user/role logic later
        features[feature.feature_key] = feature.enabled || false;
      }
      
      return features;
    } catch (error) {
      console.error('Error fetching enabled features:', error);
      throw error;
    }
  }

  // Admin settings methods (restricted to super admins)
  
  /**
   * Get all application settings (admin only)
   */
  async getAllSettings(): Promise<ApplicationSetting[]> {
    try {
      const { data, error } = await supabase
        .from('application_settings')
        .select('*')
        .order('category', { ascending: true })
        .order('setting_key', { ascending: true });
      
      if (error) {
        console.error('Error fetching all settings:', error);
        // Return empty array instead of throwing to prevent app crash
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching all settings:', error);
      // Return empty array instead of throwing to prevent app crash
      return [];
    }
  }

  /**
   * Get settings by category
   */
  async getSettingsByCategory(category: string): Promise<ApplicationSetting[]> {
    try {
      const { data, error } = await supabase
        .from('application_settings')
        .select('*')
        .eq('category', category)
        .order('setting_key', { ascending: true });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching settings by category:', error);
      throw error;
    }
  }

  /**
   * Create or update a setting
   */
  async upsertSetting(request: UpdateSettingRequest): Promise<SettingsResponse> {
    try {
      const { data, error } = await supabase
        .from('application_settings')
        .upsert({
          category: request.category,
          setting_key: request.setting_key,
          setting_value: request.setting_value,
          data_type: request.data_type,
          is_public: request.is_public ?? false,
          description: request.description,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'category,setting_key',
          ignoreDuplicates: false,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        success: true,
        data,
        message: 'Setting updated successfully',
      };
    } catch (error) {
      console.error('Error upserting setting:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete a setting
   */
  async deleteSetting(id: string): Promise<SettingsResponse> {
    try {
      const { error } = await supabase
        .from('application_settings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return {
        success: true,
        message: 'Setting deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting setting:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Feature toggle methods
  
  /**
   * Get all feature toggles (admin only)
   */
  async getAllFeatureToggles(): Promise<FeatureToggle[]> {
    try {
      const { data, error } = await supabase
        .from('feature_toggles')
        .select('*')
        .order('feature_key', { ascending: true });
      
      if (error) {
        console.error('Error fetching feature toggles:', error);
        // Return empty array instead of throwing to prevent app crash
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching feature toggles:', error);
      // Return empty array instead of throwing to prevent app crash
      return [];
    }
  }

  /**
   * Update a feature toggle
   */
  async updateFeatureToggle(request: UpdateFeatureToggleRequest): Promise<SettingsResponse> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };
      
      if (request.enabled !== undefined) updateData.enabled = request.enabled;
      if (request.config !== undefined) updateData.config = request.config;
      if (request.rollout_percentage !== undefined) updateData.rollout_percentage = request.rollout_percentage;
      if (request.enabled_for_users !== undefined) updateData.enabled_for_users = request.enabled_for_users;
      if (request.enabled_for_roles !== undefined) updateData.enabled_for_roles = request.enabled_for_roles;
      if (request.description !== undefined) updateData.description = request.description;
      
      const { data, error } = await supabase
        .from('feature_toggles')
        .update(updateData)
        .eq('feature_key', request.feature_key)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        success: true,
        data,
        message: 'Feature toggle updated successfully',
      };
    } catch (error) {
      console.error('Error updating feature toggle:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create a new feature toggle
   */
  async createFeatureToggle(request: Omit<UpdateFeatureToggleRequest, 'feature_key'> & { feature_key: string }): Promise<SettingsResponse> {
    try {
      const { data, error } = await supabase
        .from('feature_toggles')
        .insert({
          feature_key: request.feature_key,
          enabled: request.enabled ?? false,
          config: request.config ?? {},
          rollout_percentage: request.rollout_percentage ?? 0,
          enabled_for_users: request.enabled_for_users ?? [],
          enabled_for_roles: request.enabled_for_roles ?? [],
          description: request.description,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        success: true,
        data,
        message: 'Feature toggle created successfully',
      };
    } catch (error) {
      console.error('Error creating feature toggle:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete a feature toggle
   */
  async deleteFeatureToggle(id: string): Promise<SettingsResponse> {
    try {
      const { error } = await supabase
        .from('feature_toggles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return {
        success: true,
        message: 'Feature toggle deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting feature toggle:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Settings history methods
  
  /**
   * Get settings change history
   */
  async getSettingsHistory(category?: string, settingKey?: string): Promise<SettingsHistory[]> {
    try {
      let query = supabase
        .from('settings_history')
        .select('*')
        .order('changed_at', { ascending: false })
        .limit(100);
      
      if (category) {
        query = query.eq('category', category);
      }
      
      if (settingKey) {
        query = query.eq('setting_key', settingKey);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching settings history:', error);
      throw error;
    }
  }

  // Import/Export methods
  
  /**
   * Export all settings and feature toggles
   */
  async exportSettings(): Promise<SettingsExport> {
    try {
      const [settings, features] = await Promise.all([
        this.getAllSettings(),
        this.getAllFeatureToggles(),
      ]);
      
      const exportData: SettingsExport = {
        version: '1.0',
        exported_at: new Date().toISOString(),
        settings,
        feature_toggles: features,
        checksum: this.generateChecksum(settings, features),
      };
      
      return exportData;
    } catch (error) {
      console.error('Error exporting settings:', error);
      throw error;
    }
  }

  /**
   * Import settings from exported data
   */
  async importSettings(importData: SettingsImport): Promise<SettingsResponse> {
    try {
      // Validate import data
      if (!importData.settings || !importData.feature_toggles) {
        return {
          success: false,
          error: 'Invalid import data: missing settings or feature_toggles',
        };
      }

      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      // Import application settings
      for (const setting of importData.settings) {
        try {
          const result = await this.upsertSetting({
            category: setting.category as any,
            setting_key: setting.setting_key,
            setting_value: setting.setting_value,
            data_type: setting.data_type as any,
            is_public: setting.is_public ?? undefined,
            description: setting.description ?? undefined,
          });
          
          if (result.success) {
            successCount++;
          } else {
            errorCount++;
            errors.push(`Setting ${setting.category}.${setting.setting_key}: ${result.error}`);
          }
        } catch (error) {
          errorCount++;
          errors.push(`Setting ${setting.category}.${setting.setting_key}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Import feature toggles
      for (const feature of importData.feature_toggles) {
        try {
          const result = await this.updateFeatureToggle({
            feature_key: feature.feature_key,
            enabled: feature.enabled ?? undefined,
            config: feature.config ?? undefined,
            rollout_percentage: feature.rollout_percentage ?? undefined,
            enabled_for_users: feature.enabled_for_users ?? undefined,
            enabled_for_roles: feature.enabled_for_roles ?? undefined,
            description: feature.description ?? undefined,
          });
          
          if (result.success) {
            successCount++;
          } else {
            errorCount++;
            errors.push(`Feature ${feature.feature_key}: ${result.error}`);
          }
        } catch (error) {
          errorCount++;
          errors.push(`Feature ${feature.feature_key}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      if (errorCount === 0) {
        return {
          success: true,
          message: `Successfully imported ${successCount} items`,
        };
      } else if (successCount > 0) {
        return {
          success: true,
          message: `Partially successful: ${successCount} imported, ${errorCount} failed`,
          error: errors.join('; '),
        };
      } else {
        return {
          success: false,
          error: `Import failed: ${errors.join('; ')}`,
        };
      }
    } catch (error) {
      console.error('Error importing settings:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Utility methods
  
  /**
   * Generate checksum for export validation
   */
  private generateChecksum(settings: ApplicationSetting[], features: FeatureToggle[]): string {
    const content = JSON.stringify({ settings, features });
    // Simple checksum - in production you might want to use a proper hashing algorithm
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  /**
   * Validate setting value against its data type
   */
  validateSettingValue(value: any, dataType: string): boolean {
    switch (dataType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'array':
        return Array.isArray(value);
      default:
        return true;
    }
  }

  /**
   * Get setting value with proper type casting
   */
  castSettingValue(value: any, dataType: string): any {
    switch (dataType) {
      case 'string':
        return String(value);
      case 'number':
        return Number(value);
      case 'boolean':
        return Boolean(value);
      case 'object':
      case 'array':
        return typeof value === 'string' ? JSON.parse(value) : value;
      default:
        return value;
    }
  }
}

// Export singleton instance
export const settingsApi = new SettingsAPI();