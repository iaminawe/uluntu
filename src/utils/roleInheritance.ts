/**
 * Role inheritance system for hierarchical permissions
 * Defines which roles inherit permissions from other roles
 */

export interface RoleHierarchy {
  [role: string]: {
    inherits: string[];
    level: number;
    description: string;
  };
}

/**
 * Define the role hierarchy
 * Lower level numbers have higher priority
 * Roles inherit permissions from all roles they list in 'inherits'
 */
export const ROLE_HIERARCHY: RoleHierarchy = {
  'superadmin': {
    inherits: ['admin', 'group_member', 'authenticated'],
    level: 0,
    description: 'Highest level role with all permissions'
  },
  'admin': {
    inherits: ['group_member', 'authenticated'],
    level: 1,
    description: 'Administrative role with management permissions'
  },
  'group_member': {
    inherits: ['authenticated'],
    level: 2,
    description: 'Enhanced role for group members'
  },
  'authenticated': {
    inherits: [],
    level: 3,
    description: 'Basic authenticated user role'
  },
  'guest': {
    inherits: [],
    level: 4,
    description: 'Unauthenticated user with limited access'
  }
};

/**
 * Get all roles that a user effectively has through inheritance
 * @param userRoles - Array of role IDs that the user directly has
 * @returns Array of all role IDs including inherited ones
 */
export function getEffectiveRoles(userRoles: string[]): string[] {
  const effectiveRoles = new Set<string>();
  
  // Add all direct roles
  userRoles.forEach(role => {
    effectiveRoles.add(role);
    
    // Add inherited roles recursively
    addInheritedRoles(role, effectiveRoles);
  });
  
  return Array.from(effectiveRoles);
}

/**
 * Recursively add inherited roles
 */
function addInheritedRoles(role: string, effectiveRoles: Set<string>): void {
  const roleConfig = ROLE_HIERARCHY[role];
  if (!roleConfig) return;
  
  roleConfig.inherits.forEach(inheritedRole => {
    if (!effectiveRoles.has(inheritedRole)) {
      effectiveRoles.add(inheritedRole);
      // Recursively add roles that this inherited role inherits
      addInheritedRoles(inheritedRole, effectiveRoles);
    }
  });
}

/**
 * Get all permissions for a set of roles, including inherited permissions
 * @param roles - Array of role objects with permissions
 * @param userRoles - Array of role IDs the user has
 * @returns Merged permissions object
 */
export function getMergedPermissions(
  roles: Array<{ id: string; permissions: Record<string, string[]> }>,
  userRoles: string[]
): Record<string, string[]> {
  const effectiveRoles = getEffectiveRoles(userRoles);
  const mergedPermissions: Record<string, string[]> = {};
  
  // Get roles sorted by hierarchy level (higher priority first)
  const sortedRoles = roles
    .filter(role => effectiveRoles.includes(role.id))
    .sort((a, b) => {
      const levelA = ROLE_HIERARCHY[a.id]?.level ?? 999;
      const levelB = ROLE_HIERARCHY[b.id]?.level ?? 999;
      return levelA - levelB;
    });
  
  // Merge permissions, with higher priority roles overriding lower ones
  sortedRoles.forEach(role => {
    if (!role.permissions) return;
    
    Object.entries(role.permissions).forEach(([resource, actions]) => {
      if (!mergedPermissions[resource]) {
        mergedPermissions[resource] = [];
      }
      
      // If this role has wildcard permission, it takes precedence
      if (actions.includes('*')) {
        mergedPermissions[resource] = ['*'];
      } else if (!mergedPermissions[resource].includes('*')) {
        // Only add non-wildcard permissions if we don't already have wildcard
        actions.forEach(action => {
          if (!mergedPermissions[resource].includes(action)) {
            mergedPermissions[resource].push(action);
          }
        });
      }
    });
  });
  
  return mergedPermissions;
}

/**
 * Check if a role has higher priority than another role
 * @param roleA - First role ID
 * @param roleB - Second role ID
 * @returns true if roleA has higher priority than roleB
 */
