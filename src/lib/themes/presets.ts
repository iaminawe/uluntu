import type { PresetTheme } from '@/types/theme';

export const presetThemes: PresetTheme[] = [
  {
    name: 'Default Orange',
    slug: 'default-orange',
    description: 'The default Uluntu theme with vibrant orange accents',
    preview_url: '/themes/default-orange-preview.png',
    configurations: {
      colors: {
        primary: '#F97316',
        primary_hover: '#EA580C',
        primary_light: '#FED7AA',
        secondary: '#1F2937',
        secondary_hover: '#111827',
        secondary_light: '#4B5563',
        background: '#FFFFFF',
        surface: '#F9FAFB',
        text: '#111827',
        text_muted: '#6B7280',
        border: '#E5E7EB',
        error: '#EF4444',
        warning: '#F59E0B',
        success: '#10B981',
        info: '#3B82F6'
      },
      typography: {
        font_family: 'Inter, system-ui, -apple-system, sans-serif',
        font_family_heading: 'Inter, system-ui, -apple-system, sans-serif',
        font_size_base: '16px',
        font_size_sm: '14px',
        font_size_lg: '18px',
        font_size_xl: '20px',
        font_size_2xl: '24px',
        font_size_3xl: '30px',
        font_size_4xl: '36px',
        line_height_base: '1.5',
        line_height_tight: '1.25',
        line_height_loose: '1.75'
      },
      spacing: {
        spacing_xs: '0.25rem',
        spacing_sm: '0.5rem',
        spacing_md: '1rem',
        spacing_lg: '1.5rem',
        spacing_xl: '2rem',
        spacing_2xl: '3rem',
        spacing_3xl: '4rem',
        container_max_width: '1280px',
        container_padding: '1rem'
      },
      borders: {
        radius_sm: '0.125rem',
        radius_md: '0.375rem',
        radius_lg: '0.5rem',
        radius_xl: '0.75rem',
        radius_full: '9999px',
        width_thin: '1px',
        width_medium: '2px',
        width_thick: '4px'
      },
      shadows: {
        shadow_sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        shadow_md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        shadow_lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        shadow_xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }
    }
  },
  {
    name: 'Professional Blue',
    slug: 'professional-blue',
    description: 'A clean, professional theme with blue accents',
    preview_url: '/themes/professional-blue-preview.png',
    configurations: {
      colors: {
        primary: '#3B82F6',
        primary_hover: '#2563EB',
        primary_light: '#DBEAFE',
        secondary: '#1E293B',
        secondary_hover: '#0F172A',
        secondary_light: '#475569',
        background: '#FFFFFF',
        surface: '#F8FAFC',
        text: '#0F172A',
        text_muted: '#64748B',
        border: '#E2E8F0',
        error: '#EF4444',
        warning: '#F59E0B',
        success: '#10B981',
        info: '#06B6D4'
      },
      typography: {
        font_family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        font_family_heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        font_size_base: '16px',
        font_size_sm: '14px',
        font_size_lg: '18px',
        font_size_xl: '20px',
        font_size_2xl: '24px',
        font_size_3xl: '30px',
        font_size_4xl: '36px',
        line_height_base: '1.5',
        line_height_tight: '1.25',
        line_height_loose: '1.75'
      },
      spacing: {
        spacing_xs: '0.25rem',
        spacing_sm: '0.5rem',
        spacing_md: '1rem',
        spacing_lg: '1.5rem',
        spacing_xl: '2rem',
        spacing_2xl: '3rem',
        spacing_3xl: '4rem',
        container_max_width: '1280px',
        container_padding: '1rem'
      },
      borders: {
        radius_sm: '0.25rem',
        radius_md: '0.5rem',
        radius_lg: '0.75rem',
        radius_xl: '1rem',
        radius_full: '9999px',
        width_thin: '1px',
        width_medium: '2px',
        width_thick: '4px'
      },
      shadows: {
        shadow_sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        shadow_md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        shadow_lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        shadow_xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }
    }
  },
  {
    name: 'Modern Purple',
    slug: 'modern-purple',
    description: 'A modern, vibrant theme with purple gradients',
    preview_url: '/themes/modern-purple-preview.png',
    configurations: {
      colors: {
        primary: '#8B5CF6',
        primary_hover: '#7C3AED',
        primary_light: '#EDE9FE',
        secondary: '#1E1B4B',
        secondary_hover: '#0F0A3C',
        secondary_light: '#4C1D95',
        background: '#FAFAFA',
        surface: '#FFFFFF',
        text: '#111827',
        text_muted: '#6B7280',
        border: '#E5E7EB',
        error: '#DC2626',
        warning: '#F59E0B',
        success: '#059669',
        info: '#0891B2'
      },
      typography: {
        font_family: '"Plus Jakarta Sans", Inter, sans-serif',
        font_family_heading: '"Plus Jakarta Sans", Inter, sans-serif',
        font_size_base: '16px',
        font_size_sm: '14px',
        font_size_lg: '18px',
        font_size_xl: '20px',
        font_size_2xl: '24px',
        font_size_3xl: '32px',
        font_size_4xl: '40px',
        line_height_base: '1.6',
        line_height_tight: '1.2',
        line_height_loose: '1.8'
      },
      spacing: {
        spacing_xs: '0.25rem',
        spacing_sm: '0.5rem',
        spacing_md: '1rem',
        spacing_lg: '1.5rem',
        spacing_xl: '2rem',
        spacing_2xl: '3rem',
        spacing_3xl: '4rem',
        container_max_width: '1280px',
        container_padding: '1.25rem'
      },
      borders: {
        radius_sm: '0.375rem',
        radius_md: '0.75rem',
        radius_lg: '1rem',
        radius_xl: '1.5rem',
        radius_full: '9999px',
        width_thin: '1px',
        width_medium: '2px',
        width_thick: '3px'
      },
      shadows: {
        shadow_sm: '0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        shadow_md: '0 6px 10px -2px rgba(0, 0, 0, 0.08)',
        shadow_lg: '0 12px 20px -4px rgba(0, 0, 0, 0.1)',
        shadow_xl: '0 24px 40px -8px rgba(0, 0, 0, 0.12)'
      }
    }
  },
  {
    name: 'Minimalist Green',
    slug: 'minimalist-green',
    description: 'A clean, eco-friendly theme with green accents',
    preview_url: '/themes/minimalist-green-preview.png',
    configurations: {
      colors: {
        primary: '#10B981',
        primary_hover: '#059669',
        primary_light: '#D1FAE5',
        secondary: '#064E3B',
        secondary_hover: '#022C22',
        secondary_light: '#047857',
        background: '#FFFFFF',
        surface: '#F9FAFB',
        text: '#111827',
        text_muted: '#6B7280',
        border: '#E5E7EB',
        error: '#EF4444',
        warning: '#F59E0B',
        success: '#10B981',
        info: '#3B82F6'
      },
      typography: {
        font_family: 'Helvetica, Arial, sans-serif',
        font_family_heading: 'Georgia, serif',
        font_size_base: '16px',
        font_size_sm: '14px',
        font_size_lg: '18px',
        font_size_xl: '20px',
        font_size_2xl: '24px',
        font_size_3xl: '30px',
        font_size_4xl: '36px',
        line_height_base: '1.625',
        line_height_tight: '1.25',
        line_height_loose: '2'
      },
      spacing: {
        spacing_xs: '0.25rem',
        spacing_sm: '0.5rem',
        spacing_md: '1rem',
        spacing_lg: '1.5rem',
        spacing_xl: '2rem',
        spacing_2xl: '3rem',
        spacing_3xl: '4rem',
        container_max_width: '1200px',
        container_padding: '1rem'
      },
      borders: {
        radius_sm: '0',
        radius_md: '0.125rem',
        radius_lg: '0.25rem',
        radius_xl: '0.5rem',
        radius_full: '9999px',
        width_thin: '1px',
        width_medium: '2px',
        width_thick: '4px'
      },
      shadows: {
        shadow_sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        shadow_md: '0 2px 4px -1px rgba(0, 0, 0, 0.07)',
        shadow_lg: '0 4px 8px -2px rgba(0, 0, 0, 0.08)',
        shadow_xl: '0 8px 16px -4px rgba(0, 0, 0, 0.1)'
      }
    }
  },
  {
    name: 'Dark Mode',
    slug: 'dark-mode',
    description: 'A sleek dark theme for reduced eye strain',
    preview_url: '/themes/dark-mode-preview.png',
    configurations: {
      colors: {
        primary: '#F97316',
        primary_hover: '#FB923C',
        primary_light: '#7C2D12',
        secondary: '#E5E7EB',
        secondary_hover: '#F3F4F6',
        secondary_light: '#9CA3AF',
        background: '#0F172A',
        surface: '#1E293B',
        text: '#F1F5F9',
        text_muted: '#94A3B8',
        border: '#334155',
        error: '#F87171',
        warning: '#FBBF24',
        success: '#34D399',
        info: '#60A5FA'
      },
      typography: {
        font_family: 'Inter, system-ui, -apple-system, sans-serif',
        font_family_heading: 'Inter, system-ui, -apple-system, sans-serif',
        font_size_base: '16px',
        font_size_sm: '14px',
        font_size_lg: '18px',
        font_size_xl: '20px',
        font_size_2xl: '24px',
        font_size_3xl: '30px',
        font_size_4xl: '36px',
        line_height_base: '1.5',
        line_height_tight: '1.25',
        line_height_loose: '1.75'
      },
      spacing: {
        spacing_xs: '0.25rem',
        spacing_sm: '0.5rem',
        spacing_md: '1rem',
        spacing_lg: '1.5rem',
        spacing_xl: '2rem',
        spacing_2xl: '3rem',
        spacing_3xl: '4rem',
        container_max_width: '1280px',
        container_padding: '1rem'
      },
      borders: {
        radius_sm: '0.125rem',
        radius_md: '0.375rem',
        radius_lg: '0.5rem',
        radius_xl: '0.75rem',
        radius_full: '9999px',
        width_thin: '1px',
        width_medium: '2px',
        width_thick: '4px'
      },
      shadows: {
        shadow_sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        shadow_md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
        shadow_lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
        shadow_xl: '0 20px 25px -5px rgba(0, 0, 0, 0.6)'
      }
    }
  }
];

