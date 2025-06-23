import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '@/features/admin/api/settings';
import type {
  PublicSettings,
  ApplicationSetting,
  FeatureToggle,
  SettingsHistory,
  UpdateSettingRequest,
  UpdateFeatureToggleRequest,
  FeatureKey,
  UseSettingsReturn,
  UseFeatureToggleReturn,
  UseAdminSettingsReturn,
} from '@/types/settings';

/**
 * Hook for accessing public settings
 */
export function useSettings(): UseSettingsReturn {
  const {
    data: settings = {},
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['public-settings'],
    queryFn: () => settingsApi.getPublicSettings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  return {
    settings,
    loading,
    error: error?.message || null,
    refetch: useCallback(async () => {
      await refetch();
    }, [refetch]),
  };
}

/**
 * Hook for checking a specific feature toggle
 */
export function useFeatureToggle(feature: FeatureKey): UseFeatureToggleReturn {
  const {
    data,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['feature-toggle', feature],
    queryFn: async () => {
      const enabled = await settingsApi.isFeatureEnabled(feature);
      const allFeatures = await settingsApi.getAllFeatureToggles();
      const featureConfig = allFeatures.find(f => f.feature_key === feature);
      
      return {
        enabled,
        config: featureConfig?.config || {},
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });

  return {
    isEnabled: data?.enabled || false,
    config: data?.config || {},
    loading,
    error: error?.message || null,
  };
}

/**
 * Hook for getting all enabled features
 */
export function useEnabledFeatures() {
  const {
    data: features = {},
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['enabled-features'],
    queryFn: () => settingsApi.getEnabledFeatures(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  const isFeatureEnabled = useCallback(
    (feature: FeatureKey) => features[feature] || false,
    [features]
  );

  return {
    features,
    isFeatureEnabled,
    loading,
    error: error?.message || null,
    refetch,
  };
}

/**
 * Hook for admin settings management
 */
export function useAdminSettings(): UseAdminSettingsReturn {
  const queryClient = useQueryClient();

  // Fetch all settings
  const {
    data: settings = [],
    isLoading: settingsLoading,
    error: settingsError,
    refetch: refetchSettings,
  } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => settingsApi.getAllSettings(),
    retry: 2,
  });

  // Fetch all feature toggles
  const {
    data: features = [],
    isLoading: featuresLoading,
    error: featuresError,
    refetch: refetchFeatures,
  } = useQuery({
    queryKey: ['admin-feature-toggles'],
    queryFn: () => settingsApi.getAllFeatureToggles(),
    retry: 2,
  });

  // Fetch settings history
  const {
    data: history = [],
    isLoading: historyLoading,
    error: historyError,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ['settings-history'],
    queryFn: () => settingsApi.getSettingsHistory(),
    retry: 2,
  });

  // Update setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: (request: UpdateSettingRequest) => settingsApi.upsertSetting(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['public-settings'] });
      queryClient.invalidateQueries({ queryKey: ['settings-history'] });
    },
  });

  // Update feature toggle mutation
  const updateFeatureMutation = useMutation({
    mutationFn: (request: UpdateFeatureToggleRequest) => settingsApi.updateFeatureToggle(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feature-toggles'] });
      queryClient.invalidateQueries({ queryKey: ['enabled-features'] });
      queryClient.invalidateQueries({ queryKey: ['feature-toggle'] });
      queryClient.invalidateQueries({ queryKey: ['settings-history'] });
    },
  });

  // Delete setting mutation
  const deleteSettingMutation = useMutation({
    mutationFn: (id: string) => settingsApi.deleteSetting(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['public-settings'] });
      queryClient.invalidateQueries({ queryKey: ['settings-history'] });
    },
  });

  // Delete feature toggle mutation
  const deleteFeatureMutation = useMutation({
    mutationFn: (id: string) => settingsApi.deleteFeatureToggle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feature-toggles'] });
      queryClient.invalidateQueries({ queryKey: ['enabled-features'] });
      queryClient.invalidateQueries({ queryKey: ['feature-toggle'] });
      queryClient.invalidateQueries({ queryKey: ['settings-history'] });
    },
  });

  const loading = settingsLoading || featuresLoading || historyLoading;
  const error = settingsError?.message || featuresError?.message || historyError?.message || null;

  return {
    settings,
    features,
    history,
    loading,
    error,
    updateSetting: async (request: UpdateSettingRequest) => {
      const result = await updateSettingMutation.mutateAsync(request);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update setting');
      }
    },
    updateFeature: async (request: UpdateFeatureToggleRequest) => {
      const result = await updateFeatureMutation.mutateAsync(request);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update feature toggle');
      }
    },
    deleteSetting: async (id: string) => {
      const result = await deleteSettingMutation.mutateAsync(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete setting');
      }
    },
    deleteFeature: async (id: string) => {
      const result = await deleteFeatureMutation.mutateAsync(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete feature toggle');
      }
    },
    refetch: async () => {
      await Promise.all([
        refetchSettings(),
        refetchFeatures(),
        refetchHistory(),
      ]);
    },
  };
}

