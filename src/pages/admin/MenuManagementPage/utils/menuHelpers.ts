/**
 * Menu Helper Utilities
 * Common utility functions for menu management
 */

import { MenuItem } from '@/types/menu';
import { HierarchicalMenuItem } from '../types';

/**
 * Builds a hierarchical structure from flat menu items
 * @param items - Flat array of menu items
 * @returns Hierarchical tree structure sorted by sort_order
 */
export const buildHierarchy = (items: MenuItem[]): HierarchicalMenuItem[] => {
  const itemMap = new Map<string, HierarchicalMenuItem>();
  const rootItems: HierarchicalMenuItem[] = [];

  // First pass: create all items with children array
  items.forEach(item => {
    itemMap.set(item.id, { ...item, children: [] });
  });

  // Second pass: build hierarchy
  items.forEach(item => {
    const menuItem = itemMap.get(item.id)!;
    if (item.parent_id) {
      const parent = itemMap.get(item.parent_id);
      if (parent) {
        parent.children.push(menuItem);
      }
    } else {
      rootItems.push(menuItem);
    }
  });

  return rootItems.sort((a, b) => a.sort_order - b.sort_order);
};

/**
 * Checks if a URL is external (absolute URL)
 * @param url - The URL to check
 * @returns true if the URL is external
 */
export const isExternalUrl = (url: string): boolean => {
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//');
};

/**
 * Gets parent options for a menu item dropdown (excludes self and children)
 * @param allItems - All menu items
 * @param menuType - Current menu type
 * @param editingItem - Item being edited (optional)
 * @returns Filtered and sorted parent options
 */
export const getParentOptions = (
  allItems: MenuItem[],
  menuType: string,
  editingItem?: MenuItem
): MenuItem[] => {
  return allItems
    .filter(item =>
      item.menu_type === menuType &&
      (!editingItem || (item.id !== editingItem.id && item.parent_id !== editingItem.id))
    )
    .sort((a, b) => a.sort_order - b.sort_order);
};

/**
 * Filters menu items based on search term, visibility, and enabled status
 * @param items - Items to filter
 * @param searchTerm - Search query
 * @param visibilityFilter - Visibility filter
 * @param enabledFilter - Enabled status filter
 * @returns Filtered items
 */
export const filterMenuItems = (
  items: MenuItem[],
  searchTerm: string,
  visibilityFilter: string,
  enabledFilter: boolean | 'all'
): MenuItem[] => {
  let filtered = [...items];

  if (searchTerm) {
    const search = searchTerm.toLowerCase();
    filtered = filtered.filter(item =>
      item.title.toLowerCase().includes(search) ||
      item.url.toLowerCase().includes(search) ||
      (item.description && item.description.toLowerCase().includes(search))
    );
  }

  if (visibilityFilter !== 'all') {
    filtered = filtered.filter(item => item.visibility === visibilityFilter);
  }

  if (enabledFilter !== 'all') {
    filtered = filtered.filter(item => item.is_enabled === enabledFilter);
  }

  return filtered.sort((a, b) => a.sort_order - b.sort_order);
};

/**
 * Calculates menu counts by type
 * @param allItems - All menu items
 * @returns Counts by menu type
 */
export const getMenuCounts = (allItems: MenuItem[]): Record<string, number> => {
  const counts: Record<string, number> = { main: 0, footer: 0, mobile: 0, admin: 0 };
  allItems.forEach(item => {
    counts[item.menu_type] = (counts[item.menu_type] || 0) + 1;
  });
  return counts;
};
