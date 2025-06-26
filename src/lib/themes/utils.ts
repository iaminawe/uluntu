import type { CompleteTheme, ColorConfig, TypographyConfig, SpacingConfig, BordersConfig, ShadowsConfig } from '@/types/theme';

// Generate CSS custom properties from theme configuration
export function generateThemeCSSVariables(theme: CompleteTheme): string {
  const cssVariables: string[] = [];
  
  // Extract configurations
  const colorConfig = theme.configurations.find(c => c.config_type === 'colors')?.config_data as ColorConfig;
  const typographyConfig = theme.configurations.find(c => c.config_type === 'typography')?.config_data as TypographyConfig;
  const spacingConfig = theme.configurations.find(c => c.config_type === 'spacing')?.config_data as SpacingConfig;
  const bordersConfig = theme.configurations.find(c => c.config_type === 'borders')?.config_data as BordersConfig;
  const shadowsConfig = theme.configurations.find(c => c.config_type === 'shadows')?.config_data as ShadowsConfig;
  
  // Color variables
  if (colorConfig) {
    Object.entries(colorConfig).forEach(([key, value]) => {
      const varName = key.replace(/_/g, '-');
      cssVariables.push(`--color-${varName}: ${value};`);
    });
  }
  
  // Typography variables
  if (typographyConfig) {
    Object.entries(typographyConfig).forEach(([key, value]) => {
      const varName = key.replace(/_/g, '-');
      cssVariables.push(`--${varName}: ${value};`);
    });
  }
  
  // Spacing variables
  if (spacingConfig) {
    Object.entries(spacingConfig).forEach(([key, value]) => {
      const varName = key.replace(/_/g, '-');
      cssVariables.push(`--${varName}: ${value};`);
    });
  }
  
  // Border variables
  if (bordersConfig) {
    Object.entries(bordersConfig).forEach(([key, value]) => {
      const varName = key.replace(/_/g, '-');
      cssVariables.push(`--border-${varName}: ${value};`);
    });
  }
  
  // Shadow variables
  if (shadowsConfig) {
    Object.entries(shadowsConfig).forEach(([key, value]) => {
      const varName = key.replace(/_/g, '-');
      cssVariables.push(`--${varName}: ${value};`);
    });
  }
  
  return `:root {\n  ${cssVariables.join('\n  ')}\n}`;
}

// Apply theme to document
export function applyThemeToDocument(theme: CompleteTheme): void {
  // Remove existing theme style tag
  const existingThemeStyle = document.getElementById('theme-style');
  if (existingThemeStyle) {
    existingThemeStyle.remove();
  }
  
  // Create new style tag with theme CSS variables
  const styleTag = document.createElement('style');
  styleTag.id = 'theme-style';
  styleTag.textContent = generateThemeCSSVariables(theme);
  
  // Add custom CSS if provided
  if (theme.metadata?.custom_css) {
    styleTag.textContent += '\n\n' + theme.metadata.custom_css;
  }
  
  document.head.appendChild(styleTag);
  
  // Apply theme class to body
  document.body.className = document.body.className
    .replace(/theme-[\w-]+/g, '')
    .trim() + ` theme-${theme.slug}`;
  
  // Update meta tags
  updateMetaTags(theme);
  
  // Insert custom HTML if provided
  insertCustomHTML(theme);
}

// Update meta tags based on theme metadata
export function updateMetaTags(theme: CompleteTheme): void {
  const metadata = theme.metadata;
  if (!metadata) return;
  
  // Update site name
  if (metadata.site_name) {
    updateMetaTag('application-name', metadata.site_name);
    updateMetaTag('apple-mobile-web-app-title', metadata.site_name);
    document.title = metadata.site_name;
  }
  
  // Update description
  if (metadata.site_description) {
    updateMetaTag('description', metadata.site_description);
    updateMetaTag('og:description', metadata.site_description);
    updateMetaTag('twitter:description', metadata.site_description);
  }
  
  // Update custom meta tags
  if (metadata.meta_tags) {
    Object.entries(metadata.meta_tags).forEach(([name, content]) => {
      updateMetaTag(name, content);
    });
  }
  
  // Update theme-related assets
  const assets = theme.assets || [];
  
  // Update favicon
  const favicon = assets.find(a => a.asset_type === 'favicon');
  if (favicon) {
    updateFavicon(favicon.file_url);
  }
  
  // Update OG image
  const ogImage = assets.find(a => a.asset_type === 'og_image');
  if (ogImage) {
    updateMetaTag('og:image', ogImage.file_url);
    updateMetaTag('twitter:image', ogImage.file_url);
  }
}

