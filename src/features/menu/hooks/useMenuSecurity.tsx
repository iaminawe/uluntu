// Menu Security React Hook
// Provides menu-specific security checks and permissions in React components

import React, { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePermissions } from '@/hooks/usePermissions';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';
import { 
  MenuSecurity, 
  MenuPermissionContext, 
  MenuAction,
  MenuAuditLog 
} from '../security/MenuPermissions';
import { MenuItem } from '@/types/menu';

export interface UseMenuSecurityReturn {
  // Permission checks
  canReadMenus: boolean;
  canCreateMenuItems: boolean;
  canUpdateMenuItems: boolean;
  canDeleteMenuItems: boolean;
  canManageVisibility: boolean;
  canManagePermissions: boolean;
  canViewAuditLogs: boolean;
  canPerformBulkOperations: boolean;
  
  // Action-specific checks
  checkMenuPermission: (
    resource: string, 
    action: MenuAction, 
    item?: MenuItem
  ) => Promise<{ allowed: boolean; reason?: string }>;
  
  // Menu filtering
  filterVisibleMenuItems: (items: MenuItem[]) => MenuItem[];
  
  // Validation
  validateMenuItem: (item: Partial<MenuItem>) => { valid: boolean; errors: string[] };
  validateBulkOperation: (
    action: MenuAction, 
    items: MenuItem[]
  ) => Promise<{ allowed: boolean; errors: string[] }>;
  
  // Audit logging
  logMenuAction: (
    action: MenuAction,
    resourceType: 'menu_item' | 'menu_container' | 'menu_settings',
    details?: {
      resourceId?: string;
      menuItemId?: string;
      oldValues?: Record<string, any>;
      newValues?: Record<string, any>;
      metadata?: Record<string, any>;
    }
  ) => Promise<void>;
  
  // Context data
  permissionContext: MenuPermissionContext;
  isLoading: boolean;
}

/**
 * Hook for menu-specific security operations
 */
export const useMenuSecurity = (): UseMenuSecurityReturn => {
  const { user } = useSession();
  const permissions = usePermissions();
  
  // Create permission context
  const permissionContext: MenuPermissionContext = useMemo(() => ({
    userId: user?.id || '',
    userRoles: permissions.systemRoles,
    sessionId: typeof window !== 'undefined' ? 
      sessionStorage.getItem('session_id') || undefined : undefined,
    ipAddress: typeof window !== 'undefined' ? 
      localStorage.getItem('client_ip') || undefined : undefined
  }), [user?.id, permissions.systemRoles]);

  // Basic permission checks using the existing permission system
  const canReadMenus = useMemo(() => 
    permissions.hasAnyRole(['admin', 'superadmin', 'menu_manager', 'menu_editor']),
    [permissions]
  );

  const canCreateMenuItems = useMemo(() => 
    permissions.hasAnyRole(['admin', 'superadmin', 'menu_manager']),
    [permissions]
  );

  const canUpdateMenuItems = useMemo(() => 
    permissions.hasAnyRole(['admin', 'superadmin', 'menu_manager', 'content_editor']),
    [permissions]
  );

  const canDeleteMenuItems = useMemo(() => 
    permissions.hasAnyRole(['admin', 'superadmin']),
    [permissions]
  );

  const canManageVisibility = useMemo(() => 
    permissions.hasAnyRole(['admin', 'superadmin']),
    [permissions]
  );

  const canManagePermissions = useMemo(() => 
    permissions.hasRole('superadmin'),
    [permissions]
  );

  const canViewAuditLogs = useMemo(() => 
    permissions.hasAnyRole(['admin', 'superadmin', 'auditor']),
    [permissions]
  );

  const canPerformBulkOperations = useMemo(() => 
    permissions.hasAnyRole(['admin', 'superadmin']),
    [permissions]
  );

  // Action-specific permission check
  const checkMenuPermission = useCallback(async (
    resource: string,
    action: MenuAction,
    item?: MenuItem
  ) => {
    if (!user?.id) {
      return { allowed: false, reason: 'User not authenticated' };
    }

    return MenuSecurity.checkPermission(permissionContext, resource, action, item);
  }, [permissionContext, user?.id]);

  // Filter menu items based on visibility and permissions
  const filterVisibleMenuItems = useCallback((items: MenuItem[]) => {
    if (!user) {
      // For non-authenticated users, only show public items
      return items.filter(item => item.visibility === 'public');
    }

    return MenuSecurity.filterMenuItemsByPermissions(
      items, 
      permissionContext, 
      user
    );
  }, [permissionContext, user]);

  // Validate menu item before operations
  const validateMenuItem = useCallback((item: Partial<MenuItem>) => {
    return MenuSecurity.validateMenuItemSecurity(item, permissionContext);
  }, [permissionContext]);

  // Validate bulk operations
  const validateBulkOperation = useCallback(async (
    action: MenuAction,
    items: MenuItem[]
  ) => {
    return MenuSecurity.validateBulkOperation(action, items, permissionContext);
  }, [permissionContext]);

  // Log menu actions for audit trail
  const logMenuAction = useCallback(async (
    action: MenuAction,
    resourceType: 'menu_item' | 'menu_container' | 'menu_settings',
    details: {
      resourceId?: string;
      menuItemId?: string;
      oldValues?: Record<string, any>;
      newValues?: Record<string, any>;
      metadata?: Record<string, any>;
    } = {}
  ) => {
    if (!user?.email) return;

    await MenuSecurity.logMenuAction(
      action,
      resourceType,
      permissionContext,
      user.email,
      details
    );
  }, [permissionContext, user?.email]);

  return {
    // Permission flags
    canReadMenus,
    canCreateMenuItems,
    canUpdateMenuItems,
    canDeleteMenuItems,
    canManageVisibility,
    canManagePermissions,
    canViewAuditLogs,
    canPerformBulkOperations,
    
    // Functions
    checkMenuPermission,
    filterVisibleMenuItems,
    validateMenuItem,
    validateBulkOperation,
    logMenuAction,
    
    // Context
    permissionContext,
    isLoading: permissions.isLoading
  };
};

