import type { 
  ColorConfig, 
  TypographyConfig, 
  SpacingConfig, 
  BordersConfig, 
  ShadowsConfig,
  ThemeFormData,
  ThemeMetadataFormData
} from '@/types/theme';

// Color validation
export function isValidHexColor(color: string): boolean {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
}

export function isValidRgbaColor(color: string): boolean {
  const rgbaRegex = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/;
  return rgbaRegex.test(color);
}

export function isValidColor(color: string): boolean {
  return isValidHexColor(color) || isValidRgbaColor(color);
}

export function validateColorConfig(config: Partial<ColorConfig>): string[] {
  const errors: string[] = [];
  const requiredFields: (keyof ColorConfig)[] = [
    'primary', 'secondary', 'background', 'text'
  ];

  // Check required fields
  for (const field of requiredFields) {
    if (!config[field]) {
      errors.push(`${field} color is required`);
    }
  }

  // Validate color formats
  for (const [key, value] of Object.entries(config)) {
    if (value && typeof value === 'string' && !isValidColor(value)) {
      errors.push(`${key} must be a valid hex or rgba color`);
    }
  }

  return errors;
}

// Typography validation
export function isValidFontSize(size: string): boolean {
  const sizeRegex = /^\d+(\.\d+)?(px|rem|em|%)$/;
  return sizeRegex.test(size);
}

export function isValidLineHeight(height: string): boolean {
  const heightRegex = /^\d+(\.\d+)?$/;
  return heightRegex.test(height);
}

export function validateTypographyConfig(config: Partial<TypographyConfig>): string[] {
  const errors: string[] = [];
  const requiredFields: (keyof TypographyConfig)[] = [
    'font_family', 'font_size_base', 'line_height_base'
  ];

  // Check required fields
  for (const field of requiredFields) {
    if (!config[field]) {
      errors.push(`${field} is required`);
    }
  }

  // Validate font sizes
  const fontSizeFields: (keyof TypographyConfig)[] = [
    'font_size_base', 'font_size_sm', 'font_size_lg', 
    'font_size_xl', 'font_size_2xl', 'font_size_3xl', 'font_size_4xl'
  ];

  for (const field of fontSizeFields) {
    const value = config[field];
    if (value && !isValidFontSize(value)) {
      errors.push(`${field} must be a valid CSS size (e.g., 16px, 1rem)`);
    }
  }

  // Validate line heights
  const lineHeightFields: (keyof TypographyConfig)[] = [
    'line_height_base', 'line_height_tight', 'line_height_loose'
  ];

  for (const field of lineHeightFields) {
    const value = config[field];
    if (value && !isValidLineHeight(value)) {
      errors.push(`${field} must be a numeric value (e.g., 1.5)`);
    }
  }

  return errors;
}

// Spacing validation
export function isValidSpacing(spacing: string): boolean {
  const spacingRegex = /^\d+(\.\d+)?(px|rem|em|%)$/;
  return spacingRegex.test(spacing);
}

export function validateSpacingConfig(config: Partial<SpacingConfig>): string[] {
  const errors: string[] = [];

  for (const [key, value] of Object.entries(config)) {
    if (value && typeof value === 'string' && !isValidSpacing(value)) {
      errors.push(`${key} must be a valid CSS spacing value (e.g., 1rem, 16px)`);
    }
  }

  return errors;
}

// Border validation
export function isValidBorderRadius(radius: string): boolean {
  const radiusRegex = /^\d+(\.\d+)?(px|rem|em|%)|0$/;
  return radiusRegex.test(radius) || radius === '9999px'; // Allow full radius
}

export function isValidBorderWidth(width: string): boolean {
  const widthRegex = /^\d+(\.\d+)?px$/;
  return widthRegex.test(width);
}

export function validateBordersConfig(config: Partial<BordersConfig>): string[] {
  const errors: string[] = [];

  // Validate radius values
  const radiusFields: (keyof BordersConfig)[] = [
    'radius_sm', 'radius_md', 'radius_lg', 'radius_xl', 'radius_full'
  ];

  for (const field of radiusFields) {
    const value = config[field];
    if (value && !isValidBorderRadius(value)) {
      errors.push(`${field} must be a valid CSS border radius (e.g., 0.5rem, 8px)`);
    }
  }

  // Validate width values
  const widthFields: (keyof BordersConfig)[] = [
    'width_thin', 'width_medium', 'width_thick'
  ];

  for (const field of widthFields) {
    const value = config[field];
    if (value && !isValidBorderWidth(value)) {
      errors.push(`${field} must be a valid border width in pixels (e.g., 1px)`);
    }
  }

  return errors;
}

// Shadow validation
export function isValidShadow(shadow: string): boolean {
  // Basic validation - checks if string contains expected shadow components
  return shadow.includes('px') && shadow.includes('rgba');
}

export function validateShadowsConfig(config: Partial<ShadowsConfig>): string[] {
  const errors: string[] = [];

  for (const [key, value] of Object.entries(config)) {
    if (value && typeof value === 'string' && !isValidShadow(value)) {
      errors.push(`${key} must be a valid CSS box-shadow value`);
    }
  }

  return errors;
}

// Theme form validation
export function validateThemeFormData(data: ThemeFormData): string[] {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Theme name is required');
  }

  if (!data.slug || data.slug.trim().length === 0) {
    errors.push('Theme slug is required');
  } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
    errors.push('Theme slug must contain only lowercase letters, numbers, and hyphens');
  }

  if (data.description && data.description.length > 500) {
    errors.push('Theme description must be less than 500 characters');
  }

  return errors;
}

// Metadata validation
export function validateThemeMetadata(data: ThemeMetadataFormData): string[] {
  const errors: string[] = [];

  if (data.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact_email)) {
    errors.push('Contact email must be a valid email address');
  }

  if (data.site_name && data.site_name.length > 100) {
    errors.push('Site name must be less than 100 characters');
  }

  if (data.site_tagline && data.site_tagline.length > 200) {
    errors.push('Site tagline must be less than 200 characters');
  }

  if (data.site_description && data.site_description.length > 500) {
    errors.push('Site description must be less than 500 characters');
  }

  if (data.custom_css && data.custom_css.length > 50000) {
    errors.push('Custom CSS must be less than 50KB');
  }

  return errors;
}

// Complete theme validation
export function validateThemeConfiguration(config: {
  colors?: Partial<ColorConfig>;
  typography?: Partial<TypographyConfig>;
  spacing?: Partial<SpacingConfig>;
  borders?: Partial<BordersConfig>;
  shadows?: Partial<ShadowsConfig>;
}): { valid: boolean; errors: Record<string, string[]> } {
  const errors: Record<string, string[]> = {};

  if (config.colors) {
    const colorErrors = validateColorConfig(config.colors);
    if (colorErrors.length > 0) {
      errors.colors = colorErrors;
    }
  }

  if (config.typography) {
    const typographyErrors = validateTypographyConfig(config.typography);
    if (typographyErrors.length > 0) {
      errors.typography = typographyErrors;
    }
  }

  if (config.spacing) {
    const spacingErrors = validateSpacingConfig(config.spacing);
    if (spacingErrors.length > 0) {
      errors.spacing = spacingErrors;
    }
  }

  if (config.borders) {
    const bordersErrors = validateBordersConfig(config.borders);
    if (bordersErrors.length > 0) {
      errors.borders = bordersErrors;
    }
  }

  if (config.shadows) {
    const shadowsErrors = validateShadowsConfig(config.shadows);
    if (shadowsErrors.length > 0) {
      errors.shadows = shadowsErrors;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}