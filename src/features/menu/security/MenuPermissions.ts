// Enhanced Menu Permission System
// Comprehensive security controls for menu management with RBAC and audit logging

import { User } from '@supabase/supabase-js';
import { MenuItem, MenuType, MenuVisibility } from '@/types/menu';
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

export interface MenuPermissionContext {
  userId: string;
  userRoles: string[];
  sessionId?: string;
  ipAddress?: string;
}

export interface MenuSecurityRule {
  resource: string;
  action: MenuAction;
  requiredRoles: string[];
  conditions?: (context: MenuPermissionContext, item?: MenuItem) => boolean;
  cascade?: boolean; // Apply to child items
}

export type MenuAction = 
  | 'read' 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'toggle' 
  | 'reorder' 
  | 'manage_visibility' 
  | 'manage_permissions'
  | 'view_audit_logs'
  | 'export'
  | 'bulk_operations';

export interface MenuAuditLog {
  id?: string;
  menu_item_id?: string;
  action: MenuAction;
  user_id: string;
  user_email: string;
  resource_type: 'menu_item' | 'menu_container' | 'menu_settings';
  resource_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  metadata?: {
    ip_address?: string;
    user_agent?: string;
    session_id?: string;
    affected_children?: number;
  };
  created_at: string;
}

// Define menu-specific security rules
export const MENU_SECURITY_RULES: MenuSecurityRule[] = [
  // Read permissions
  {
    resource: 'menu_management',
    action: 'read',
    requiredRoles: ['admin', 'superadmin', 'menu_manager'],
    conditions: (context) => {
      // Allow content editors to view menus they can manage
      return context.userRoles.includes('content_editor') || 
             context.userRoles.includes('menu_editor');
    }
  },

  // Create permissions
  {
    resource: 'menu_item',
    action: 'create',
    requiredRoles: ['admin', 'superadmin', 'menu_manager'],
    conditions: (context, item) => {
      // Menu editors can only create in specific containers
      if (context.userRoles.includes('menu_editor')) {
        return item?.menu_type !== 'admin';
      }
      return true;
    }
  },

  // Update permissions
  {
    resource: 'menu_item',
    action: 'update',
    requiredRoles: ['admin', 'superadmin', 'menu_manager'],
    conditions: (context, item) => {
      // Content editors can update content-related menu items
      if (context.userRoles.includes('content_editor')) {
        return item?.visibility === 'public' || item?.visibility === 'authenticated';
      }
      return true;
    }
  },

  // Delete permissions with cascading
  {
    resource: 'menu_item',
    action: 'delete',
    requiredRoles: ['admin', 'superadmin'],
    cascade: true,
    conditions: (context, item) => {
      // Prevent deletion of system-critical menu items
      const protectedItems = ['/admin', '/signin', '/signup'];
      return !protectedItems.includes(item?.url || '');
    }
  },

  // Visibility management
  {
    resource: 'menu_item',
    action: 'manage_visibility',
    requiredRoles: ['admin', 'superadmin'],
    conditions: (context, item) => {
      // Only superadmins can create admin-only items
      if (item?.visibility === 'admin') {
        return context.userRoles.includes('superadmin');
      }
      return true;
    }
  },

  // Permission management
  {
    resource: 'menu_item',
    action: 'manage_permissions',
    requiredRoles: ['superadmin'],
    cascade: true
  },

  // Audit log access
  {
    resource: 'menu_audit_logs',
    action: 'view_audit_logs',
    requiredRoles: ['admin', 'superadmin', 'auditor']
  },

  // Bulk operations
  {
    resource: 'menu_items',
    action: 'bulk_operations',
    requiredRoles: ['admin', 'superadmin'],
    conditions: (context) => {
      // Additional validation for bulk operations
      return context.userRoles.includes('superadmin');
    }
  }
];

export class MenuSecurityManager {
  
