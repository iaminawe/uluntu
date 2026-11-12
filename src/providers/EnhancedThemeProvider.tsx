import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useSettingsContext } from '@/providers/SettingsProvider';
import { useAppearanceSettings } from '@/hooks/useEnhancedSettings';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface ThemeColors {
  primary: string;
  primary_hover: string;
  primary_light: string;
  secondary: string;
  secondary_hover: string;
  secondary_light: string;
  background: string;
  surface: string;
  text: string;
  text_muted: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

interface ThemeTypography {
  font_family: string;
  font_family_heading: string;
  font_size_base: string;
  font_size_sm: string;
  font_size_lg: string;
  font_size_xl: string;
  font_size_2xl: string;
  font_size_3xl: string;
  font_size_4xl: string;
  line_height_base: string;
  line_height_tight: string;
  line_height_loose: string;
}

interface ThemeSpacing {
  spacing_xs: string;
  spacing_sm: string;
  spacing_md: string;
  spacing_lg: string;
  spacing_xl: string;
  spacing_2xl: string;
  spacing_3xl: string;
  container_max_width: string;
  container_padding: string;
}

interface ThemeConfigurationUpdate {
  colors?: Partial<ThemeColors>;
  typography?: Partial<ThemeTypography>;
  spacing?: Partial<ThemeSpacing>;
  borders?: Partial<ThemeBorders>;
  shadows?: Partial<ThemeShadows>;
}

interface ThemeBorders {
  radius_sm: string;
  radius_md: string;
  radius_lg: string;
  radius_xl: string;
  radius_full: string;
  width_thin: string;
  width_medium: string;
  width_thick: string;
}

interface ThemeShadows {
  shadow_sm: string;
  shadow_md: string;
  shadow_lg: string;
  shadow_xl: string;
}

interface ThemeAsset {
  asset_type: 'logo' | 'logo_dark' | 'favicon' | 'og_image' | 'background' | 'pattern';
  file_url: string;
  alt_text?: string;
}

interface ThemeMetadata {
  site_name?: string;
  site_tagline?: string;
  site_description?: string;
  contact_email?: string;
  social_links?: Record<string, string>;
  custom_css?: string;
  custom_head_html?: string;
  custom_body_html?: string;
  meta_tags?: Record<string, string>;
}

interface Theme {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  is_active: boolean;
  is_default: boolean;
  is_preset: boolean;
  colors?: Partial<ThemeColors>;
  typography?: Partial<ThemeTypography>;
  spacing?: Partial<ThemeSpacing>;
  borders?: Partial<ThemeBorders>;
  shadows?: Partial<ThemeShadows>;
  assets?: ThemeAsset[];
  metadata?: Partial<ThemeMetadata>;
}

interface ThemeContextValue {
  // Current theme state
  theme: 'light' | 'dark';
  currentTheme: Theme | null;
  themes: Theme[];
  loading: boolean;
  
  // Backward compatibility
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  
  // Theme actions
  toggleTheme: () => void;
  setTheme: (themeId: string) => Promise<void>;
  
  // Live preview
  previewTheme: Theme | null;
  setPreviewTheme: (theme: Theme | null) => void;
  isPreviewMode: boolean;
  
  // Theme management
  createTheme: (theme: Partial<Theme>) => Promise<Theme | null>;
  updateTheme: (themeId: string, updates: Partial<Theme>) => Promise<boolean>;
  deleteTheme: (themeId: string) => Promise<boolean>;
  duplicateTheme: (themeId: string, newName: string) => Promise<Theme | null>;
  
  // Configuration
  updateThemeColors: (themeId: string, colors: Partial<ThemeColors>) => Promise<boolean>;
  updateThemeTypography: (themeId: string, typography: Partial<ThemeTypography>) => Promise<boolean>;
  updateThemeSpacing: (themeId: string, spacing: Partial<ThemeSpacing>) => Promise<boolean>;
  updateThemeBorders: (themeId: string, borders: Partial<ThemeBorders>) => Promise<boolean>;
  updateThemeShadows: (themeId: string, shadows: Partial<ThemeShadows>) => Promise<boolean>;
  updateThemeMetadata: (themeId: string, metadata: Partial<ThemeMetadata>) => Promise<boolean>;
  updateThemeConfigurations: (themeId: string, configs: ThemeConfigurationUpdate) => Promise<boolean>;
  
  // Assets
  uploadThemeAsset: (themeId: string, assetType: ThemeAsset['asset_type'], file: File) => Promise<boolean>;
  deleteThemeAsset: (themeId: string, assetType: ThemeAsset['asset_type']) => Promise<boolean>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const EnhancedThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading: settingsLoading } = useSettingsContext();
  const appearance = useAppearanceSettings();
  
  const [theme, setThemeMode] = useState<'light' | 'dark'>('light');
  const [themes, setThemes] = useState<Theme[]>([]);
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);

  // Computed values
  const isPreviewMode = previewTheme !== null;
  const activeTheme = previewTheme || currentTheme;

  // Load themes from database
  const loadThemes = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch all themes with their configurations
      const { data: themesData, error: themesError } = await supabase
        .from('themes')
        .select(`
          *,
          theme_configurations!theme_configurations_theme_id_fkey(config_type, config_data),
          theme_assets!theme_assets_theme_id_fkey(asset_type, file_url, alt_text),
          theme_metadata!theme_metadata_theme_id_fkey(*)
        `)
        .order('created_at', { ascending: false });

      if (themesError) {
        console.error('Error fetching themes:', themesError);
        // Check if it's a table not found error
        if (themesError.message?.includes('relation "themes" does not exist') || 
            themesError.message?.includes('relation "public.themes" does not exist')) {
          console.warn('Themes table does not exist. Please run database migrations.');
          toast.error('Theme system not initialized. Please run database migrations.');
          setThemes([]);
          setLoading(false);
          return;
        }
        throw themesError;
      }

      // Transform the data
      const transformedThemes = (themesData || []).map(theme => {
        const configurations = theme.theme_configurations || [];
        const assets = theme.theme_assets || [];
        const metadata = Array.isArray(theme.theme_metadata) && theme.theme_metadata.length > 0 
          ? theme.theme_metadata[0] 
          : {};

        // Extract configurations by type
        const getConfig = (type: string) => 
          configurations.find(c => c.config_type === type)?.config_data || {};

        return {
          id: theme.id,
          name: theme.name,
          slug: theme.slug,
          description: theme.description,
          is_active: theme.is_active,
          is_default: theme.is_default,
          is_preset: theme.is_preset,
          colors: getConfig('colors') as Partial<ThemeColors>,
          typography: getConfig('typography') as Partial<ThemeTypography>,
          spacing: getConfig('spacing') as Partial<ThemeSpacing>,
          borders: getConfig('borders') as Partial<ThemeBorders>,
          shadows: getConfig('shadows') as Partial<ThemeShadows>,
          assets: assets,
          metadata: metadata as Partial<ThemeMetadata>
        } as Theme;
      });

      setThemes(transformedThemes);
      
      // Set the active theme
      let active = transformedThemes.find(t => t.is_active);
      
      // If no active theme, try to activate the default theme
      if (!active && transformedThemes.length > 0) {
        const defaultTheme = transformedThemes.find(t => t.is_default) || transformedThemes[0];
        if (defaultTheme) {
          // Activate the default theme
          await supabase
            .from('themes')
            .update({ is_active: true })
            .eq('id', defaultTheme.id);
          
          defaultTheme.is_active = true;
          active = defaultTheme;
        }
      }
      
      if (active) {
        setCurrentTheme(active);
        applyThemeToDOM(active);
      }
    } catch (error) {
      console.error('Error loading themes:', error);
      toast.error('Failed to load themes');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize themes on mount
  useEffect(() => {
    loadThemes();
  }, [loadThemes]);
  
  // Helper function to apply theme to DOM
  const applyThemeToDOM = useCallback((theme: Theme) => {
    const root = document.documentElement;
    const colors = theme.colors || {};
    const typography = theme.typography || {};
    const spacing = theme.spacing || {};
    const borders = theme.borders || {};
    const shadows = theme.shadows || {};

    // Apply color variables
    Object.entries(colors).forEach(([key, value]) => {
      const cssVar = `--theme-color-${key.replace(/_/g, '-')}`;
      root.style.setProperty(cssVar, value);
    });

    // Apply typography variables
    Object.entries(typography).forEach(([key, value]) => {
      const cssVar = `--theme-${key.replace(/_/g, '-')}`;
      root.style.setProperty(cssVar, value);
    });
    
    // Load and apply Google Font
    if (typography && 'font_family' in typography && typography.font_family) {
      // Extract the primary font name (before the first comma)
      const primaryFont = typography.font_family.split(',')[0].trim().replace(/['"]/g, '');

      // Skip system fonts
      const systemFonts = ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif', 'serif', 'monospace'];
      if (systemFonts.includes(primaryFont)) {
        // Still set the CSS variable even for system fonts
        root.style.setProperty('--theme-font-family', typography.font_family);
        document.body.style.fontFamily = typography.font_family;
        return;
      }
      
      // Check if font link already exists
      const fontId = `google-font-${primaryFont.replace(/\s+/g, '-')}`;
      let fontLink = document.getElementById(fontId) as HTMLLinkElement;
      
      if (!fontLink) {
        // Create new font link
        fontLink = document.createElement('link');
        fontLink.id = fontId;
        fontLink.rel = 'stylesheet';
        fontLink.href = `https://fonts.googleapis.com/css2?family=${primaryFont.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
        document.head.appendChild(fontLink);

        // Add load event listener to ensure font is applied after loading
        fontLink.addEventListener('load', async () => {
          if (typography.font_family) {
            document.body.style.fontFamily = typography.font_family;
          }
          
          // Use Font Loading API to ensure font is ready
          if ('fonts' in document) {
            try {
              await document.fonts.load(`16px ${primaryFont}`);
            } catch (error) {
              // Error loading font, non-critical
            }
          }
          
          // Force re-render by triggering a style recalculation
          document.body.offsetHeight;
        });
      }
      
      // Apply font to body and CSS variable
      document.body.style.fontFamily = typography.font_family;
      root.style.setProperty('--theme-font-family', typography.font_family);

      // Also set heading font if different
      if ('font_family_heading' in typography && typography.font_family_heading && typography.font_family_heading !== typography.font_family) {
        const headingFont = typography.font_family_heading.split(',')[0].trim().replace(/['"]/g, '');
        
        // Skip system fonts for headings too
        if (!systemFonts.includes(headingFont)) {
          const headingFontId = `google-font-${headingFont.replace(/\s+/g, '-')}`;
          let headingFontLink = document.getElementById(headingFontId) as HTMLLinkElement;
          
          if (!headingFontLink) {
            headingFontLink = document.createElement('link');
            headingFontLink.id = headingFontId;
            headingFontLink.rel = 'stylesheet';
            headingFontLink.href = `https://fonts.googleapis.com/css2?family=${headingFont.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
            document.head.appendChild(headingFontLink);
          }
        }
        
        root.style.setProperty('--theme-font-family-heading', typography.font_family_heading);
      }
    }

    // Apply spacing variables
    Object.entries(spacing).forEach(([key, value]) => {
      const cssVar = `--theme-${key.replace(/_/g, '-')}`;
      root.style.setProperty(cssVar, value);
    });

    // Apply border variables
    Object.entries(borders).forEach(([key, value]) => {
      const cssVar = `--theme-border-${key.replace(/_/g, '-')}`;
      root.style.setProperty(cssVar, value);
    });

    // Apply shadow variables
    Object.entries(shadows).forEach(([key, value]) => {
      const cssVar = `--theme-${key.replace(/_/g, '-')}`;
      root.style.setProperty(cssVar, value);
    });

    // Apply custom CSS if any
    if (theme.metadata?.custom_css) {
      const styleElement = document.getElementById('theme-custom-css') || document.createElement('style');
      styleElement.id = 'theme-custom-css';
      styleElement.textContent = theme.metadata.custom_css;
      if (!styleElement.parentNode) {
        document.head.appendChild(styleElement);
      }
    }
  }, []);

  // Apply theme CSS variables
  useEffect(() => {
    if (!activeTheme) return;
    applyThemeToDOM(activeTheme);
  }, [activeTheme, applyThemeToDOM]);

  // Initialize theme mode (light/dark)
  useEffect(() => {
    if (settingsLoading) return;
    
    const savedTheme = localStorage.getItem('theme');
    const settingsDarkMode = appearance.darkMode;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialTheme = savedTheme || 
      (settingsDarkMode ? 'dark' : null) || 
      (systemPrefersDark ? 'dark' : 'light');
    
    setThemeMode(initialTheme as 'light' | 'dark');
    
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settingsLoading, appearance.darkMode]);

  // Theme management functions
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeMode(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const setTheme = useCallback(async (themeId: string): Promise<void> => {
    try {
      // Activate the theme in the database
      const { error } = await supabase
        .from('themes')
        .update({ is_active: true })
        .eq('id', themeId);

      if (error) throw error;

      // Reload themes to get the updated state
      await loadThemes();
      
      toast.success('Theme activated successfully');
    } catch (error) {
      console.error('Error setting theme:', error);
      toast.error('Failed to activate theme');
    }
  }, [loadThemes]);

  const createTheme = useCallback(async (theme: Partial<Theme>): Promise<Theme | null> => {
    try {
      const { data, error } = await supabase
        .from('themes')
        .insert({
          name: theme.name || 'New Theme',
          slug: theme.slug || `theme-${Date.now()}`,
          description: theme.description,
          is_active: false,
          is_default: false,
          is_preset: false
        })
        .select()
        .single();

      if (error) throw error;

      // Reload themes
      await loadThemes();
      
      toast.success('Theme created successfully');
      return data;
    } catch (error) {
      console.error('Error creating theme:', error);
      toast.error('Failed to create theme');
      return null;
    }
  }, [loadThemes]);

  const updateTheme = useCallback(async (themeId: string, updates: Partial<Theme>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('themes')
        .update({
          name: updates.name,
          slug: updates.slug,
          description: updates.description
        })
        .eq('id', themeId);

      if (error) {
        console.error('Supabase error updating theme:', error);
        if (error.code === '42501') {
          console.error('Permission denied - user may not have admin role');
          toast.error('Permission denied. Please ensure you have admin privileges.');
        }
        throw error;
      }

      await loadThemes();
      toast.success('Theme updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating theme:', error);
      toast.error('Failed to update theme');
      return false;
    }
  }, [loadThemes]);

  const deleteTheme = useCallback(async (themeId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('themes')
        .delete()
        .eq('id', themeId)
        .eq('is_preset', false); // Prevent deletion of preset themes

      if (error) throw error;

      await loadThemes();
      toast.success('Theme deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting theme:', error);
      toast.error('Failed to delete theme');
      return false;
    }
  }, [loadThemes]);

  const duplicateTheme = useCallback(async (themeId: string, newName: string): Promise<Theme | null> => {
    try {
      const sourcetheme = themes.find(t => t.id === themeId);
      if (!sourcetheme) throw new Error('Theme not found');

      // Create new theme
      const newTheme = await createTheme({
        name: newName,
        slug: `${sourcetheme.slug}-copy-${Date.now()}`,
        description: `Copy of ${sourcetheme.name}`
      });

      if (!newTheme) return null;

      // Copy configurations
      const configTypes = ['colors', 'typography', 'spacing', 'borders', 'shadows'] as const;
      for (const configType of configTypes) {
        if (sourcetheme[configType]) {
          await supabase
            .from('theme_configurations')
            .insert({
              theme_id: newTheme.id,
              config_type: configType,
              config_data: sourcetheme[configType]
            });
        }
      }

      // Copy metadata
      if (sourcetheme.metadata) {
        await supabase
          .from('theme_metadata')
          .insert({
            theme_id: newTheme.id,
            ...sourcetheme.metadata
          });
      }

      await loadThemes();
      return newTheme;
    } catch (error) {
      console.error('Error duplicating theme:', error);
      toast.error('Failed to duplicate theme');
      return null;
    }
  }, [themes, createTheme, loadThemes]);

  // Configuration update functions
  const updateThemeColors = useCallback(async (themeId: string, colors: Partial<ThemeColors>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('theme_configurations')
        .upsert({
          theme_id: themeId,
          config_type: 'colors',
          config_data: colors
        }, {
          onConflict: 'theme_id,config_type'
        });

      if (error) {
        console.error('Supabase error updating theme colors:', error);
        if (error.code === '42501') {
          console.error('Permission denied - user may not have admin role');
          toast.error('Permission denied. Please ensure you have admin privileges.');
        }
        throw error;
      }

      await loadThemes();
      return true;
    } catch (error) {
      console.error('Error updating theme colors:', error);
      toast.error('Failed to update theme colors');
      return false;
    }
  }, [loadThemes]);

  const updateThemeTypography = useCallback(async (themeId: string, typography: Partial<ThemeTypography>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('theme_configurations')
        .upsert({
          theme_id: themeId,
          config_type: 'typography',
          config_data: typography
        }, {
          onConflict: 'theme_id,config_type'
        });

      if (error) throw error;

      await loadThemes();
      return true;
    } catch (error) {
      console.error('Error updating theme typography:', error);
      toast.error('Failed to update theme typography');
      return false;
    }
  }, [loadThemes]);

  const updateThemeSpacing = useCallback(async (themeId: string, spacing: Partial<ThemeSpacing>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('theme_configurations')
        .upsert({
          theme_id: themeId,
          config_type: 'spacing',
          config_data: spacing
        }, {
          onConflict: 'theme_id,config_type'
        });

      if (error) throw error;

      await loadThemes();
      return true;
    } catch (error) {
      console.error('Error updating theme spacing:', error);
      toast.error('Failed to update theme spacing');
      return false;
    }
  }, [loadThemes]);

  const updateThemeBorders = useCallback(async (themeId: string, borders: Partial<ThemeBorders>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('theme_configurations')
        .upsert({
          theme_id: themeId,
          config_type: 'borders',
          config_data: borders
        }, {
          onConflict: 'theme_id,config_type'
        });

      if (error) throw error;

      await loadThemes();
      return true;
    } catch (error) {
      console.error('Error updating theme borders:', error);
      toast.error('Failed to update theme borders');
      return false;
    }
  }, [loadThemes]);

  const updateThemeShadows = useCallback(async (themeId: string, shadows: Partial<ThemeShadows>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('theme_configurations')
        .upsert({
          theme_id: themeId,
          config_type: 'shadows',
          config_data: shadows
        }, {
          onConflict: 'theme_id,config_type'
        });

      if (error) throw error;

      await loadThemes();
      return true;
    } catch (error) {
      console.error('Error updating theme shadows:', error);
      toast.error('Failed to update theme shadows');
      return false;
    }
  }, [loadThemes]);

  // Saves several configuration types in one upsert and reloads once, instead
  // of one upsert and one full reload per type.
  const updateThemeConfigurations = useCallback(async (themeId: string, configs: ThemeConfigurationUpdate): Promise<boolean> => {
    const rows = Object.entries(configs)
      .filter(([, data]) => data !== undefined)
      .map(([configType, data]) => ({ theme_id: themeId, config_type: configType, config_data: data }));
    if (rows.length === 0) return true;

    try {
      const { error } = await supabase
        .from('theme_configurations')
        .upsert(rows as any, { onConflict: 'theme_id,config_type' });

      if (error) {
        if (error.code === '42501') {
          toast.error('Permission denied. Please ensure you have admin privileges.');
        }
        throw error;
      }

      await loadThemes();
      return true;
    } catch (error) {
      console.error('Error updating theme configuration:', error);
      return false;
    }
  }, [loadThemes]);

  const updateThemeMetadata = useCallback(async (themeId: string, metadata: Partial<ThemeMetadata>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('theme_metadata')
        .upsert({
          theme_id: themeId,
          ...metadata
        }, {
          onConflict: 'theme_id'
        });

      if (error) throw error;

      await loadThemes();
      return true;
    } catch (error) {
      console.error('Error updating theme metadata:', error);
      toast.error('Failed to update theme metadata');
      return false;
    }
  }, [loadThemes]);

  // Asset management functions
  const uploadThemeAsset = useCallback(async (themeId: string, assetType: ThemeAsset['asset_type'], file: File): Promise<boolean> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${themeId}/${assetType}.${fileExt}`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('theme-assets')
        .upload(fileName, file, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('theme-assets')
        .getPublicUrl(fileName);

      // Save to database
      const { error: dbError } = await supabase
        .from('theme_assets')
        .upsert({
          theme_id: themeId,
          asset_type: assetType,
          file_path: fileName,
          file_url: publicUrl,
          file_size: file.size,
          mime_type: file.type
        }, {
          onConflict: 'theme_id,asset_type'
        });

      if (dbError) throw dbError;

      await loadThemes();
      toast.success('Asset uploaded successfully');
      return true;
    } catch (error) {
      console.error('Error uploading theme asset:', error);
      toast.error('Failed to upload asset');
      return false;
    }
  }, [loadThemes]);

  const deleteThemeAsset = useCallback(async (themeId: string, assetType: ThemeAsset['asset_type']): Promise<boolean> => {
    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from('theme_assets')
        .delete()
        .eq('theme_id', themeId)
        .eq('asset_type', assetType);

      if (dbError) throw dbError;

      await loadThemes();
      toast.success('Asset deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting theme asset:', error);
      toast.error('Failed to delete asset');
      return false;
    }
  }, [loadThemes]);

  const value: ThemeContextValue = {
    theme,
    currentTheme,
    themes,
    loading,
    // Backward compatibility
    primaryColor: activeTheme?.colors?.primary || '#F97316',
    secondaryColor: activeTheme?.colors?.secondary || '#1F2937',
    accentColor: activeTheme?.colors?.info || '#3B82F6',
    toggleTheme,
    setTheme,
    previewTheme,
    setPreviewTheme,
    isPreviewMode,
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
    updateThemeConfigurations,
    uploadThemeAsset,
    deleteThemeAsset
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};