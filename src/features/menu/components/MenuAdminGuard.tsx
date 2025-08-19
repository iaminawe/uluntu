// Menu Admin Permission Guard
// Comprehensive access control for menu management features

import React, { ReactNode } from 'react';
import { AlertCircle, Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { useMenuSecurity } from '../hooks/useMenuSecurity';
import { usePermissions } from '@/hooks/usePermissions';
import { MenuItem, MenuAction } from '@/types/menu';

interface MenuAdminGuardProps {
  children: ReactNode;
  requiredPermissions?: {
    resource: string;
    action: MenuAction;
  }[];
  menuItem?: MenuItem;
  fallback?: ReactNode;
  showReason?: boolean;
}

/**
 * Guard component for menu administration features
 * Provides granular access control for menu management operations
 */
export const MenuAdminGuard: React.FC<MenuAdminGuardProps> = ({
  children,
  requiredPermissions = [{ resource: 'menu_management', action: 'read' }],
  menuItem,
  fallback,
  showReason = true
}) => {
  const menuSecurity = useMenuSecurity();
  const permissions = usePermissions();
  const [permissionResults, setPermissionResults] = React.useState<{
    allowed: boolean;
    reasons: string[];
    loading: boolean;
  }>({ allowed: false, reasons: [], loading: true });

  React.useEffect(() => {
    const checkPermissions = async () => {
      if (menuSecurity.isLoading) return;

      const results = await Promise.all(
        requiredPermissions.map(({ resource, action }) =>
          menuSecurity.checkMenuPermission(resource, action, menuItem)
        )
      );

      const allowed = results.every(result => result.allowed);
      const reasons = results
        .filter(result => !result.allowed)
        .map(result => result.reason || 'Access denied')
        .filter((reason, index, array) => array.indexOf(reason) === index); // Remove duplicates

      setPermissionResults({ allowed, reasons, loading: false });
    };

    checkPermissions();
  }, [menuSecurity, requiredPermissions, menuItem]);

  if (permissionResults.loading || menuSecurity.isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          Checking permissions...
        </span>
      </div>
    );
  }

  if (!permissionResults.allowed) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Access Restricted
            </h3>
            {showReason && permissionResults.reasons.length > 0 && (
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <ul className="list-disc pl-5 space-y-1">
                  {permissionResults.reasons.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-2 text-xs text-red-600 dark:text-red-400">
              Contact your administrator if you need access to this feature.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * Guard for menu item operations
 */
export const MenuItemGuard: React.FC<{
  children: ReactNode;
  menuItem: MenuItem;
  action: MenuAction;
  fallback?: ReactNode;
}> = ({ children, menuItem, action, fallback }) => {
  return (
    <MenuAdminGuard
      requiredPermissions={[{ resource: 'menu_item', action }]}
      menuItem={menuItem}
      fallback={fallback}
    >
      {children}
    </MenuAdminGuard>
  );
};

/**
 * Guard for bulk operations
 */
export const MenuBulkOperationGuard: React.FC<{
  children: ReactNode;
  menuItems: MenuItem[];
  action: MenuAction;
  fallback?: ReactNode;
}> = ({ children, menuItems, action, fallback }) => {
  const menuSecurity = useMenuSecurity();
  const [canPerformBulk, setCanPerformBulk] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const checkBulkPermission = async () => {
      const validation = await menuSecurity.validateBulkOperation(action, menuItems);
      setCanPerformBulk(validation.allowed);
    };

    if (menuItems.length > 0) {
      checkBulkPermission();
    }
  }, [menuSecurity, menuItems, action]);

  if (canPerformBulk === null) {
    return (
      <div className="flex items-center justify-center p-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!canPerformBulk) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

/**
 * Menu visibility indicator with security context
 */
export const MenuVisibilityIndicator: React.FC<{
  menuItem: MenuItem;
  showLabel?: boolean;
}> = ({ menuItem, showLabel = false }) => {
  const menuSecurity = useMenuSecurity();

  const getVisibilityInfo = () => {
    switch (menuItem.visibility) {
      case 'public':
        return {
          icon: <Eye className="h-4 w-4 text-green-500" />,
          label: 'Public',
          description: 'Visible to all users',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/30'
        };
      case 'authenticated':
        return {
          icon: <Shield className="h-4 w-4 text-blue-500" />,
          label: 'Authenticated',
          description: 'Visible to logged-in users only',
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-100 dark:bg-blue-900/30'
        };
      case 'admin':
        return {
          icon: <Lock className="h-4 w-4 text-red-500" />,
          label: 'Admin Only',
          description: 'Visible to administrators only',
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/30'
        };
      case 'role_based':
        return {
          icon: <Shield className="h-4 w-4 text-purple-500" />,
          label: 'Role Based',
          description: `Requires roles: ${menuItem.required_roles?.join(', ') || 'None'}`,
          color: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-purple-100 dark:bg-purple-900/30'
        };
      default:
        return {
          icon: <EyeOff className="h-4 w-4 text-gray-500" />,
          label: 'Unknown',
          description: 'Unknown visibility setting',
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-900/30'
        };
    }
  };

  const visibilityInfo = getVisibilityInfo();

  // Check if user can see this menu item
  const isVisibleToUser = menuSecurity.filterVisibleMenuItems([menuItem]).length > 0;

  return (
    <div className="flex items-center space-x-2">
      <div
        className={`p-1 rounded ${visibilityInfo.bgColor}`}
        title={visibilityInfo.description}
      >
        {visibilityInfo.icon}
      </div>
      {showLabel && (
        <div className="flex items-center space-x-2">
          <span className={`text-sm ${visibilityInfo.color}`}>
            {visibilityInfo.label}
          </span>
          {!isVisibleToUser && (
            <span className="text-xs text-orange-600 dark:text-orange-400">
              (Hidden from you)
            </span>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Security audit button for menu items
 */
export const MenuSecurityAuditButton: React.FC<{
  menuItem: MenuItem;
  className?: string;
}> = ({ menuItem, className = '' }) => {
  const menuSecurity = useMenuSecurity();
  const [showAudit, setShowAudit] = React.useState(false);

  if (!menuSecurity.canViewAuditLogs) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowAudit(true)}
        className={`p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ${className}`}
        title="View security audit logs"
      >
        <Shield className="h-4 w-4" />
      </button>
      
      {showAudit && (
        <MenuAuditLogModal
          menuItemId={menuItem.id}
          menuItemTitle={menuItem.title}
          onClose={() => setShowAudit(false)}
        />
      )}
    </>
  );
};

/**
 * Menu audit log modal component
 */
export const MenuAuditLogModal: React.FC<{
  menuItemId: string;
  menuItemTitle: string;
  onClose: () => void;
}> = ({ menuItemId, menuItemTitle, onClose }) => {
  const { data: auditData, isLoading } = useMenuAuditLogs({
    menuItemId,
    limit: 20
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Audit Log: {menuItemTitle}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : (
          <div className="space-y-2">
            {auditData?.logs?.length ? (
              auditData.logs.map((log, index) => (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-700 rounded p-3"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {log.action.toUpperCase()}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    by {log.user_email}
                  </div>
                  {log.metadata && (
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      {Object.entries(log.metadata).map(([key, value]) => (
                        <div key={key}>
                          {key}: {JSON.stringify(value)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No audit logs found for this menu item.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuAdminGuard;