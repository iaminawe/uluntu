import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSettingsContext } from '@/providers/SettingsProvider';
import type { FeatureKey, SettingCategory } from '@/types/settings';
import { 
  validateSettingValue, 
  castValue, 
  createSettingsCacheKey,
  debounceSettingsUpdate 
} from '@/utils/settingsUtils';

/**
 * Enhanced hook for working with site appearance settings
 */
export function useAppearanceSettings() {
  const { settings, getSetting } = useSettingsContext();
  
  return useMemo(() => ({
    primaryColor: getSetting('appearance', 'primary_color', '#3B82F6'),
    secondaryColor: getSetting('appearance', 'secondary_color', '#1E40AF'),
    fontFamily: getSetting('appearance', 'font_family', 'Inter'),
    logoUrl: getSetting('appearance', 'logo_url', null),
    faviconUrl: getSetting('appearance', 'favicon_url', null),
    darkMode: getSetting('appearance', 'dark_mode_enabled', false),
  }), [settings, getSetting]);
}

/**
 * Enhanced hook for working with site information
 */
export function useSiteInfo() {
  const { getSetting } = useSettingsContext();
  
  return useMemo(() => ({
    name: getSetting('site', 'name', 'Nelson Tech'),
    tagline: getSetting('site', 'tagline', 'Growing Together'),
    description: getSetting('site', 'description', ''),
    email: getSetting('contact', 'email', ''),
    phone: getSetting('contact', 'phone', ''),
    address: getSetting('contact', 'address', ''),
    socialLinks: getSetting('site', 'social_links', {}),
  }), [getSetting]);
}

/**
 * Enhanced hook for working with feature toggles with caching
 */
export function useFeatures() {
  const { features, isFeatureEnabled } = useSettingsContext();
  const [cache, setCache] = useState<Record<string, boolean>>({});

  // Update cache when features change
  useEffect(() => {
    setCache(features);
  }, [features]);

  const checkFeature = useCallback((feature: FeatureKey): boolean => {
    // Check cache first
    if (feature in cache) {
      return cache[feature];
    }
    
    // Fall back to context check
    const enabled = isFeatureEnabled(feature);
    
    // Update cache
    setCache(prev => ({ ...prev, [feature]: enabled }));
    
    return enabled;
  }, [cache, isFeatureEnabled]);

  return {
    features: cache,
    isEnabled: checkFeature,
    enabledCount: Object.values(cache).filter(Boolean).length,
  };
}

/**
 * Enhanced hook for working with limits and constraints
 */
export function useLimits() {
  const { getSetting } = useSettingsContext();
  
  return useMemo(() => ({
    maxUploadSize: getSetting('limits', 'max_upload_size', 10485760), // 10MB
    maxGalleryImages: getSetting('limits', 'max_gallery_images', 50),
    maxResourceSize: getSetting('limits', 'max_resource_size', 52428800), // 50MB
    maxGroupMembers: getSetting('limits', 'max_group_members', 100),
    maxEventsPerUser: getSetting('limits', 'max_events_per_user', 10),
    rateLimitRequests: getSetting('limits', 'rate_limit_requests', 100),
    rateLimitWindow: getSetting('limits', 'rate_limit_window', 60), // seconds
  }), [getSetting]);
}

/**
 * Hook for settings with validation
 */
export function useValidatedSetting<T = any>(
  category: string,
  key: string,
  defaultValue: T,
  validationRules?: any[]
) {
  const { getSetting } = useSettingsContext();
  const [error, setError] = useState<string | null>(null);
  
  const value = getSetting(category, key, defaultValue);
  
  useEffect(() => {
    if (validationRules && validationRules.length > 0) {
      const result = validateSettingValue(value, typeof value as any, validationRules);
      setError(result.isValid ? null : result.errors[0]);
    }
  }, [value, validationRules]);
  
  return {
    value,
    error,
    isValid: !error,
  };
}

/**
 * Hook for dynamic CSS variables based on settings
 */
