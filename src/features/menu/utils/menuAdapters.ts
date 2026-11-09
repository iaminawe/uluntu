import type { MenuItem } from '@/types/menu';
import type { FeatureKey } from '@/types/settings';

// Legacy compatibility types
export interface NavLinkItem {
  id: string;
  title: string;
  url: string;
  target?: string;
  icon?: string;
  description?: string;
  feature_flag?: string;
  sort_order: number;
  css_classes?: string;
  children?: NavLinkItem[];
}

export interface FooterColumn {
  id: string;
  title: string;
  links: FooterLink[];
  order: number;
}

export interface FooterLink {
  id: string;
  title: string;
  url: string;
  target?: string;
  icon?: string;
  description?: string;
}

export type MenuToNavLinkAdapter = (item: MenuItem) => NavLinkItem;
export type MenuToFooterColumnAdapter = (items: MenuItem[]) => FooterColumn[];

/**
 * Converts a dynamic MenuItem to legacy NavLinkItem format for backward compatibility
 */
export const menuToNavLinkAdapter: MenuToNavLinkAdapter = (item: MenuItem): NavLinkItem => {
  return {
    id: item.id,
    title: item.title,
    url: item.url,
    target: item.target,
    icon: item.icon || undefined,
    description: item.description || undefined,
    feature_flag: item.feature_flag || undefined,
    sort_order: item.sort_order,
    css_classes: item.css_classes || undefined,
    children: item.children?.map(menuToNavLinkAdapter)
  };
};

/**
 * Converts an array of MenuItems to NavLinkItem array
 */
export function menuItemsToNavLinks(items: MenuItem[]): NavLinkItem[] {
  return items.map(menuToNavLinkAdapter);
}

/**
 * Converts MenuItems to FooterColumn format
 * Groups top-level items as columns, with their children as links
 */
export const menuToFooterColumnsAdapter: MenuToFooterColumnAdapter = (
  items: MenuItem[],
  groupBy?: string
): FooterColumn[] => {
  if (groupBy) {
    // Group by a specific property (future enhancement)
    return items.map((item, index) => ({
      id: item.id,
      title: item.title,
      order: index,
      links: item.children?.map(child => ({
        id: child.id,
        title: child.title,
        url: child.url,
        target: child.target,
        icon: child.icon || undefined,
        description: child.description || undefined
      })) || []
    }));
  }

  // Default: treat top-level items as columns
  return items.map((item, index) => ({
    id: item.id,
    title: item.title,
    order: index,
    links: item.children?.map(child => ({
      id: child.id,
      title: child.title,
      url: child.url,
      target: child.target,
      icon: child.icon || undefined,
      description: child.description || undefined
    })) || [{
      id: item.id,
      title: item.title,
      url: item.url,
      target: item.target,
      icon: item.icon || undefined,
      description: item.description || undefined
    }]
  }));
};

/**
 * Flattens menu items into a simple FooterLink array
 * Useful for simple footer layouts without columns
 */
export function menuItemsToFooterLinks(items: MenuItem[]): FooterLink[] {
  const links: FooterLink[] = [];
  
  const flatten = (menuItems: MenuItem[]) => {
    menuItems.forEach(item => {
      if (item.url) {
        links.push({
          id: item.id,
          title: item.title,
          url: item.url,
          target: item.target,
          icon: item.icon || undefined,
          description: item.description || undefined
        });
      }
      if (item.children?.length) {
        flatten(item.children);
      }
    });
  };
  
  flatten(items);
  return links;
}

/**
 * Filters menu items based on feature flags
 */
export function filterMenuItemsByFeatures(
  items: MenuItem[], 
  isFeatureEnabled: (feature: FeatureKey | string) => boolean
): MenuItem[] {
  return items.filter(item => {
    // Check if this item should be shown based on feature flag
    if (item.feature_flag && !isFeatureEnabled(item.feature_flag)) {
      return false;
    }

    // Filter children recursively
    const filteredChildren = item.children 
      ? filterMenuItemsByFeatures(item.children, isFeatureEnabled)
      : undefined;

    // If item has children but none passed the filter, hide the parent too
    if (item.children?.length && (!filteredChildren || filteredChildren.length === 0)) {
      return false;
    }

    // Update children on the item
    if (filteredChildren) {
      item.children = filteredChildren;
    }

    return true;
  });
}

/**
 * Converts legacy NavLinkItem to MenuItem (for migration purposes)
 */
