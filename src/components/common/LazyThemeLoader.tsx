import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { PresetTheme } from '@/types/theme';
import { themePresets } from '@/lib/themes/presets';
import { getCachedTheme, themeCache } from '@/lib/services/themeCache';

interface LazyThemeLoaderProps {
  themeId: string;
  onLoad?: (theme: PresetTheme) => void;
  onError?: (error: Error) => void;
  children: (theme: PresetTheme | null, loading: boolean) => React.ReactNode;
  fallback?: React.ReactNode;
  preload?: boolean;
}

/**
 * Lazy loads theme data with intelligent caching and performance optimization
 */
export const LazyThemeLoader: React.FC<LazyThemeLoaderProps> = ({
  themeId,
  onLoad,
  onError,
  children,
  fallback,
  preload = false,
}) => {
  const [theme, setTheme] = useState<PresetTheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadTheme = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get from cache first
      const cachedTheme = themeCache.get<PresetTheme>(`theme:${themeId}`);
      if (cachedTheme) {
        setTheme(cachedTheme);
        setLoading(false);
        onLoad?.(cachedTheme);
        return;
      }

      // Simulate async theme loading (in real app, this would be an API call)
      const loadedTheme = await getCachedTheme(themeId, async () => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // In a real app, this would fetch from an API
        const { themePresets } = await import('@/lib/themes/presets');
        const theme = themePresets.find(t => t.slug === themeId);
        
        if (!theme) {
          throw new Error(`Theme ${themeId} not found`);
        }
        
        return theme;
      });

      setTheme(loadedTheme);
      onLoad?.(loadedTheme);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load theme');
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [themeId, onLoad, onError]);

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  // Preload theme assets if requested
  useEffect(() => {
    if (preload && theme) {
      preloadThemeAssets(theme);
    }
  }, [preload, theme]);

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to load theme</p>
          <button
            onClick={loadTheme}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (fallback && loading) {
    return <>{fallback}</>;
  }

  return <>{children(theme, loading)}</>;
};

/**
 * Loading skeleton for theme components
 */
export const ThemeLoadingSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  );
};

/**
 * Default loading component
 */
export const ThemeLoadingSpinner: React.FC<{ message?: string }> = ({ 
  message = 'Loading theme...' 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  );
};

/**
 * Preload theme assets for better performance
 */
async function preloadThemeAssets(theme: PresetTheme): Promise<void> {
  const preloadTasks: Promise<void>[] = [];

  // Preload font if custom
  if (theme.configurations.typography.font_family && !isSystemFont(theme.configurations.typography.font_family)) {
    preloadTasks.push(preloadFont(theme.configurations.typography.font_family));
  }

  // Preload theme-specific images if any
  if (theme.preview_url) {
    preloadTasks.push(preloadImage(theme.preview_url));
  }

  await Promise.all(preloadTasks);
}

/**
 * Check if font is a system font
 */
function isSystemFont(fontFamily: string): boolean {
  const systemFonts = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Verdana',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
  ];
  
  return systemFonts.some(font => 
    fontFamily.toLowerCase().includes(font.toLowerCase())
  );
}

/**
 * Preload a font
 */
async function preloadFont(fontFamily: string): Promise<void> {
  try {
    // Use CSS Font Loading API if available
    if ('fonts' in document) {
      await document.fonts.load(`16px ${fontFamily}`);
    } else {
      // Fallback: create a hidden element with the font
      const el = (document as Document).createElement('span');
      el.style.fontFamily = fontFamily;
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      el.textContent = 'Preload';
      (document as Document).body.appendChild(el);
      
      // Remove after a short delay
      setTimeout(() => {
        (document as Document).body.removeChild(el);
      }, 100);
    }
  } catch (error) {
    console.warn(`Failed to preload font ${fontFamily}:`, error);
  }
}

/**
 * Preload an image
 */
async function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Higher-order component for lazy loading themes
 */
export function withLazyTheme<P extends { theme: PresetTheme }>(
  Component: React.ComponentType<P>,
  themeId: string
) {
  return (props: Omit<P, 'theme'>) => {
    return (
      <LazyThemeLoader
        themeId={themeId}
        fallback={<ThemeLoadingSpinner />}
      >
        {(theme, loading) => {
          if (loading || !theme) {
            return <ThemeLoadingSpinner />;
          }
          
          return <Component {...(props as P)} theme={theme} />;
        }}
      </LazyThemeLoader>
    );
  };
}