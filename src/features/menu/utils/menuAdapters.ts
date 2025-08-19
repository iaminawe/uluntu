import type { 
  MenuItem, 
  NavLinkItem, 
  FooterColumn, 
  FooterLink,
  MenuToNavLinkAdapter,
  MenuToFooterColumnAdapter 
} from '@/types/menu';

/**
 * Converts a dynamic MenuItem to legacy NavLinkItem format for backward compatibility
 */
export const menuToNavLinkAdapter: MenuToNavLinkAdapter = (item: MenuItem): NavLinkItem => {
  return {
    ...item,
    text: item.title,
    href: item.url || '#',
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
    return items.map(item => ({
      title: item.title,
      links: item.children?.map(child => ({
        text: child.title,
        href: child.url || '#'
      })) || []
    }));
  }

  // Default: treat top-level items as columns
  return items.map(item => ({
    title: item.title,
    links: item.children?.map(child => ({
      text: child.title,
      href: child.url || '#'
    })) || [{
      text: item.title,
      href: item.url || '#'
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
          text: item.title,
          href: item.url
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
  isFeatureEnabled: (feature: string) => boolean
): MenuItem[] {
  return items.map(item => {
    // Check if this item should be shown based on feature flag
    if (item.feature_flag && !isFeatureEnabled(item.feature_flag)) {
      return null;
    }

    // Filter children recursively
    const filteredChildren = item.children 
      ? filterMenuItemsByFeatures(item.children, isFeatureEnabled)
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
}

/**
 * Converts legacy NavLinkItem to MenuItem (for migration purposes)
 */
export function navLinkToMenuItem(navLink: NavLinkItem, sortOrder = 0): MenuItem {
  return {
    id: navLink.id || generateTempId(navLink.text),
    title: navLink.text || navLink.title,
    url: navLink.href || navLink.url,
    target: navLink.target,
    icon: navLink.icon,
    description: navLink.description,
    feature_flag: navLink.feature_flag,
    sort_order: sortOrder,
    css_classes: navLink.css_classes,
    children: navLink.children?.map((child, index) => 
      navLinkToMenuItem(child, index)
    )
  };
}

/**
 * Generates a temporary ID for menu items during migration
 */
function generateTempId(text: string): string {
  return `temp_${text.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
}

/**
 * Creates default fallback menu items for header navigation
 */
export function getDefaultHeaderMenuItems(): MenuItem[] {
  return [
    {
      id: 'community',
      title: 'Community',
      url: '/community',
      sort_order: 10,
      children: [
        {
          id: 'events',
          title: 'Events',
          url: '/events',
          description: 'Workshops, meetups, and tech talks',
          feature_flag: 'events_system',
          sort_order: 10
        },
        {
          id: 'directory',
          title: 'Directory',
          url: '/directory',
          description: 'Connect with tech professionals',
          feature_flag: 'members_directory',
          sort_order: 20
        },
        {
          id: 'groups',
          title: 'Groups',
          url: '/groups',
          description: 'Join communities of interest',
          feature_flag: 'groups_communities',
          sort_order: 30
        },
        {
          id: 'news',
          title: 'News',
          url: '/news',
          description: 'Latest tech news and articles',
          feature_flag: 'news_blog',
          sort_order: 40
        },
        {
          id: 'galleries',
          title: 'Galleries',
          url: '/galleries',
          description: 'Browse community photo galleries',
          feature_flag: 'photo_galleries',
          sort_order: 50
        }
      ]
    },
    {
      id: 'business',
      title: 'Business',
      url: '/business',
      sort_order: 20,
      children: [
        {
          id: 'companies',
          title: 'Companies',
          url: '/companies',
          description: 'Explore local tech companies',
          feature_flag: 'companies_listing',
          sort_order: 10
        },
        {
          id: 'opportunities',
          title: 'Opportunities',
          url: '/opportunities',
          description: 'Find jobs and volunteer roles',
          feature_flag: 'opportunities_board',
          sort_order: 20
        },
        {
          id: 'marketplace',
          title: 'Marketplace',
          url: '/marketplace',
          description: 'Buy and sell tech items',
          feature_flag: 'marketplace',
          sort_order: 30
        }
      ]
    },
    {
      id: 'resources',
      title: 'Resources',
      url: '/resources',
      description: 'Educational content and guides',
      feature_flag: 'resources_library',
      sort_order: 30
    },
    {
      id: 'topics',
      title: 'Topics',
      url: '/topics',
      description: 'Browse content by topic',
      sort_order: 40
    },
    {
      id: 'about',
      title: 'About',
      url: '/about',
      sort_order: 50,
      children: [
        {
          id: 'about-us',
          title: 'About Us',
          url: '/about',
          description: 'Learn about our mission',
          sort_order: 10
        },
        {
          id: 'about-uluntu',
          title: 'About Uluntu',
          url: '/about-uluntu',
          description: 'Learn about the Uluntu platform',
          sort_order: 20
        },
        {
          id: 'partners',
          title: 'Partners',
          url: '/partners',
          description: 'Our community partners and sponsors',
          sort_order: 30
        },
        {
          id: 'contact',
          title: 'Contact',
          url: '/contact',
          description: 'Get in touch with us',
          sort_order: 40
        },
        {
          id: 'privacy',
          title: 'Privacy',
          url: '/privacy',
          description: 'Privacy policy and data protection',
          sort_order: 50
        },
        {
          id: 'terms',
          title: 'Terms',
          url: '/terms',
          description: 'Terms of service and guidelines',
          sort_order: 60
        }
      ]
    }
  ];
}

/**
 * Creates default fallback menu items for footer navigation
 */
export function getDefaultFooterMenuItems(): MenuItem[] {
  return [
    {
      id: 'footer-community',
      title: 'Community',
      url: '/community',
      sort_order: 10
    },
    {
      id: 'footer-directory',
      title: 'Directory',
      url: '/directory',
      sort_order: 20
    },
    {
      id: 'footer-companies',
      title: 'Companies',
      url: '/companies',
      sort_order: 30
    },
    {
      id: 'footer-groups',
      title: 'Groups',
      url: '/groups',
      sort_order: 40
    },
    {
      id: 'footer-resources',
      title: 'Resources',
      url: '/resources',
      sort_order: 50
    },
    {
      id: 'footer-events',
      title: 'Events',
      url: '/events',
      sort_order: 60
    },
    {
      id: 'footer-news',
      title: 'News',
      url: '/news',
      sort_order: 70
    },
    {
      id: 'footer-marketplace',
      title: 'Marketplace',
      url: '/marketplace',
      sort_order: 80
    },
    {
      id: 'footer-opportunities',
      title: 'Opportunities',
      url: '/opportunities',
      sort_order: 90
    }
  ];
}