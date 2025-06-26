/**
 * Theme Caching Service
 * Implements a performance-optimized caching strategy for themes
 * with lazy loading and memory management
 */

import { ThemePreset } from '@/lib/themes/presets';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface ThemeCacheConfig {
  maxAge?: number; // Maximum age in milliseconds (default: 1 hour)
  maxSize?: number; // Maximum number of items in cache (default: 20)
  persistToLocalStorage?: boolean; // Persist cache to localStorage (default: true)
}

class ThemeCache {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private config: Required<ThemeCacheConfig>;
  private accessOrder: string[] = []; // Track access order for LRU eviction

  constructor(config: ThemeCacheConfig = {}) {
    this.config = {
      maxAge: config.maxAge || 3600000, // 1 hour
      maxSize: config.maxSize || 20,
      persistToLocalStorage: config.persistToLocalStorage ?? true,
    };

    // Load cache from localStorage on initialization
    if (this.config.persistToLocalStorage) {
      this.loadFromLocalStorage();
    }
  }

  /**
   * Get an item from cache
   */
  get<T>(key: string): T | null {
    // Check memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && this.isValid(memoryEntry)) {
      this.updateAccessOrder(key);
      return memoryEntry.data;
    }

    // Check localStorage if enabled
    if (this.config.persistToLocalStorage) {
      const storageEntry = this.getFromLocalStorage<T>(key);
      if (storageEntry && this.isValid(storageEntry)) {
        // Restore to memory cache
        this.memoryCache.set(key, storageEntry);
        this.updateAccessOrder(key);
        return storageEntry.data;
      }
    }

