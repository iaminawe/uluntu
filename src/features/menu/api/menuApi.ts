import { supabase } from '@/lib/supabase';
import { menuManagementApi } from '@/features/admin/api/menuManagement';
import type { MenuItem, MenuFilterParams, MenuType } from '@/types/menu';

/**
 * Comprehensive Menu API for fetching dynamic menu items
 * Supports hierarchical menus, feature flags, and permissions
 */
class MenuAPI {
  /**
   * Fetch menu hierarchy for a specific position/type
   */
  async fetchMenuHierarchy(position: string): Promise<MenuItem[]> {
    try {
      // Map position to menu type
      const menuType = this.mapPositionToMenuType(position);
      
      if (!menuType) {
        console.warn(`Unknown menu position: ${position}`);
        return [];
      }

      // Fetch from database using the menu management API
      const structure = await menuManagementApi.getEnabledMenuStructure();
      
      // Convert to MenuItem format and filter by type
      const menuItems = this.convertStructureToMenuItems(structure, menuType);
      
      return menuItems;
    } catch (error) {
      console.error(`Error fetching menu hierarchy for position ${position}:`, error);
      throw error;
    }
  }

  /**
   * Fetch menu items with advanced filtering
   */
  async fetchMenuItems(filters: MenuFilterParams = {}): Promise<MenuItem[]> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch menu items: ${error.message}`);
      }

      // Apply filters
      let filteredData = data || [];
      
      if (filters.menu_type) {
        const types = Array.isArray(filters.menu_type) ? filters.menu_type : [filters.menu_type];
        filteredData = filteredData.filter(item => types.includes(item.menu_type as MenuType));
      }
      
      if (filters.is_enabled !== undefined) {
        filteredData = filteredData.filter(item => item.is_enabled === filters.is_enabled);
      }
      
      if (filters.visibility) {
        const visibilities = Array.isArray(filters.visibility) ? filters.visibility : [filters.visibility];
        filteredData = filteredData.filter(item => visibilities.includes(item.visibility));
      }
      
      if (filters.parent_id !== undefined) {
        filteredData = filteredData.filter(item => item.parent_id === filters.parent_id);
      }
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredData = filteredData.filter(item => 
          item.title.toLowerCase().includes(searchTerm) ||
          item.description?.toLowerCase().includes(searchTerm)
        );
      }

      // Convert to MenuItem format
      const menuItems = filteredData.map(this.convertDatabaseRowToMenuItem);
      
      // Build hierarchy if requested
      if (filters.include_children) {
        return this.buildMenuHierarchy(menuItems);
      }
      
      return menuItems;
    } catch (error) {
      console.error('Error fetching menu items with filters:', error);
      throw error;
    }
  }

  /**
   * Fetch footer-specific menu items with proper grouping
   */
  async fetchFooterMenuItems(): Promise<MenuItem[]> {
    return this.fetchMenuItems({
      menu_type: 'footer',
      is_enabled: true,
      include_children: true
    });
  }

  /**
   * Map position string to MenuType
   */
  private mapPositionToMenuType(position: string): MenuType | null {
    const positionMap: Record<string, MenuType> = {
      'main_navigation': 'main',
      'main_header': 'main',  // Support legacy position name
      'header_menu': 'main',
      'footer_links': 'footer',
      'main_footer': 'footer',  // Support legacy position name
      'footer_menu': 'footer',
      'mobile_menu': 'mobile',
      'admin_menu': 'admin'
    };
    
    return positionMap[position] || null;
  }

  /**
   * Convert MenuStructure to MenuItem format
   */
  private convertStructureToMenuItems(structures: any[], targetType: MenuType): MenuItem[] {
    return structures
      .filter(item => item.menu_type === targetType || !item.menu_type)
      .map(structure => ({
        id: structure.id,
        title: structure.label,
        url: structure.href,
        description: structure.description,
        menu_type: targetType,
        sort_order: structure.order_index,
        is_enabled: structure.is_enabled,
        target: '_self',
        visibility: 'public',
        is_external: structure.href?.startsWith('http') || false,
        children: structure.children ? 
          this.convertStructureToMenuItems(structure.children, targetType) : undefined
      }));
  }

  /**
   * Convert database row to MenuItem
   */
  private convertDatabaseRowToMenuItem(row: any): MenuItem {
    return {
      id: row.id,
      title: row.title,
      url: row.url,
      description: row.description,
      menu_type: row.menu_type,
      parent_id: row.parent_id,
      sort_order: row.sort_order,
      is_enabled: row.is_enabled,
      target: row.target || '_self',
      icon: row.icon,
      css_classes: row.css_classes,
      visibility: row.visibility || 'public',
      required_roles: row.required_roles,
      is_external: row.is_external || false,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  /**
   * Build hierarchical menu structure
   */
  private buildMenuHierarchy(items: MenuItem[]): MenuItem[] {
    const itemMap = new Map<string, MenuItem>();
    const rootItems: MenuItem[] = [];
    
    // Create map of all items
    items.forEach(item => {
      itemMap.set(item.id, { ...item, children: [] });
    });
    
    // Build hierarchy
    items.forEach(item => {
      const menuItem = itemMap.get(item.id)!;
      
      if (item.parent_id) {
        const parent = itemMap.get(item.parent_id);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push(menuItem);
        }
      } else {
        rootItems.push(menuItem);
      }
    });
    
    // Sort by sort_order
    const sortItems = (items: MenuItem[]): MenuItem[] => {
      return items.sort((a, b) => a.sort_order - b.sort_order).map(item => ({
        ...item,
        children: item.children ? sortItems(item.children) : undefined
      }));
    };
    
    return sortItems(rootItems);
  }
}

// Export singleton instance
export const menuApi = new MenuAPI();
export { MenuAPI };

// Export convenience functions
export const fetchMenuHierarchy = (position: string) => menuApi.fetchMenuHierarchy(position);
export const fetchMenuItems = (filters?: MenuFilterParams) => menuApi.fetchMenuItems(filters);
export const fetchFooterMenuItems = () => menuApi.fetchFooterMenuItems();
