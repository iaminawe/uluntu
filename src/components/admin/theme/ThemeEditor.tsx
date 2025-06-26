import React, { useState, useEffect, useCallback } from 'react';
import { 
  Palette, 
  Type, 
  Image, 
  Layout, 
  Save, 
  RefreshCw,
  Eye,
  Download,
  Upload,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import ColorSchemeEditor from './ColorSchemeEditor';
import FontSelector from './FontSelector';
import ImageUploader from './ImageUploader';
import PresetThemes from './PresetThemes';
import ThemeManager from './ThemeManager';
import ThemePreview from './ThemePreview';
import { Theme } from './types';
import { PresetTheme } from '@/types/theme';
import { useTheme } from '@/providers/EnhancedThemeProvider';
import { useAdminSettings } from '@/hooks/useSettings';
import type { UpdateSettingRequest } from '@/types/settings';
import { toast } from 'react-hot-toast';

interface ThemeEditorProps {
  settings: any[];
  onRefresh: () => void;
}

const defaultTheme: Theme = {
  name: 'Custom Theme',
  colors: {
    primary: '#F97316',
    secondary: '#64748B',
    accent: '#FB923C',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#1E293B',
    border: '#E2E8F0',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6'
  },
  typography: {
    fontFamily: 'Inter',
    fontFallback: 'system-ui, -apple-system, sans-serif',
    fontSize: {
      base: '16px',
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px'
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    }
  },
  spacing: {
    unit: 4,
    scale: {
      xs: 1,
      sm: 2,
      md: 4,
      lg: 8,
      xl: 12,
      '2xl': 16,
      '3xl': 20
    }
  },
  layout: {
    borderRadius: {
      none: '0px',
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      full: '9999px'
    },
    shadow: {
      none: 'none',
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
    },
    containerWidth: '1280px',
    sidebarWidth: '280px'
  },
  images: {
    logo: null,
    favicon: null,
    backgroundImage: null,
    backgroundPattern: null
  },
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    easing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out'
    }
  },
  darkMode: false,
  customCSS: '',
  version: '1.0.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export default function ThemeEditor({ settings, onRefresh }: ThemeEditorProps) {
  const { updateSetting } = useAdminSettings();
  const {
    themes,
    currentTheme: activeTheme,
    previewTheme,
    isPreviewMode,
    loading: themeLoading,
    setTheme,
    setPreviewTheme,
    createTheme,
    updateTheme,
    deleteTheme,
    duplicateTheme,
    updateThemeColors,
    updateThemeTypography,
    updateThemeSpacing,
    updateThemeBorders,
    updateThemeShadows,
    updateThemeMetadata,
    uploadThemeAsset
  } = useTheme();
  
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'images' | 'layout' | 'presets' | 'preview'>('colors');
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultTheme);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedThemes, setSavedThemes] = useState<Theme[]>([]);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Initialize theme from active theme
  useEffect(() => {
    if (activeTheme) {
      // Convert database theme format to local theme format
      setCurrentTheme({
        ...defaultTheme,
        name: activeTheme.name,
        colors: activeTheme.colors || defaultTheme.colors,
        typography: {
          fontFamily: activeTheme.typography?.font_family?.split(',')[0]?.trim() || defaultTheme.typography.fontFamily,
          fontFallback: activeTheme.typography?.font_family || defaultTheme.typography.fontFallback,
          fontSize: {
            base: activeTheme.typography?.font_size_base || defaultTheme.typography.fontSize.base,
            xs: activeTheme.typography?.font_size_sm || defaultTheme.typography.fontSize.xs,
            sm: activeTheme.typography?.font_size_sm || defaultTheme.typography.fontSize.sm,
            md: activeTheme.typography?.font_size_base || defaultTheme.typography.fontSize.md,
            lg: activeTheme.typography?.font_size_lg || defaultTheme.typography.fontSize.lg,
            xl: activeTheme.typography?.font_size_xl || defaultTheme.typography.fontSize.xl,
            '2xl': activeTheme.typography?.font_size_2xl || defaultTheme.typography.fontSize['2xl'],
            '3xl': activeTheme.typography?.font_size_3xl || defaultTheme.typography.fontSize['3xl'],
            '4xl': activeTheme.typography?.font_size_4xl || defaultTheme.typography.fontSize['4xl']
          },
          fontWeight: defaultTheme.typography.fontWeight,
          lineHeight: {
            tight: parseFloat(activeTheme.typography?.line_height_tight || '1.25'),
            normal: parseFloat(activeTheme.typography?.line_height_base || '1.5'),
            relaxed: parseFloat(activeTheme.typography?.line_height_loose || '1.75')
          }
        },
        spacing: activeTheme.spacing ? {
          unit: 4,
          scale: {
            xs: parseInt(activeTheme.spacing.spacing_xs) / 4,
            sm: parseInt(activeTheme.spacing.spacing_sm) / 4,
            md: parseInt(activeTheme.spacing.spacing_md) / 4,
            lg: parseInt(activeTheme.spacing.spacing_lg) / 4,
            xl: parseInt(activeTheme.spacing.spacing_xl) / 4,
            '2xl': parseInt(activeTheme.spacing.spacing_2xl) / 4,
            '3xl': parseInt(activeTheme.spacing.spacing_3xl) / 4
          }
        } : defaultTheme.spacing,
        layout: {
          borderRadius: activeTheme.borders ? {
            none: '0px',
            sm: activeTheme.borders.radius_sm,
            md: activeTheme.borders.radius_md,
            lg: activeTheme.borders.radius_lg,
            xl: activeTheme.borders.radius_xl,
            full: activeTheme.borders.radius_full
          } : defaultTheme.layout.borderRadius,
          shadow: activeTheme.shadows ? {
            none: 'none',
            sm: activeTheme.shadows.shadow_sm,
            md: activeTheme.shadows.shadow_md,
            lg: activeTheme.shadows.shadow_lg,
            xl: activeTheme.shadows.shadow_xl
          } : defaultTheme.layout.shadow,
          containerWidth: activeTheme.spacing?.container_max_width || defaultTheme.layout.containerWidth,
          sidebarWidth: defaultTheme.layout.sidebarWidth
        },
        darkMode: activeTheme.slug === 'dark-mode',
        updatedAt: new Date().toISOString()
      });
      setIsDarkMode(activeTheme.slug === 'dark-mode');
    }
  }, [activeTheme]);

  const handleThemeChange = useCallback((updates: Partial<Theme>) => {
    setCurrentTheme(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString()
    }));
    setHasChanges(true);
  }, []);

  const handleColorChange = useCallback((colors: Partial<Theme['colors']>) => {
    handleThemeChange({
      colors: { ...currentTheme.colors, ...colors }
    });
  }, [currentTheme.colors, handleThemeChange]);

  const handleTypographyChange = useCallback((typography: Partial<Theme['typography']>) => {
    handleThemeChange({
      typography: { ...currentTheme.typography, ...typography }
    });
  }, [currentTheme.typography, handleThemeChange]);

  const handleLayoutChange = useCallback((layout: Partial<Theme['layout']>) => {
    handleThemeChange({
      layout: { ...currentTheme.layout, ...layout }
    });
  }, [currentTheme.layout, handleThemeChange]);

  const handleImagesChange = useCallback((images: Partial<Theme['images']>) => {
    handleThemeChange({
      images: { ...currentTheme.images, ...images }
    });
  }, [currentTheme.images, handleThemeChange]);

  const handlePresetSelect = useCallback(async (preset: PresetTheme) => {
    // Find the preset theme in the database
    const dbTheme = themes.find(t => t.slug === preset.slug);
    
    if (dbTheme) {
      // Activate the preset theme
      await setTheme(dbTheme.id);
      toast.success(`Activated theme: ${preset.name}`);
      
      // Update local state to match
      setCurrentTheme({
        ...defaultTheme,
        name: preset.name,
        colors: dbTheme.colors || defaultTheme.colors,
        typography: {
          fontFamily: dbTheme.typography?.font_family?.split(',')[0]?.trim() || defaultTheme.typography.fontFamily,
          fontFallback: dbTheme.typography?.font_family || defaultTheme.typography.fontFallback,
          fontSize: {
            base: dbTheme.typography?.font_size_base || defaultTheme.typography.fontSize.base,
            xs: dbTheme.typography?.font_size_sm || defaultTheme.typography.fontSize.xs,
            sm: dbTheme.typography?.font_size_sm || defaultTheme.typography.fontSize.sm,
            md: dbTheme.typography?.font_size_base || defaultTheme.typography.fontSize.md,
            lg: dbTheme.typography?.font_size_lg || defaultTheme.typography.fontSize.lg,
            xl: dbTheme.typography?.font_size_xl || defaultTheme.typography.fontSize.xl,
            '2xl': dbTheme.typography?.font_size_2xl || defaultTheme.typography.fontSize['2xl'],
            '3xl': dbTheme.typography?.font_size_3xl || defaultTheme.typography.fontSize['3xl'],
            '4xl': dbTheme.typography?.font_size_4xl || defaultTheme.typography.fontSize['4xl']
          },
          fontWeight: defaultTheme.typography.fontWeight,
          lineHeight: {
            tight: parseFloat(dbTheme.typography?.line_height_tight || '1.25'),
            normal: parseFloat(dbTheme.typography?.line_height_base || '1.5'),
            relaxed: parseFloat(dbTheme.typography?.line_height_loose || '1.75')
          }
        },
        layout: {
          borderRadius: dbTheme.borders ? {
            none: '0px',
            sm: dbTheme.borders.radius_sm,
            md: dbTheme.borders.radius_md,
            lg: dbTheme.borders.radius_lg,
            xl: dbTheme.borders.radius_xl,
            full: dbTheme.borders.radius_full
          } : defaultTheme.layout.borderRadius,
          shadow: dbTheme.shadows ? {
            none: 'none',
            sm: dbTheme.shadows.shadow_sm,
            md: dbTheme.shadows.shadow_md,
            lg: dbTheme.shadows.shadow_lg,
            xl: dbTheme.shadows.shadow_xl
          } : defaultTheme.layout.shadow,
          containerWidth: dbTheme.spacing?.container_max_width || defaultTheme.layout.containerWidth,
          sidebarWidth: defaultTheme.layout.sidebarWidth
        },
        spacing: dbTheme.spacing ? {
          unit: 4,
          scale: {
            xs: parseInt(dbTheme.spacing.spacing_xs) / 4,
            sm: parseInt(dbTheme.spacing.spacing_sm) / 4,
            md: parseInt(dbTheme.spacing.spacing_md) / 4,
            lg: parseInt(dbTheme.spacing.spacing_lg) / 4,
            xl: parseInt(dbTheme.spacing.spacing_xl) / 4,
            '2xl': parseInt(dbTheme.spacing.spacing_2xl) / 4,
            '3xl': parseInt(dbTheme.spacing.spacing_3xl) / 4
          }
        } : defaultTheme.spacing,
        darkMode: preset.name.toLowerCase().includes('dark'),
        updatedAt: new Date().toISOString()
      });
      setHasChanges(false); // No changes needed since we just activated a preset
    } else {
      // If not found in database, just update local state for editing
      toast.info('Preset theme not found in database. You can customize and save it.');
      
      const { colors, typography, spacing, borders, shadows } = preset.configurations;
      
      setCurrentTheme({
        ...defaultTheme,
        name: preset.name,
        colors: {
          ...defaultTheme.colors,
          ...colors
        },
        typography: {
          fontFamily: typography.font_family.split(',')[0].trim(),
          fontFallback: typography.font_family,
          fontSize: {
            base: typography.font_size_base,
            xs: typography.font_size_sm,
            sm: typography.font_size_sm,
            md: typography.font_size_base,
            lg: typography.font_size_lg,
            xl: typography.font_size_xl,
            '2xl': typography.font_size_2xl,
            '3xl': typography.font_size_3xl,
            '4xl': typography.font_size_4xl
          },
          fontWeight: {
            light: 300,
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700
          },
          lineHeight: {
            tight: parseFloat(typography.line_height_tight),
            normal: parseFloat(typography.line_height_base),
            relaxed: parseFloat(typography.line_height_loose)
          }
        },
        layout: {
          borderRadius: {
            none: borders.radius_sm,
            sm: borders.radius_sm,
            md: borders.radius_md,
            lg: borders.radius_lg,
            xl: borders.radius_xl,
            full: borders.radius_full
          },
          shadow: {
            none: 'none',
            sm: shadows.shadow_sm,
            md: shadows.shadow_md,
            lg: shadows.shadow_lg,
            xl: shadows.shadow_xl
          },
          containerWidth: spacing.container_max_width,
          sidebarWidth: '256px'
        },
        spacing: {
          unit: 4,
          scale: {
            xs: parseInt(spacing.spacing_xs) / 4,
            sm: parseInt(spacing.spacing_sm) / 4,
            md: parseInt(spacing.spacing_md) / 4,
            lg: parseInt(spacing.spacing_lg) / 4,
            xl: parseInt(spacing.spacing_xl) / 4,
            '2xl': parseInt(spacing.spacing_2xl) / 4,
            '3xl': parseInt(spacing.spacing_3xl) / 4
          }
        },
        darkMode: preset.name.toLowerCase().includes('dark'),
        updatedAt: new Date().toISOString()
      });
      setHasChanges(true);
    }
  }, [themes, setTheme]);

  const handleSaveTheme = useCallback(async () => {
    if (!activeTheme) {
      toast.error('No active theme selected. Please select a theme first.');
      return;
    }
    
    setLoading(true);
    try {
      // Convert the local theme format to the database format
      const success = await updateTheme(activeTheme.id, {
        name: currentTheme.name
      });
      
      if (success) {
        // Update colors
        await updateThemeColors(activeTheme.id, currentTheme.colors);
        
        // Update typography
        await updateThemeTypography(activeTheme.id, {
          font_family: `${currentTheme.typography.fontFamily}, ${currentTheme.typography.fontFallback}`,
          font_family_heading: `${currentTheme.typography.fontFamily}, ${currentTheme.typography.fontFallback}`,
          font_size_base: currentTheme.typography.fontSize.base,
          font_size_sm: currentTheme.typography.fontSize.sm,
          font_size_lg: currentTheme.typography.fontSize.lg,
          font_size_xl: currentTheme.typography.fontSize.xl,
          font_size_2xl: currentTheme.typography.fontSize['2xl'],
          font_size_3xl: currentTheme.typography.fontSize['3xl'],
          font_size_4xl: currentTheme.typography.fontSize['4xl'],
          line_height_base: currentTheme.typography.lineHeight.normal.toString(),
          line_height_tight: currentTheme.typography.lineHeight.tight.toString(),
          line_height_loose: currentTheme.typography.lineHeight.relaxed.toString()
        });
        
        // Update spacing
        await updateThemeSpacing(activeTheme.id, {
          spacing_xs: `${currentTheme.spacing.scale.xs * currentTheme.spacing.unit}px`,
          spacing_sm: `${currentTheme.spacing.scale.sm * currentTheme.spacing.unit}px`,
          spacing_md: `${currentTheme.spacing.scale.md * currentTheme.spacing.unit}px`,
          spacing_lg: `${currentTheme.spacing.scale.lg * currentTheme.spacing.unit}px`,
          spacing_xl: `${currentTheme.spacing.scale.xl * currentTheme.spacing.unit}px`,
          spacing_2xl: `${currentTheme.spacing.scale['2xl'] * currentTheme.spacing.unit}px`,
          spacing_3xl: `${currentTheme.spacing.scale['3xl'] * currentTheme.spacing.unit}px`,
          container_max_width: currentTheme.layout.containerWidth,
          container_padding: '1rem'
        });
        
        // Update borders
        await updateThemeBorders(activeTheme.id, {
          radius_sm: currentTheme.layout.borderRadius.sm,
          radius_md: currentTheme.layout.borderRadius.md,
          radius_lg: currentTheme.layout.borderRadius.lg,
          radius_xl: currentTheme.layout.borderRadius.xl,
          radius_full: currentTheme.layout.borderRadius.full,
          width_thin: '1px',
          width_medium: '2px',
          width_thick: '4px'
        });
        
        // Update shadows
        await updateThemeShadows(activeTheme.id, {
          shadow_sm: currentTheme.layout.shadow.sm,
          shadow_md: currentTheme.layout.shadow.md,
          shadow_lg: currentTheme.layout.shadow.lg,
          shadow_xl: currentTheme.layout.shadow.xl
        });
        
        setHasChanges(false);
        toast.success('Theme saved successfully');
      }
    } catch (error) {
      console.error('Failed to save theme:', error);
      toast.error('Failed to save theme');
    } finally {
      setLoading(false);
    }
  }, [activeTheme, currentTheme, updateTheme, updateThemeColors, updateThemeTypography, updateThemeSpacing, updateThemeBorders, updateThemeShadows]);

  const handleResetTheme = useCallback(() => {
    setCurrentTheme(defaultTheme);
    setHasChanges(false);
  }, []);

  const handleExportTheme = useCallback(() => {
    const dataStr = JSON.stringify(currentTheme, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `theme-${currentTheme.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [currentTheme]);

  const handleImportTheme = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedTheme = JSON.parse(e.target?.result as string);
        setCurrentTheme({
          ...defaultTheme,
          ...importedTheme,
          updatedAt: new Date().toISOString()
        });
        setHasChanges(true);
      } catch (error) {
        console.error('Failed to import theme:', error);
        alert('Failed to import theme. Please check the file format.');
      }
    };
    reader.readAsText(file);
  }, []);

  const generateCSSVariables = (theme: Theme, darkMode: boolean) => {
    const colors = darkMode ? generateDarkModeColors(theme.colors) : theme.colors;
    
    return `
:root {
  /* Colors */
  --color-primary: ${colors.primary};
  --color-secondary: ${colors.secondary};
  --color-accent: ${colors.accent};
  --color-background: ${colors.background};
  --color-surface: ${colors.surface};
  --color-text: ${colors.text};
  --color-border: ${colors.border};
  --color-error: ${colors.error};
  --color-success: ${colors.success};
  --color-warning: ${colors.warning};
  --color-info: ${colors.info};
  
  /* Typography */
  --font-family: ${theme.typography.fontFamily}, ${theme.typography.fontFallback};
  --font-size-base: ${theme.typography.fontSize.base};
  --font-size-xs: ${theme.typography.fontSize.xs};
  --font-size-sm: ${theme.typography.fontSize.sm};
  --font-size-md: ${theme.typography.fontSize.md};
  --font-size-lg: ${theme.typography.fontSize.lg};
  --font-size-xl: ${theme.typography.fontSize.xl};
  --font-size-2xl: ${theme.typography.fontSize['2xl']};
  --font-size-3xl: ${theme.typography.fontSize['3xl']};
  --font-size-4xl: ${theme.typography.fontSize['4xl']};
  
  /* Font Weights */
  --font-weight-light: ${theme.typography.fontWeight.light};
  --font-weight-normal: ${theme.typography.fontWeight.normal};
  --font-weight-medium: ${theme.typography.fontWeight.medium};
  --font-weight-semibold: ${theme.typography.fontWeight.semibold};
  --font-weight-bold: ${theme.typography.fontWeight.bold};
  
  /* Line Heights */
  --line-height-tight: ${theme.typography.lineHeight.tight};
  --line-height-normal: ${theme.typography.lineHeight.normal};
  --line-height-relaxed: ${theme.typography.lineHeight.relaxed};
  
  /* Spacing */
  --spacing-unit: ${theme.spacing.unit}px;
  --spacing-xs: ${theme.spacing.unit * theme.spacing.scale.xs}px;
  --spacing-sm: ${theme.spacing.unit * theme.spacing.scale.sm}px;
  --spacing-md: ${theme.spacing.unit * theme.spacing.scale.md}px;
  --spacing-lg: ${theme.spacing.unit * theme.spacing.scale.lg}px;
  --spacing-xl: ${theme.spacing.unit * theme.spacing.scale.xl}px;
  --spacing-2xl: ${theme.spacing.unit * theme.spacing.scale['2xl']}px;
  --spacing-3xl: ${theme.spacing.unit * theme.spacing.scale['3xl']}px;
  
  /* Layout */
  --border-radius-none: ${theme.layout.borderRadius.none};
  --border-radius-sm: ${theme.layout.borderRadius.sm};
  --border-radius-md: ${theme.layout.borderRadius.md};
  --border-radius-lg: ${theme.layout.borderRadius.lg};
  --border-radius-xl: ${theme.layout.borderRadius.xl};
  --border-radius-full: ${theme.layout.borderRadius.full};
  
  /* Shadows */
  --shadow-none: ${theme.layout.shadow.none};
  --shadow-sm: ${theme.layout.shadow.sm};
  --shadow-md: ${theme.layout.shadow.md};
  --shadow-lg: ${theme.layout.shadow.lg};
  --shadow-xl: ${theme.layout.shadow.xl};
  
  /* Container */
  --container-width: ${theme.layout.containerWidth};
  --sidebar-width: ${theme.layout.sidebarWidth};
  
  /* Animations */
  --duration-fast: ${theme.animations.duration.fast};
  --duration-normal: ${theme.animations.duration.normal};
  --duration-slow: ${theme.animations.duration.slow};
  --easing-linear: ${theme.animations.easing.linear};
  --easing-ease: ${theme.animations.easing.ease};
  --easing-ease-in: ${theme.animations.easing.easeIn};
  --easing-ease-out: ${theme.animations.easing.easeOut};
  --easing-ease-in-out: ${theme.animations.easing.easeInOut};
}

${theme.customCSS}
    `.trim();
  };

  const generateDarkModeColors = (lightColors: Theme['colors']): Theme['colors'] => {
    // Simple dark mode transformation - can be made more sophisticated
    return {
      ...lightColors,
      background: '#0F172A',
      surface: '#1E293B',
      text: '#F1F5F9',
      border: '#334155'
    };
  };

  const tabs = [
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'images', label: 'Images & Logos', icon: Image },
    { id: 'layout', label: 'Layout', icon: Layout },
    { id: 'presets', label: 'Presets', icon: Monitor },
    { id: 'preview', label: 'Preview', icon: Eye }
  ];

  return (
    <div className="space-y-6">
      {/* Active Theme Selector */}
      {themes.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-900">Active Theme</p>
              <p className="text-lg font-semibold text-orange-800">
                {activeTheme ? activeTheme.name : 'No theme active'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={activeTheme?.id || ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setTheme(e.target.value);
                  }
                }}
                className="px-4 py-2 border border-orange-300 rounded-lg bg-white text-orange-800 font-medium focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select a theme</option>
                {themes.map(theme => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name} {theme.is_preset ? '(Preset)' : ''}
                  </option>
                ))}
              </select>
              <button
                onClick={async () => {
                  const newTheme = await createTheme({
                    name: 'Custom Theme ' + new Date().toLocaleString(),
                    slug: 'custom-theme-' + Date.now(),
                    description: 'A custom theme'
                  });
                  if (newTheme) {
                    await setTheme(newTheme.id);
                    toast.success('New theme created and activated');
                  }
                }}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                Create New Theme
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">Advanced Theme Editor</h3>
          <p className="text-sm text-gray-500 mt-1">
            Customize every aspect of your platform's appearance
          </p>
        </div>
        
        <div className="flex items-center flex-wrap gap-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'bg-gray-800 text-yellow-400' 
                : 'bg-gray-100 text-gray-600'
            }`}
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Import/Export */}
          <div className="flex items-center gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={handleImportTheme}
                className="hidden"
              />
              <div className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                <Upload className="h-5 w-5" />
              </div>
            </label>
            
            <button
              onClick={handleExportTheme}
              className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              title="Export Theme"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>

          {/* Save/Reset */}
          {hasChanges && (
            <>
              <button
                onClick={handleResetTheme}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-1 inline" />
                Reset
              </button>
              
              <button
                onClick={handleSaveTheme}
                disabled={loading}
                className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center transition-colors"
              >
                <Save className="h-4 w-4 mr-1" />
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-2 sm:px-1 border-b-2 font-medium text-sm flex items-center whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'colors' && (
          <ColorSchemeEditor
            colors={currentTheme.colors}
            onChange={handleColorChange}
            isDarkMode={isDarkMode}
          />
        )}
        
        {activeTab === 'typography' && (
          <FontSelector
            typography={currentTheme.typography}
            onChange={handleTypographyChange}
          />
        )}
        
        {activeTab === 'images' && (
          <ImageUploader
            images={currentTheme.images}
            onChange={handleImagesChange}
          />
        )}
        
        {activeTab === 'layout' && (
          <div className="space-y-6">
            {/* Layout controls would go here */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h4 className="font-medium text-gray-900 mb-4">Layout Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Border Radius */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Border Radius
                  </label>
                  <select
                    value={currentTheme.layout.borderRadius.md}
                    onChange={(e) => handleLayoutChange({
                      borderRadius: {
                        ...currentTheme.layout.borderRadius,
                        md: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="0px">None (0px)</option>
                    <option value="4px">Small (4px)</option>
                    <option value="8px">Medium (8px)</option>
                    <option value="12px">Large (12px)</option>
                    <option value="16px">Extra Large (16px)</option>
                  </select>
                </div>

                {/* Shadow Style */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Shadow
                  </label>
                  <select
                    value={currentTheme.layout.shadow.md}
                    onChange={(e) => handleLayoutChange({
                      shadow: {
                        ...currentTheme.layout.shadow,
                        md: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="none">None</option>
                    <option value="0 1px 2px 0 rgba(0, 0, 0, 0.05)">Small</option>
                    <option value="0 4px 6px -1px rgba(0, 0, 0, 0.1)">Medium</option>
                    <option value="0 10px 15px -3px rgba(0, 0, 0, 0.1)">Large</option>
                    <option value="0 20px 25px -5px rgba(0, 0, 0, 0.1)">Extra Large</option>
                  </select>
                </div>

                {/* Container Width */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Container Max Width
                  </label>
                  <input
                    type="text"
                    value={currentTheme.layout.containerWidth}
                    onChange={(e) => handleLayoutChange({
                      containerWidth: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="1280px"
                  />
                </div>

                {/* Sidebar Width */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sidebar Width
                  </label>
                  <input
                    type="text"
                    value={currentTheme.layout.sidebarWidth}
                    onChange={(e) => handleLayoutChange({
                      sidebarWidth: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="280px"
                  />
                </div>
              </div>
            </div>

            {/* Custom CSS */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h4 className="font-medium text-gray-900 mb-4">Custom CSS</h4>
              <textarea
                value={currentTheme.customCSS}
                onChange={(e) => handleThemeChange({ customCSS: e.target.value })}
                className="w-full h-64 px-3 py-2 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="/* Add your custom CSS here */"
              />
            </div>
          </div>
        )}
        
        {activeTab === 'presets' && (
          <PresetThemes
            onSelectPreset={handlePresetSelect}
            currentThemeName={currentTheme.name}
          />
        )}
        
        {activeTab === 'preview' && (
          <ThemePreview
            theme={currentTheme}
            isDarkMode={isDarkMode}
            device={previewDevice}
            onDeviceChange={setPreviewDevice}
          />
        )}
      </div>

      {/* Theme Manager */}
      <ThemeManager
        currentTheme={currentTheme}
        savedThemes={savedThemes}
        onSaveTheme={(theme) => {
          const newSavedThemes = [...savedThemes, theme];
          setSavedThemes(newSavedThemes);
          localStorage.setItem('saved_themes', JSON.stringify(newSavedThemes));
        }}
        onLoadTheme={(theme) => {
          setCurrentTheme(theme);
          setHasChanges(true);
        }}
        onDeleteTheme={(themeName) => {
          const newSavedThemes = savedThemes.filter(t => t.name !== themeName);
          setSavedThemes(newSavedThemes);
          localStorage.setItem('saved_themes', JSON.stringify(newSavedThemes));
        }}
      />
    </div>
  );
}