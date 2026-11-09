import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useMenuItems } from '@/features/menu/contexts/MenuContext';
import { menuItemsToNavLinks, filterMenuItemsByFeatures } from '@/features/menu/utils/menuAdapters';
import { useEnabledFeatures } from '@/hooks/useSettings';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';
import type { NavLinkItem } from '@/shared/components/layout/Header/types';
import type { MenuItem } from '@/types/menu';

// Feature flags for navigation system
interface NavigationFeatureFlags {
  use_dynamic_menu: boolean;
  enable_menu_caching: boolean;
  enable_role_based_menus: boolean;
}

// Navigation context type
interface NavigationContextType {
  // Header navigation
  headerNavLinks: NavLinkItem[];
  headerLoading: boolean;
  headerError: string | null;
  
  // Footer navigation  
  footerNavLinks: NavLinkItem[];
  footerLoading: boolean;
  footerError: string | null;
  
  // Mobile navigation
  mobileNavLinks: NavLinkItem[];
  mobileLoading: boolean;
  mobileError: string | null;
  
  // Control methods
  refreshNavigation: (position?: string) => void;
  isDynamicEnabled: boolean;
  
  // Feature flags
  features: Partial<NavigationFeatureFlags>;
}

// Default nav links fallback for backward compatibility
const DEFAULT_HEADER_NAV_LINKS: NavLinkItem[] = [
  { 
    text: "Community", 
    href: "/community",
    children: [
      { text: "Events", href: "/events", description: "Workshops, meetups, and gatherings", feature: "events_system" },
      { text: "Directory", href: "/directory", description: "Connect with community members", feature: "members_directory" },
      { text: "Groups", href: "/groups", description: "Join communities of interest", feature: "groups_communities" },
      { text: "News", href: "/news", description: "Latest community news and articles", feature: "news_blog" },
      { text: "Galleries", href: "/galleries", description: "Browse community photo galleries", feature: "photo_galleries" }
    ]
  },
  { 
    text: "Business", 
    href: "/business",
    children: [
      { text: "Companies", href: "/companies", description: "Explore local businesses and organizations", feature: "companies_listing" },
      { text: "Opportunities", href: "/opportunities", description: "Find jobs and volunteer roles", feature: "opportunities_board" },
      { text: "Marketplace", href: "/marketplace", description: "Buy and sell tech items", feature: "marketplace" }
    ]
  },
  { 
    text: "Resources", 
    href: "/resources", 
    description: "Educational content and guides",
    feature: "resources_library"
  },
  {
    text: "Topics",
    href: "/topics",
    description: "Browse content by topic",
    feature: "topics_system"
  },
  { 
    text: "About", 
    href: "/about",
    children: [
      { text: "About Us", href: "/about", description: "Learn about Uluntu" },
      { text: "Contact", href: "/contact", description: "Get in touch with us" },
      { text: "Privacy", href: "/privacy", description: "Privacy policy and data protection" },
      { text: "Terms", href: "/terms", description: "Terms of service and guidelines" }
    ]
  }
];

const DEFAULT_FOOTER_NAV_LINKS: NavLinkItem[] = [
  { text: "Community", href: "/community" },
  { text: "Directory", href: "/directory" },
  { text: "Companies", href: "/companies" },
  { text: "Groups", href: "/groups" },
  { text: "Resources", href: "/resources" },
  { text: "Events", href: "/events" },
  { text: "News", href: "/news" },
  { text: "About", href: "/about" },
  { text: "Contact", href: "/contact" },
  { text: "Privacy", href: "/privacy" },
  { text: "Terms", href: "/terms" }
];

// Navigation Context
const NavigationContext = createContext<NavigationContextType | null>(null);

