import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useEnabledFeatures } from '@/hooks/useSettings';
import { useMenuItems } from '@/features/menu/contexts/MenuContext';
import { filterMenuItemsByFeatures } from '@/features/menu/utils/menuAdapters';
import type { MenuItem, FooterColumn, FooterMenuConfig } from '../types';

interface FooterMenuContextType {
  footerMenuItems: MenuItem[];
  loading: boolean;
  error: string | null;
  isFeatureEnabled: (feature: string) => boolean;
  generateColumns: (config?: Partial<FooterMenuConfig>) => FooterColumn[];
  refreshFooterMenu: () => void;
}

const FooterMenuContext = createContext<FooterMenuContextType | null>(null);

interface FooterMenuProviderProps {
  children: React.ReactNode;
  userRoles?: string[];
  fallbackItems?: MenuItem[];
}

/**
 * Provider for footer menu context with caching and optimization
 */
export const FooterMenuProvider: React.FC<FooterMenuProviderProps> = ({
  children,
  userRoles = [],
  fallbackItems = []
}) => {
  const { isFeatureEnabled } = useEnabledFeatures();
  const { items: rawItems, loading, error, refresh } = useMenuItems('footer_links');

  // Filter and process footer menu items
  const footerMenuItems = useMemo(() => {
    const itemsToProcess = rawItems.length > 0 ? rawItems : fallbackItems;
    
    // Apply feature flag filtering
    let filtered = filterMenuItemsByFeatures(itemsToProcess, isFeatureEnabled);
    
    // Apply role-based filtering
    if (userRoles.length > 0) {
      filtered = filtered.filter(item => {
        if (!item.required_roles || item.required_roles.length === 0) {
          return item.visibility === 'public' || item.visibility === 'authenticated';
        }
        return item.required_roles.some(role => userRoles.includes(role));
      });
    } else {
      // Only show public items for unauthenticated users
      filtered = filtered.filter(item => item.visibility === 'public');
    }

    // Sort by sort_order
    return filtered.sort((a, b) => a.sort_order - b.sort_order);
  }, [rawItems, fallbackItems, isFeatureEnabled, userRoles]);

  // Generate footer columns with different strategies
  const generateColumns = useCallback((config: Partial<FooterMenuConfig> = {}) => {
    const defaultConfig: FooterMenuConfig = {
      groupingStrategy: 'by-category',
      maxItemsPerColumn: 6,
      showIcons: false,
      showDescriptions: false,
      preserveHierarchy: true,
      ...config
    };

    return generateFooterColumns(footerMenuItems, defaultConfig);
  }, [footerMenuItems]);

  const contextValue: FooterMenuContextType = {
    footerMenuItems,
    loading,
    error,
    isFeatureEnabled,
    generateColumns,
    refreshFooterMenu: refresh
  };

  return (
    <FooterMenuContext.Provider value={contextValue}>
      {children}
    </FooterMenuContext.Provider>
  );
};

/**
 * Hook to use footer menu context
 */
export const useFooterMenu = (): FooterMenuContextType => {
  const context = useContext(FooterMenuContext);
  if (!context) {
    throw new Error('useFooterMenu must be used within a FooterMenuProvider');
  }
  return context;
};

/**
 * Generate footer columns based on menu items and configuration
 */
function generateFooterColumns(
  items: MenuItem[],
  config: FooterMenuConfig
): FooterColumn[] {
  if (items.length === 0) {
    return [];
  }

  switch (config.groupingStrategy) {
    case 'by-category':
      return groupByCategory(items, config);
    case 'by-section':
      return groupBySection(items, config);
    case 'hierarchical':
      return config.preserveHierarchy 
        ? groupHierarchically(items, config)
        : groupFlat(items, config);
    case 'flat':
    default:
      return groupFlat(items, config);
  }
}

/**
 * Group items by inferred categories
 */
function groupByCategory(items: MenuItem[], config: FooterMenuConfig): FooterColumn[] {
  const categories = new Map<string, MenuItem[]>();
  
  items.forEach(item => {
    const category = inferCategoryFromItem(item);
    if (!categories.has(category)) {
      categories.set(category, []);
    }
    categories.get(category)!.push(item);
  });

  const columns: FooterColumn[] = [];
  
  Array.from(categories.entries())
    .sort(([a], [b]) => getCategoryPriority(a) - getCategoryPriority(b))
    .forEach(([category, categoryItems]) => {
      const links = categoryItems
        .slice(0, config.maxItemsPerColumn)
        .map(item => ({
          text: item.title,
          href: item.url || '#',
          isExternal: item.is_external,
          target: item.target,
          icon: config.showIcons ? item.icon : undefined
        }));
      
      if (links.length > 0) {
        columns.push({
          id: `category-${category.toLowerCase().replace(/\s+/g, '-')}`,
          title: category,
          links
        });
      }
    });
  
  return columns;
}

