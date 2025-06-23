import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  resource: string;
  action: string;
  conditions?: Record<string, unknown>;
  fallback?: React.ReactNode;
  requireAll?: boolean; // For multiple permissions
}

interface MultiplePermissionGuardProps {
  children: React.ReactNode;
  permissions: Array<{
    resource: string;
    action: string;
    conditions?: Record<string, unknown>;
  }>;
  requireAll?: boolean; // true = user needs ALL permissions, false = user needs ANY permission
  fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders children based on user permissions
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  resource,
  action,
  conditions,
  fallback = null
}) => {
  const { hasPermission, isLoading } = usePermissions();

  // Show loading state while permissions are being fetched
  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>;
  }

  const hasAccess = hasPermission({ resource, action, conditions });

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

/**
 * Component that checks multiple permissions
 */
export const MultiplePermissionGuard: React.FC<MultiplePermissionGuardProps> = ({
  children,
  permissions,
  requireAll = true,
  fallback = null
}) => {
  const { hasAllPermissions, hasAnyPermission, isLoading } = usePermissions();

  // Show loading state while permissions are being fetched
  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>;
  }

  const hasAccess = requireAll 
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

/**
 * Component that conditionally renders children based on user roles
 */
interface RoleGuardProps {
  children: React.ReactNode;
  roles: string | string[];
  requireAll?: boolean; // true = user needs ALL roles, false = user needs ANY role
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  roles,
  requireAll = false,
  fallback = null
}) => {
  const { hasRole, hasAllRoles, hasAnyRole, isLoading, systemRoles } = usePermissions();

  // Only show loading if we don't have any roles yet
  // If we have roles, we can check permissions even if other things are loading
  if (isLoading && systemRoles.length === 0) {
    return <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>;
  }

  const roleArray = Array.isArray(roles) ? roles : [roles];
  
  let hasAccess = false;
  if (roleArray.length === 1) {
    hasAccess = hasRole(roleArray[0]);
  } else {
    hasAccess = requireAll ? hasAllRoles(roleArray) : hasAnyRole(roleArray);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

/**
 * Higher-order component for permission-based rendering
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permission: { resource: string; action: string; conditions?: Record<string, unknown> },
  fallback?: React.ReactNode
) {
  return function PermissionWrappedComponent(props: P) {
    return (
      <PermissionGuard {...permission} fallback={fallback}>
        <Component {...props} />
      </PermissionGuard>
    );
  };
}

/**
 * Higher-order component for role-based rendering
 */
export function withRole<P extends object>(
  Component: React.ComponentType<P>,
  roles: string | string[],
  requireAll = false,
  fallback?: React.ReactNode
) {
  return function RoleWrappedComponent(props: P) {
    return (
      <RoleGuard roles={roles} requireAll={requireAll} fallback={fallback}>
        <Component {...props} />
      </RoleGuard>
    );
  };
}

/**
 * Convenient components for common permission checks
 */
export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback
}) => (
  <RoleGuard roles={['admin', 'superadmin']} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const SuperAdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback
}) => (
  <RoleGuard roles="superadmin" fallback={fallback}>
    {children}
  </RoleGuard>
);

export const AuthenticatedOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback
}) => (
  <RoleGuard roles="authenticated" fallback={fallback}>
    {children}
  </RoleGuard>
);

export const GroupMemberOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback
}) => (
  <RoleGuard roles="group_member" fallback={fallback}>
    {children}
  </RoleGuard>
);

// Content management guards
export const CanCreate: React.FC<{ 
  children: React.ReactNode; 
  resource: string; 
  fallback?: React.ReactNode 
}> = ({ children, resource, fallback }) => (
  <PermissionGuard resource={resource} action="create" fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const CanEdit: React.FC<{ 
  children: React.ReactNode; 
  resource: string; 
  fallback?: React.ReactNode 
}> = ({ children, resource, fallback }) => (
  <PermissionGuard resource={resource} action="update" fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const CanDelete: React.FC<{ 
  children: React.ReactNode; 
  resource: string; 
  fallback?: React.ReactNode 
}> = ({ children, resource, fallback }) => (
  <PermissionGuard resource={resource} action="delete" fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const CanManage: React.FC<{ 
  children: React.ReactNode; 
  resource: string; 
  fallback?: React.ReactNode 
}> = ({ children, resource, fallback }) => (
  <PermissionGuard resource={resource} action="*" fallback={fallback}>
    {children}
  </PermissionGuard>
);