export function hasHigherPriority(roleA: string, roleB: string): boolean {
  const levelA = ROLE_HIERARCHY[roleA]?.level ?? 999;
  const levelB = ROLE_HIERARCHY[roleB]?.level ?? 999;
  return levelA < levelB;
}

/**
 * Get the highest priority role from a list of roles
 * @param roles - Array of role IDs
 * @returns The highest priority role ID
 */
export function getHighestPriorityRole(roles: string[]): string | null {
  if (roles.length === 0) return null;
  
  return roles.reduce((highest, current) => {
    if (!highest) return current;
    return hasHigherPriority(current, highest) ? current : highest;
  });
}

/**
 * Check if a user can assign a specific role based on their own roles
 * Generally, users can only assign roles that are lower in the hierarchy
 * @param userRoles - Roles that the assigning user has
 * @param targetRole - Role to be assigned
 * @returns true if the user can assign this role
 */
export function canAssignRole(userRoles: string[], targetRole: string): boolean {
  // Super admins can assign any role
  if (userRoles.includes('superadmin')) return true;
  
  // Admins can assign roles below admin level
  if (userRoles.includes('admin')) {
    const targetLevel = ROLE_HIERARCHY[targetRole]?.level ?? 999;
    return targetLevel > 1; // Can't assign superadmin or admin roles
  }
  
  // Regular users can't assign roles
  return false;
}

/**
 * Get all roles that a user can assign to others
 * @param userRoles - Roles that the assigning user has
 * @returns Array of role IDs that can be assigned
 */
export function getAssignableRoles(userRoles: string[]): string[] {
  const assignable: string[] = [];
  
  Object.keys(ROLE_HIERARCHY).forEach(role => {
    if (canAssignRole(userRoles, role)) {
      assignable.push(role);
    }
  });
  
  return assignable;
}

/**
 * Validate role hierarchy for consistency
 * @returns Array of validation errors, empty if valid
 */
export function validateRoleHierarchy(): string[] {
  const errors: string[] = [];
  
  Object.entries(ROLE_HIERARCHY).forEach(([role, config]) => {
    // Check for circular dependencies
    const visited = new Set<string>();
    const checkCircular = (currentRole: string, path: string[]) => {
      if (visited.has(currentRole)) return;
      if (path.includes(currentRole)) {
        errors.push(`Circular dependency detected: ${path.join(' -> ')} -> ${currentRole}`);
        return;
      }
      
      visited.add(currentRole);
      const currentConfig = ROLE_HIERARCHY[currentRole];
      if (currentConfig) {
        currentConfig.inherits.forEach(inheritedRole => {
          checkCircular(inheritedRole, [...path, currentRole]);
        });
      }
    };
    
    checkCircular(role, []);
    
    // Check if inherited roles exist
    config.inherits.forEach(inheritedRole => {
      if (!ROLE_HIERARCHY[inheritedRole]) {
        errors.push(`Role "${role}" inherits from non-existent role "${inheritedRole}"`);
      }
    });
    
    // Check level consistency (inherited roles should have higher level numbers)
    config.inherits.forEach(inheritedRole => {
      const inheritedConfig = ROLE_HIERARCHY[inheritedRole];
      if (inheritedConfig && inheritedConfig.level <= config.level) {
        errors.push(`Role "${role}" (level ${config.level}) inherits from "${inheritedRole}" (level ${inheritedConfig.level}) which should have a higher level number`);
      }
    });
  });
  
  return errors;
}

/**
 * Get a user-friendly description of what roles a user effectively has
 * @param userRoles - Array of role IDs the user has
 * @returns Human-readable description
 */
export function getRoleDescription(userRoles: string[]): string {
  const effectiveRoles = getEffectiveRoles(userRoles);
  const highestRole = getHighestPriorityRole(effectiveRoles);
  
  if (!highestRole) return 'No roles assigned';
  
  const config = ROLE_HIERARCHY[highestRole];
  const roleTitle = config?.description || highestRole;
  
  if (effectiveRoles.length === 1) {
    return roleTitle;
  }
  
  return `${roleTitle} (with ${effectiveRoles.length - 1} inherited role${effectiveRoles.length > 2 ? 's' : ''})`;
}