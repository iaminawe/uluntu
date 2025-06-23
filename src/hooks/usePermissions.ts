import { useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import { adminRolesApi } from '@/features/admin/api/roles';
import { useQuery } from '@tanstack/react-query';
import { getEffectiveRoles, getMergedPermissions, canAssignRole, getAssignableRoles } from '@/utils/roleInheritance';

interface PermissionCheck {
  resource: string;
  action: string;
  conditions?: Record<string, unknown>;
}

/**
 * Hook for checking user permissions and roles
 * Combines system roles from Redux state with custom roles from database
 */
export const usePermissions = () => {
  const { user, roles: reduxRoles } = useAppSelector(state => state.auth);
  
  // Fetch custom roles for the current user
  const { data: customRoles = [] } = useQuery({
    queryKey: ['user-custom-roles', user?.id],
    queryFn: () => user ? adminRolesApi.getUserRoles(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Combine system and custom roles with inheritance
  const allRoles = useMemo(() => {
    const systemRoles = reduxRoles.list.map(roleId => ({
      id: roleId,
      name: formatRoleName(roleId),
      type: 'system' as const,
      permissions: getSystemRolePermissions(roleId)
    }));

    return [...systemRoles, ...customRoles];
  }, [reduxRoles.list, customRoles]);

  // Get effective roles including inherited ones
  const effectiveRoles = useMemo(() => {
    const userRoleIds = allRoles.map(role => role.id);
    return getEffectiveRoles(userRoleIds);
  }, [allRoles]);

  // Get merged permissions with inheritance
  const mergedPermissions = useMemo(() => {
    const userRoleIds = allRoles.map(role => role.id);
    return getMergedPermissions(allRoles, userRoleIds);
  }, [allRoles]);

  // Check if user has a specific role (including inherited roles)
  const hasRole = (roleId: string): boolean => {
    return effectiveRoles.includes(roleId);
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roleIds: string[]): boolean => {
    return roleIds.some(roleId => hasRole(roleId));
  };

  // Check if user has all of the specified roles
  const hasAllRoles = (roleIds: string[]): boolean => {
    return roleIds.every(roleId => hasRole(roleId));
  };

  // Check specific permission using merged permissions with inheritance
  const hasPermission = ({ resource, action, conditions }: PermissionCheck): boolean => {
    if (!user) return false;

    // Super admin has all permissions
    if (hasRole('superadmin')) return true;

    // Check merged permissions
    if (mergedPermissions['*']?.includes('*')) {
      return true;
    }

    // Check specific resource permissions
    const resourcePermissions = mergedPermissions[resource];
    if (resourcePermissions) {
      if (resourcePermissions.includes('*') || resourcePermissions.includes(action)) {
        // TODO: Implement condition checking if needed
        return true;
      }
    }

    return false;
  };

  // Check multiple permissions (user needs ALL of them)
  const hasAllPermissions = (permissions: PermissionCheck[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  // Check multiple permissions (user needs ANY of them)
  const hasAnyPermission = (permissions: PermissionCheck[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  // Get all permissions for current user (using merged permissions with inheritance)
  const getAllPermissions = (): Record<string, string[]> => {
    return mergedPermissions;
  };

  // Helper function to check if user can perform admin actions
  const isAdmin = (): boolean => {
    return hasAnyRole(['admin', 'superadmin']);
  };

  // Helper function to check if user is super admin
  const isSuperAdmin = (): boolean => {
    return hasRole('superadmin');
  };

  // Helper function to check if user is authenticated
  const isAuthenticated = (): boolean => {
    return !!user && hasRole('authenticated');
  };

  // Helper function to check if user is a group member
  const isGroupMember = (): boolean => {
    return hasRole('group_member');
  };

  // Role assignment helpers
  const canUserAssignRole = (targetRole: string): boolean => {
    const userRoleIds = allRoles.map(role => role.id);
    return canAssignRole(userRoleIds, targetRole);
  };

  const getAssignableRolesList = (): string[] => {
    const userRoleIds = allRoles.map(role => role.id);
    return getAssignableRoles(userRoleIds);
  };

  // Debug logging
  console.log('🔑 usePermissions Debug:', {
    user: user?.email,
    systemRoles: reduxRoles.list,
    rolesLoading: reduxRoles.loading,
    hasRoles: reduxRoles.list.length > 0,
    isSuperAdmin: reduxRoles.list.includes('superadmin')
  });

  return {
    // Role checks
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isAdmin,
    isSuperAdmin,
    isAuthenticated,
    isGroupMember,
    
    // Permission checks
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    getAllPermissions,
    
    // Role assignment
    canUserAssignRole,
    getAssignableRolesList,
    
    // Data
    roles: allRoles,
    effectiveRoles,
    mergedPermissions,
    systemRoles: reduxRoles.list,
    customRoles,
    user,
    
    // Loading states
    isLoading: reduxRoles.loading
  };
};

// Helper function to format system role names
function formatRoleName(roleId: string): string {
  const roleMap: Record<string, string> = {
    'authenticated': 'Authenticated User',
    'group_member': 'Group Member', 
    'admin': 'Administrator',
    'superadmin': 'Super Administrator'
  };
  return roleMap[roleId] || roleId.charAt(0).toUpperCase() + roleId.slice(1).replace(/_/g, ' ');
}

// Helper function to get default permissions for system roles
function getSystemRolePermissions(roleId: string): Record<string, string[]> {
  const systemPermissions: Record<string, Record<string, string[]>> = {
    'authenticated': {
      members: ['read'],
      companies: ['read'],
      events: ['read'],
      groups: ['read'],
      news: ['read'],
      resources: ['read'],
      marketplace: ['read'],
      opportunities: ['read']
    },
    'group_member': {
      members: ['read', 'update'],
      companies: ['read'],
      events: ['read', 'create'],
      groups: ['read', 'update'],
      news: ['read'],
      resources: ['read', 'create'],
      marketplace: ['read', 'create'],
      opportunities: ['read']
    },
    'admin': {
      members: ['*'],
      companies: ['*'],
      events: ['*'],
      groups: ['*'],
      news: ['*'],
      resources: ['*'],
      marketplace: ['*'],
      opportunities: ['*'],
      users: ['read', 'update'],
      moderation: ['*']
    },
    'superadmin': {
      '*': ['*']
    }
  };

  return systemPermissions[roleId] || {};
}

// Convenience hooks for common permission checks
export const useCanManageUsers = () => {
  const { hasPermission } = usePermissions();
  return hasPermission({ resource: 'users', action: 'update' });
};

export const useCanModerate = () => {
  const { hasPermission } = usePermissions();
  return hasPermission({ resource: 'moderation', action: 'read' });
};

export const useCanManageContent = (contentType: string) => {
  const { hasPermission } = usePermissions();
  return hasPermission({ resource: contentType, action: 'update' });
};

export const useCanCreateContent = (contentType: string) => {
  const { hasPermission } = usePermissions();
  return hasPermission({ resource: contentType, action: 'create' });
};