// Navigation Provider Component
export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { features, isFeatureEnabled } = useEnabledFeatures();
  const { session, user } = useSession();
  
  // Check if dynamic menus are enabled via feature flag
  const isDynamicEnabled = useMemo(() => {
    return isFeatureEnabled('dynamic_menu_system' as any) || false;
  }, [isFeatureEnabled]);
  
  // Get user roles for role-based filtering
  const userRoles = useMemo(() => {
    if (!session || !user) return ['anonymous'];
    
    // Extract roles from user data or session
    const roles = ['authenticated']; // Base role for logged-in users
    
    // Add specific roles if available
    if (user.roles && Array.isArray(user.roles)) {
      roles.push(...user.roles);
    }
    
    // Check for admin role
    if (user.is_admin || user.role === 'admin') {
      roles.push('admin');
    }
    
    return roles;
  }, [session, user]);
  
  // Hook into dynamic menu system
  const { 
    items: headerMenuItems, 
    loading: headerLoading, 
    error: headerError,
    refresh: refreshHeader 
  } = useMenuItems('header_menu');
  
  const { 
    items: footerMenuItems, 
    loading: footerLoading, 
    error: footerError,
    refresh: refreshFooter 
  } = useMenuItems('footer_menu');
  
  const { 
    items: mobileMenuItems, 
    loading: mobileLoading, 
    error: mobileError,
    refresh: refreshMobile 
  } = useMenuItems('mobile_menu');

  // Filter menu items by role-based access
  const filterMenuItemsByRoles = useCallback((items: MenuItem[]): MenuItem[] => {
    return items.map(item => {
      // Check visibility requirements
      if (item.visibility === 'public') {
        // Public items are visible to everyone
      } else if (item.visibility === 'authenticated') {
        // Only show to logged-in users
        if (!session) return null;
      } else if (item.visibility === 'admin') {
        // Only show to admin users
        if (!userRoles.includes('admin')) return null;
      } else if (item.visibility === 'role_based' && item.required_roles) {
        // Check if user has any of the required roles
        const hasRequiredRole = item.required_roles.some(role => userRoles.includes(role));
        if (!hasRequiredRole) return null;
      }
      
      // Filter children recursively
      const filteredChildren = item.children 
        ? filterMenuItemsByRoles(item.children)
        : undefined;
      
      // If item has children but none passed the filter, hide the parent too
      if (item.children?.length && (!filteredChildren || filteredChildren.length === 0)) {
        return null;
      }
      
      return {
        ...item,
        children: filteredChildren
      };
    }).filter((item): item is MenuItem => item !== null);
  }, [session, userRoles]);

  // Convert menu items to nav links with feature and role filtering
  const processMenuItems = useCallback((items: MenuItem[]): NavLinkItem[] => {
    if (!items || items.length === 0) return [];

    // Filter by roles first
    const roleFilteredItems = filterMenuItemsByRoles(items);

    // Then filter by feature flags
    const featureFilteredItems = filterMenuItemsByFeatures(roleFilteredItems, isFeatureEnabled);

    // Convert to nav links
    return menuItemsToNavLinks(featureFilteredItems);
  }, [isFeatureEnabled, filterMenuItemsByRoles]);

  // Filter static nav links by feature flags
  const filterNavLinksByFeatures = useCallback((links: NavLinkItem[]): NavLinkItem[] => {
    return links.map(link => {
      // If the main link has a feature requirement, check it
      if (link.feature && !isFeatureEnabled(link.feature as any)) {
        return null;
      }

      // Filter children based on their feature requirements
      if (link.children) {
        const filteredChildren = link.children.filter(child => {
          return !child.feature || isFeatureEnabled(child.feature as any);
        });

        // If no children remain after filtering, hide the parent
        if (filteredChildren.length === 0) {
          return null;
        }

        return {
          ...link,
          children: filteredChildren
        };
      }

      return link;
    }).filter((link): link is NavLinkItem => link !== null);
  }, [isFeatureEnabled]);

  // Header navigation
  const headerNavLinks = useMemo(() => {
    if (!isDynamicEnabled) {
      // Use static fallback when dynamic system is disabled, but apply feature filtering
      return filterNavLinksByFeatures(DEFAULT_HEADER_NAV_LINKS);
    }

    if (headerLoading && headerMenuItems.length === 0) {
      // Show empty array while loading if no cached data
      return [];
    }

    if (headerError && headerMenuItems.length === 0) {
      // Fallback to static links on error with no cached data, but apply feature filtering
      console.warn('Header menu failed to load, falling back to static navigation:', headerError);
      return filterNavLinksByFeatures(DEFAULT_HEADER_NAV_LINKS);
    }

    // Use dynamic menu items or fallback to static
    const menuItems = headerMenuItems.length > 0 ? headerMenuItems : [];
    const processedLinks = processMenuItems(menuItems);

    // Apply feature filtering to fallback as well
    return processedLinks.length > 0 ? processedLinks : filterNavLinksByFeatures(DEFAULT_HEADER_NAV_LINKS);
  }, [isDynamicEnabled, headerMenuItems, headerLoading, headerError, processMenuItems, filterNavLinksByFeatures]);

  // Footer navigation
  const footerNavLinks = useMemo(() => {
    if (!isDynamicEnabled) {
      return DEFAULT_FOOTER_NAV_LINKS;
    }
    
    if (footerLoading && footerMenuItems.length === 0) {
      return [];
    }
    
    if (footerError && footerMenuItems.length === 0) {
      console.warn('Footer menu failed to load, falling back to static navigation:', footerError);
      return DEFAULT_FOOTER_NAV_LINKS;
    }
    
    const menuItems = footerMenuItems.length > 0 ? footerMenuItems : [];
    const processedLinks = processMenuItems(menuItems);
    
    return processedLinks.length > 0 ? processedLinks : DEFAULT_FOOTER_NAV_LINKS;
  }, [isDynamicEnabled, footerMenuItems, footerLoading, footerError, processMenuItems]);

  // Mobile navigation (fallback to header items)
  const mobileNavLinks = useMemo(() => {
    if (!isDynamicEnabled) {
      return DEFAULT_HEADER_NAV_LINKS;
    }
    
    // Use mobile-specific items if available, otherwise fallback to header items
    const sourceItems = mobileMenuItems.length > 0 ? mobileMenuItems : headerMenuItems;
    
    if ((mobileLoading || headerLoading) && sourceItems.length === 0) {
      return [];
    }
    
    if ((mobileError || headerError) && sourceItems.length === 0) {
      console.warn('Mobile menu failed to load, falling back to static navigation:', mobileError || headerError);
      return DEFAULT_HEADER_NAV_LINKS;
    }
    
    const processedLinks = processMenuItems(sourceItems);
    return processedLinks.length > 0 ? processedLinks : DEFAULT_HEADER_NAV_LINKS;
  }, [isDynamicEnabled, mobileMenuItems, headerMenuItems, mobileLoading, headerLoading, mobileError, headerError, processMenuItems]);

  // Refresh methods
  const refreshNavigation = useCallback((position?: string) => {
    switch (position) {
      case 'header':
        refreshHeader();
        break;
      case 'footer':
        refreshFooter();
        break;
      case 'mobile':
        refreshMobile();
        break;
      default:
        // Refresh all
        refreshHeader();
        refreshFooter();
        refreshMobile();
        break;
    }
  }, [refreshHeader, refreshFooter, refreshMobile]);

  // Navigation feature flags
  const navigationFeatures = useMemo((): Partial<NavigationFeatureFlags> => ({
    use_dynamic_menu: isDynamicEnabled,
    enable_menu_caching: isFeatureEnabled('menu_caching' as any) || false,
    enable_role_based_menus: isFeatureEnabled('role_based_menus' as any) || false,
  }), [isDynamicEnabled, isFeatureEnabled]);

  const contextValue: NavigationContextType = {
    // Header
    headerNavLinks,
    headerLoading: isDynamicEnabled ? headerLoading : false,
    headerError: isDynamicEnabled ? headerError : null,
    
    // Footer
    footerNavLinks,
    footerLoading: isDynamicEnabled ? footerLoading : false,
    footerError: isDynamicEnabled ? footerError : null,
    
    // Mobile
    mobileNavLinks,
    mobileLoading: isDynamicEnabled ? (mobileLoading || headerLoading) : false,
    mobileError: isDynamicEnabled ? (mobileError || headerError) : null,
    
    // Controls
    refreshNavigation,
    isDynamicEnabled,
    
    // Features
    features: navigationFeatures,
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
};

// Hook to use navigation context
export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

// Convenience hooks for specific navigation areas
export const useHeaderNavigation = () => {
  const { headerNavLinks, headerLoading, headerError, refreshNavigation, isDynamicEnabled } = useNavigation();
  
  return {
    navLinks: headerNavLinks,
    loading: headerLoading,
    error: headerError,
    refresh: () => refreshNavigation('header'),
    isDynamic: isDynamicEnabled
  };
};

export const useFooterNavigation = () => {
  const { footerNavLinks, footerLoading, footerError, refreshNavigation, isDynamicEnabled } = useNavigation();
  
  return {
    navLinks: footerNavLinks,
    loading: footerLoading,
    error: footerError,
    refresh: () => refreshNavigation('footer'),
    isDynamic: isDynamicEnabled
  };
};

export const useMobileNavigation = () => {
  const { mobileNavLinks, mobileLoading, mobileError, refreshNavigation, isDynamicEnabled } = useNavigation();
  
  return {
    navLinks: mobileNavLinks,
    loading: mobileLoading,
    error: mobileError,
    refresh: () => refreshNavigation('mobile'),
    isDynamic: isDynamicEnabled
  };
};