/**
 * Group items by parent-child sections
 */
function groupBySection(items: MenuItem[], config: FooterMenuConfig): FooterColumn[] {
  const parentItems = items.filter(item => !item.parent_id);
  const columns: FooterColumn[] = [];
  
  parentItems.forEach(parent => {
    const children = items
      .filter(item => item.parent_id === parent.id)
      .slice(0, config.maxItemsPerColumn - 1);
    
    const links = children.length > 0 
      ? children.map(child => ({
          text: child.title,
          href: child.url || '#',
          isExternal: child.is_external,
          target: child.target
        }))
      : [{
          text: parent.title,
          href: parent.url || '#',
          isExternal: parent.is_external,
          target: parent.target
        }];
    
    columns.push({
      id: `section-${parent.id}`,
      title: parent.title,
      links
    });
  });
  
  return columns;
}

/**
 * Group items hierarchically
 */
function groupHierarchically(items: MenuItem[], config: FooterMenuConfig): FooterColumn[] {
  const topLevel = items.filter(item => !item.parent_id);
  const columns: FooterColumn[] = [];
  
  topLevel.forEach(topItem => {
    const descendants = findAllDescendants(topItem.id, items)
      .slice(0, config.maxItemsPerColumn);
    
    const links = descendants.length > 0
      ? descendants.map(descendant => ({
          text: descendant.title,
          href: descendant.url || '#',
          isExternal: descendant.is_external,
          target: descendant.target
        }))
      : [{
          text: topItem.title,
          href: topItem.url || '#',
          isExternal: topItem.is_external,
          target: topItem.target
        }];
    
    columns.push({
      id: `hierarchical-${topItem.id}`,
      title: topItem.title,
      links
    });
  });
  
  return columns;
}

/**
 * Group items flat with even distribution
 */
function groupFlat(items: MenuItem[], config: FooterMenuConfig): FooterColumn[] {
  const maxColumns = 4;
  const itemsPerColumn = Math.ceil(items.length / maxColumns);
  const actualItemsPerColumn = Math.min(itemsPerColumn, config.maxItemsPerColumn);
  
  const columns: FooterColumn[] = [];
  
  for (let i = 0; i < maxColumns && i * actualItemsPerColumn < items.length; i++) {
    const start = i * actualItemsPerColumn;
    const end = Math.min(start + actualItemsPerColumn, items.length);
    const columnItems = items.slice(start, end);
    
    if (columnItems.length === 0) break;
    
    const links = columnItems.map(item => ({
      text: item.title,
      href: item.url || '#',
      isExternal: item.is_external,
      target: item.target
    }));
    
    const title = getColumnTitle(i);
    
    columns.push({
      id: `flat-${i}`,
      title,
      links
    });
  }
  
  return columns;
}

/**
 * Helper functions
 */
function inferCategoryFromItem(item: MenuItem): string {
  const url = item.url?.toLowerCase() || '';
  
  if (url.includes('/community') || url.includes('/directory') || url.includes('/groups') || url.includes('/events')) {
    return 'Community';
  }
  if (url.includes('/business') || url.includes('/companies') || url.includes('/opportunities') || url.includes('/marketplace')) {
    return 'Business';
  }
  if (url.includes('/resources') || url.includes('/news') || url.includes('/galleries') || url.includes('/topics')) {
    return 'Resources';
  }
  if (url.includes('/about') || url.includes('/contact') || url.includes('/privacy') || url.includes('/terms')) {
    return 'About';
  }
  
  return 'Links';
}

function getCategoryPriority(category: string): number {
  const priorities = {
    'Community': 1,
    'Business': 2,
    'Resources': 3,
    'About': 4,
    'Links': 5
  };
  return priorities[category as keyof typeof priorities] || 6;
}

function getColumnTitle(index: number): string {
  const titles = ['Community', 'Business', 'Resources', 'About'];
  return titles[index] || 'Links';
}

function findAllDescendants(parentId: string, items: MenuItem[]): MenuItem[] {
  const descendants: MenuItem[] = [];
  
  const findChildren = (currentParentId: string) => {
    items.forEach(item => {
      if (item.parent_id === currentParentId) {
        descendants.push(item);
        findChildren(item.id); // Recursive for nested children
      }
    });
  };
  
  findChildren(parentId);
  return descendants.sort((a, b) => a.sort_order - b.sort_order);
}

export default FooterMenuProvider;