import { adminRolesApi } from '../roles';
import { supabase } from '@/lib/supabase';

// Mock supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(() => Promise.resolve({ 
        data: { user: { id: 'test-user-id' } } 
      }))
    }
  }
}));

describe('Admin Roles API', () => {
  const mockFrom = supabase.from as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRoles', () => {
    it('should fetch all roles ordered by name', async () => {
      const mockRoles = [
        { id: '1', name: 'admin', permissions: { users: ['read', 'update'] }, is_system: true },
        { id: '2', name: 'user', permissions: { own_profile: ['read', 'update'] }, is_system: true }
      ];

      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockRoles,
            error: null
          })
        })
      });

      const result = await adminRolesApi.getRoles();

      expect(mockFrom).toHaveBeenCalledWith('roles');
      expect(result).toEqual(mockRoles);
    });
  });

  describe('createRole', () => {
    it('should create a new role', async () => {
      const newRole = {
        name: 'content-manager',
        description: 'Manages content',
        permissions: { content: ['create', 'read', 'update', 'delete'] },
        is_system: false
      };

      const mockCreatedRole = { id: '3', ...newRole };

      mockFrom.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockCreatedRole,
              error: null
            })
          })
        })
      });

      const result = await adminRolesApi.createRole(newRole);

      expect(result).toEqual(mockCreatedRole);
      expect(result.id).toBeDefined();
    });
  });

  describe('updateRole', () => {
    it('should update a non-system role', async () => {
      const updates = { description: 'Updated description' };
      const mockUpdatedRole = {
        id: '2',
        name: 'custom-role',
        description: 'Updated description',
        permissions: {},
        is_system: false
      };

      mockFrom.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockUpdatedRole,
                  error: null
                })
              })
            })
          })
        })
      });

      const result = await adminRolesApi.updateRole('2', updates);

      expect(result).toEqual(mockUpdatedRole);
    });

    it('should prevent updating system roles', async () => {
      mockFrom.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: new Error('Cannot update system role')
                })
              })
            })
          })
        })
      });

      await expect(adminRolesApi.updateRole('1', { name: 'superadmin' }))
        .rejects.toThrow('Cannot update system role');
    });
  });

  describe('getUserRoles', () => {
    it('should fetch roles for a specific user', async () => {
      const mockUserRoles = [
        {
          user_id: 'user-1',
          role_id: 'role-1',
          role: { id: 'role-1', name: 'admin', permissions: { '*': ['*'] } }
        }
      ];

      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: mockUserRoles,
            error: null
          })
        })
      });

      const result = await adminRolesApi.getUserRoles('user-1');

      expect(result).toEqual(mockUserRoles);
      expect(mockFrom).toHaveBeenCalledWith('user_roles');
    });
  });

  describe('checkPermission', () => {
    it('should return true for wildcard permissions', async () => {
      const mockUserRoles = [
        {
          role: { permissions: { '*': ['*'] } }
        }
      ];

      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: mockUserRoles,
            error: null
          })
        })
      });

      const result = await adminRolesApi.checkPermission('user-1', 'any-resource', 'any-action');
      expect(result).toBe(true);
    });

    it('should return true for specific resource wildcard', async () => {
      const mockUserRoles = [
        {
          role: { permissions: { members: ['*'] } }
        }
      ];

      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: mockUserRoles,
            error: null
          })
        })
      });

      const result = await adminRolesApi.checkPermission('user-1', 'members', 'delete');
      expect(result).toBe(true);
    });

    it('should return true for specific permission', async () => {
      const mockUserRoles = [
        {
          role: { permissions: { members: ['read', 'update'] } }
        }
      ];

      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: mockUserRoles,
            error: null
          })
        })
      });

      const result = await adminRolesApi.checkPermission('user-1', 'members', 'read');
      expect(result).toBe(true);
    });

    it('should return false for missing permission', async () => {
      const mockUserRoles = [
        {
          role: { permissions: { members: ['read'] } }
        }
      ];

      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: mockUserRoles,
            error: null
          })
        })
      });

      const result = await adminRolesApi.checkPermission('user-1', 'members', 'delete');
      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockRejectedValue(new Error('Database error'))
        })
      });

      const result = await adminRolesApi.checkPermission('user-1', 'members', 'read');
      expect(result).toBe(false);
    });
  });

  describe('assignRole', () => {
    it('should assign a role to a user', async () => {
      const mockAssignment = {
        user_id: 'user-1',
        role_id: 'role-2'
      };

      mockFrom.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockAssignment,
              error: null
            })
          })
        })
      });

      const result = await adminRolesApi.assignRole('user-1', 'role-2');

      expect(result).toEqual(mockAssignment);
    });
  });

  describe('removeRole', () => {
    it('should remove a role from a user', async () => {
      mockFrom.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              error: null
            })
          })
        })
      });

      await expect(adminRolesApi.removeRole('user-1', 'role-2')).resolves.not.toThrow();
    });
  });
});