export function navLinkToMenuItem(navLink: NavLinkItem, sortOrder = 0): MenuItem {
  return {
    id: navLink.id || generateTempId(navLink.title),
    title: navLink.title,
    url: navLink.url,
    description: navLink.description,
    menu_type: 'main',
    parent_id: null,
    sort_order: sortOrder,
    is_enabled: true,
    target: (navLink.target as any) || '_self',
    icon: navLink.icon,
    css_classes: navLink.css_classes,
    visibility: 'public',
    required_roles: null,
    is_external: navLink.target === '_blank',
    feature_flag: navLink.feature_flag,
    children: navLink.children?.map((child: any, index: number) => 
      navLinkToMenuItem(child, index)
    ),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

/**
 * Generates a temporary ID for menu items during migration
 */
function generateTempId(text: string): string {
  return `temp_${text.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
}

/**
 * Creates a complete MenuItem with default required properties
 */
function createMenuItem(partial: Partial<MenuItem> & { id: string; title: string; url: string }): MenuItem {
  return {
    ...partial,
    menu_type: partial.menu_type || 'main',
    parent_id: partial.parent_id || null,
    sort_order: partial.sort_order || 0,
    is_enabled: partial.is_enabled !== undefined ? partial.is_enabled : true,
    target: partial.target || '_self',
    visibility: partial.visibility || 'public',
    required_roles: partial.required_roles || null,
    is_external: partial.is_external !== undefined ? partial.is_external : false,
    status: partial.status || 'published',
    featured: partial.featured !== undefined ? partial.featured : null,
    created_at: partial.created_at || new Date().toISOString(),
    updated_at: partial.updated_at || new Date().toISOString()
  } as MenuItem;
}

/**
 * Creates default fallback menu items for header navigation
 */
export function getDefaultHeaderMenuItems(): MenuItem[] {
  return [
    createMenuItem({
      id: 'community',
      title: 'Community',
      url: '/community',
      sort_order: 10,
      children: [
        createMenuItem({
          id: 'events',
          title: 'Events',
          url: '/events',
          description: 'Workshops, meetups, and gatherings',
          feature_flag: 'events_system',
          sort_order: 10
        }),
        createMenuItem({
          id: 'directory',
          title: 'Directory',
          url: '/directory',
          description: 'Connect with community members',
          feature_flag: 'members_directory',
          sort_order: 20
        }),
        createMenuItem({
          id: 'groups',
          title: 'Groups',
          url: '/groups',
          description: 'Join communities of interest',
          feature_flag: 'groups_communities',
          sort_order: 30
        }),
        createMenuItem({
          id: 'news',
          title: 'News',
          url: '/news',
          description: 'Latest community news and articles',
          feature_flag: 'news_blog',
          sort_order: 40
        }),
        createMenuItem({
          id: 'galleries',
          title: 'Galleries',
          url: '/galleries',
          description: 'Browse community photo galleries',
          feature_flag: 'photo_galleries',
          sort_order: 50
        })
      ]
    }),
    createMenuItem({
      id: 'business',
      title: 'Business',
      url: '/business',
      sort_order: 20,
      children: [
        createMenuItem({
          id: 'companies',
          title: 'Companies',
          url: '/companies',
          description: 'Explore local businesses and organizations',
          feature_flag: 'companies_listing',
          sort_order: 10
        }),
        createMenuItem({
          id: 'opportunities',
          title: 'Opportunities',
          url: '/opportunities',
          description: 'Find jobs and volunteer roles',
          feature_flag: 'opportunities_board',
          sort_order: 20
        }),
        createMenuItem({
          id: 'marketplace',
          title: 'Marketplace',
          url: '/marketplace',
          description: 'Buy and sell tech items',
          feature_flag: 'marketplace',
          sort_order: 30
        })
      ]
    }),
    createMenuItem({
      id: 'resources',
      title: 'Resources',
      url: '/resources',
      description: 'Educational content and guides',
      feature_flag: 'resources_library',
      sort_order: 30
    }),
    createMenuItem({
      id: 'topics',
      title: 'Topics',
      url: '/topics',
      description: 'Browse content by topic',
      sort_order: 40
    }),
    createMenuItem({
      id: 'about',
      title: 'About',
      url: '/about',
      sort_order: 50,
      children: [
        createMenuItem({
          id: 'about-us',
          title: 'About Us',
          url: '/about',
          description: 'Learn about Uluntu',
          sort_order: 10
        }),
        createMenuItem({
          id: 'contact',
          title: 'Contact',
          url: '/contact',
          description: 'Get in touch with us',
          sort_order: 40
        }),
        createMenuItem({
          id: 'privacy',
          title: 'Privacy',
          url: '/privacy',
          description: 'Privacy policy and data protection',
          sort_order: 50
        }),
        createMenuItem({
          id: 'terms',
          title: 'Terms',
          url: '/terms',
          description: 'Terms of service and guidelines',
          sort_order: 60
        })
      ]
    })
  ];
}

/**
 * Creates default fallback menu items for footer navigation
 */
export function getDefaultFooterMenuItems(): MenuItem[] {
  return [
    createMenuItem({
      id: 'footer-community',
      title: 'Community',
      url: '/community',
      sort_order: 10
    }),
    createMenuItem({
      id: 'footer-directory',
      title: 'Directory',
      url: '/directory',
      sort_order: 20
    }),
    createMenuItem({
      id: 'footer-companies',
      title: 'Companies',
      url: '/companies',
      sort_order: 30
    }),
    createMenuItem({
      id: 'footer-groups',
      title: 'Groups',
      url: '/groups',
      sort_order: 40
    }),
    createMenuItem({
      id: 'footer-resources',
      title: 'Resources',
      url: '/resources',
      sort_order: 50
    }),
    createMenuItem({
      id: 'footer-events',
      title: 'Events',
      url: '/events',
      sort_order: 60
    }),
    createMenuItem({
      id: 'footer-news',
      title: 'News',
      url: '/news',
      sort_order: 70
    }),
    createMenuItem({
      id: 'footer-marketplace',
      title: 'Marketplace',
      url: '/marketplace',
      sort_order: 80
    }),
    createMenuItem({
      id: 'footer-opportunities',
      title: 'Opportunities',
      url: '/opportunities',
      sort_order: 90
    })
  ];
}