    return null;
  }

  /**
   * Set an item in cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.config.maxAge);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt,
    };

    // Evict oldest items if cache is full
    if (this.memoryCache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    this.memoryCache.set(key, entry);
    this.updateAccessOrder(key);

    // Persist to localStorage if enabled
    if (this.config.persistToLocalStorage) {
      this.saveToLocalStorage(key, entry);
    }
  }

  /**
   * Remove an item from cache
   */
  delete(key: string): void {
    this.memoryCache.delete(key);
    this.accessOrder = this.accessOrder.filter(k => k !== key);

    if (this.config.persistToLocalStorage) {
      this.removeFromLocalStorage(key);
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.memoryCache.clear();
    this.accessOrder = [];

    if (this.config.persistToLocalStorage) {
      this.clearLocalStorage();
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    memorySize: number;
    hitRate: number;
  } {
    return {
      size: this.memoryCache.size,
      memorySize: this.estimateMemorySize(),
      hitRate: this.calculateHitRate(),
    };
  }

  /**
   * Preload themes for better performance
   */
  async preloadThemes(themes: ThemePreset[]): Promise<void> {
    const preloadPromises = themes.map(async (theme) => {
      // Simulate async loading (in real app, might fetch from API)
      await new Promise(resolve => setTimeout(resolve, 10));
      this.set(`theme:${theme.slug}`, theme);
    });

    await Promise.all(preloadPromises);
  }

  // Private methods

  private isValid(entry: CacheEntry<any>): boolean {
    return Date.now() < entry.expiresAt;
  }

  private updateAccessOrder(key: string): void {
    this.accessOrder = this.accessOrder.filter(k => k !== key);
    this.accessOrder.push(key);
  }

  private evictOldest(): void {
    if (this.accessOrder.length > 0) {
      const oldestKey = this.accessOrder.shift()!;
      this.delete(oldestKey);
    }
  }

  private getLocalStorageKey(key: string): string {
    return `theme-cache:${key}`;
  }

  private loadFromLocalStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('theme-cache:'));
      keys.forEach(storageKey => {
        const key = storageKey.replace('theme-cache:', '');
        const entry = this.getFromLocalStorage(key);
        if (entry && this.isValid(entry)) {
          this.memoryCache.set(key, entry);
        } else {
          // Clean up expired entries
          localStorage.removeItem(storageKey);
        }
      });
    } catch (error) {
      console.error('Failed to load theme cache from localStorage:', error);
    }
  }

  private getFromLocalStorage<T>(key: string): CacheEntry<T> | null {
    if (typeof window === 'undefined') return null;

    try {
      const storageKey = this.getLocalStorageKey(key);
      const data = localStorage.getItem(storageKey);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to get theme from localStorage:', error);
    }
    return null;
  }

  private saveToLocalStorage<T>(key: string, entry: CacheEntry<T>): void {
    if (typeof window === 'undefined') return;

    try {
      const storageKey = this.getLocalStorageKey(key);
      localStorage.setItem(storageKey, JSON.stringify(entry));
    } catch (error) {
      console.error('Failed to save theme to localStorage:', error);
      // If localStorage is full, clear old theme cache entries
      this.clearOldLocalStorageEntries();
    }
  }

  private removeFromLocalStorage(key: string): void {
    if (typeof window === 'undefined') return;

    try {
      const storageKey = this.getLocalStorageKey(key);
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Failed to remove theme from localStorage:', error);
    }
  }

  private clearLocalStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('theme-cache:'));
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to clear theme cache from localStorage:', error);
    }
  }

  private clearOldLocalStorageEntries(): void {
    if (typeof window === 'undefined') return;

    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('theme-cache:'));
      const entries: Array<{ key: string; timestamp: number }> = [];

      keys.forEach(storageKey => {
        try {
          const data = localStorage.getItem(storageKey);
          if (data) {
            const entry = JSON.parse(data);
            entries.push({ key: storageKey, timestamp: entry.timestamp });
          }
        } catch {
          // Remove corrupted entries
          localStorage.removeItem(storageKey);
        }
      });

      // Sort by timestamp and remove oldest half
      entries.sort((a, b) => a.timestamp - b.timestamp);
      const toRemove = Math.floor(entries.length / 2);
      entries.slice(0, toRemove).forEach(({ key }) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Failed to clear old theme cache entries:', error);
    }
  }

  private estimateMemorySize(): number {
    let size = 0;
    this.memoryCache.forEach((value) => {
      size += JSON.stringify(value).length * 2; // Rough estimate (2 bytes per char)
    });
    return size;
  }

  private calculateHitRate(): number {
    // In a real implementation, you'd track hits and misses
    // For now, return a placeholder
    return this.memoryCache.size > 0 ? 0.85 : 0;
  }
}

// Create singleton instance
export const themeCache = new ThemeCache({
  maxAge: 3600000, // 1 hour
  maxSize: 20,
  persistToLocalStorage: true,
});

// Utility functions for common operations

/**
 * Get a theme from cache or fetch it
 */
export async function getCachedTheme(
  themeId: string,
  fetcher: () => Promise<ThemePreset>
): Promise<ThemePreset> {
  const cacheKey = `theme:${themeId}`;
  const cached = themeCache.get<ThemePreset>(cacheKey);

  if (cached) {
    return cached;
  }

  const theme = await fetcher();
  themeCache.set(cacheKey, theme);
  return theme;
}

/**
 * Cache a CSS string with deduplication
 */
export function cacheThemeCSS(themeId: string, css: string): void {
  const cacheKey = `theme-css:${themeId}`;
  const hash = simpleHash(css);
  
  // Check if CSS has changed
  const existingHash = themeCache.get<string>(`theme-css-hash:${themeId}`);
  if (existingHash === hash) {
    return; // CSS hasn't changed, no need to update
  }

  themeCache.set(cacheKey, css);
  themeCache.set(`theme-css-hash:${themeId}`, hash);
}

/**
 * Get cached CSS
 */
export function getCachedThemeCSS(themeId: string): string | null {
  return themeCache.get<string>(`theme-css:${themeId}`);
}

/**
 * Simple hash function for deduplication
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

export default themeCache;