// Theme system types

export interface Theme {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  is_default: boolean;
  is_preset: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  configurations?: ThemeConfiguration[];
  assets?: ThemeAsset[];
  metadata?: ThemeMetadata;
}

export type ConfigType = 'colors' | 'typography' | 'spacing' | 'borders' | 'shadows' | 'animations';

export interface ThemeConfiguration {
  id: string;
  theme_id: string;
  config_type: ConfigType;
  config_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type AssetType = 'logo' | 'logo_dark' | 'favicon' | 'og_image' | 'background' | 'pattern';

export interface ThemeAsset {
  id: string;
  theme_id: string;
  asset_type: AssetType;
  file_path: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  width?: number;
  height?: number;
  alt_text?: string;
  created_at: string;
  updated_at: string;
}

export interface ThemeMetadata {
  id: string;
  theme_id: string;
  site_name?: string;
  site_tagline?: string;
  site_description?: string;
  contact_email?: string;
  social_links?: Record<string, string>;
  custom_css?: string;
  custom_head_html?: string;
  custom_body_html?: string;
  meta_tags?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

// Color configuration
export interface ColorConfig {
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

// Typography configuration
export interface TypographyConfig {
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

// Spacing configuration
export interface SpacingConfig {
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

// Borders configuration
export interface BordersConfig {
  radius_sm: string;
  radius_md: string;
  radius_lg: string;
  radius_xl: string;
  radius_full: string;
  width_thin: string;
  width_medium: string;
  width_thick: string;
}

// Shadows configuration
export interface ShadowsConfig {
  shadow_sm: string;
  shadow_md: string;
  shadow_lg: string;
  shadow_xl: string;
}

// Form data types
export interface ThemeFormData {
  name: string;
  slug: string;
  description?: string;
  is_active?: boolean;
}

export interface ThemeConfigFormData {
  colors?: Partial<ColorConfig>;
  typography?: Partial<TypographyConfig>;
  spacing?: Partial<SpacingConfig>;
  borders?: Partial<BordersConfig>;
  shadows?: Partial<ShadowsConfig>;
}

export interface ThemeMetadataFormData {
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

// Asset upload types
export interface AssetUploadData {
  file: File;
  asset_type: AssetType;
  alt_text?: string;
}

// Complete theme with all relations
export interface CompleteTheme extends Theme {
  configurations: ThemeConfiguration[];
  assets: ThemeAsset[];
  metadata: ThemeMetadata;
}

// Preset themes
export interface PresetTheme {
  name: string;
  slug: string;
  description: string;
  preview_url?: string;
  configurations: {
    colors: ColorConfig;
    typography: TypographyConfig;
    spacing: SpacingConfig;
    borders: BordersConfig;
    shadows: ShadowsConfig;
  };
}