// Menu data adapters for transforming between database and frontend types

import { MenuItem, MenuItemDatabaseRow, MenuItemInput } from '@/types/menu';
import { ContentStatus } from '@/types/common';

/**
 * Adapt menu item from database format to frontend format
 */
export function adaptMenuItemFromDatabase(row: MenuItemDatabaseRow): MenuItem {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    description: row.description || undefined,
    menu_type: row.menu_type as MenuItem['menu_type'],
    parent_id: row.parent_id || undefined,
    sort_order: row.sort_order,
    is_enabled: row.is_enabled,
    target: row.target as MenuItem['target'],
    icon: row.icon || undefined,
    css_classes: row.css_classes || undefined,
    visibility: row.visibility as MenuItem['visibility'],
    required_roles: row.required_roles || undefined,
    is_external: row.is_external,
    status: (row.status as ContentStatus) || 'published',
    featured: row.featured || false,
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString(),
    children: [] // Will be populated separately if needed
  };
}

/**
 * Adapt menu item input for database insert
 */
export function adaptMenuItemToSupabaseInsert(input: MenuItemInput): Partial<MenuItemDatabaseRow> {
  return {
    title: input.title,
    url: input.url,
    description: input.description || null,
    menu_type: input.menu_type,
    parent_id: input.parent_id || null,
    sort_order: input.sort_order ?? 0,
    is_enabled: input.is_enabled ?? true,
    target: input.target ?? '_self',
    icon: input.icon || null,
    css_classes: input.css_classes || null,
    visibility: input.visibility ?? 'public',
    required_roles: input.required_roles || null,
    is_external: input.is_external ?? false,
    status: 'published',
    featured: false
  };
}

/**
 * Adapt menu item data for database update
 */
export function adaptMenuItemToSupabaseUpdate(
  input: Partial<MenuItemInput>
): Partial<MenuItemDatabaseRow> {
  const update: Partial<MenuItemDatabaseRow> = {};

  if (input.title !== undefined) update.title = input.title;
  if (input.url !== undefined) update.url = input.url;
  if (input.description !== undefined) update.description = input.description || null;
  if (input.menu_type !== undefined) update.menu_type = input.menu_type;
  if (input.parent_id !== undefined) update.parent_id = input.parent_id || null;
  if (input.sort_order !== undefined) update.sort_order = input.sort_order;
  if (input.is_enabled !== undefined) update.is_enabled = input.is_enabled;
  if (input.target !== undefined) update.target = input.target;
  if (input.icon !== undefined) update.icon = input.icon || null;
  if (input.css_classes !== undefined) update.css_classes = input.css_classes || null;
  if (input.visibility !== undefined) update.visibility = input.visibility;
  if (input.required_roles !== undefined) update.required_roles = input.required_roles || null;
  if (input.is_external !== undefined) update.is_external = input.is_external;

  return update;
}

/**
 * Build hierarchical menu structure from flat menu items array
 */
export function buildMenuHierarchy(menuItems: MenuItem[]): MenuItem[] {
  const itemMap = new Map<string, MenuItem>();
  const rootItems: MenuItem[] = [];

  // First pass: create a map of all items and initialize children arrays
  menuItems.forEach(item => {
    itemMap.set(item.id, { ...item, children: [] });
  });

  // Second pass: build the hierarchy
  menuItems.forEach(item => {
    const menuItem = itemMap.get(item.id);
    if (!menuItem) return;

    if (item.parent_id) {
      const parent = itemMap.get(item.parent_id);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(menuItem);
      } else {
        // Parent not found, treat as root item
        rootItems.push(menuItem);
      }
    } else {
      rootItems.push(menuItem);
    }
  });

  // Sort items at each level by sort_order
  const sortMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(item => ({
        ...item,
        children: item.children ? sortMenuItems(item.children) : []
      }));
  };

  return sortMenuItems(rootItems);
}

/**
 * Flatten hierarchical menu structure to flat array
 */
export function flattenMenuHierarchy(
  menuItems: MenuItem[],
  parentId: string | null = null,
  currentLevel: number = 0
): MenuItem[] {
  const flattened: MenuItem[] = [];

  menuItems.forEach(item => {
    // Add current item
    flattened.push({
      ...item,
      parent_id: parentId || undefined,
      children: [] // Remove children for flattened structure
    });

    // Recursively add children
    if (item.children && item.children.length > 0) {
      const childItems = flattenMenuHierarchy(item.children, item.id, currentLevel + 1);
      flattened.push(...childItems);
    }
  });

  return flattened;
}

/**
 * Filter menu items based on user permissions and visibility
 */
export function filterMenuItemsByVisibility(
  menuItems: MenuItem[],
  userRoles: string[] = [],
  isAuthenticated: boolean = false
): MenuItem[] {
  return menuItems
    .filter(item => {
      switch (item.visibility) {
        case 'public':
          return true;
        case 'authenticated':
          return isAuthenticated;
        case 'admin':
          return userRoles.includes('admin') || userRoles.includes('superadmin');
        case 'role_based':
          return item.required_roles?.some(role => userRoles.includes(role)) || false;
        default:
          return false;
      }
    })
    .map(item => ({
      ...item,
      children: item.children ? filterMenuItemsByVisibility(item.children, userRoles, isAuthenticated) : []
    }));
}

/**
 * Get next available sort order for a menu type
 */
export function getNextSortOrder(menuItems: MenuItem[], menuType: MenuItem['menu_type'], parentId?: string): number {
  const relevantItems = menuItems.filter(item => 
    item.menu_type === menuType && item.parent_id === (parentId || null)
  );
  
  if (relevantItems.length === 0) return 0;
  
  const maxSortOrder = Math.max(...relevantItems.map(item => item.sort_order));
  return maxSortOrder + 100; // Leave space for manual reordering
}

/**
 * Validate menu item URL format
 */
export function validateMenuItemUrl(url: string): { isValid: boolean; error?: string } {
  try {
    // Check for relative URLs (starting with /)
    if (url.startsWith('/')) {
      return { isValid: true };
    }
    
    // Check for absolute URLs
    new URL(url);
    return { isValid: true };
  } catch {
    return { 
      isValid: false, 
      error: 'Invalid URL format. Use relative paths (e.g., /about) or absolute URLs (e.g., https://example.com)' 
    };
  }
}

/**
 * Generate breadcrumbs from menu hierarchy
 */
export function generateMenuBreadcrumbs(
  menuItems: MenuItem[],
  currentPath: string
): MenuItem[] {
  const findPath = (items: MenuItem[], targetPath: string, breadcrumbs: MenuItem[] = []): MenuItem[] | null => {
    for (const item of items) {
      const currentBreadcrumbs = [...breadcrumbs, item];
      
      if (item.url === targetPath) {
        return currentBreadcrumbs;
      }
      
      if (item.children && item.children.length > 0) {
        const result = findPath(item.children, targetPath, currentBreadcrumbs);
        if (result) return result;
      }
    }
    return null;
  };

  return findPath(menuItems, currentPath) || [];
}