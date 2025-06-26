import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { themeCache, getCachedTheme, cacheThemeCSS, getCachedThemeCSS } from '../themeCache';
import { ThemePreset } from '../../themes/presets';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('ThemeCache', () => {
  beforeEach(() => {
    themeCache.clear();
    localStorageMock.clear();
  });

  afterEach(() => {
    themeCache.clear();
    localStorageMock.clear();
  });

  describe('Basic cache operations', () => {
    it('should store and retrieve values', () => {
      const testData = { id: 'test', name: 'Test Theme' };
      themeCache.set('test-key', testData);
      
      const retrieved = themeCache.get('test-key');
      expect(retrieved).toEqual(testData);
    });

    it('should return null for non-existent keys', () => {
      const result = themeCache.get('non-existent');
      expect(result).toBeNull();
    });

    it('should delete values', () => {
      themeCache.set('test-key', 'test-value');
      expect(themeCache.get('test-key')).toBe('test-value');
      
      themeCache.delete('test-key');
      expect(themeCache.get('test-key')).toBeNull();
    });

    it('should clear all values', () => {
      themeCache.set('key1', 'value1');
      themeCache.set('key2', 'value2');
      
      themeCache.clear();
      
      expect(themeCache.get('key1')).toBeNull();
      expect(themeCache.get('key2')).toBeNull();
    });
  });

  describe('TTL and expiration', () => {
    it('should expire values after TTL', async () => {
      const ttl = 100; // 100ms
      themeCache.set('test-key', 'test-value', ttl);
      
      // Should exist immediately
      expect(themeCache.get('test-key')).toBe('test-value');
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, ttl + 10));
      
      // Should be expired
      expect(themeCache.get('test-key')).toBeNull();
    });

    it('should use default TTL if not specified', () => {
      themeCache.set('test-key', 'test-value');
      
      // Should exist (default TTL is 1 hour)
      expect(themeCache.get('test-key')).toBe('test-value');
    });
  });

  describe('LRU eviction', () => {
    it('should evict oldest items when cache is full', () => {
      // Create a small cache for testing
      const smallCache = new (require('../themeCache').default)({
        maxSize: 3,
        persistToLocalStorage: false,
      });

      smallCache.set('key1', 'value1');
      smallCache.set('key2', 'value2');
      smallCache.set('key3', 'value3');
      
      // Cache is now full
      expect(smallCache.get('key1')).toBe('value1');
      
      // Adding new item should evict key1 (oldest)
      smallCache.set('key4', 'value4');
      
      expect(smallCache.get('key1')).toBeNull(); // Evicted
      expect(smallCache.get('key2')).toBe('value2');
      expect(smallCache.get('key3')).toBe('value3');
      expect(smallCache.get('key4')).toBe('value4');
    });

    it('should update access order on get', () => {
      const smallCache = new (require('../themeCache').default)({
        maxSize: 3,
        persistToLocalStorage: false,
      });

      smallCache.set('key1', 'value1');
      smallCache.set('key2', 'value2');
      smallCache.set('key3', 'value3');
      
      // Access key1 to make it most recently used
      smallCache.get('key1');
      
      // Adding new item should evict key2 (now oldest)
      smallCache.set('key4', 'value4');
      
      expect(smallCache.get('key1')).toBe('value1'); // Still exists
      expect(smallCache.get('key2')).toBeNull(); // Evicted
      expect(smallCache.get('key3')).toBe('value3');
      expect(smallCache.get('key4')).toBe('value4');
    });
  });

  describe('localStorage persistence', () => {
    it('should persist to localStorage', () => {
      themeCache.set('test-key', 'test-value');
      
      const storageKey = 'theme-cache:test-key';
      const stored = localStorage.getItem(storageKey);
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.data).toBe('test-value');
    });

    it('should load from localStorage on initialization', () => {
      // Set data in localStorage
      const storageData = {
        data: 'persisted-value',
        timestamp: Date.now(),
        expiresAt: Date.now() + 3600000, // 1 hour
      };
      localStorage.setItem('theme-cache:persisted-key', JSON.stringify(storageData));
      
      // Create new cache instance
      const newCache = new (require('../themeCache').default)({
        persistToLocalStorage: true,
      });
      
      // Should load from localStorage
      expect(newCache.get('persisted-key')).toBe('persisted-value');
    });

    it('should clean up expired entries from localStorage', () => {
      // Set expired data in localStorage
      const expiredData = {
        data: 'expired-value',
        timestamp: Date.now() - 7200000, // 2 hours ago
        expiresAt: Date.now() - 3600000, // Expired 1 hour ago
      };
      localStorage.setItem('theme-cache:expired-key', JSON.stringify(expiredData));
      
      // Create new cache instance
      const newCache = new (require('../themeCache').default)({
        persistToLocalStorage: true,
      });
      
      // Should not load expired data
      expect(newCache.get('expired-key')).toBeNull();
      
      // Should remove from localStorage
      expect(localStorage.getItem('theme-cache:expired-key')).toBeNull();
    });
  });

  describe('Cache statistics', () => {
    it('should provide cache statistics', () => {
      themeCache.set('key1', 'value1');
      themeCache.set('key2', { data: 'complex value with more bytes' });
      
      const stats = themeCache.getStats();
      
      expect(stats.size).toBe(2);
      expect(stats.memorySize).toBeGreaterThan(0);
      expect(stats.hitRate).toBeGreaterThanOrEqual(0);
      expect(stats.hitRate).toBeLessThanOrEqual(1);
    });
  });

  describe('Theme preloading', () => {
    it('should preload themes', async () => {
      const themes: ThemePreset[] = [
        {
          id: 'theme1',
          name: 'Theme 1',
          description: 'Test theme 1',
          isDark: false,
          colors: {
            primary: '#000000',
            secondary: '#111111',
            accent: '#222222',
            background: '#FFFFFF',
            surface: '#FFFFFF',
            text: '#000000',
            textSecondary: '#666666',
            border: '#DDDDDD',
            error: '#FF0000',
            warning: '#FF6600',
            success: '#00FF00',
            info: '#0000FF',
          },
          typography: {
            fontFamily: 'Inter',
            fontSizeBase: 16,
            fontWeightNormal: 400,
            fontWeightMedium: 500,
            fontWeightBold: 700,
            lineHeightBase: 1.5,
            letterSpacing: '0',
          },
          layout: {
            borderRadius: 8,
            shadowStyle: 'medium',
            containerMaxWidth: '1280px',
            spacing: {
              xs: '0.25rem',
              sm: '0.5rem',
              md: '1rem',
              lg: '1.5rem',
              xl: '2rem',
            },
          },
        },
      ];

      await themeCache.preloadThemes(themes);
      
      const cached = themeCache.get('theme:theme1');
      expect(cached).toEqual(themes[0]);
    });
  });

  describe('Theme-specific utilities', () => {
    it('should cache themes with getCachedTheme', async () => {
      const mockTheme: ThemePreset = {
        id: 'mock-theme',
        name: 'Mock Theme',
        description: 'A mock theme for testing',
        isDark: false,
        colors: {
          primary: '#0000FF',
          secondary: '#00FF00',
          accent: '#FF0000',
          background: '#FFFFFF',
          surface: '#F0F0F0',
          text: '#000000',
          textSecondary: '#666666',
          border: '#CCCCCC',
          error: '#FF0000',
          warning: '#FFA500',
          success: '#00FF00',
          info: '#0000FF',
        },
        typography: {
          fontFamily: 'Arial',
          fontSizeBase: 16,
          fontWeightNormal: 400,
          fontWeightMedium: 500,
          fontWeightBold: 700,
          lineHeightBase: 1.5,
          letterSpacing: '0',
        },
        layout: {
          borderRadius: 4,
          shadowStyle: 'small',
          containerMaxWidth: '1200px',
          spacing: {
            xs: '0.25rem',
            sm: '0.5rem',
            md: '1rem',
            lg: '1.5rem',
            xl: '2rem',
          },
        },
      };

      const fetcher = jest.fn().mockResolvedValue(mockTheme);
      
      // First call should fetch
      const result1 = await getCachedTheme('mock-theme', fetcher);
      expect(result1).toEqual(mockTheme);
      expect(fetcher).toHaveBeenCalledTimes(1);
      
      // Second call should use cache
      const result2 = await getCachedTheme('mock-theme', fetcher);
      expect(result2).toEqual(mockTheme);
      expect(fetcher).toHaveBeenCalledTimes(1); // Not called again
    });

    it('should cache theme CSS with deduplication', () => {
      const themeId = 'test-theme';
      const css1 = ':root { --color-primary: #0000FF; }';
      const css2 = ':root { --color-primary: #0000FF; }'; // Same content
      const css3 = ':root { --color-primary: #FF0000; }'; // Different content
      
      // Cache first CSS
      cacheThemeCSS(themeId, css1);
      expect(getCachedThemeCSS(themeId)).toBe(css1);
      
      // Cache same CSS (should not update due to deduplication)
      const stats1 = themeCache.getStats();
      cacheThemeCSS(themeId, css2);
      const stats2 = themeCache.getStats();
      expect(stats2.size).toBe(stats1.size); // No new entries
      
      // Cache different CSS (should update)
      cacheThemeCSS(themeId, css3);
      expect(getCachedThemeCSS(themeId)).toBe(css3);
    });
  });

  describe('Error handling', () => {
    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage.setItem to throw error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn().mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      // Should not throw when localStorage is full
      expect(() => {
        themeCache.set('test-key', 'test-value');
      }).not.toThrow();

      // Restore original
      localStorage.setItem = originalSetItem;
    });

    it('should handle corrupted localStorage data', () => {
      // Set corrupted data
      localStorage.setItem('theme-cache:corrupted', 'invalid json');
      
      // Should handle gracefully
      expect(() => {
        const newCache = new (require('../themeCache').default)({
          persistToLocalStorage: true,
        });
      }).not.toThrow();
      
      // Should clean up corrupted entry
      expect(localStorage.getItem('theme-cache:corrupted')).toBeNull();
    });
  });
});