  /**
   * Check if user has permission for a specific menu action
   */
  static async checkPermission(
    context: MenuPermissionContext,
    resource: string,
    action: MenuAction,
    item?: MenuItem
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      // Find applicable security rule
      const rule = MENU_SECURITY_RULES.find(r => 
        r.resource === resource && r.action === action
      );

      if (!rule) {
        logger.warn(`No security rule found for ${resource}:${action}`, 'MENU_SECURITY');
        return { allowed: false, reason: 'No security rule defined' };
      }

      // Check required roles
      const hasRequiredRole = rule.requiredRoles.some(role => 
        context.userRoles.includes(role)
      );

      if (!hasRequiredRole) {
        return { 
          allowed: false, 
          reason: `Requires one of: ${rule.requiredRoles.join(', ')}` 
        };
      }

      // Apply additional conditions
      if (rule.conditions) {
        // TEMPORARY: Log the condition check for debugging
        logger.debug('Checking additional conditions', 'MENU_SECURITY', {
          context,
          item,
          resource,
          action
        });
        
        const conditionsMet = rule.conditions(context, item);
        if (!conditionsMet) {
          // TEMPORARY: Allow superadmins to bypass conditions
          if (context.userRoles.includes('superadmin')) {
            logger.warn('Superadmin bypassing security conditions', 'MENU_SECURITY');
            return { allowed: true };
          }
          
          return { 
            allowed: false, 
            reason: 'Additional security conditions not met' 
          };
        }
      }

      // Check cascading permissions for parent items
      if (item?.parent_id && rule.cascade) {
        const parentPermission = await this.checkParentPermissions(
          context, resource, action, item.parent_id
        );
        if (!parentPermission.allowed) {
          return {
            allowed: false,
            reason: `Parent item restrictions: ${parentPermission.reason}`
          };
        }
      }

      return { allowed: true };
    } catch (error) {
      logger.error('Error checking menu permission', 'MENU_SECURITY', error);
      return { allowed: false, reason: 'Permission check failed' };
    }
  }

  /**
   * Check permissions for parent menu items (cascading)
   */
  private static async checkParentPermissions(
    context: MenuPermissionContext,
    resource: string,
    action: MenuAction,
    parentId: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      // Get parent menu item
      const { data: parentItem, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', parentId)
        .single();

      if (error || !parentItem) {
        return { allowed: false, reason: 'Parent item not found' };
      }

      // Check parent permissions recursively
      return this.checkPermission(context, resource, action, parentItem as MenuItem);
    } catch (error) {
      logger.error('Error checking parent permissions', 'MENU_SECURITY', error);
      return { allowed: false, reason: 'Parent permission check failed' };
    }
  }

  /**
   * Filter menu items based on user permissions and visibility rules
   */
  static filterMenuItemsByPermissions(
    items: MenuItem[],
    context: MenuPermissionContext,
    user?: User
  ): MenuItem[] {
    return items.filter(item => {
      // Check visibility rules
      switch (item.visibility) {
        case 'public':
          return true;
        case 'authenticated':
          return !!user;
        case 'admin':
          return context.userRoles.includes('admin') || 
                 context.userRoles.includes('superadmin');
        case 'role_based':
          if (!item.required_roles || !user) return false;
          return item.required_roles.some(role => 
            context.userRoles.includes(role)
          );
        default:
          return false;
      }
    });
  }

  /**
   * Validate menu item security before operations
   */
  static validateMenuItemSecurity(
    item: Partial<MenuItem>,
    context: MenuPermissionContext
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate visibility settings
    if (item.visibility === 'admin' && !context.userRoles.includes('superadmin')) {
      errors.push('Only super administrators can create admin-only menu items');
    }

    // Validate role requirements
    if (item.visibility === 'role_based' && (!item.required_roles || item.required_roles.length === 0)) {
      errors.push('Role-based menu items must specify required roles');
    }

    // Validate URL safety
    if (item.url && this.isUnsafeUrl(item.url)) {
      errors.push('URL appears to be unsafe or suspicious');
    }

    // Validate external links
    if (item.is_external && item.target !== '_blank') {
      errors.push('External links should open in a new window for security');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if URL is potentially unsafe
   */
  private static isUnsafeUrl(url: string): boolean {
    const suspiciousPatterns = [
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /on\w+\s*=/i,
      /<script/i,
      /\.\.\/.*\.\.\//, // Path traversal
    ];

    return suspiciousPatterns.some(pattern => pattern.test(url));
  }

  /**
   * Log menu action for audit trail
   */
  static async logMenuAction(
    action: MenuAction,
    resourceType: 'menu_item' | 'menu_container' | 'menu_settings',
    context: MenuPermissionContext,
    userEmail: string,
    details: {
      resourceId?: string;
      menuItemId?: string;
      oldValues?: Record<string, any>;
      newValues?: Record<string, any>;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<void> {
    try {
      const auditLog: Omit<MenuAuditLog, 'id' | 'created_at'> = {
        action,
        resource_type: resourceType,
        user_id: context.userId,
        user_email: userEmail,
        resource_id: details.resourceId,
        menu_item_id: details.menuItemId,
        old_values: details.oldValues,
        new_values: details.newValues,
        metadata: {
          session_id: context.sessionId,
          ip_address: context.ipAddress,
          ...details.metadata
        }
      };

      const { error } = await supabase
        .from('menu_audit_logs')
        .insert([auditLog]);

      if (error) {
        logger.error('Failed to create menu audit log', 'MENU_SECURITY', error);
      } else {
        logger.info(`Menu action logged: ${action}`, 'MENU_AUDIT', {
          resourceType,
          userId: context.userId,
          resourceId: details.resourceId
        });
      }
    } catch (error) {
      logger.error('Error creating menu audit log', 'MENU_SECURITY', error);
    }
  }

  /**
   * Get menu audit logs with filtering
   */
  static async getMenuAuditLogs(
    filters: {
      menuItemId?: string;
      userId?: string;
      action?: MenuAction;
      resourceType?: string;
      fromDate?: string;
      toDate?: string;
    } = {},
    limit = 50,
    offset = 0
  ): Promise<{ logs: MenuAuditLog[]; total: number }> {
    try {
      let query = supabase
        .from('menu_audit_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.menuItemId) {
        query = query.eq('menu_item_id', filters.menuItemId);
      }
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      if (filters.resourceType) {
        query = query.eq('resource_type', filters.resourceType);
      }
      if (filters.fromDate) {
        query = query.gte('created_at', filters.fromDate);
      }
      if (filters.toDate) {
        query = query.lte('created_at', filters.toDate);
      }

      const { data, error, count } = await query
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return {
        logs: data || [],
        total: count || 0
      };
    } catch (error) {
      logger.error('Error fetching menu audit logs', 'MENU_SECURITY', error);
      return { logs: [], total: 0 };
    }
  }

  /**
   * Check feature flag permissions for menu items
   */
  static async checkFeatureFlagPermissions(
    items: MenuItem[],
    context: MenuPermissionContext
  ): Promise<MenuItem[]> {
    // This would integrate with your feature flag system
    // For now, we'll implement a basic check
    return items.filter(item => {
      if (!item.css_classes) return true;
      
      // Check for feature flag classes that might indicate restricted access
      const restrictedFlags = ['admin-only', 'beta-users', 'premium'];
      const hasRestrictedFlag = restrictedFlags.some(flag => 
        item.css_classes?.includes(flag)
      );

      if (hasRestrictedFlag) {
        return context.userRoles.includes('admin') || 
               context.userRoles.includes('superadmin');
      }

      return true;
    });
  }

  /**
   * Validate bulk operation permissions
   */
  static async validateBulkOperation(
    action: MenuAction,
    items: MenuItem[],
    context: MenuPermissionContext
  ): Promise<{ allowed: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check if user can perform bulk operations
    const bulkPermission = await this.checkPermission(
      context, 'menu_items', 'bulk_operations'
    );

    if (!bulkPermission.allowed) {
      errors.push(bulkPermission.reason || 'Bulk operations not allowed');
      return { allowed: false, errors };
    }

    // Check each item individually
    for (const item of items) {
      const itemPermission = await this.checkPermission(
        context, 'menu_item', action, item
      );

      if (!itemPermission.allowed) {
        errors.push(
          `Cannot ${action} "${item.title}": ${itemPermission.reason}`
        );
      }
    }

    return {
      allowed: errors.length === 0,
      errors
    };
  }
}

// Export menu security utilities for use in other parts of the application
export const MenuSecurity = MenuSecurityManager;