// Helper function to update or create meta tag
function updateMetaTag(name: string, content: string): void {
  let meta = document.querySelector(`meta[name="${name}"]`) || 
             document.querySelector(`meta[property="${name}"]`);
  
  if (!meta) {
    meta = document.createElement('meta');
    if (name.startsWith('og:') || name.startsWith('twitter:')) {
      meta.setAttribute('property', name);
    } else {
      meta.setAttribute('name', name);
    }
    document.head.appendChild(meta);
  }
  
  meta.setAttribute('content', content);
}

// Helper function to update favicon
function updateFavicon(url: string): void {
  // Remove existing favicons
  const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
  existingFavicons.forEach(favicon => favicon.remove());
  
  // Add new favicon
  const link = document.createElement('link');
  link.rel = 'icon';
  link.href = url;
  document.head.appendChild(link);
}

// Insert custom HTML
function insertCustomHTML(theme: CompleteTheme): void {
  const metadata = theme.metadata;
  if (!metadata) return;
  
  // Remove existing custom HTML
  const existingHeadHTML = document.getElementById('theme-custom-head');
  const existingBodyHTML = document.getElementById('theme-custom-body');
  
  if (existingHeadHTML) existingHeadHTML.remove();
  if (existingBodyHTML) existingBodyHTML.remove();
  
  // Insert custom head HTML
  if (metadata.custom_head_html) {
    const headDiv = document.createElement('div');
    headDiv.id = 'theme-custom-head';
    headDiv.innerHTML = metadata.custom_head_html;
    document.head.appendChild(headDiv);
  }
  
  // Insert custom body HTML
  if (metadata.custom_body_html) {
    const bodyDiv = document.createElement('div');
    bodyDiv.id = 'theme-custom-body';
    bodyDiv.innerHTML = metadata.custom_body_html;
    document.body.appendChild(bodyDiv);
  }
}

// Get logo URL for current theme mode
export function getThemedLogo(theme: CompleteTheme, darkMode: boolean = false): string | null {
  const assets = theme.assets || [];
  
  if (darkMode) {
    const darkLogo = assets.find(a => a.asset_type === 'logo_dark');
    if (darkLogo) return darkLogo.file_url;
  }
  
  const logo = assets.find(a => a.asset_type === 'logo');
  return logo ? logo.file_url : null;
}

// Get background image or pattern
export function getThemeBackground(theme: CompleteTheme): { url?: string; pattern?: string } | null {
  const assets = theme.assets || [];
  
  const background = assets.find(a => a.asset_type === 'background');
  const pattern = assets.find(a => a.asset_type === 'pattern');
  
  if (!background && !pattern) return null;
  
  return {
    url: background?.file_url,
    pattern: pattern?.file_url
  };
}

// Export theme for sharing
export function exportThemeJSON(theme: CompleteTheme): string {
  const exportData = {
    name: theme.name,
    slug: theme.slug,
    description: theme.description,
    configurations: theme.configurations.reduce((acc, config) => {
      acc[config.config_type] = config.config_data;
      return acc;
    }, {} as Record<string, any>),
    metadata: theme.metadata ? {
      site_name: theme.metadata.site_name,
      site_tagline: theme.metadata.site_tagline,
      site_description: theme.metadata.site_description,
      contact_email: theme.metadata.contact_email,
      social_links: theme.metadata.social_links,
      custom_css: theme.metadata.custom_css,
      custom_head_html: theme.metadata.custom_head_html,
      custom_body_html: theme.metadata.custom_body_html,
      meta_tags: theme.metadata.meta_tags
    } : null
  };
  
  return JSON.stringify(exportData, null, 2);
}

// Download theme as JSON file
export function downloadThemeJSON(theme: CompleteTheme): void {
  const json = exportThemeJSON(theme);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `theme-${theme.slug}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  URL.revokeObjectURL(url);
}

// Convert hex color to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Generate complementary color
export function getComplementaryColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const r = 255 - rgb.r;
  const g = 255 - rgb.g;
  const b = 255 - rgb.b;
  
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Check if color is light or dark
export function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return true;
  
  // Calculate luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5;
}

// Get contrasting text color
export function getContrastingTextColor(backgroundColor: string): string {
  return isLightColor(backgroundColor) ? '#000000' : '#FFFFFF';
}