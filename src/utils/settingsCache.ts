import type { PublicSettings, FeatureKey } from '@/types/settings';

/**
 * In-memory cache for settings with TTL support
 */
class SettingsCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Set a value in cache with optional TTL
   */
  set(key: string, value: any, ttl?: number): void {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  /**
   * Get a value from cache if not expired
   */
  get<T = any>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete a specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const entry of this.cache.values()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    }

    return {
      total: this.cache.size,
      valid: validEntries,
      expired: expiredEntries,
      hitRate: this.hitCount / (this.hitCount + this.missCount) || 0,
    };
  }

  private hitCount = 0;
  private missCount = 0;

  /**
   * Get with hit/miss tracking
   */
  getWithStats<T = any>(key: string): T | null {
    const value = this.get<T>(key);
    
    if (value !== null) {
      this.hitCount++;
    } else {
      this.missCount++;
    }

    return value;
  }
}

/**
 * Singleton cache instance
 */
export const settingsCache = new SettingsCache();

/**
 * Cache keys for different types of data
 */
export const CACHE_KEYS = {
  PUBLIC_SETTINGS: 'public_settings',
  ENABLED_FEATURES: 'enabled_features',
  FEATURE_TOGGLE: (feature: string) => `feature_toggle:${feature}`,
  CATEGORY_SETTINGS: (category: string) => `category_settings:${category}`,
  SETTING_VALUE: (category: string, key: string) => `setting:${category}:${key}`,
  USER_FEATURES: (userId: string) => `user_features:${userId}`,
  SETTINGS_METADATA: 'settings_metadata',
} as const;

/**
 * Settings-specific cache operations
 */
export class SettingsCacheManager {
  /**
   * Cache public settings
   */
  static cachePublicSettings(settings: PublicSettings): void {
    settingsCache.set(CACHE_KEYS.PUBLIC_SETTINGS, settings);
    
    // Also cache individual category settings
    Object.entries(settings).forEach(([category, categorySettings]) => {
      settingsCache.set(CACHE_KEYS.CATEGORY_SETTINGS(category), categorySettings);
      
      // Cache individual setting values
      Object.entries(categorySettings).forEach(([key, value]) => {
        settingsCache.set(CACHE_KEYS.SETTING_VALUE(category, key), value);
      });
    });
  }

  /**
   * Get cached public settings
   */
  static getCachedPublicSettings(): PublicSettings | null {
    return settingsCache.get<PublicSettings>(CACHE_KEYS.PUBLIC_SETTINGS);
  }

  /**
   * Cache enabled features
   */
  static cacheEnabledFeatures(features: Record<string, boolean>): void {
    settingsCache.set(CACHE_KEYS.ENABLED_FEATURES, features);
    
    // Cache individual feature states
    Object.entries(features).forEach(([feature, enabled]) => {
      settingsCache.set(CACHE_KEYS.FEATURE_TOGGLE(feature), enabled);
    });
  }

  /**
   * Get cached enabled features
   */
  static getCachedEnabledFeatures(): Record<string, boolean> | null {
    return settingsCache.get<Record<string, boolean>>(CACHE_KEYS.ENABLED_FEATURES);
  }

  /**
   * Check if a feature is cached and enabled
   */
  static isFeatureCached(feature: FeatureKey): boolean | null {
    return settingsCache.get<boolean>(CACHE_KEYS.FEATURE_TOGGLE(feature));
  }

  /**
   * Get a specific setting from cache
   */
  static getCachedSetting(category: string, key: string): any {
    return settingsCache.get(CACHE_KEYS.SETTING_VALUE(category, key));
  }

  /**
   * Invalidate all settings cache
   */
  static invalidateAll(): void {
    settingsCache.clear();
  }

  /**
   * Invalidate settings for a specific category
   */
  static invalidateCategory(category: string): void {
    settingsCache.delete(CACHE_KEYS.CATEGORY_SETTINGS(category));
    settingsCache.delete(CACHE_KEYS.PUBLIC_SETTINGS);
  }

  /**
   * Invalidate feature toggles cache
   */
  static invalidateFeatures(): void {
    settingsCache.delete(CACHE_KEYS.ENABLED_FEATURES);
    // Note: Individual feature caches will expire naturally
  }

  /**
   * Pre-warm cache with essential settings
   */
  static async preWarmCache(): Promise<void> {
    // This would typically be called during app initialization
    // Implementation would depend on your specific caching strategy
    console.log('Settings cache pre-warming initiated');
  }

  /**
   * Get cache performance metrics
   */
  static getMetrics() {
    return settingsCache.getStats();
  }
}

/**
 * Cleanup expired cache entries periodically
 */
setInterval(() => {
  settingsCache.clearExpired();
}, 60 * 1000); // Every minute

/**
 * Browser storage fallback for persistent caching
 */
export class PersistentSettingsCache {
  private static STORAGE_KEY = 'nelson_tech_settings_cache';
  private static VERSION = '1.0';

  /**
   * Save critical settings to localStorage
   */
  static saveToStorage(settings: Partial<PublicSettings>): void {
    try {
      const data = {
        version: this.VERSION,
        timestamp: Date.now(),
        settings,
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save settings to localStorage:', error);
    }
  }

  /**
   * Load settings from localStorage
   */
  static loadFromStorage(): Partial<PublicSettings> | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      
      if (!stored) {
        return null;
      }

      const data = JSON.parse(stored);
      
      // Check version compatibility
      if (data.version !== this.VERSION) {
        this.clearStorage();
        return null;
      }

      // Check if data is not too old (24 hours)
      const maxAge = 24 * 60 * 60 * 1000;
      if (Date.now() - data.timestamp > maxAge) {
        this.clearStorage();
        return null;
      }

      return data.settings;
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error);
      this.clearStorage();
      return null;
    }
  }

  /**
   * Clear persistent cache
   */
  static clearStorage(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear settings storage:', error);
    }
  }
}