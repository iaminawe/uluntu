import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

/**
 * Entity-specific permission checking utilities
 * These handle permissions for specific entities (companies, groups, etc.)
 * as opposed to system-wide permissions
 */

export interface EntityPermissionCheck {
  entityType: 'company' | 'group';
  entityId: string;
  permission: 'admin' | 'member' | 'moderator';
  userId?: string; // Optional - defaults to current user
}

/**
 * Check if a user has specific permissions for an entity
 */
export async function checkEntityPermission({
  entityType,
  entityId,
  permission,
  userId
}: EntityPermissionCheck): Promise<boolean> {
  try {
    // Get current user if not provided
    let currentUserId = userId;
    if (!currentUserId) {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return false;
      currentUserId = user.user.id;
    }

    // Get member ID for the user
    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', currentUserId)
      .single();

    if (!member) {
      logger.debug('No member found for user', 'ENTITY_PERMISSIONS', { userId: currentUserId });
      return false;
    }

    // Check entity-specific membership
    switch (entityType) {
      case 'company':
        return checkCompanyPermission(entityId, member.id, permission);
      case 'group':
        return checkGroupPermission(entityId, member.id, permission);
      default:
        logger.warn('Unknown entity type', 'ENTITY_PERMISSIONS', { entityType });
        return false;
    }
  } catch (error) {
    logger.error('Error checking entity permission', 'ENTITY_PERMISSIONS', {
      entityType,
      entityId,
      permission,
      error
    });
    return false;
  }
}

/**
 * Check company-specific permissions
 */
async function checkCompanyPermission(
  companyId: string,
  memberId: string,
  permission: 'admin' | 'member' | 'moderator'
): Promise<boolean> {
  try {
    const { data: membership } = await supabase
      .from('company_members')
      .select('role')
      .eq('company_id', companyId)
      .eq('member_id', memberId)
      .single();

    if (!membership) {
      return false;
    }

    switch (permission) {
      case 'admin':
        return membership.role === 'admin';
      case 'moderator':
        return membership.role === 'admin' || membership.role === 'moderator';
      case 'member':
        return true; // Any membership counts as member access
      default:
        return false;
    }
  } catch (error) {
    logger.debug('No company membership found', 'ENTITY_PERMISSIONS', {
      companyId,
      memberId,
      permission
    });
    return false;
  }
}

/**
 * Check group-specific permissions
 */
async function checkGroupPermission(
  groupId: string,
  memberId: string,
  permission: 'admin' | 'member' | 'moderator'
): Promise<boolean> {
  try {
    const { data: membership } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('member_id', memberId)
      .single();

    if (!membership) {
      return false;
    }

    switch (permission) {
      case 'admin':
        return membership.role === 'admin';
      case 'moderator':
        return membership.role === 'admin' || membership.role === 'moderator';
      case 'member':
        return true; // Any membership counts as member access
      default:
        return false;
    }
  } catch (error) {
    logger.debug('No group membership found', 'ENTITY_PERMISSIONS', {
      groupId,
      memberId,
      permission
    });
    return false;
  }
}

/**
 * Batch check multiple entity permissions for performance
 */
export async function checkMultipleEntityPermissions(
  checks: EntityPermissionCheck[]
): Promise<boolean[]> {
  try {
    const results = await Promise.all(
      checks.map(check => checkEntityPermission(check))
    );
    return results;
  } catch (error) {
    logger.error('Error checking multiple entity permissions', 'ENTITY_PERMISSIONS', error);
    return checks.map(() => false);
  }
}

/**
 * Hook-like interface for React components
 * Note: This is async, so use with React Query or similar
 */
export const entityPermissions = {
  checkPermission: checkEntityPermission,
  checkMultiple: checkMultipleEntityPermissions,
  
  // Convenience methods
  isCompanyAdmin: (companyId: string, userId?: string) =>
    checkEntityPermission({ entityType: 'company', entityId: companyId, permission: 'admin', userId }),
    
  isGroupAdmin: (groupId: string, userId?: string) =>
    checkEntityPermission({ entityType: 'group', entityId: groupId, permission: 'admin', userId }),
    
  isCompanyMember: (companyId: string, userId?: string) =>
    checkEntityPermission({ entityType: 'company', entityId: companyId, permission: 'member', userId }),
    
  isGroupMember: (groupId: string, userId?: string) =>
    checkEntityPermission({ entityType: 'group', entityId: groupId, permission: 'member', userId })
};