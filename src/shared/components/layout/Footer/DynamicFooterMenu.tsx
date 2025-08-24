import React, { useMemo } from 'react';
import { useMenuItems } from '@/features/menu/contexts/MenuContext';
import { filterMenuItemsByFeatures } from '@/features/menu/utils/menuAdapters';
import { useEnabledFeatures } from '@/hooks/useSettings';
import type { 
  FooterColumn, 
  FooterMenuConfig,
  FooterGroupingStrategy,
  DynamicFooterProps 
} from './types';
import type { MenuItem } from '@/types/menu';
import FooterColumnComponent from './FooterColumn';
import { MenuLoadingSkeleton } from '@/features/menu/components/DynamicMenu';

interface DynamicFooterMenuProps extends DynamicFooterProps {
  config?: Partial<FooterMenuConfig>;
  className?: string;
  onError?: (error: string) => void;
}

/**
 * Dynamic footer menu component that fetches menu items from the database
 * and renders them in a responsive column layout with proper loading states
 */
export const DynamicFooterMenu: React.FC<DynamicFooterMenuProps> = ({
  enableDynamicMenu = true,
  fallbackColumns = [],
  featureFlagKey = 'dynamic_footer_menus',
  permissionRoles = [],
  maxColumns = 4,
  columnLayout = 'auto',
  config = {},
  className = '',
  onError
}) => {
  const { isFeatureEnabled: checkFeature } = useEnabledFeatures();
  const isFeatureEnabled = (feature: string) => checkFeature(feature as any);
  const { items: rawMenuItems, loading, error } = useMenuItems('footer_links');
  
  // Check if dynamic footer menus are enabled
  const isDynamicEnabled = enableDynamicMenu && isFeatureEnabled(featureFlagKey);
  
  // Default menu configuration
  const menuConfig: FooterMenuConfig = {
    groupingStrategy: 'by-category',
    maxItemsPerColumn: 8,
    showIcons: false,
    showDescriptions: false,
    preserveHierarchy: true,
    ...config
  };

  // Filter menu items based on feature flags and permissions
  const filteredMenuItems = useMemo(() => {
    if (!isDynamicEnabled || rawMenuItems.length === 0) {
      return [];
    }

    let filtered = filterMenuItemsByFeatures(rawMenuItems, isFeatureEnabled);
    
    // Apply permission filtering if roles are specified
    if (permissionRoles.length > 0) {
      filtered = filtered.filter(item => {
        if (!item.required_roles || item.required_roles.length === 0) {
          return true; // Public items
        }
        return item.required_roles.some(role => permissionRoles.includes(role));
      });
    }

    return filtered;
  }, [rawMenuItems, isFeatureEnabled, isDynamicEnabled, permissionRoles]);

  // Convert menu items to footer columns
  const dynamicColumns = useMemo(() => {
    if (filteredMenuItems.length === 0) {
      return [];
    }

    return convertMenuItemsToFooterColumns(
      filteredMenuItems,
      menuConfig,
      maxColumns
    );
  }, [filteredMenuItems, menuConfig, maxColumns]);

  // Determine which columns to render
  const columnsToRender = useMemo(() => {
    if (isDynamicEnabled) {
      if (loading) {
        return []; // Will show loading skeleton
      }
      if (error || dynamicColumns.length === 0) {
        if (onError) {
          onError(error || 'No menu items available');
        }
        return fallbackColumns;
      }
      return dynamicColumns;
    }
    return fallbackColumns;
  }, [isDynamicEnabled, loading, error, dynamicColumns, fallbackColumns, onError]);

  // Loading state
  if (isDynamicEnabled && loading && rawMenuItems.length === 0) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(maxColumns, 4)} gap-8 ${className}`}>
        {Array.from({ length: maxColumns }, (_, i) => (
          <div key={i} className="flex flex-col">
            <div className="h-5 w-20 bg-slate-200 dark:bg-slate-600 rounded animate-pulse mb-3" />
            <MenuLoadingSkeleton 
              count={4} 
              className="space-y-2"
              itemClassName="h-4 w-16 bg-slate-200 dark:bg-slate-600 rounded animate-pulse"
            />
          </div>
        ))}
      </div>
    );
  }

  // Error state with fallback
  if (isDynamicEnabled && error && columnsToRender === fallbackColumns) {
    console.warn(`Footer menu failed to load: ${error}, using fallback`);
  }

  // Render columns
  if (columnsToRender.length === 0) {
    return null;
  }

  const gridCols = Math.min(columnsToRender.length, maxColumns);
  const gridClassName = getGridClassName(gridCols, columnLayout);

  return (
    <div className={`${gridClassName} gap-8 ${className}`}>
      {columnsToRender.map((column, index) => (
        <FooterColumnComponent key={column.id || index} column={column} />
      ))}
    </div>
  );
};

/**
 * Convert menu items to footer columns based on grouping strategy
 */
function convertMenuItemsToFooterColumns(
  menuItems: MenuItem[],
  config: FooterMenuConfig,
  maxColumns: number
): FooterColumn[] {
  const { groupingStrategy, maxItemsPerColumn, preserveHierarchy } = config;
  
  switch (groupingStrategy) {
    case 'by-category':
      return groupByCategory(menuItems, maxColumns, maxItemsPerColumn);
      
    case 'by-section':
      return groupBySection(menuItems, maxColumns, maxItemsPerColumn);
      
    case 'hierarchical':
      return preserveHierarchy ? 
        groupHierarchically(menuItems, maxColumns, maxItemsPerColumn) :
        groupFlat(menuItems, maxColumns, maxItemsPerColumn);
        
    case 'flat':
    default:
      return groupFlat(menuItems, maxColumns, maxItemsPerColumn);
  }
}

/**
 * Group menu items by category (inferred from URL patterns)
 */
function groupByCategory(
  items: MenuItem[], 
  maxColumns: number, 
  maxItemsPerColumn: number
): FooterColumn[] {
  const categories = new Map<string, MenuItem[]>();
  
  items.forEach(item => {
    const category = inferCategory(item);
    if (!categories.has(category)) {
      categories.set(category, []);
    }
    categories.get(category)!.push(item);
  });

  const columns: FooterColumn[] = [];
  let columnIndex = 0;
  
  for (const [category, categoryItems] of categories) {
    if (columnIndex >= maxColumns) break;
    
    const links = categoryItems
      .slice(0, maxItemsPerColumn)
      .map(item => ({
        text: item.title,
        href: item.url || '#',
        isExternal: item.is_external,
        target: item.target,
        icon: item.icon,
        cssClasses: item.css_classes || undefined
      }));
    
    columns.push({
      id: `category-${category}`,
      title: category,
      links
    });
    
    columnIndex++;
  }
  
  return columns;
}

/**
 * Group menu items by section (parent-child relationships)
 */
function groupBySection(
  items: MenuItem[],
  maxColumns: number,
  maxItemsPerColumn: number
): FooterColumn[] {
  const parentItems = items.filter(item => !item.parent_id);
  const childItems = items.filter(item => item.parent_id);
  
  const columns: FooterColumn[] = [];
  
  parentItems.slice(0, maxColumns).forEach(parent => {
    const children = childItems
      .filter(child => child.parent_id === parent.id)
      .slice(0, maxItemsPerColumn - 1);
    
    const links = [
      {
        text: parent.title,
        href: parent.url || '#',
        isExternal: parent.is_external,
        target: parent.target
      },
      ...children.map(child => ({
        text: child.title,
        href: child.url || '#',
        isExternal: child.is_external,
        target: child.target
      }))
    ];
    
    columns.push({
      id: `section-${parent.id}`,
      title: parent.title,
      links
    });
  });
  
  return columns;
}

/**
 * Group menu items hierarchically
 */
function groupHierarchically(
  items: MenuItem[],
  maxColumns: number,
  maxItemsPerColumn: number
): FooterColumn[] {
  const topLevelItems = items.filter(item => !item.parent_id);
  
  return topLevelItems.slice(0, maxColumns).map(topItem => {
    const children = items
      .filter(item => item.parent_id === topItem.id)
      .slice(0, maxItemsPerColumn);
    
    const links = children.length > 0 
      ? children.map(child => ({
          text: child.title,
          href: child.url || '#',
          isExternal: child.is_external,
          target: child.target
        }))
      : [{
          text: topItem.title,
          href: topItem.url || '#',
          isExternal: topItem.is_external,
          target: topItem.target
        }];
    
    return {
      id: `hierarchical-${topItem.id}`,
      title: topItem.title,
      links
    };
  });
}

/**
 * Group menu items flat (distribute evenly)
 */
function groupFlat(
  items: MenuItem[],
  maxColumns: number,
  maxItemsPerColumn: number
): FooterColumn[] {
  const itemsPerColumn = Math.ceil(items.length / maxColumns);
  const actualItemsPerColumn = Math.min(itemsPerColumn, maxItemsPerColumn);
  
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
    
    // Determine column title based on first item
    const title = i === 0 ? 'Navigation' :
                  i === 1 ? 'Resources' :
                  i === 2 ? 'Community' :
                  'More';
    
    columns.push({
      id: `flat-${i}`,
      title,
      links
    });
  }
  
  return columns;
}

/**
 * Infer category from menu item URL or title
 */
function inferCategory(item: MenuItem): string {
  const url = item.url?.toLowerCase() || '';
  const title = item.title.toLowerCase();
  
  if (url.includes('community') || url.includes('directory') || url.includes('groups')) {
    return 'Community';
  }
  if (url.includes('business') || url.includes('companies') || url.includes('opportunities')) {
    return 'Business';
  }
  if (url.includes('resources') || url.includes('events') || url.includes('news')) {
    return 'Resources';
  }
  if (url.includes('about') || url.includes('contact') || url.includes('privacy') || url.includes('terms')) {
    return 'Company';
  }
  
  return 'Links';
}

/**
 * Get responsive grid className based on column count and layout
 */
function getGridClassName(columnCount: number, layout: 'auto' | 'equal' | 'custom'): string {
  const baseClass = 'grid';
  
  if (layout === 'equal') {
    return `${baseClass} grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(columnCount, 4)}`;
  }
  
  if (layout === 'auto') {
    if (columnCount <= 2) {
      return `${baseClass} grid-cols-1 md:grid-cols-2`;
    }
    if (columnCount === 3) {
      return `${baseClass} grid-cols-1 md:grid-cols-2 lg:grid-cols-3`;
    }
    return `${baseClass} grid-cols-1 md:grid-cols-2 lg:grid-cols-4`;
  }
  
  // Custom layout - let parent handle
  return baseClass;
}

export default DynamicFooterMenu;