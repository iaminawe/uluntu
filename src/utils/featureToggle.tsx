import React from 'react';
import { settingsApi } from '@/features/admin/api/settings';
import type { FeatureKey } from '@/types/settings';
import { useEnabledFeatures } from '@/hooks/useSettings';

/**
 * Feature toggle utilities for conditional rendering and functionality
 */

// Cache for feature toggles to avoid repeated API calls
const featureCache = new Map<string, { value: boolean; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Check if a feature is enabled with caching
 */
export async function isFeatureEnabled(featureKey: FeatureKey): Promise<boolean> {
  const cacheKey = `feature_${featureKey}`;
  const cached = featureCache.get(cacheKey);
  
  // Return cached value if still valid
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.value;
  }
  
  try {
    const enabled = await settingsApi.isFeatureEnabled(featureKey);
    
    // Cache the result
    featureCache.set(cacheKey, {
      value: enabled,
      timestamp: Date.now(),
    });
    
    return enabled;
  } catch (error) {
    console.error(`Error checking feature toggle for ${featureKey}:`, error);
    
    // Return cached value if available, fallback to false
    return cached?.value ?? false;
  }
}

/**
 * Clear feature cache (useful for logout or forced refresh)
 */
export function clearFeatureCache(): void {
  featureCache.clear();
}

/**
 * Preload multiple features at once
 */
export async function preloadFeatures(features: FeatureKey[]): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {};
  
  await Promise.all(
    features.map(async (feature) => {
      results[feature] = await isFeatureEnabled(feature);
    })
  );
  
  return results;
}

/**
 * Feature toggle middleware for route protection
 */
export function createFeatureMiddleware(requiredFeature: FeatureKey) {
  return async (next: () => void, fallback?: () => void) => {
    const enabled = await isFeatureEnabled(requiredFeature);
    
    if (enabled) {
      next();
    } else if (fallback) {
      fallback();
    } else {
      console.warn(`Feature ${requiredFeature} is disabled`);
    }
  };
}

/**
 * React HOC for feature-gated components
 */

interface FeatureGateProps {
  feature: FeatureKey;
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
  children: React.ReactNode;
}

export function FeatureGate({
  feature,
  fallback = null,
  loading = null,
  children
}: FeatureGateProps): React.ReactElement {
  // Use the hook-based approach for better performance and caching
  const { isFeatureEnabled, loading: featuresLoading } = useEnabledFeatures();

  // Show loading state while features are being fetched
  if (featuresLoading) {
    return <>{loading}</>;
  }

  // Check if feature is enabled
  const enabled = isFeatureEnabled(feature);

  if (!enabled) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Hook for using feature toggles in components
 */
export function useFeatureToggle(feature: FeatureKey) {
  const [enabled, setEnabled] = React.useState<boolean | null>(null);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    let mounted = true;
    
    isFeatureEnabled(feature)
      .then((result) => {
        if (mounted) {
          setEnabled(result);
          setLoading(false);
        }
      })
      .catch((error) => {
        if (mounted) {
          console.error(`Error loading feature toggle ${feature}:`, error);
          setEnabled(false);
          setLoading(false);
        }
      });
    
    return () => {
      mounted = false;
    };
  }, [feature]);
  
  return { enabled, loading };
}

/**
 * Hook for multiple feature toggles
 */
export function useFeatureToggles(features: FeatureKey[]) {
  const [toggles, setToggles] = React.useState<Record<string, boolean>>({});
  const [loading, setLoading] = React.useState(true);
  
  // Create a stable string key from features array to prevent infinite re-renders
  // Sort the features to ensure consistent ordering
  const featuresKey = React.useMemo(
    () => [...features].sort().join(','), 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(features.sort())]
  );
  
  React.useEffect(() => {
    let mounted = true;
    
    preloadFeatures(features)
      .then((results) => {
        if (mounted) {
          setToggles(results);
          setLoading(false);
        }
      })
      .catch((error) => {
        if (mounted) {
          console.error('Error loading feature toggles:', error);
          setLoading(false);
        }
      });
    
    return () => {
      mounted = false;
    };
  }, [featuresKey, features]);
  
  const isEnabled = (feature: FeatureKey) => toggles[feature] ?? false;
  
  return { toggles, isEnabled, loading };
}

/**
 * Conditional navigation items based on feature toggles
 */
export interface ConditionalNavItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  feature?: FeatureKey;
  visible?: boolean;
  order?: number;
}

