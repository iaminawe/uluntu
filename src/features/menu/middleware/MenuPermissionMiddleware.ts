// Menu Permission Middleware
// Route-level permission checks and security enforcement for menu management

import { NextFunction, Request, Response } from 'express';
import { MenuSecurity, MenuPermissionContext, MenuAction } from '../security/MenuPermissions';
import { logger } from '@/utils/logger';

// Extend Request type for menu permissions
interface MenuPermissionRequest extends Request {
  user?: {
    id: string;
    email: string;
    roles: string[];
  };
  menuPermissions?: {
    context: MenuPermissionContext;
    checkPermission: (resource: string, action: MenuAction) => Promise<{ allowed: boolean; reason?: string }>;
  };
}

/**
 * Middleware to inject menu permission checking functionality
 */
export const injectMenuPermissions = (
  req: MenuPermissionRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const context: MenuPermissionContext = {
    userId: req.user.id,
    userRoles: req.user.roles,
    sessionId: req.headers['x-session-id'] as string,
    ipAddress: req.ip || req.headers['x-forwarded-for'] as string || req.connection.remoteAddress
  };

  req.menuPermissions = {
    context,
    checkPermission: async (resource: string, action: MenuAction) => {
      return MenuSecurity.checkPermission(context, resource, action);
    }
  };

  next();
};

/**
 * Middleware to require specific menu permissions
 */
export const requireMenuPermission = (
  resource: string,
  action: MenuAction,
  options: {
    allowSuperAdmin?: boolean;
    logAccess?: boolean;
  } = {}
) => {
  return async (req: MenuPermissionRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.menuPermissions || !req.user) {
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      // Super admin bypass if enabled
      if (options.allowSuperAdmin !== false && req.user.roles.includes('superadmin')) {
        if (options.logAccess) {
          await MenuSecurity.logMenuAction(
            action,
            'menu_item',
            req.menuPermissions.context,
            req.user.email,
            {
              metadata: {
                route: req.path,
                method: req.method,
                superAdminBypass: true
              }
            }
          );
        }
        return next();
      }

      // Check permission
      const permission = await req.menuPermissions.checkPermission(resource, action);
      
      if (!permission.allowed) {
        logger.warn('Menu permission denied', 'MENU_MIDDLEWARE', {
          userId: req.user.id,
          userEmail: req.user.email,
          resource,
          action,
          reason: permission.reason,
          route: req.path
        });

        return res.status(403).json({
          error: 'Access denied',
          reason: permission.reason,
          code: 'INSUFFICIENT_PERMISSIONS',
          required: { resource, action }
        });
      }

      // Log successful access if requested
      if (options.logAccess) {
        await MenuSecurity.logMenuAction(
          action,
          'menu_item',
          req.menuPermissions.context,
          req.user.email,
          {
            metadata: {
              route: req.path,
              method: req.method,
              permissionCheck: 'passed'
            }
          }
        );
      }

      next();
    } catch (error) {
      logger.error('Error in menu permission middleware', 'MENU_MIDDLEWARE', error);
      return res.status(500).json({
        error: 'Permission check failed',
        code: 'PERMISSION_CHECK_ERROR'
      });
    }
  };
};

/**
 * Middleware to require menu management access
 */
export const requireMenuManagementAccess = requireMenuPermission(
  'menu_management',
  'read',
  { logAccess: true }
);

/**
 * Middleware to require menu item creation permissions
 */
export const requireMenuItemCreate = requireMenuPermission(
  'menu_item',
  'create',
  { logAccess: true }
);

/**
 * Middleware to require menu item update permissions
 */
export const requireMenuItemUpdate = requireMenuPermission(
  'menu_item',
  'update',
  { logAccess: true }
);

/**
 * Middleware to require menu item deletion permissions
 */
export const requireMenuItemDelete = requireMenuPermission(
  'menu_item',
  'delete',
  { logAccess: true }
);

/**
 * Middleware to require bulk operation permissions
 */
export const requireBulkOperations = requireMenuPermission(
  'menu_items',
  'bulk_operations',
  { logAccess: true }
);

/**
 * Middleware to require audit log access
 */
export const requireAuditLogAccess = requireMenuPermission(
  'menu_audit_logs',
  'view_audit_logs',
  { logAccess: false } // Don't log audit log access to prevent recursion
);

/**
 * React router middleware equivalent for client-side permission checking
 */
export const createClientMenuGuard = (
  resource: string,
  action: MenuAction,
  options: {
    redirectTo?: string;
    fallbackComponent?: React.ComponentType;
    showError?: boolean;
  } = {}
) => {
  return (Component: React.ComponentType<any>) => {
    return function MenuGuardedComponent(props: any) {
      const React = require('react');
      const { useMenuSecurity } = require('../hooks/useMenuSecurity');
      const { Navigate } = require('react-router-dom');
      
      const menuSecurity = useMenuSecurity();
      const [hasPermission, setHasPermission] = React.useState<boolean | null>(null);
      const [error, setError] = React.useState<string>('');

      React.useEffect(() => {
        const checkPermission = async () => {
          try {
            const result = await menuSecurity.checkMenuPermission(resource, action);
            setHasPermission(result.allowed);
            if (!result.allowed) {
              setError(result.reason || 'Access denied');
            }
          } catch (err) {
            setHasPermission(false);
            setError('Permission check failed');
          }
        };

        if (!menuSecurity.isLoading) {
          checkPermission();
        }
      }, [menuSecurity, resource, action]);

      if (menuSecurity.isLoading || hasPermission === null) {
        return React.createElement('div', {
          className: 'flex justify-center items-center p-8'
        }, 'Checking permissions...');
      }

      if (!hasPermission) {
        if (options.redirectTo) {
          return React.createElement(Navigate, { to: options.redirectTo, replace: true });
        }

        if (options.fallbackComponent) {
          return React.createElement(options.fallbackComponent, { error });
        }

        if (options.showError) {
          return React.createElement('div', {
            className: 'text-center p-8 text-red-600'
          }, `Access denied: ${error}`);
        }

        return null;
      }

      return React.createElement(Component, props);
    };
  };
};

/**
 * Higher-order component for menu-specific route protection
 */
export const withMenuPermission = (
  resource: string,
  action: MenuAction,
  options: {
    redirectTo?: string;
    showError?: boolean;
  } = {}
) => createClientMenuGuard(resource, action, options);

/**
 * Common menu permission guards for routes
 */
export const MenuManagementGuard = createClientMenuGuard(
  'menu_management',
  'read',
  { 
    redirectTo: '/unauthorized',
    showError: true
  }
);

export const MenuItemCreateGuard = createClientMenuGuard(
  'menu_item',
  'create',
  { 
    redirectTo: '/unauthorized',
    showError: true
  }
);

export const MenuBulkOperationsGuard = createClientMenuGuard(
  'menu_items',
  'bulk_operations',
  { 
    redirectTo: '/unauthorized',
    showError: true
  }
);

export const MenuAuditLogsGuard = createClientMenuGuard(
  'menu_audit_logs',
  'view_audit_logs',
  { 
    redirectTo: '/unauthorized',
    showError: true
  }
);