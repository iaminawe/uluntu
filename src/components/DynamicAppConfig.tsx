import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSettingsCSS, useSiteInfo, useAppearanceSettings } from '@/hooks/useEnhancedSettings';

/**
 * Component that applies dynamic configuration based on settings
 * This component handles:
 * - Dynamic CSS variables
 * - Page title and meta tags
 * - Favicon updates
 * - Theme changes
 */
export function DynamicAppConfig() {
  const siteInfo = useSiteInfo();
  const appearance = useAppearanceSettings();
  
  // Apply CSS variables and theme changes
  useSettingsCSS();
  
  // Update document title when site name changes
  useEffect(() => {
    if (siteInfo.name) {
      document.title = siteInfo.name;
    }
  }, [siteInfo.name]);

  return (
    <Helmet>
      {/* Dynamic Site Information */}
      <title>{siteInfo.name}</title>
      <meta name="description" content={siteInfo.description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={siteInfo.name} />
      <meta property="og:description" content={siteInfo.description} />
      {appearance.logoUrl && (
        <meta property="og:image" content={appearance.logoUrl} />
      )}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteInfo.name} />
      <meta name="twitter:description" content={siteInfo.description} />
      {appearance.logoUrl && (
        <meta name="twitter:image" content={appearance.logoUrl} />
      )}
      
      {/* Favicon */}
      {appearance.faviconUrl && (
        <>
          <link rel="icon" type="image/x-icon" href={appearance.faviconUrl} />
          <link rel="shortcut icon" href={appearance.faviconUrl} />
          <link rel="apple-touch-icon" href={appearance.faviconUrl} />
        </>
      )}
      
      {/* Theme Color */}
      <meta name="theme-color" content={appearance.primaryColor} />
      <meta name="msapplication-TileColor" content={appearance.primaryColor} />
      
      {/* Font Preload */}
      {appearance.fontFamily !== 'Inter' && (
        <link
          rel="preload"
          href={`https://fonts.googleapis.com/css2?family=${appearance.fontFamily.replace(' ', '+')}&display=swap`}
          as="style"
        />
      )}
    </Helmet>
  );
}