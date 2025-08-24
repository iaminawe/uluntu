import { supabase } from '@/lib/supabase';
import { MenuItem, MenuItemInput, MenuItemUpdate, MenuType } from '@/types/menu';
import { convertDatabaseRowToMenuItem, convertDatabaseRowsToMenuItems } from '@/features/menu/utils/typeAdapters';

// Legacy interface compatibility - deprecated
export interface CreateMenuItemInput {
  label: string;
  href: string;
  description?: string;
  parent_id?: string | null;
  sort_order?: number;
  is_enabled?: boolean;
  icon?: string;
  feature_flag?: string;
}

export interface UpdateMenuItemInput extends Partial<CreateMenuItemInput> {
  id: string;
}

export interface MenuStructure {
  id: string;
  label: string;
  href: string;
  description?: string;
  icon?: string;
  feature_flag?: string;
  is_enabled: boolean;
  sort_order: number;
  children?: MenuStructure[];
}

class MenuManagementAPI {
  /**
   * Get default menu container ID
   */
  private async getDefaultContainerId(): Promise<string> {
    const { data, error } = await supabase
      .from('menu_containers')
      .select('id')
      .eq('name', 'main-navigation')
      .single();
    
    if (error || !data) {
      // Fallback: get any active container
      const { data: fallback } = await supabase
        .from('menu_containers')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .single();
      
      return fallback?.id || '';
    }
    
    return data.id;
  }

  /**
   * Get all menu items with hierarchy
   */
  async getMenuItems(): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch menu items: ${error.message}`);
    }

    // Use type adapter for consistent conversion
    const { items, errors } = convertDatabaseRowsToMenuItems(data || []);
    
    if (errors.length > 0) {
      console.warn('Menu item conversion errors:', errors);
    }

    return items;
  }

  /**
   * Get menu item by ID
   */
  async getMenuItem(id: string): Promise<MenuItem | null> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch menu item: ${error.message}`);
    }

    return data;
  }

  /**
   * Create a new menu item
   */
  async createMenuItem(input: CreateMenuItemInput): Promise<MenuItem> {
    // If no sort_order provided, get the next available index
    if (input.sort_order === undefined) {
      const { data: maxOrderData } = await supabase
        .from('menu_items')
        .select('sort_order')
        .is('parent_id', input.parent_id || null)
        .order('sort_order', { ascending: false })
        .limit(1);

      input.sort_order = maxOrderData?.[0]?.sort_order ? maxOrderData[0].sort_order + 1 : 0;
    }

    const { data, error } = await supabase
      .from('menu_items')
      .insert([{
        title: input.label,
        url: input.href,
        description: input.description,
        menu_type: 'main', // Default to main menu
        parent_id: input.parent_id,
        sort_order: input.sort_order,
        is_enabled: input.is_enabled ?? true,
        target: '_self',
        icon: input.icon,
        visibility: 'public',
        is_external: false,
        custom_properties: input.feature_flag ? { feature_flag: input.feature_flag } : {},
        menu_container_id: await this.getDefaultContainerId(),
        is_visible: true
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create menu item: ${error.message}`);
    }

    // Use type adapter for consistent conversion
    return convertDatabaseRowToMenuItem(data);
  }

  /**
   * Update an existing menu item
   */
  async updateMenuItem(input: UpdateMenuItemInput): Promise<MenuItem> {
    const { id, ...updates } = input;

    // Map input fields to database columns
    const dbUpdates: any = {
      updated_at: new Date().toISOString()
    };
    
    if (updates.label !== undefined) dbUpdates.title = updates.label;
    if (updates.href !== undefined) dbUpdates.url = updates.href;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.parent_id !== undefined) dbUpdates.parent_id = updates.parent_id;
    if (updates.sort_order !== undefined) dbUpdates.sort_order = updates.sort_order;
    if (updates.is_enabled !== undefined) dbUpdates.is_enabled = updates.is_enabled;
    if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
    if (updates.feature_flag !== undefined) {
      dbUpdates.custom_properties = { feature_flag: updates.feature_flag };
    }

    const { data, error } = await supabase
      .from('menu_items')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update menu item: ${error.message}`);
    }

    // Use type adapter for consistent conversion
    return convertDatabaseRowToMenuItem(data);
  }

  /**
   * Delete a menu item and all its children
   */
  async deleteMenuItem(id: string): Promise<boolean> {
    // First delete all children
    const { error: childrenError } = await supabase
      .from('menu_items')
      .delete()
      .eq('parent_id', id);

    if (childrenError) {
      throw new Error(`Failed to delete child menu items: ${childrenError.message}`);
    }

    // Then delete the parent
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete menu item: ${error.message}`);
    }

    return true;
  }

  /**
   * Toggle menu item enabled status
   */
  async toggleMenuItemStatus(id: string, isEnabled: boolean): Promise<MenuItem> {
    const { data, error } = await supabase
      .from('menu_items')
      .update({ 
        is_enabled: isEnabled,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to toggle menu item status: ${error.message}`);
    }

    return data;
  }

  /**
   * Reorder menu items
   */
  async reorderMenuItems(updates: Array<{ id: string; sort_order: number; parent_id?: string | null }>): Promise<boolean> {
    const { error } = await supabase.rpc('update_menu_items_order', {
      updates: updates
    });

    if (error) {
      throw new Error(`Failed to reorder menu items: ${error.message}`);
    }

    return true;
  }

  /**
   * Get menu structure for navigation
   */
  async getMenuStructure(): Promise<MenuStructure[]> {
    const items = await this.getMenuItems();
    
    // Build hierarchical structure
    const itemMap = new Map<string, MenuStructure>();
    const rootItems: MenuStructure[] = [];

    // First pass: create all items
    items.forEach(item => {
      itemMap.set(item.id, {
        id: item.id,
        label: item.label,
        href: item.href,
        description: item.description,
        icon: item.icon,
        feature_flag: item.feature_flag,
        is_enabled: item.is_enabled,
        sort_order: item.sort_order,
        children: []
      });
    });

    // Second pass: build hierarchy
    items.forEach(item => {
      const menuItem = itemMap.get(item.id)!;
      
      if (item.parent_id) {
        const parent = itemMap.get(item.parent_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(menuItem);
        }
      } else {
        rootItems.push(menuItem);
      }
    });

    // Sort children by sort_order
    const sortByOrder = (items: MenuStructure[]): MenuStructure[] => {
      return items.sort((a, b) => a.sort_order - b.sort_order).map(item => ({
        ...item,
        children: item.children ? sortByOrder(item.children) : []
      }));
    };

    return sortByOrder(rootItems);
  }

  /**
   * Get enabled menu items only for public navigation
   */
  async getEnabledMenuStructure(): Promise<MenuStructure[]> {
    const structure = await this.getMenuStructure();
    
    // Filter out disabled items recursively
    const filterEnabled = (items: MenuStructure[]): MenuStructure[] => {
      return items
        .filter(item => item.is_enabled)
        .map(item => ({
          ...item,
          children: item.children ? filterEnabled(item.children) : []
        }));
    };

    return filterEnabled(structure);
  }
}

export const menuManagementApi = new MenuManagementAPI();