export async function filterNavigationItems(items: ConditionalNavItem[]): Promise<ConditionalNavItem[]> {
  const filteredItems: ConditionalNavItem[] = [];
  
  for (const item of items) {
    // Check if item should be visible based on feature toggle
    if (item.feature) {
      const enabled = await isFeatureEnabled(item.feature);
      if (!enabled) continue;
    }
    
    // Check explicit visibility flag
    if (item.visible === false) continue;
    
    filteredItems.push(item);
  }
  
  // Sort by order if specified
  return filteredItems.sort((a, b) => (a.order || 0) - (b.order || 0));
}

/**
 * Feature-based route definitions
 */
export interface FeatureRoute {
  path: string;
  component: React.ComponentType<any>;
  feature?: FeatureKey;
  exact?: boolean;
  permissions?: string[];
}

export function filterRoutes(routes: FeatureRoute[], enabledFeatures: Record<string, boolean>): FeatureRoute[] {
  return routes.filter(route => {
    if (route.feature && !enabledFeatures[route.feature]) {
      return false;
    }
    return true;
  });
}

/**
 * Feature toggle debugging utilities
 */
export class FeatureToggleDebugger {
  private static instance: FeatureToggleDebugger;
  
  static getInstance(): FeatureToggleDebugger {
    if (!FeatureToggleDebugger.instance) {
      FeatureToggleDebugger.instance = new FeatureToggleDebugger();
    }
    return FeatureToggleDebugger.instance;
  }
  
  /**
   * Log all enabled features
   */
  async logEnabledFeatures(): Promise<void> {
    const features = await settingsApi.getEnabledFeatures();
    console.group('🚀 Enabled Features');
    Object.entries(features).forEach(([feature, enabled]) => {
      console.log(`${enabled ? '✅' : '❌'} ${feature}`);
    });
    console.groupEnd();
  }
  
  /**
   * Get feature toggle statistics
   */
  async getFeatureStats(): Promise<{
    total: number;
    enabled: number;
    disabled: number;
    percentage: number;
  }> {
    const features = await settingsApi.getEnabledFeatures();
    const enabled = Object.values(features).filter(Boolean).length;
    const total = Object.keys(features).length;
    
    return {
      total,
      enabled,
      disabled: total - enabled,
      percentage: total > 0 ? Math.round((enabled / total) * 100) : 0,
    };
  }
  
  /**
   * Override feature toggle for testing (client-side only)
   */
  overrideFeature(feature: FeatureKey, enabled: boolean): void {
    const cacheKey = `feature_${feature}`;
    featureCache.set(cacheKey, {
      value: enabled,
      timestamp: Date.now(),
    });
    console.warn(`🔧 Feature override: ${feature} = ${enabled}`);
  }
  
  /**
   * Clear all overrides
   */
  clearOverrides(): void {
    clearFeatureCache();
    console.info('🔧 All feature overrides cleared');
  }
}

// Global debug access
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).featureDebugger = FeatureToggleDebugger.getInstance();
}

/**
 * Feature announcement system
 */
export interface FeatureAnnouncement {
  feature: FeatureKey;
  title: string;
  description: string;
  type: 'new' | 'updated' | 'deprecated';
  showUntil?: Date;
  dismissible?: boolean;
}

export class FeatureAnnouncementManager {
  private static readonly STORAGE_KEY = 'dismissed_feature_announcements';
  
  static getDismissedAnnouncements(): Set<string> {
    if (typeof localStorage === 'undefined') return new Set();
    
    try {
      const dismissed = localStorage.getItem(this.STORAGE_KEY);
      return new Set(dismissed ? JSON.parse(dismissed) : []);
    } catch {
      return new Set();
    }
  }
  
  static dismissAnnouncement(feature: FeatureKey): void {
    if (typeof localStorage === 'undefined') return;
    
    const dismissed = this.getDismissedAnnouncements();
    dismissed.add(feature);
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify([...dismissed]));
    } catch (error) {
      console.warn('Failed to save dismissed announcements:', error);
    }
  }
  
  static shouldShowAnnouncement(announcement: FeatureAnnouncement): boolean {
    // Check if dismissed
    if (announcement.dismissible && this.getDismissedAnnouncements().has(announcement.feature)) {
      return false;
    }
    
    // Check expiry
    if (announcement.showUntil && new Date() > announcement.showUntil) {
      return false;
    }
    
    return true;
  }
}