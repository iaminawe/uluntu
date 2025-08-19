import React from 'react';
import { useEnabledFeatures } from '@/hooks/useSettings';
import type { MenuItem, FeatureKey } from '@/types/menu';

interface FooterFeatureGateProps {
  children: React.ReactNode;
  featureKey?: FeatureKey | string;
  menuItem?: MenuItem;
  fallback?: React.ReactNode;
  requireAll?: boolean; // For multiple feature flags
  showDevMode?: boolean; // Show in development mode even if disabled
}

/**
 * Feature gate component for footer elements
 * Controls visibility based on feature flags
 */
export const FooterFeatureGate: React.FC<FooterFeatureGateProps> = ({
  children,
  featureKey,
  menuItem,
  fallback = null,
  requireAll = false,
  showDevMode = true
}) => {
  const { isFeatureEnabled } = useEnabledFeatures();

  // Get feature flags to check
  const featuresToCheck = getFeaturesToCheck(featureKey, menuItem);
  
  if (featuresToCheck.length === 0) {
    // No feature flags to check, show content
    return <>{children}</>;
  }

  // Check feature flags
  const hasAccess = checkFeatureAccess(
    featuresToCheck,
    isFeatureEnabled,
    requireAll,
    showDevMode
  );

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * Get array of features to check from props and menu item
 */
function getFeaturesToCheck(
  featureKey?: FeatureKey | string,
  menuItem?: MenuItem
): string[] {
  const features: string[] = [];

  // Add explicit feature key
  if (featureKey) {
    features.push(featureKey);
  }

  // Add menu item feature flag
  if (menuItem?.feature_flag) {
    features.push(menuItem.feature_flag);
  }

  return [...new Set(features)]; // Remove duplicates
}

/**
 * Check if user has access based on feature flags
 */
function checkFeatureAccess(
  features: string[],
  isFeatureEnabled: (feature: string) => boolean,
  requireAll: boolean,
  showDevMode: boolean
): boolean {
  // Development mode override
  if (showDevMode && process.env.NODE_ENV === 'development') {
    return true;
  }

  if (features.length === 0) {
    return true;
  }

  if (requireAll) {
    // All features must be enabled
    return features.every(feature => isFeatureEnabled(feature));
  } else {
    // At least one feature must be enabled
    return features.some(feature => isFeatureEnabled(feature));
  }
}

/**
 * Higher-order component for wrapping footer components with feature gates
 */
export function withFooterFeatureGate<T extends object>(
  Component: React.ComponentType<T>,
  defaultFeatureKey?: FeatureKey | string
) {
  return function FeatureGatedComponent(
    props: T & {
      featureKey?: FeatureKey | string;
      menuItem?: MenuItem;
      fallback?: React.ReactNode;
    }
  ) {
    const { featureKey, menuItem, fallback, ...componentProps } = props;
    const actualFeatureKey = featureKey || defaultFeatureKey;
    
    return (
      <FooterFeatureGate
        featureKey={actualFeatureKey}
        menuItem={menuItem}
        fallback={fallback}
      >
        <Component {...(componentProps as T)} />
      </FooterFeatureGate>
    );
  };
}

/**
 * Hook for managing footer feature flags
 */
export function useFooterFeatures() {
  const { isFeatureEnabled, features } = useEnabledFeatures();

  const checkItemFeature = (item: MenuItem): boolean => {
    if (!item.feature_flag) return true;
    return isFeatureEnabled(item.feature_flag);
  };

  const filterByFeatures = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter(checkItemFeature)
      .map(item => ({
        ...item,
        children: item.children ? filterByFeatures(item.children) : undefined
      }))
      .filter(item => !item.children || item.children.length > 0 || !item.feature_flag);
  };

  const getEnabledFooterFeatures = (): string[] => {
    const footerFeatures = [
      'dynamic_footer_menus',
      'footer_social_links',
      'footer_newsletter_signup',
      'footer_legal_links',
      'footer_branding',
      'footer_search'
    ];

    return footerFeatures.filter(feature => isFeatureEnabled(feature));
  };

  const isFooterFeatureEnabled = (feature: string): boolean => {
    return isFeatureEnabled(feature);
  };

  return {
    checkItemFeature,
    filterByFeatures,
    getEnabledFooterFeatures,
    isFooterFeatureEnabled,
    isFeatureEnabled,
    features
  };
}

/**
 * Component for displaying feature status in development mode
 */
export const FooterFeatureDebug: React.FC<{
  features: string[];
  className?: string;
}> = ({ features, className = '' }) => {
  const { isFeatureEnabled } = useEnabledFeatures();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className={`text-xs opacity-50 ${className}`}>
      <details>
        <summary>Feature Flags</summary>
        <ul className="mt-1">
          {features.map(feature => (
            <li key={feature} className="flex justify-between">
              <span>{feature}</span>
              <span className={isFeatureEnabled(feature) ? 'text-green-500' : 'text-red-500'}>
                {isFeatureEnabled(feature) ? '✓' : '✗'}
              </span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
};

export default FooterFeatureGate;