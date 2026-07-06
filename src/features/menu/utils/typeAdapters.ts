/**
 * Type adapters for Menu API service layer
 * Handles type conversions between different API interfaces
 */

import { MenuItem, MenuItemDatabaseRow, MenuType, MenuTarget, MenuVisibility } from '@/types/menu';

/**
 * Convert database row to MenuItem interface with proper type validation
 */
export function convertDatabaseRowToMenuItem(row: MenuItemDatabaseRow): MenuItem {
  // Validate required fields
  if (!row.id || !row.title) {
    throw new Error('Invalid menu item data: missing required fields (id, title)');
  }

  // URL is optional for dropdown/divider items
  if (!row.url && row.item_type !== 'dropdown' && row.item_type !== 'divider') {
    throw new Error('Invalid menu item data: missing required field (url) for non-dropdown items');
  }

  // Validate and convert menu_type
  const menuType = row.menu_type as MenuType;
  if (!['main', 'footer', 'mobile', 'admin'].includes(menuType)) {
    throw new Error(`Invalid menu_type: ${row.menu_type}. Must be one of: main, footer, mobile, admin`);
  }

  // Validate and convert target
  const target = (row.target || '_self') as MenuTarget;
  if (!['_self', '_blank', '_parent', '_top'].includes(target)) {
    throw new Error(`Invalid target: ${target}. Must be one of: _self, _blank, _parent, _top`);
  }

  // Validate and convert visibility
  const visibility = (row.visibility || 'public') as MenuVisibility;
  if (!['public', 'authenticated', 'admin', 'role_based'].includes(visibility)) {
    throw new Error(`Invalid visibility: ${visibility}. Must be one of: public, authenticated, admin, role_based`);
  }

  return {
    id: row.id,
    title: row.title,
    url: row.url || '#', // Default to '#' for dropdown/divider items with no URL
    description: row.description || undefined,
    menu_type: menuType,
    parent_id: row.parent_id || undefined,
    sort_order: Number(row.sort_order) || 0,
    is_enabled: Boolean(row.is_enabled),
    target: target,
    icon: row.icon || undefined,
    css_classes: row.css_classes || undefined,
    visibility: visibility,
    required_roles: Array.isArray(row.required_roles) ? row.required_roles : undefined,
    is_external: Boolean(row.is_external),
    feature_flag: row.custom_properties?.feature_flag || undefined,
    status: row.status as any || undefined,
    featured: row.featured || undefined,
    created_at: row.created_at || undefined,
    updated_at: row.updated_at || undefined
  };
}

/**
 * Convert MenuItem to database row format
 */
export function convertMenuItemToDatabaseRow(item: MenuItem): Partial<MenuItemDatabaseRow> {
  return {
    id: item.id,
    title: item.title,
    url: item.url,
    description: item.description || null,
    menu_type: item.menu_type,
    parent_id: item.parent_id || null,
    sort_order: item.sort_order,
    is_enabled: item.is_enabled,
    target: item.target,
    icon: item.icon || null,
    css_classes: item.css_classes || null,
    visibility: item.visibility,
    required_roles: item.required_roles || null,
    is_external: item.is_external,
    status: item.status || null,
    featured: item.featured || null,
    custom_properties: item.feature_flag ? { feature_flag: item.feature_flag } : null,
    created_at: item.created_at || null,
    updated_at: item.updated_at || null
  };
}

/**
 * Legacy interface adapter - converts old MenuItem format to new format
 */
export function adaptLegacyMenuItem(legacyItem: any): MenuItem {
  // Handle legacy interface with label/href properties
  return {
    id: legacyItem.id,
    title: legacyItem.title || legacyItem.label || '',
    url: legacyItem.url || legacyItem.href || '',
    description: legacyItem.description || legacyItem.subtitle || undefined,
    menu_type: legacyItem.menu_type || 'main',
    parent_id: legacyItem.parent_id || undefined,
    sort_order: legacyItem.sort_order || legacyItem.order || 0,
    is_enabled: legacyItem.is_enabled !== undefined ? legacyItem.is_enabled : legacyItem.enabled !== undefined ? legacyItem.enabled : true,
    target: legacyItem.target || '_self',
    icon: legacyItem.icon || undefined,
    css_classes: legacyItem.css_classes || undefined,
    visibility: legacyItem.visibility || 'public',
    required_roles: legacyItem.required_roles || undefined,
    is_external: legacyItem.is_external || false,
    feature_flag: legacyItem.feature_flag || undefined,
    created_at: legacyItem.created_at || undefined,
    updated_at: legacyItem.updated_at || undefined
  };
}

/**
 * Validate MenuItem structure
 */
export function validateMenuItem(item: any): item is MenuItem {
  try {
    if (!item || typeof item !== 'object') {
      return false;
    }

    // Check required fields
    if (!item.id || typeof item.id !== 'string') {
      return false;
    }
    if (!item.title || typeof item.title !== 'string') {
      return false;
    }
    if (!item.url || typeof item.url !== 'string') {
      return false;
    }

    // Validate enum values
    if (!['main', 'footer', 'mobile', 'admin'].includes(item.menu_type)) {
      return false;
    }
    if (item.target && !['_self', '_blank', '_parent', '_top'].includes(item.target)) {
      return false;
    }
    if (item.visibility && !['public', 'authenticated', 'admin', 'role_based'].includes(item.visibility)) {
      return false;
    }

    // Validate types
    if (typeof item.sort_order !== 'number') {
      return false;
    }
    if (typeof item.is_enabled !== 'boolean') {
      return false;
    }
    if (typeof item.is_external !== 'boolean') {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Batch convert array of database rows to MenuItems with error handling
 */
export function convertDatabaseRowsToMenuItems(rows: any[]): { items: MenuItem[], errors: string[] } {
  const items: MenuItem[] = [];
  const errors: string[] = [];

  rows.forEach((row, index) => {
    try {
      const menuItem = convertDatabaseRowToMenuItem(row);
      items.push(menuItem);
    } catch (error) {
      errors.push(`Row ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  return { items, errors };
}

/**
 * Type guard to check if object is a MenuItem
 */
export function isMenuItem(obj: any): obj is MenuItem {
  return validateMenuItem(obj);
}

/**
 * Type guard to check if array contains MenuItems
 */
export function isMenuItemArray(arr: any): arr is MenuItem[] {
  return Array.isArray(arr) && arr.every(isMenuItem);
}

/**
 * Safe type conversion with fallback defaults
 */
export function safeConvertToMenuItem(item: any): MenuItem {
  try {
    if (isMenuItem(item)) {
      return item;
    }
    return adaptLegacyMenuItem(item);
  } catch (error) {
    // Return a minimal valid MenuItem as fallback
    return {
      id: item?.id || 'invalid-item',
      title: item?.title || item?.label || 'Invalid Item',
      url: item?.url || item?.href || '#',
      menu_type: 'main',
      sort_order: 0,
      is_enabled: false,
      target: '_self',
      visibility: 'public',
      is_external: false
    };
  }
}