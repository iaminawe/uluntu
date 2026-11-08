import React, { createContext, useContext, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
// Use optimized hooks that don't make API calls
import { useSettings, useEnabledFeatures } from '@/hooks/useSettingsOptimized';
import type { 
  SettingsContextValue, 
  FeatureKey, 
  PublicSettings,
  SettingDataType 
} from '@/types/settings';
import { settingsApi } from '@/features/admin/api/settings';
import { 
  SettingsCacheManager, 
  PersistentSettingsCache 
} from '@/utils/settingsCache';

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

/**
 * Default settings to use when no settings are loaded or as fallback
 */
const DEFAULT_SETTINGS: Partial<PublicSettings> = {
  site: {
    name: { value: 'Uluntu', type: 'string' as SettingDataType },
    tagline: { value: 'Growing Together', type: 'string' as SettingDataType },
    description: { value: 'A community platform for technology professionals', type: 'string' as SettingDataType },
  },
  appearance: {
    primary_color: { value: '#3B82F6', type: 'string' as SettingDataType },
    secondary_color: { value: '#1E40AF', type: 'string' as SettingDataType },
    font_family: { value: 'Inter', type: 'string' as SettingDataType },
  },
  limits: {
    max_upload_size: { value: 10485760, type: 'number' as SettingDataType }, // 10MB
    max_gallery_images: { value: 50, type: 'number' as SettingDataType },
    max_resource_size: { value: 52428800, type: 'number' as SettingDataType }, // 50MB
  },
};

/**
 * Settings Provider Component
 * Provides global access to site settings and feature toggles
 */
export function SettingsProvider({ children }: SettingsProviderProps) {
  const queryClient = useQueryClient();
  const { settings: rawSettings, loading: settingsLoading, error: settingsError, refetch: refetchSettings } = useSettings();
  const { features, isFeatureEnabled: checkFeature, loading: featuresLoading, error: featuresError, refetch: refetchFeatures } = useEnabledFeatures();

  // Initialize cache with persistent storage
  useEffect(() => {
    const persistentSettings = PersistentSettingsCache.loadFromStorage();
    if (persistentSettings && !rawSettings) {
      // Use persistent cache as fallback while loading
      SettingsCacheManager.cachePublicSettings(persistentSettings as PublicSettings);
    }
  }, []);

  // Cache settings when they load
  useEffect(() => {
    if (rawSettings && Object.keys(rawSettings).length > 0) {
      SettingsCacheManager.cachePublicSettings(rawSettings);
      PersistentSettingsCache.saveToStorage(rawSettings);
    }
  }, [rawSettings]);

  // Cache features when they load
  useEffect(() => {
    if (features && Object.keys(features).length > 0) {
      SettingsCacheManager.cacheEnabledFeatures(features);
    }
  }, [features]);

  // Merge default settings with loaded settings, using cache when available
  const settings = useMemo(() => {
    const merged: PublicSettings = {};
    
    // Start with defaults
    Object.entries(DEFAULT_SETTINGS).forEach(([category, categorySettings]) => {
      merged[category] = { ...categorySettings };
    });
    
    // Try to get from cache first if no raw settings yet
    let settingsToUse = rawSettings;
    if (!rawSettings || Object.keys(rawSettings).length === 0) {
      const cachedSettings = SettingsCacheManager.getCachedPublicSettings();
      if (cachedSettings) {
        settingsToUse = cachedSettings;
      }
    }
    
    // Override with loaded/cached settings
    if (settingsToUse) {
      Object.entries(settingsToUse).forEach(([category, categorySettings]) => {
        if (!merged[category]) {
          merged[category] = {};
        }
        Object.entries(categorySettings).forEach(([key, value]) => {
          merged[category][key] = value;
        });
      });
    }
    
    return merged;
  }, [rawSettings]);

  // Combined loading state
  const loading = settingsLoading || featuresLoading;
  const error = settingsError || featuresError;

  /**
   * Refresh all settings and features with cache invalidation
   */
  const refreshSettings = useCallback(async () => {
    // Invalidate cache before refetch
    SettingsCacheManager.invalidateAll();
    
    await Promise.all([
      refetchSettings(),
      refetchFeatures(),
    ]);
  }, [refetchSettings, refetchFeatures]);

  /**
   * Check if a feature is enabled with cache fallback
   */
  const isFeatureEnabled = useCallback((feature: FeatureKey): boolean => {
    // Check cache first for faster response
    const cachedResult = SettingsCacheManager.isFeatureCached(feature);
    if (cachedResult !== null) {
      return cachedResult;
    }
    
    // Fall back to real-time check
    return checkFeature(feature);
  }, [checkFeature]);

  /**
   * Get a specific setting value with type safety and caching
   */
  const getSetting = useCallback(<T = any>(
    category: string, 
    key: string, 
    defaultValue?: T
  ): T => {
    // Check cache first for faster response
    const cachedSetting = SettingsCacheManager.getCachedSetting(category, key);
    if (cachedSetting !== null && cachedSetting !== undefined) {
      try {
        return settingsApi.castSettingValue(cachedSetting.value, cachedSetting.type) as T;
      } catch {
        // Fall through to main logic if casting fails
      }
    }
    
    const setting = settings[category]?.[key];
    
    if (!setting || setting.value === undefined || setting.value === null) {
      return defaultValue as T;
    }
    
    // Cast value to proper type based on data type
    try {
      return settingsApi.castSettingValue(setting.value, setting.type) as T;
    } catch {
      return defaultValue as T;
    }
  }, [settings]);

  /**
   * Subscribe to settings changes via WebSocket or polling
   * This enables real-time updates when settings change
   */
  useEffect(() => {
    // Disabled periodic refresh to prevent API calls
    // const interval = setInterval(() => {
    //   refreshSettings();
    // }, 5 * 60 * 1000);

    // Clean up on unmount
    // return () => clearInterval(interval);
  }, [refreshSettings]);

  /**
   * Invalidate settings cache when window regains focus
   */
  useEffect(() => {
    const handleFocus = () => {
      queryClient.invalidateQueries({ queryKey: ['public-settings'] });
      queryClient.invalidateQueries({ queryKey: ['enabled-features'] });
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [queryClient]);

  const contextValue: SettingsContextValue = {
    settings,
    features,
    loading,
    error,
    refreshSettings,
    isFeatureEnabled,
    getSetting,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * Hook to use settings context
 */
export function useSettingsContext(): SettingsContextValue {
  const context = useContext(SettingsContext);
  
  if (!context) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  
  return context;
}

/**
 * Hook to get a specific setting value
 */
export function useSettingValue<T = any>(
  category: string, 
  key: string, 
  defaultValue?: T
): T {
  const { getSetting } = useSettingsContext();
  return getSetting(category, key, defaultValue);
}

/**
 * Hook to check if a feature is enabled
 */
export function useFeature(feature: FeatureKey): boolean {
  const { isFeatureEnabled } = useSettingsContext();
  return isFeatureEnabled(feature);
}

/**
 * Hook to get all settings in a category
 */
export function useCategorySettings(category: string) {
  const { settings } = useSettingsContext();
  return settings[category] || {};
}

/**
 * Hook to wait for settings to be loaded
 */
export function useSettingsReady() {
  const { loading, error } = useSettingsContext();
  return { ready: !loading && !error, loading, error };
}