/**
 * Hook for menu audit logs
 */
export const useMenuAuditLogs = (
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
) => {
  const { canViewAuditLogs } = useMenuSecurity();
  
  return useQuery({
    queryKey: ['menu-audit-logs', filters, limit, offset],
    queryFn: () => MenuSecurity.getMenuAuditLogs(filters, limit, offset),
    enabled: canViewAuditLogs,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false
  });
};

/**
 * Hook for checking specific menu item permissions
 */
export const useMenuItemPermissions = (item?: MenuItem) => {
  const { checkMenuPermission } = useMenuSecurity();
  
  return useQuery({
    queryKey: ['menu-item-permissions', item?.id],
    queryFn: async () => {
      if (!item) return null;
      
      const permissions = await Promise.all([
        checkMenuPermission('menu_item', 'read', item),
        checkMenuPermission('menu_item', 'update', item),
        checkMenuPermission('menu_item', 'delete', item),
        checkMenuPermission('menu_item', 'manage_visibility', item),
        checkMenuPermission('menu_item', 'manage_permissions', item)
      ]);
      
      return {
        canRead: permissions[0].allowed,
        canUpdate: permissions[1].allowed,
        canDelete: permissions[2].allowed,
        canManageVisibility: permissions[3].allowed,
        canManagePermissions: permissions[4].allowed,
        reasons: permissions.map((p, i) => p.reason).filter(Boolean)
      };
    },
    enabled: !!item,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Higher-order component for menu security
export const withMenuSecurity = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermissions: {
    resource: string;
    action: MenuAction;
  }[]
) => {
  return (props: P) => {
    const { checkMenuPermission, isLoading } = useMenuSecurity();
    const [hasPermission, setHasPermission] = React.useState<boolean | null>(null);
    
    React.useEffect(() => {
      const checkPermissions = async () => {
        const results = await Promise.all(
          requiredPermissions.map(({ resource, action }) =>
            checkMenuPermission(resource, action)
          )
        );
        
        setHasPermission(results.every(result => result.allowed));
      };
      
      if (!isLoading) {
        checkPermissions();
      }
    }, [checkMenuPermission, isLoading]);
    
    if (isLoading || hasPermission === null) {
      return (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      );
    }
    
    if (!hasPermission) {
      return (
        <div className="text-center p-8">
          <div className="text-red-500 mb-2">Access Denied</div>
          <div className="text-gray-600 text-sm">
            You don't have permission to access this feature.
          </div>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
};