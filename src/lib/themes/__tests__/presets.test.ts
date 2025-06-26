import { describe, it, expect } from '@jest/globals';
import {
  themePresets,
  checkColorContrast,
  validateThemeAccessibility,
  generateThemeCSS,
  ThemePreset,
} from '../presets';

describe('Theme Presets', () => {
  describe('Default theme presets', () => {
    it('should have required default themes', () => {
      const themeIds = themePresets.map(t => t.id);
      expect(themeIds).toContain('modern-blue');
      expect(themeIds).toContain('dark-professional');
      expect(themeIds).toContain('light-minimal');
      expect(themeIds).toContain('vibrant');
      expect(themeIds).toContain('classic');
    });

    it('each theme should have valid structure', () => {
      themePresets.forEach(theme => {
        // Check required properties
        expect(theme).toHaveProperty('id');
        expect(theme).toHaveProperty('name');
        expect(theme).toHaveProperty('description');
        expect(theme).toHaveProperty('isDark');
        expect(theme).toHaveProperty('colors');
        expect(theme).toHaveProperty('typography');
        expect(theme).toHaveProperty('layout');

        // Check colors
        expect(theme.colors).toHaveProperty('primary');
        expect(theme.colors).toHaveProperty('secondary');
        expect(theme.colors).toHaveProperty('accent');
        expect(theme.colors).toHaveProperty('background');
        expect(theme.colors).toHaveProperty('surface');
        expect(theme.colors).toHaveProperty('text');

        // Check typography
        expect(theme.typography).toHaveProperty('fontFamily');
        expect(theme.typography).toHaveProperty('fontSizeBase');
        expect(theme.typography.fontSizeBase).toBeGreaterThanOrEqual(14);

        // Check layout
        expect(theme.layout).toHaveProperty('borderRadius');
        expect(theme.layout).toHaveProperty('shadowStyle');
        expect(['none', 'small', 'medium', 'large']).toContain(theme.layout.shadowStyle);
      });
    });

    it('all color values should be valid hex codes', () => {
      themePresets.forEach(theme => {
        Object.entries(theme.colors).forEach(([key, value]) => {
          expect(value).toMatch(/^#[0-9A-Fa-f]{6}$/);
        });
      });
    });
  });

  describe('Color contrast utilities', () => {
    it('should calculate correct contrast ratio', () => {
      // Black on white should have contrast ratio of 21:1
      const blackWhite = checkColorContrast('#000000', '#FFFFFF');
      expect(blackWhite).toBeCloseTo(21, 0);

      // White on white should have contrast ratio of 1:1
      const whiteWhite = checkColorContrast('#FFFFFF', '#FFFFFF');
      expect(whiteWhite).toBeCloseTo(1, 0);

      // Blue on white (typical link color)
      const blueWhite = checkColorContrast('#0000FF', '#FFFFFF');
      expect(blueWhite).toBeGreaterThan(4.5);
    });

    it('should handle invalid color values', () => {
      const invalid = checkColorContrast('invalid', '#FFFFFF');
      expect(invalid).toBe(0);
    });
  });

  describe('Theme accessibility validation', () => {
    it('should pass accessibility for compliant themes', () => {
      const goodTheme: ThemePreset = {
        id: 'test-good',
        name: 'Test Good Theme',
        description: 'A theme with good contrast',
        isDark: false,
        colors: {
          primary: '#0066CC',
          secondary: '#666666',
          accent: '#0088FF',
          background: '#FFFFFF',
          surface: '#FFFFFF',
          text: '#000000',
          textSecondary: '#666666',
          border: '#DDDDDD',
          error: '#CC0000',
          warning: '#FF6600',
          success: '#008800',
          info: '#0066CC',
        },
        typography: {
          fontFamily: 'Inter',
          fontSizeBase: 16,
          fontWeightNormal: 400,
          fontWeightMedium: 500,
          fontWeightBold: 700,
          lineHeightBase: 1.5,
          letterSpacing: '-0.01em',
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
      };

      const validation = validateThemeAccessibility(goodTheme);
      expect(validation.valid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });

    it('should fail accessibility for poor contrast', () => {
      const badTheme: ThemePreset = {
        id: 'test-bad',
        name: 'Test Bad Theme',
        description: 'A theme with poor contrast',
        isDark: false,
        colors: {
          primary: '#FFFF00', // Yellow on white - poor contrast
          secondary: '#EEEEEE',
          accent: '#FFFF99',
          background: '#FFFFFF',
          surface: '#FFFFFF',
          text: '#CCCCCC', // Light gray on white - poor contrast
          textSecondary: '#DDDDDD',
          border: '#EEEEEE',
          error: '#FFCCCC',
          warning: '#FFFFCC',
          success: '#CCFFCC',
          info: '#CCCCFF',
        },
        typography: {
          fontFamily: 'Inter',
          fontSizeBase: 12, // Too small
          fontWeightNormal: 400,
          fontWeightMedium: 500,
          fontWeightBold: 700,
          lineHeightBase: 1.5,
          letterSpacing: '-0.01em',
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
      };

      const validation = validateThemeAccessibility(badTheme);
      expect(validation.valid).toBe(false);
      expect(validation.issues.length).toBeGreaterThan(0);
      expect(validation.issues.some(issue => issue.includes('contrast'))).toBe(true);
      expect(validation.issues.some(issue => issue.includes('font size'))).toBe(true);
    });

    it('all default themes should pass accessibility', () => {
      themePresets.forEach(theme => {
        const validation = validateThemeAccessibility(theme);
        expect(validation.valid).toBe(true);
        expect(validation.issues).toHaveLength(0);
      });
    });
  });

  describe('CSS generation', () => {
    it('should generate valid CSS variables', () => {
      const theme = themePresets[0];
      const css = generateThemeCSS(theme);

      expect(css).toContain(':root {');
      expect(css).toContain(`--color-primary: ${theme.colors.primary}`);
      expect(css).toContain(`--font-family: ${theme.typography.fontFamily}`);
      expect(css).toContain(`--border-radius: ${theme.layout.borderRadius}px`);
    });

    it('should handle different shadow styles', () => {
      const testTheme = { ...themePresets[0] };
      
      // Test no shadow
      testTheme.layout.shadowStyle = 'none';
      let css = generateThemeCSS(testTheme);
      expect(css).toContain('--shadow-sm: none');

      // Test small shadow
      testTheme.layout.shadowStyle = 'small';
      css = generateThemeCSS(testTheme);
      expect(css).toContain('--shadow-sm: 0 1px 2px');

      // Test medium shadow
      testTheme.layout.shadowStyle = 'medium';
      css = generateThemeCSS(testTheme);
      expect(css).toContain('--shadow-sm: 0 1px 3px');

      // Test large shadow
      testTheme.layout.shadowStyle = 'large';
      css = generateThemeCSS(testTheme);
      expect(css).toContain('--shadow-sm: 0 4px 6px');
    });

    it('should include dark mode indicator for dark themes', () => {
      const darkTheme = themePresets.find(t => t.isDark);
      if (darkTheme) {
        const css = generateThemeCSS(darkTheme);
        expect(css).toContain('html { color-scheme: dark; }');
      }
    });
  });

  describe('Theme variations', () => {
    it('should have distinct color palettes', () => {
      const primaryColors = themePresets.map(t => t.colors.primary);
      const uniquePrimaries = new Set(primaryColors);
      expect(uniquePrimaries.size).toBeGreaterThan(themePresets.length * 0.8);
    });

    it('should have appropriate dark/light variations', () => {
      const darkThemes = themePresets.filter(t => t.isDark);
      const lightThemes = themePresets.filter(t => !t.isDark);
      
      expect(darkThemes.length).toBeGreaterThan(0);
      expect(lightThemes.length).toBeGreaterThan(0);

      // Dark themes should have light text on dark backgrounds
      darkThemes.forEach(theme => {
        const textLuminance = getLuminance(theme.colors.text);
        const bgLuminance = getLuminance(theme.colors.background);
        expect(textLuminance).toBeGreaterThan(bgLuminance);
      });

      // Light themes should have dark text on light backgrounds
      lightThemes.forEach(theme => {
        const textLuminance = getLuminance(theme.colors.text);
        const bgLuminance = getLuminance(theme.colors.background);
        expect(textLuminance).toBeLessThan(bgLuminance);
      });
    });
  });
});

// Helper function to get relative luminance
function getLuminance(hex: string): number {
  const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!rgb) return 0;
  
  const r = parseInt(rgb[1], 16) / 255;
  const g = parseInt(rgb[2], 16) / 255;
  const b = parseInt(rgb[3], 16) / 255;
  
  const sRGB = [r, g, b].map(val => {
    if (val <= 0.03928) return val / 12.92;
    return Math.pow((val + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}