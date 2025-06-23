import { useCallback } from 'react';
import type {
  PublicSettings,
  FeatureKey,
  UseSettingsReturn,
  UseFeatureToggleReturn,
} from '@/types/settings';

/**
 * Optimized hook for accessing public settings - returns defaults immediately
 * No API calls to avoid startup delays
 */
export function useSettings(): UseSettingsReturn {
  // Return default settings immediately
  const defaultSettings: PublicSettings = {
    site: {
      name: { value: 'Nelson Tech', type: 'string' },
      tagline: { value: 'Growing Together', type: 'string' },
      description: { value: 'A community platform for technology professionals', type: 'string' },
    },
    appearance: {
      primary_color: { value: '#3B82F6', type: 'string' },
      secondary_color: { value: '#1E40AF', type: 'string' },
      font_family: { value: 'Inter', type: 'string' },
    },
    limits: {
      max_upload_size: { value: 10485760, type: 'number' }, // 10MB
      max_gallery_images: { value: 50, type: 'number' },
      max_resource_size: { value: 52428800, type: 'number' }, // 50MB
    },
  };

  return {
    settings: defaultSettings,
    loading: false,
    error: null,
    refetch: async () => {
      // No-op for now
    },
  };
}

/**
 * Optimized hook for getting all enabled features - returns all features enabled
 * No API calls to avoid startup delays
 */
export function useEnabledFeatures() {
  // Default all features to enabled
  const features: Record<FeatureKey, boolean> = {
    galleries: true,
    events: true,
    resources: true,
    newsletter: true,
    marketplace: true,
    opportunities: true,
    groups: true,
    companies: true,
    members: true,
    news: true,
    contact: true,
    about: true,
    privacy: true,
    terms: true,
    partners: true,
  };

  const isFeatureEnabled = useCallback(
    (feature: FeatureKey) => features[feature] || true,
    []
  );

  return {
    features,
    isFeatureEnabled,
    loading: false,
    error: null,
    refetch: async () => {
      // No-op for now
    },
  };
}