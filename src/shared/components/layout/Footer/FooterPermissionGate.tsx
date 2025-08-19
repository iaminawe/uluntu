import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { MenuItem } from '@/types/menu';

interface FooterPermissionGateProps {
  children: React.ReactNode;
  menuItem?: MenuItem;
  requiredRoles?: string[];
  visibility?: 'public' | 'authenticated' | 'admin' | 'role_based';
  fallback?: React.ReactNode;
}

/**
 * Permission gate component for footer menu items
 * Controls visibility based on user roles and item configuration
 */
export const FooterPermissionGate: React.FC<FooterPermissionGateProps> = ({
  children,
  menuItem,
  requiredRoles,
  visibility,
  fallback = null
}) => {
  const { user, hasRole, isAuthenticated } = useAuth();

  // Determine the visibility rules to apply
  const itemVisibility = visibility || menuItem?.visibility || 'public';
  const itemRequiredRoles = requiredRoles || menuItem?.required_roles || [];

  // Check if user meets visibility requirements
  const hasAccess = checkAccess(
    itemVisibility,
    itemRequiredRoles,
    isAuthenticated,
    hasRole
  );

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * Check if user has access based on visibility and role requirements
 */
function checkAccess(
  visibility: string,
  requiredRoles: string[],
  isAuthenticated: boolean,
  hasRole: (role: string) => boolean
): boolean {
  switch (visibility) {
    case 'public':
      return true;
      
    case 'authenticated':
      return isAuthenticated;
      
    case 'admin':
      return isAuthenticated && hasRole('admin');
      
    case 'role_based':
      if (!isAuthenticated) return false;
      if (requiredRoles.length === 0) return true;
      return requiredRoles.some(role => hasRole(role));
      
    default:
      return true; // Default to public access
  }
}

/**
 * Higher-order component for wrapping footer items with permission checks
 */
export function withFooterPermissions<T extends object>(
  Component: React.ComponentType<T>
) {
  return function PermissionWrappedComponent(
    props: T & { menuItem?: MenuItem; fallback?: React.ReactNode }
  ) {
    const { menuItem, fallback, ...componentProps } = props;
    
    return (
      <FooterPermissionGate menuItem={menuItem} fallback={fallback}>
        <Component {...(componentProps as T)} />
      </FooterPermissionGate>
    );
  };
}

/**
 * Hook for checking footer item permissions
 */
export function useFooterPermissions() {
  const { user, hasRole, isAuthenticated } = useAuth();

  const checkItemAccess = (item: MenuItem): boolean => {
    return checkAccess(
      item.visibility || 'public',
      item.required_roles || [],
      isAuthenticated,
      hasRole
    );
  };

  const filterAccessibleItems = (items: MenuItem[]): MenuItem[] => {
    return items.filter(checkItemAccess).map(item => ({
      ...item,
      children: item.children ? filterAccessibleItems(item.children) : undefined
    }));
  };

  const getAccessLevel = (): 'public' | 'authenticated' | 'admin' => {
    if (!isAuthenticated) return 'public';
    if (hasRole('admin')) return 'admin';
    return 'authenticated';
  };

  return {
    checkItemAccess,
    filterAccessibleItems,
    getAccessLevel,
    isAuthenticated,
    hasRole
  };
}

export default FooterPermissionGate;