/**
 * Hook for settings by category
 */
export function useSettingsByCategory(category: string) {
  const {
    data: settings = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['settings-by-category', category],
    queryFn: () => settingsApi.getSettingsByCategory(category),
    enabled: !!category,
    retry: 2,
  });

  return {
    settings,
    loading,
    error: error?.message || null,
    refetch,
  };
}

/**
 * Hook for getting a specific setting value
 */
export function useSetting<T = any>(category: string, key: string, defaultValue?: T) {
  const { settings, loading, error } = useSettings();
  
  const value = settings?.[category]?.[key]?.value ?? defaultValue;
  const dataType = settings?.[category]?.[key]?.type;
  
  // Cast value to proper type if needed
  const typedValue = useMemo(() => {
    if (value === undefined || value === null) return defaultValue;
    
    try {
      switch (dataType) {
        case 'number':
          return typeof value === 'number' ? value : Number(value);
        case 'boolean':
          return typeof value === 'boolean' ? value : Boolean(value);
        case 'object':
        case 'array':
          return typeof value === 'string' ? JSON.parse(value) : value;
        default:
          return value;
      }
    } catch {
      return defaultValue;
    }
  }, [value, dataType, defaultValue]);
  
  return {
    value: typedValue,
    loading,
    error,
    exists: value !== undefined,
  };
}

/**
 * Hook for bulk settings operations
 */
export function useBulkSettings() {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateMultipleSettings = useCallback(async (updates: UpdateSettingRequest[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await Promise.allSettled(
        updates.map(update => settingsApi.upsertSetting(update))
      );
      
      const failures = results
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .map(result => result.reason);
      
      if (failures.length > 0) {
        throw new Error(`${failures.length} settings failed to update`);
      }
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['public-settings'] });
      queryClient.invalidateQueries({ queryKey: ['settings-history'] });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settings';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [queryClient]);

  return {
    updateMultipleSettings,
    loading,
    error,
  };
}

/**
 * Hook for settings validation
 */
export function useSettingsValidation() {
  const validateSetting = useCallback((value: any, dataType: string, rules?: any) => {
    const errors: string[] = [];
    
    // Basic type validation
    if (!settingsApi.validateSettingValue(value, dataType)) {
      errors.push(`Value must be of type ${dataType}`);
    }
    
    // Additional validation rules
    if (rules) {
      if (rules.required && (value === null || value === undefined || value === '')) {
        errors.push('This field is required');
      }
      
      if (rules.min !== undefined && typeof value === 'number' && value < rules.min) {
        errors.push(`Value must be at least ${rules.min}`);
      }
      
      if (rules.max !== undefined && typeof value === 'number' && value > rules.max) {
        errors.push(`Value must be at most ${rules.max}`);
      }
      
      if (rules.pattern && typeof value === 'string') {
        const regex = new RegExp(rules.pattern);
        if (!regex.test(value)) {
          errors.push('Value does not match required pattern');
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }, []);

  return { validateSetting };
}

