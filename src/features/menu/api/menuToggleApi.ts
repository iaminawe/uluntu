import { supabase } from '@/lib/supabase';
import { MenuItem } from '@/types/menu';
import { menuManagementApi } from '@/features/admin/api/menuManagement';

export interface BulkOperation {
  id: string;
  operation: 'enable' | 'disable' | 'delete';
  success: boolean;
  error?: string;
}

export interface MenuToggleOperation {
  itemId: string;
  enabled: boolean;
  cascade?: boolean;
}

export interface BulkToggleResult {
  operations: BulkOperation[];
  successCount: number;
  failureCount: number;
}

class MenuToggleApiService {
  /**
   * Toggle a single menu item's enabled status
   */
  async toggleMenuItem(itemId: string, enabled: boolean): Promise<boolean> {
    try {
      const updatedItem = await menuManagementApi.toggleMenuItemStatus(itemId, enabled);
      return !!updatedItem;
    } catch (error) {
      console.error('Failed to toggle menu item:', error);
      return false;
    }
  }

  /**
   * Toggle multiple menu items with cascade support
   */
  async bulkToggleMenuItems(
    itemIds: string[], 
    enabled: boolean, 
    cascade: boolean = false
  ): Promise<BulkToggleResult> {
    const operations: BulkOperation[] = [];
    
    try {
      // Get all items first to determine cascade relationships
      const allItems = await menuManagementApi.getMenuItems();
      const itemMap = new Map(allItems.map(item => [item.id, item]));
      
      // Determine all affected items
      let affectedIds = new Set(itemIds);
      
      if (cascade) {
        itemIds.forEach(itemId => {
          const item = itemMap.get(itemId);
          if (item) {
            // Find all children recursively
            this.findAllChildren(itemId, allItems).forEach(childId => {
              affectedIds.add(childId);
            });
          }
        });
      }

      // Process each item
      for (const itemId of affectedIds) {
        try {
          const success = await this.toggleMenuItem(itemId, enabled);
          operations.push({
            id: itemId,
            operation: enabled ? 'enable' : 'disable',
            success
          });
        } catch (error) {
          operations.push({
            id: itemId,
            operation: enabled ? 'enable' : 'disable',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return {
        operations,
        successCount: operations.filter(op => op.success).length,
        failureCount: operations.filter(op => !op.success).length
      };
      
    } catch (error) {
      console.error('Bulk toggle failed:', error);
      
      // Return failed operations for all requested items
      return {
        operations: itemIds.map(id => ({
          id,
          operation: enabled ? 'enable' : 'disable',
          success: false,
          error: error instanceof Error ? error.message : 'Bulk operation failed'
        })),
        successCount: 0,
        failureCount: itemIds.length
      };
    }
  }

  /**
   * Delete multiple menu items
   */
  async bulkDeleteMenuItems(itemIds: string[]): Promise<BulkToggleResult> {
    const operations: BulkOperation[] = [];
    
    try {
      for (const itemId of itemIds) {
        try {
          const success = await menuManagementApi.deleteMenuItem(itemId);
          operations.push({
            id: itemId,
            operation: 'delete',
            success
          });
        } catch (error) {
          operations.push({
            id: itemId,
            operation: 'delete',
            success: false,
            error: error instanceof Error ? error.message : 'Delete failed'
          });
        }
      }

      return {
        operations,
        successCount: operations.filter(op => op.success).length,
        failureCount: operations.filter(op => !op.success).length
      };
      
    } catch (error) {
      console.error('Bulk delete failed:', error);
      
      return {
        operations: itemIds.map(id => ({
          id,
          operation: 'delete',
          success: false,
          error: error instanceof Error ? error.message : 'Bulk delete failed'
        })),
        successCount: 0,
        failureCount: itemIds.length
      };
    }
  }

  /**
   * Get menu items with hierarchical relationships
   */
  async getMenuItemsWithHierarchy(): Promise<MenuItem[]> {
    const items = await menuManagementApi.getMenuItems();
    return this.buildMenuHierarchy(items);
  }

  /**
   * Find all children of a menu item recursively
   */
  private findAllChildren(parentId: string, allItems: MenuItem[]): string[] {
    const children: string[] = [];
    
    const findChildren = (currentParentId: string) => {
      allItems.forEach(item => {
        if (item.parent_id === currentParentId) {
          children.push(item.id);
          findChildren(item.id); // Recursive call for nested children
        }
      });
    };
    
    findChildren(parentId);
    return children;
  }

  /**
   * Build hierarchical menu structure
   */
  private buildMenuHierarchy(flatItems: MenuItem[]): MenuItem[] {
    const itemMap = new Map<string, MenuItem>();
    const rootItems: MenuItem[] = [];

    // First pass: create map and initialize children arrays
    flatItems.forEach(item => {
      itemMap.set(item.id, { ...item, children: [] });
    });

    // Second pass: build hierarchy
    flatItems.forEach(item => {
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

    // Sort all levels by order_index
    const sortByOrder = (items: MenuItem[]): MenuItem[] => {
      return items.sort((a, b) => a.order_index - b.order_index).map(item => ({
        ...item,
        children: item.children ? sortByOrder(item.children) : []
      }));
    };

    return sortByOrder(rootItems);
  }

  /**
   * Restore items to their previous state (for undo functionality)
   */
  async restoreMenuItems(itemIds: string[], previousStates: Map<string, boolean>): Promise<BulkToggleResult> {
    const operations: BulkOperation[] = [];
    
    for (const itemId of itemIds) {
      const previousState = previousStates.get(itemId);
      if (previousState !== undefined) {
        try {
          const success = await this.toggleMenuItem(itemId, previousState);
          operations.push({
            id: itemId,
            operation: previousState ? 'enable' : 'disable',
            success
          });
        } catch (error) {
          operations.push({
            id: itemId,
            operation: previousState ? 'enable' : 'disable',
            success: false,
            error: error instanceof Error ? error.message : 'Restore failed'
          });
        }
      }
    }

    return {
      operations,
      successCount: operations.filter(op => op.success).length,
      failureCount: operations.filter(op => !op.success).length
    };
  }

  /**
   * Get menu statistics
   */
  async getMenuStats(): Promise<{
    total: number;
    enabled: number;
    disabled: number;
    mainMenu: number;
    footerMenu: number;
    parents: number;
    children: number;
  }> {
    try {
      const items = await menuManagementApi.getMenuItems();
      
      return {
        total: items.length,
        enabled: items.filter(item => item.is_enabled).length,
        disabled: items.filter(item => !item.is_enabled).length,
        mainMenu: items.filter(item => !item.parent_id).length, // Assuming no parent_id means main menu
        footerMenu: items.filter(item => item.parent_id !== null).length,
        parents: items.filter(item => !item.parent_id).length,
        children: items.filter(item => item.parent_id).length
      };
    } catch (error) {
      console.error('Failed to get menu stats:', error);
      return {
        total: 0,
        enabled: 0,
        disabled: 0,
        mainMenu: 0,
        footerMenu: 0,
        parents: 0,
        children: 0
      };
    }
  }

  /**
   * Batch update menu items order
   */
  async reorderMenuItems(updates: Array<{ id: string; order_index: number; parent_id?: string | null }>): Promise<boolean> {
    try {
      return await menuManagementApi.reorderMenuItems(updates);
    } catch (error) {
      console.error('Failed to reorder menu items:', error);
      return false;
    }
  }

  /**
   * Validate menu item relationships
   */
  async validateMenuHierarchy(): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    try {
      const items = await menuManagementApi.getMenuItems();
      const errors: string[] = [];
      const warnings: string[] = [];
      
      // Check for orphaned children
      items.forEach(item => {
        if (item.parent_id) {
          const parent = items.find(p => p.id === item.parent_id);
          if (!parent) {
            errors.push(`Item "${item.label}" has invalid parent_id: ${item.parent_id}`);
          }
        }
      });
      
      // Check for circular references
      const checkCircular = (itemId: string, visited = new Set<string>()): boolean => {
        if (visited.has(itemId)) return true;
        
        visited.add(itemId);
        const item = items.find(i => i.id === itemId);
        
        if (item?.parent_id) {
          return checkCircular(item.parent_id, visited);
        }
        
        return false;
      };
      
      items.forEach(item => {
        if (checkCircular(item.id)) {
          errors.push(`Circular reference detected involving item "${item.label}"`);
        }
      });
      
      // Check for disabled parents with enabled children
      items.forEach(item => {
        if (item.parent_id) {
          const parent = items.find(p => p.id === item.parent_id);
          if (parent && !parent.is_enabled && item.is_enabled) {
            warnings.push(`Item "${item.label}" is enabled but its parent "${parent.label}" is disabled`);
          }
        }
      });
      
      return {
        valid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      return {
        valid: false,
        errors: [`Failed to validate menu hierarchy: ${error}`],
        warnings: []
      };
    }
  }
}

export const menuToggleApi = new MenuToggleApiService();
export default menuToggleApi;