export function useSettingsCSS() {
  const appearance = useAppearanceSettings();
  
  useEffect(() => {
    const root = document.documentElement;
    
    // Set CSS variables
    root.style.setProperty('--primary-color', appearance.primaryColor);
    root.style.setProperty('--secondary-color', appearance.secondaryColor);
    root.style.setProperty('--font-family', appearance.fontFamily);
    
    // Set favicon
    if (appearance.faviconUrl) {
      const favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (favicon) {
        favicon.href = appearance.faviconUrl;
      }
    }
    
    // Apply dark mode
    if (appearance.darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [appearance]);
}

/**
 * Hook for monitoring settings changes
 */
export function useSettingsMonitor(
  category?: SettingCategory,
  callback?: (changes: any) => void
) {
  const { settings, refreshSettings } = useSettingsContext();
  const [previousSettings, setPreviousSettings] = useState(settings);
  
  useEffect(() => {
    // Check for changes
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(previousSettings);
    
    if (hasChanges && callback) {
      const changes = category 
        ? { [category]: settings[category] }
        : settings;
      
      callback(changes);
      setPreviousSettings(settings);
    }
  }, [settings, previousSettings, category, callback]);
  
  // Debounced refresh function
  const debouncedRefresh = useMemo(
    () => debounceSettingsUpdate(refreshSettings, 1000),
    [refreshSettings]
  );
  
  return {
    refresh: debouncedRefresh,
    hasChanges: JSON.stringify(settings) !== JSON.stringify(previousSettings),
  };
}

/**
 * Hook for conditional rendering based on settings
 */
export function useConditionalSetting(
  category: string,
  key: string,
  condition: (value: any) => boolean
) {
  const { getSetting } = useSettingsContext();
  const value = getSetting(category, key);
  
  return useMemo(() => condition(value), [value, condition]);
}

/**
 * Hook for navigation settings
 */
export function useNavigationSettings() {
  const { getSetting, isFeatureEnabled } = useSettingsContext();
  
  return useMemo(() => {
    const navItems = getSetting('navigation', 'items', []);
    const enabledItems = navItems.filter((item: any) => {
      if (item.feature) {
        return isFeatureEnabled(item.feature);
      }
      return true;
    });
    
    return {
      items: enabledItems,
      style: getSetting('navigation', 'style', 'horizontal'),
      showIcons: getSetting('navigation', 'show_icons', true),
      collapsible: getSetting('navigation', 'collapsible', true),
    };
  }, [getSetting, isFeatureEnabled]);
}

/**
 * Hook for integration settings
 */
export function useIntegrationSettings() {
  const { getSetting } = useSettingsContext();
  
  return useMemo(() => ({
    googleAnalytics: {
      enabled: getSetting('integration', 'google_analytics_enabled', false),
      trackingId: getSetting('integration', 'google_analytics_id', ''),
    },
    mailchimp: {
      enabled: getSetting('integration', 'mailchimp_enabled', false),
      apiKey: getSetting('integration', 'mailchimp_api_key', ''),
      listId: getSetting('integration', 'mailchimp_list_id', ''),
    },
    stripe: {
      enabled: getSetting('integration', 'stripe_enabled', false),
      publishableKey: getSetting('integration', 'stripe_publishable_key', ''),
    },
    slack: {
      enabled: getSetting('integration', 'slack_enabled', false),
      webhookUrl: getSetting('integration', 'slack_webhook_url', ''),
    },
  }), [getSetting]);
}

/**
 * Hook for security settings
 */
export function useSecuritySettings() {
  const { getSetting } = useSettingsContext();
  
  return useMemo(() => ({
    requireEmailVerification: getSetting('security', 'require_email_verification', true),
    passwordMinLength: getSetting('security', 'password_min_length', 8),
    passwordRequireSpecialChar: getSetting('security', 'password_require_special', true),
    sessionTimeout: getSetting('security', 'session_timeout', 3600), // seconds
    maxLoginAttempts: getSetting('security', 'max_login_attempts', 5),
    enableTwoFactor: getSetting('security', 'enable_two_factor', false),
    allowedFileTypes: getSetting('security', 'allowed_file_types', ['jpg', 'png', 'pdf', 'doc']),
  }), [getSetting]);
}