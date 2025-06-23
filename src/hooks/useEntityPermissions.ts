import { useQuery } from '@tanstack/react-query';
import { entityPermissions, EntityPermissionCheck } from '@/utils/entityPermissions';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';

/**
 * React Query hooks for entity-specific permissions
 * These hooks work with usePermissions for system-wide permissions
 */

/**
 * Check if current user is admin of a specific company
 */
export function useIsCompanyAdmin(companyId: string | undefined) {
  const { user } = useSession();
  
  return useQuery({
    queryKey: ['entity-permission', 'company', companyId, 'admin', user?.id],
    queryFn: () => companyId ? entityPermissions.isCompanyAdmin(companyId) : Promise.resolve(false),
    enabled: !!companyId && !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Check if current user is admin of a specific group
 */
export function useIsGroupAdmin(groupId: string | undefined) {
  const { user } = useSession();
  
  return useQuery({
    queryKey: ['entity-permission', 'group', groupId, 'admin', user?.id],
    queryFn: () => groupId ? entityPermissions.isGroupAdmin(groupId) : Promise.resolve(false),
    enabled: !!groupId && !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Check if current user is member of a specific company
 */
export function useIsCompanyMember(companyId: string | undefined) {
  const { user } = useSession();
  
  return useQuery({
    queryKey: ['entity-permission', 'company', companyId, 'member', user?.id],
    queryFn: () => companyId ? entityPermissions.isCompanyMember(companyId) : Promise.resolve(false),
    enabled: !!companyId && !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Check if current user is member of a specific group
 */
export function useIsGroupMember(groupId: string | undefined) {
  const { user } = useSession();
  
  return useQuery({
    queryKey: ['entity-permission', 'group', groupId, 'member', user?.id],
    queryFn: () => groupId ? entityPermissions.isGroupMember(groupId) : Promise.resolve(false),
    enabled: !!groupId && !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Generic hook for checking any entity permission
 */
export function useEntityPermission(
  entityType: 'company' | 'group',
  entityId: string | undefined,
  permission: 'admin' | 'member' | 'moderator'
) {
  const { user } = useSession();
  
  return useQuery({
    queryKey: ['entity-permission', entityType, entityId, permission, user?.id],
    queryFn: () => {
      if (!entityId) return Promise.resolve(false);
      return entityPermissions.checkPermission({
        entityType,
        entityId,
        permission
      });
    },
    enabled: !!entityId && !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook that combines system permissions with entity permissions
 * Useful for components that need both types of checks
 */
export function useCombinedPermissions(
  entityType?: 'company' | 'group',
  entityId?: string,
  entityPermission?: 'admin' | 'member' | 'moderator'
) {
  const { user } = useSession();
  
  // Entity permission check
  const entityPermissionQuery = useQuery({
    queryKey: ['entity-permission', entityType, entityId, entityPermission, user?.id],
    queryFn: () => {
      if (!entityType || !entityId || !entityPermission) return Promise.resolve(false);
      return entityPermissions.checkPermission({
        entityType,
        entityId,
        permission: entityPermission
      });
    },
    enabled: !!entityType && !!entityId && !!entityPermission && !!user,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  return {
    // Entity permissions
    hasEntityPermission: entityPermissionQuery.data ?? false,
    isEntityPermissionLoading: entityPermissionQuery.isLoading,
    
    // Helper methods
    isEntityAdmin: entityPermission === 'admin' ? entityPermissionQuery.data ?? false : false,
    isEntityMember: entityPermissionQuery.data ?? false, // Any permission means member
  };
}