import {
  getEffectiveRoles,
  getMergedPermissions,
  hasHigherPriority,
  getHighestPriorityRole,
  canAssignRole,
  getAssignableRoles,
  validateRoleHierarchy,
  getRoleDescription,
  ROLE_HIERARCHY
} from '../roleInheritance';

describe('roleInheritance', () => {
  describe('getEffectiveRoles', () => {
    it('should return direct roles plus inherited roles', () => {
      const userRoles = ['admin'];
      const effectiveRoles = getEffectiveRoles(userRoles);
      
      expect(effectiveRoles).toContain('admin');
      expect(effectiveRoles).toContain('group_member');
      expect(effectiveRoles).toContain('authenticated');
      expect(effectiveRoles).not.toContain('superadmin');
    });

    it('should handle superadmin role', () => {
      const userRoles = ['superadmin'];
      const effectiveRoles = getEffectiveRoles(userRoles);
      
      expect(effectiveRoles).toContain('superadmin');
      expect(effectiveRoles).toContain('admin');
      expect(effectiveRoles).toContain('group_member');
      expect(effectiveRoles).toContain('authenticated');
    });

    it('should handle multiple direct roles', () => {
      const userRoles = ['admin', 'group_member'];
      const effectiveRoles = getEffectiveRoles(userRoles);
      
      // Should not duplicate inherited roles
      const uniqueRoles = [...new Set(effectiveRoles)];
      expect(effectiveRoles.length).toBe(uniqueRoles.length);
    });

    it('should handle unknown roles gracefully', () => {
      const userRoles = ['unknown_role', 'authenticated'];
      const effectiveRoles = getEffectiveRoles(userRoles);
      
      expect(effectiveRoles).toContain('unknown_role');
      expect(effectiveRoles).toContain('authenticated');
    });
  });

  describe('getMergedPermissions', () => {
    const mockRoles = [
      {
        id: 'authenticated',
        permissions: {
          members: ['read'],
          events: ['read'],
          groups: [],
          users: []
        }
      },
      {
        id: 'group_member',
        permissions: {
          members: ['read', 'update'],
          events: ['read', 'create'],
          groups: ['read', 'update'],
          users: []
        }
      },
      {
        id: 'admin',
        permissions: {
          members: ['*'],
          events: ['*'],
          groups: ['*'],
          users: ['read', 'update']
        }
      }
    ];

    it('should merge permissions correctly', () => {
      const userRoles = ['group_member'];
      const merged = getMergedPermissions(mockRoles, userRoles);
      
      expect(merged.members).toContain('read');
      expect(merged.members).toContain('update');
      expect(merged.events).toContain('read');
      expect(merged.events).toContain('create');
      expect(merged.groups).toContain('read');
      expect(merged.groups).toContain('update');
    });

    it('should prioritize higher-level roles', () => {
      const userRoles = ['admin'];
      const merged = getMergedPermissions(mockRoles, userRoles);
      
      expect(merged.members).toEqual(['*']);
      expect(merged.events).toEqual(['*']);
      expect(merged.users).toContain('read');
      expect(merged.users).toContain('update');
    });

    it('should handle wildcard permissions correctly', () => {
      const adminRole = {
        id: 'admin',
        permissions: { members: ['*'] }
      };
      
      const userRoles = ['admin'];
      const merged = getMergedPermissions([adminRole], userRoles);
      
      expect(merged.members).toEqual(['*']);
    });
  });

  describe('hasHigherPriority', () => {
    it('should correctly compare role priorities', () => {
      expect(hasHigherPriority('superadmin', 'admin')).toBe(true);
      expect(hasHigherPriority('admin', 'group_member')).toBe(true);
      expect(hasHigherPriority('group_member', 'authenticated')).toBe(true);
      expect(hasHigherPriority('authenticated', 'superadmin')).toBe(false);
    });

    it('should handle unknown roles', () => {
      expect(hasHigherPriority('unknown', 'admin')).toBe(false);
      expect(hasHigherPriority('admin', 'unknown')).toBe(true);
    });
  });

  describe('getHighestPriorityRole', () => {
    it('should return highest priority role', () => {
      const roles = ['authenticated', 'admin', 'group_member'];
      expect(getHighestPriorityRole(roles)).toBe('admin');
    });

    it('should handle single role', () => {
      const roles = ['group_member'];
      expect(getHighestPriorityRole(roles)).toBe('group_member');
    });

    it('should handle empty array', () => {
      expect(getHighestPriorityRole([])).toBeNull();
    });
  });

  describe('canAssignRole', () => {
    it('should allow superadmin to assign any role', () => {
      const userRoles = ['superadmin'];
      expect(canAssignRole(userRoles, 'admin')).toBe(true);
      expect(canAssignRole(userRoles, 'group_member')).toBe(true);
      expect(canAssignRole(userRoles, 'authenticated')).toBe(true);
    });

    it('should allow admin to assign lower-level roles', () => {
      const userRoles = ['admin'];
      expect(canAssignRole(userRoles, 'group_member')).toBe(true);
      expect(canAssignRole(userRoles, 'authenticated')).toBe(true);
      expect(canAssignRole(userRoles, 'admin')).toBe(false);
      expect(canAssignRole(userRoles, 'superadmin')).toBe(false);
    });

    it('should not allow regular users to assign roles', () => {
      const userRoles = ['group_member'];
      expect(canAssignRole(userRoles, 'authenticated')).toBe(false);
      expect(canAssignRole(userRoles, 'group_member')).toBe(false);
    });
  });

  describe('getAssignableRoles', () => {
    it('should return correct assignable roles for admin', () => {
      const userRoles = ['admin'];
      const assignable = getAssignableRoles(userRoles);
      
      expect(assignable).toContain('group_member');
      expect(assignable).toContain('authenticated');
      expect(assignable).toContain('guest');
      expect(assignable).not.toContain('admin');
      expect(assignable).not.toContain('superadmin');
    });

    it('should return all roles for superadmin', () => {
      const userRoles = ['superadmin'];
      const assignable = getAssignableRoles(userRoles);
      
      expect(assignable).toContain('admin');
      expect(assignable).toContain('group_member');
      expect(assignable).toContain('authenticated');
      expect(assignable).toContain('guest');
    });

    it('should return empty array for regular users', () => {
      const userRoles = ['authenticated'];
      const assignable = getAssignableRoles(userRoles);
      
      expect(assignable).toEqual([]);
    });
  });

  describe('validateRoleHierarchy', () => {
    it('should validate the current role hierarchy', () => {
      const errors = validateRoleHierarchy();
      expect(errors).toEqual([]);
    });
  });

  describe('getRoleDescription', () => {
    it('should return description for single role', () => {
      const description = getRoleDescription(['authenticated']);
      expect(description).toContain('authenticated');
    });

    it('should return description for multiple roles', () => {
      const description = getRoleDescription(['admin']);
      expect(description).toContain('Administrative');
      expect(description).toContain('inherited');
    });

    it('should handle empty roles', () => {
      const description = getRoleDescription([]);
      expect(description).toBe('No roles assigned');
    });
  });

  describe('ROLE_HIERARCHY', () => {
    it('should have consistent level ordering', () => {
      const roles = Object.entries(ROLE_HIERARCHY);
      
      // Check that inherited roles have higher level numbers
      roles.forEach(([_roleName, config]) => {
        config.inherits.forEach(inheritedRole => {
          const inheritedConfig = ROLE_HIERARCHY[inheritedRole];
          if (inheritedConfig) {
            expect(inheritedConfig.level).toBeGreaterThan(config.level);
          }
        });
      });
    });

    it('should have all required properties', () => {
      Object.entries(ROLE_HIERARCHY).forEach(([_roleName, config]) => {
        expect(config).toHaveProperty('inherits');
        expect(config).toHaveProperty('level');
        expect(config).toHaveProperty('description');
        expect(Array.isArray(config.inherits)).toBe(true);
        expect(typeof config.level).toBe('number');
        expect(typeof config.description).toBe('string');
      });
    });
  });
});