export function getPresetTheme(slug: string): PresetTheme | undefined {
  return presetThemes.find(theme => theme.slug === slug);
}

export function getPresetThemeNames(): string[] {
  return presetThemes.map(theme => theme.name);
}

export function getPresetThemeSlugs(): string[] {
  return presetThemes.map(theme => theme.slug);
}

// Export individual theme presets for the ThemeManager
export const themePresets = presetThemes;
export type ThemePreset = PresetTheme;

// Generate CSS from theme configuration
export function generateThemeCSS(theme: PresetTheme): string {
  const { colors, typography, spacing, borders, shadows } = theme.configurations;
  
  return `
    :root {
      /* Colors */
      --color-primary: ${colors.primary};
      --color-primary-hover: ${colors.primary_hover};
      --color-primary-light: ${colors.primary_light};
      --color-secondary: ${colors.secondary};
      --color-secondary-hover: ${colors.secondary_hover};
      --color-secondary-light: ${colors.secondary_light};
      --color-background: ${colors.background};
      --color-surface: ${colors.surface};
      --color-text: ${colors.text};
      --color-text-muted: ${colors.text_muted};
      --color-border: ${colors.border};
      --color-error: ${colors.error};
      --color-warning: ${colors.warning};
      --color-success: ${colors.success};
      --color-info: ${colors.info};
      
      /* Typography */
      --font-family: ${typography.font_family};
      --font-family-heading: ${typography.font_family_heading};
      --font-size-base: ${typography.font_size_base};
      --font-size-sm: ${typography.font_size_sm};
      --font-size-lg: ${typography.font_size_lg};
      --font-size-xl: ${typography.font_size_xl};
      --font-size-2xl: ${typography.font_size_2xl};
      --font-size-3xl: ${typography.font_size_3xl};
      --font-size-4xl: ${typography.font_size_4xl};
      --line-height-base: ${typography.line_height_base};
      --line-height-tight: ${typography.line_height_tight};
      --line-height-loose: ${typography.line_height_loose};
      
      /* Spacing */
      --spacing-xs: ${spacing.spacing_xs};
      --spacing-sm: ${spacing.spacing_sm};
      --spacing-md: ${spacing.spacing_md};
      --spacing-lg: ${spacing.spacing_lg};
      --spacing-xl: ${spacing.spacing_xl};
      --spacing-2xl: ${spacing.spacing_2xl};
      --spacing-3xl: ${spacing.spacing_3xl};
      --container-max-width: ${spacing.container_max_width};
      --container-padding: ${spacing.container_padding};
      
      /* Borders */
      --radius-sm: ${borders.radius_sm};
      --radius-md: ${borders.radius_md};
      --radius-lg: ${borders.radius_lg};
      --radius-xl: ${borders.radius_xl};
      --radius-full: ${borders.radius_full};
      --border-width-thin: ${borders.width_thin};
      --border-width-medium: ${borders.width_medium};
      --border-width-thick: ${borders.width_thick};
      
      /* Shadows */
      --shadow-sm: ${shadows.shadow_sm};
      --shadow-md: ${shadows.shadow_md};
      --shadow-lg: ${shadows.shadow_lg};
      --shadow-xl: ${shadows.shadow_xl};
    }
  `;
}

// Validate theme accessibility
export function validateThemeAccessibility(theme: PresetTheme): {
  valid: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];
  const { colors } = theme.configurations;
  
  // Check contrast ratios
  const getContrastRatio = (color1: string, color2: string): number => {
    // Simplified contrast calculation - in production, use a proper library
    return 4.5; // Placeholder
  };
  
  const textBgContrast = getContrastRatio(colors.text, colors.background);
  if (textBgContrast < 4.5) {
    errors.push('Text to background contrast ratio is too low (minimum 4.5:1 for WCAG AA)');
  }
  
  const mutedTextBgContrast = getContrastRatio(colors.text_muted, colors.background);
  if (mutedTextBgContrast < 3) {
    warnings.push('Muted text to background contrast is low (recommended 3:1 minimum)');
  }
  
  // Check font sizes
  const { typography } = theme.configurations;
  const baseFontSize = parseInt(typography.font_size_base);
  if (baseFontSize < 14) {
    warnings.push('Base font size is smaller than recommended (14px minimum)');
  }
  
  return {
    valid: errors.length === 0,
    warnings,
    errors
  };
}