// Secure Menu API with comprehensive permission validation
// Enhanced API layer with security checks, validation, and audit logging

import { supabase } from '@/lib/supabase';
import { 
  MenuSecurity, 
  MenuPermissionContext, 
  MenuAction 
} from '../security/MenuPermissions';
import { MenuItem, MenuItemInput, MenuItemUpdate, MenuType, MenuTarget, MenuVisibility } from '@/types/menu';
import { logger } from '@/utils/logger';

export interface SecureApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  validationErrors?: string[];
}

export interface SecureMenuApiContext {
  userId: string;
  userEmail: string;
  userRoles: string[];
  sessionId?: string;
  ipAddress?: string;
}

export class SecureMenuApi {
  private context: SecureMenuApiContext;

  constructor(context: SecureMenuApiContext) {
    this.context = context;
  }

  private get permissionContext(): MenuPermissionContext {
    return {
      userId: this.context.userId,
      userRoles: this.context.userRoles,
      sessionId: this.context.sessionId,
      ipAddress: this.context.ipAddress
    };
  }

  /**
   * Secure menu item retrieval with permission filtering
   */
  async getMenuItems(menuType?: MenuType): Promise<SecureApiResponse<MenuItem[]>> {
    try {
      // Check read permissions
      const permission = await MenuSecurity.checkPermission(
        this.permissionContext,
        'menu_management',
        'read'
      );

      if (!permission.allowed) {
        return {
          success: false,
          error: `Access denied: ${permission.reason}`,
        };
      }

      // First get the containers to map menu types
      const { data: containers, error: containerError } = await supabase
        .from('menu_containers')
        .select('id, name, type')
        .eq('is_active', true);

      if (containerError) {
        logger.error('Database error fetching containers', 'SECURE_MENU_API', containerError);
        return {
          success: false,
          error: 'Failed to fetch menu containers'
        };
      }

      // Create container map
      const containerMap = new Map(containers?.map(c => [c.id, c]) || []);

      // Fetch menu items with proper selection
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          id,
          menu_container_id,
          parent_id,
          title,
          subtitle,
          description,
          url,
          icon,
          image_url,
          item_type,
          target,
          is_enabled,
          is_visible,
          requires_auth,
          sort_order,
          depth_level,
          path,
          custom_properties,
          css_classes,
          data_attributes,
          created_at,
          updated_at
        `)
        .order('sort_order', { ascending: true });

      if (error) {
        logger.error('Database error fetching menu items', 'SECURE_MENU_API', error);
        return {
          success: false,
          error: 'Failed to fetch menu items'
        };
      }

      // Map database fields to MenuItem type
      const mappedItems: MenuItem[] = (data || []).map(item => {
        const container = containerMap.get(item.menu_container_id);
        return {
          id: item.id,
          title: item.title,
          url: item.url || '',
          description: item.description || item.subtitle || null,
          menu_type: (container?.type || 'main') as MenuType,
          parent_id: item.parent_id,
          sort_order: item.sort_order,
          is_enabled: item.is_enabled,
          target: (item.target || '_self') as MenuTarget,
          icon: item.icon || null,
          css_classes: item.css_classes || null,
          visibility: item.requires_auth ? 'authenticated' : 'public' as MenuVisibility,
          required_roles: item.custom_properties?.required_roles || null,
          is_external: item.url?.startsWith('http') || false,
          created_at: item.created_at,
          updated_at: item.updated_at
        };
      });

      // Filter by menu type if specified
      let filteredItems = menuType 
        ? mappedItems.filter(item => item.menu_type === menuType)
        : mappedItems;

      // Filter items based on permissions and visibility
      filteredItems = MenuSecurity.filterMenuItemsByPermissions(
        filteredItems,
        this.permissionContext,
        { id: this.context.userId, email: this.context.userEmail } as any
      );

      // Log access
      await MenuSecurity.logMenuAction(
        'read',
        'menu_item',
        this.permissionContext,
        this.context.userEmail,
        { metadata: { itemCount: filteredItems.length, menuType } }
      );

      return {
        success: true,
        data: filteredItems
      };
    } catch (error) {
      logger.error('Error in secure getMenuItems', 'SECURE_MENU_API', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }

  /**
   * Secure menu item creation with validation
   */
  async createMenuItem(data: MenuItemInput): Promise<SecureApiResponse<MenuItem>> {
    try {
      // Check create permissions
      const permission = await MenuSecurity.checkPermission(
        this.permissionContext,
        'menu_item',
        'create',
        data as MenuItem
      );

      if (!permission.allowed) {
        return {
          success: false,
          error: `Access denied: ${permission.reason}`,
        };
      }

      // Validate menu item security
      const validation = MenuSecurity.validateMenuItemSecurity(
        data,
        this.permissionContext
      );

      if (!validation.valid) {
        return {
          success: false,
          error: 'Validation failed',
          validationErrors: validation.errors
        };
      }

      // Validate required fields
      if (!data.title?.trim() || !data.url?.trim()) {
        return {
          success: false,
          error: 'Title and URL are required'
        };
      }

      // Check for duplicate URLs in the same menu type
      const { data: existing } = await supabase
        .from('menu_items')
        .select('id')
        .eq('url', data.url)
        .eq('menu_type', data.menu_type);

      if (existing && existing.length > 0) {
        return {
          success: false,
          error: 'A menu item with this URL already exists'
        };
      }

      // Set default sort order if not provided
      if (data.sort_order === undefined) {
        const { data: maxOrderData } = await supabase
          .from('menu_items')
          .select('sort_order')
          .eq('menu_type', data.menu_type)
          .is('parent_id', data.parent_id || null)
          .order('sort_order', { ascending: false })
          .limit(1);

        data.sort_order = (maxOrderData?.[0]?.sort_order || 0) + 1;
      }

      // Create the menu item
      const { data: newItem, error } = await supabase
        .from('menu_items')
        .insert([{
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        logger.error('Database error creating menu item', 'SECURE_MENU_API', error);
        return {
          success: false,
          error: 'Failed to create menu item'
        };
      }

      // Log the action
      await MenuSecurity.logMenuAction(
        'create',
        'menu_item',
        this.permissionContext,
        this.context.userEmail,
        {
          menuItemId: newItem.id,
          newValues: data,
          metadata: { menuType: data.menu_type }
        }
      );

      return {
        success: true,
        data: newItem
      };
    } catch (error) {
      logger.error('Error in secure createMenuItem', 'SECURE_MENU_API', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }

  /**
   * Secure menu item update with change tracking
   */
  async updateMenuItem(data: MenuItemUpdate): Promise<SecureApiResponse<MenuItem>> {
    try {
      // Get existing item for permission check and change tracking
      const { data: existingItem, error: fetchError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', data.id)
        .single();

      if (fetchError || !existingItem) {
        return {
          success: false,
          error: 'Menu item not found'
        };
      }

      // Check update permissions
      const permission = await MenuSecurity.checkPermission(
        this.permissionContext,
        'menu_item',
        'update',
        existingItem as MenuItem
      );

      if (!permission.allowed) {
        return {
          success: false,
          error: `Access denied: ${permission.reason}`,
        };
      }

      // Validate menu item security
      const validation = MenuSecurity.validateMenuItemSecurity(
        data,
        this.permissionContext
      );

      if (!validation.valid) {
        return {
          success: false,
          error: 'Validation failed',
          validationErrors: validation.errors
        };
      }

      // Check visibility change permissions
      if (data.visibility && data.visibility !== existingItem.visibility) {
        const visibilityPermission = await MenuSecurity.checkPermission(
          this.permissionContext,
          'menu_item',
          'manage_visibility',
          { ...existingItem, visibility: data.visibility } as MenuItem
        );

        if (!visibilityPermission.allowed) {
          return {
            success: false,
            error: `Cannot change visibility: ${visibilityPermission.reason}`
          };
        }
      }

      // Update the menu item
      const { data: updatedItem, error } = await supabase
        .from('menu_items')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id)
        .select()
        .single();

      if (error) {
        logger.error('Database error updating menu item', 'SECURE_MENU_API', error);
        return {
          success: false,
          error: 'Failed to update menu item'
        };
      }

      // Log the action with change tracking
      await MenuSecurity.logMenuAction(
        'update',
        'menu_item',
        this.permissionContext,
        this.context.userEmail,
        {
          menuItemId: data.id,
          oldValues: existingItem,
          newValues: data,
          metadata: { 
            changedFields: Object.keys(data).filter(key => 
              data[key as keyof MenuItemUpdate] !== existingItem[key]
            )
          }
        }
      );

      return {
        success: true,
        data: updatedItem
      };
    } catch (error) {
      logger.error('Error in secure updateMenuItem', 'SECURE_MENU_API', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }

  /**
   * Secure menu item deletion with cascade handling
   */
  async deleteMenuItem(id: string): Promise<SecureApiResponse<void>> {
    try {
      // Get existing item for permission check
      const { data: existingItem, error: fetchError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !existingItem) {
        return {
          success: false,
          error: 'Menu item not found'
        };
      }

      // Check delete permissions
      const permission = await MenuSecurity.checkPermission(
        this.permissionContext,
        'menu_item',
        'delete',
        existingItem as MenuItem
      );

      if (!permission.allowed) {
        return {
          success: false,
          error: `Access denied: ${permission.reason}`,
        };
      }

      // Find all child items
      const { data: children } = await supabase
        .from('menu_items')
        .select('id, title')
        .eq('parent_id', id);

      const childrenCount = children?.length || 0;

      // Delete child items first (cascade)
      if (childrenCount > 0) {
        const { error: childrenError } = await supabase
          .from('menu_items')
          .delete()
          .eq('parent_id', id);

        if (childrenError) {
          logger.error('Error deleting child menu items', 'SECURE_MENU_API', childrenError);
          return {
            success: false,
            error: 'Failed to delete child menu items'
          };
        }
      }

      // Delete the parent item
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Database error deleting menu item', 'SECURE_MENU_API', error);
        return {
          success: false,
          error: 'Failed to delete menu item'
        };
      }

      // Log the action
      await MenuSecurity.logMenuAction(
        'delete',
        'menu_item',
        this.permissionContext,
        this.context.userEmail,
        {
          menuItemId: id,
          oldValues: existingItem,
          metadata: { 
            deletedChildren: childrenCount,
            cascadeDelete: childrenCount > 0
          }
        }
      );

      return {
        success: true
      };
    } catch (error) {
      logger.error('Error in secure deleteMenuItem', 'SECURE_MENU_API', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }

  /**
   * Secure menu item toggle with validation
   */
  async toggleMenuItem(id: string, field: 'is_enabled' | 'is_visible'): Promise<SecureApiResponse<MenuItem>> {
    try {
      // Get existing item
      const { data: existingItem, error: fetchError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !existingItem) {
        return {
          success: false,
          error: 'Menu item not found'
        };
      }

      // Check toggle permissions
      const permission = await MenuSecurity.checkPermission(
        this.permissionContext,
        'menu_item',
        'toggle',
        existingItem as MenuItem
      );

      if (!permission.allowed) {
        return {
          success: false,
          error: `Access denied: ${permission.reason}`,
        };
      }

      const newValue = !existingItem[field];

      // Update the field
      const { data: updatedItem, error } = await supabase
        .from('menu_items')
        .update({
          [field]: newValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Database error toggling menu item', 'SECURE_MENU_API', error);
        return {
          success: false,
          error: 'Failed to toggle menu item'
        };
      }

      // Log the action
      await MenuSecurity.logMenuAction(
        'toggle',
        'menu_item',
        this.permissionContext,
        this.context.userEmail,
        {
          menuItemId: id,
          oldValues: { [field]: existingItem[field] },
          newValues: { [field]: newValue },
          metadata: { toggledField: field }
        }
      );

      return {
        success: true,
        data: updatedItem
      };
    } catch (error) {
      logger.error('Error in secure toggleMenuItem', 'SECURE_MENU_API', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }

  /**
   * Secure bulk operations with individual permission checks
   */
  async bulkUpdateMenuItems(
    updates: Array<{ id: string; updates: Partial<MenuItem> }>
  ): Promise<SecureApiResponse<MenuItem[]>> {
    try {
      // Get all items to be updated
      const ids = updates.map(u => u.id);
      const { data: existingItems, error: fetchError } = await supabase
        .from('menu_items')
        .select('*')
        .in('id', ids);

      if (fetchError) {
        return {
          success: false,
          error: 'Failed to fetch menu items for bulk update'
        };
      }

      // Validate bulk operation permission
      const bulkValidation = await MenuSecurity.validateBulkOperation(
        'update',
        existingItems || [],
        this.permissionContext
      );

      if (!bulkValidation.allowed) {
        return {
          success: false,
          error: 'Bulk operation not allowed',
          validationErrors: bulkValidation.errors
        };
      }

      const results: MenuItem[] = [];
      const errors: string[] = [];

      // Process each update
      for (const update of updates) {
        const existingItem = existingItems?.find(item => item.id === update.id);
        if (!existingItem) {
          errors.push(`Item ${update.id} not found`);
          continue;
        }

        // Update individual item
        const result = await this.updateMenuItem({
          id: update.id,
          ...update.updates
        });

        if (result.success && result.data) {
          results.push(result.data);
        } else {
          errors.push(`Failed to update ${existingItem.title}: ${result.error}`);
        }
      }

      return {
        success: errors.length === 0,
        data: results,
        validationErrors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      logger.error('Error in secure bulkUpdateMenuItems', 'SECURE_MENU_API', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }

  /**
   * Secure menu export with permission check
   */
  async exportMenuStructure(
    menuType?: MenuType,
    includeDisabled = false
  ): Promise<SecureApiResponse<MenuItem[]>> {
    try {
      // Check export permissions
      const permission = await MenuSecurity.checkPermission(
        this.permissionContext,
        'menu_items',
        'export'
      );

      if (!permission.allowed) {
        return {
          success: false,
          error: `Access denied: ${permission.reason}`,
        };
      }

      // Get menu items
      const result = await this.getMenuItems(menuType);
      if (!result.success || !result.data) {
        return result;
      }

      let exportData = result.data;

      // Filter disabled items if requested
      if (!includeDisabled) {
        exportData = exportData.filter(item => item.is_enabled);
      }

      // Log export action
      await MenuSecurity.logMenuAction(
        'export',
        'menu_item',
        this.permissionContext,
        this.context.userEmail,
        {
          metadata: {
            menuType,
            includeDisabled,
            exportedCount: exportData.length
          }
        }
      );

      return {
        success: true,
        data: exportData
      };
    } catch (error) {
      logger.error('Error in secure exportMenuStructure', 'SECURE_MENU_API', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }
}

/**
 * Factory function to create a secure menu API instance
 */
export const createSecureMenuApi = (context: SecureMenuApiContext) => {
  return new SecureMenuApi(context);
};