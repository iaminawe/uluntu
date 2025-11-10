// Re-export navigation hooks for convenience
export { 
  useNavigation,
  useHeaderNavigation,
  useFooterNavigation,
  useMobileNavigation 
} from '@/providers/NavigationProvider';

// Additional navigation utilities
import { useCallback, useMemo } from 'react';
import { useNavigation } from '@/providers/NavigationProvider';
import type { NavLinkItem } from '@/shared/components/layout/Header/types';

/**
 * Hook for navigation utilities and helpers
 */
export const useNavigationHelpers = () => {
  const { features, isDynamicEnabled } = useNavigation();
  
  // Find nav item by href
  const findNavItemByHref = useCallback((navLinks: NavLinkItem[], href: string): NavLinkItem | null => {
    for (const link of navLinks) {
      if (link.href === href) {
        return link;
      }
      if (link.children) {
        const childResult = findNavItemByHref(link.children, href);
        if (childResult) return childResult;
      }
    }
    return null;
  }, []);

  // Get breadcrumb path for current route
  const getBreadcrumbPath = useCallback((navLinks: NavLinkItem[], currentHref: string): NavLinkItem[] => {
    const path: NavLinkItem[] = [];
    
    const findPath = (items: NavLinkItem[], targetHref: string): boolean => {
      for (const item of items) {
        path.push(item);
        
        if (item.href === targetHref) {
          return true;
        }
        
        if (item.children && findPath(item.children, targetHref)) {
          return true;
        }
        
        path.pop();
      }
      return false;
    };
    
    findPath(navLinks, currentHref);
    return path;
  }, []);

  // Filter nav items by feature flags
  const filterNavItemsByFeatures = useCallback((navLinks: NavLinkItem[], isFeatureEnabled: (feature: string) => boolean): NavLinkItem[] => {
    return navLinks.map(link => {
      // Check if this link should be shown based on feature flag
      if (link.feature && !isFeatureEnabled(link.feature)) {
        return null;
      }

      // Filter children recursively
      const filteredChildren = link.children 
        ? filterNavItemsByFeatures(link.children, isFeatureEnabled)
        : undefined;

      // If link has children but none passed the filter, hide the parent too
      if (link.children?.length && (!filteredChildren || filteredChildren.length === 0)) {
        return null;
      }

      return {
        ...link,
        children: filteredChildren
      };
    }).filter((item): item is NavLinkItem => item !== null);
  }, []);

  // Get flattened list of all nav links (useful for search, sitemaps, etc.)
  const getFlattenedNavLinks = useCallback((navLinks: NavLinkItem[]): NavLinkItem[] => {
    const flattened: NavLinkItem[] = [];
    
    const flatten = (items: NavLinkItem[]) => {
      items.forEach(item => {
        flattened.push({
          ...item,
          children: undefined // Remove children for flattened version
        });
        
        if (item.children?.length) {
          flatten(item.children);
        }
      });
    };
    
    flatten(navLinks);
    return flattened;
  }, []);

  // Check if navigation system is healthy
  const isNavigationHealthy = useMemo(() => {
    if (!isDynamicEnabled) {
      return true; // Static navigation is always healthy
    }
    
    // Add health checks for dynamic navigation
    return features.use_dynamic_menu === true;
  }, [isDynamicEnabled, features]);

  return {
    findNavItemByHref,
    getBreadcrumbPath,
    filterNavItemsByFeatures,
    getFlattenedNavLinks,
    isNavigationHealthy,
    features,
    isDynamicEnabled
  };
};

/**
 * Hook for navigation analytics and debugging
 */
export const useNavigationDebug = () => {
  const navigation = useNavigation();
  const helpers = useNavigationHelpers();
  
  const debugInfo = useMemo(() => ({
    system: {
      isDynamic: navigation.isDynamicEnabled,
      features: navigation.features,
      healthy: helpers.isNavigationHealthy
    },
    header: {
      itemCount: navigation.headerNavLinks.length,
      loading: navigation.headerLoading,
      hasError: !!navigation.headerError,
      error: navigation.headerError
    },
    footer: {
      itemCount: navigation.footerNavLinks.length,
      loading: navigation.footerLoading,
      hasError: !!navigation.footerError,
      error: navigation.footerError
    },
    mobile: {
      itemCount: navigation.mobileNavLinks.length,
      loading: navigation.mobileLoading,
      hasError: !!navigation.mobileError,
      error: navigation.mobileError
    }
  }), [navigation, helpers.isNavigationHealthy]);

  const logNavigationState = useCallback(() => {
    // Debug logging function for navigation state (disabled)
    // Uncomment for debugging: console.group('Navigation System Debug');
    // etc...
  }, [debugInfo, navigation]);

  return {
    debugInfo,
    logNavigationState,
    ...navigation,
    ...helpers
  };
};