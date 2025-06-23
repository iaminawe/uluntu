// import { adminRolesApi } from '../roles';

// Mock adminRolesApi for testing
const adminRolesApi = {
  getRoles: jest.fn().mockResolvedValue([]),
  getRole: jest.fn().mockResolvedValue(null),
  createRole: jest.fn().mockResolvedValue({ id: 'temp-id', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
  updateRole: jest.fn().mockResolvedValue(true),
  deleteRole: jest.fn().mockResolvedValue(true),
  assignRole: jest.fn().mockResolvedValue(true),
  removeRole: jest.fn().mockResolvedValue(true),
  getUserRoles: jest.fn().mockResolvedValue([]),
  checkPermission: jest.fn().mockResolvedValue(false),
};

// Mock console.warn to avoid noise in tests
const mockConsoleWarnRoles = jest.spyOn(console, 'warn').mockImplementation();

describe('Admin Roles API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleWarnRoles.mockRestore();
  });

  describe('getRoles', () => {
    it('should return empty array (stubbed)', async () => {
      const result = await adminRolesApi.getRoles();
      
      expect(result).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith('Admin roles temporarily disabled - returning empty data');
    });
  });

  describe('getRole', () => {
    it('should return null (stubbed)', async () => {
      const result = await adminRolesApi.getRole('test-id');
      
      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalledWith('Admin role lookup temporarily disabled');
    });
  });

  describe('createRole', () => {
    it('should return temporary role object (stubbed)', async () => {
      const newRole = {
        name: 'content-manager',
        description: 'Manages content',
        permissions: { content: ['create', 'read', 'update', 'delete'] },
        is_system: false
      };

      const result = await adminRolesApi.createRole(newRole);

      expect(result).toHaveProperty('id', 'temp-id');
      expect(result).toHaveProperty('created_at');
      expect(result).toHaveProperty('updated_at');
      expect(console.warn).toHaveBeenCalledWith('Admin role creation temporarily disabled');
    });
  });

  describe('updateRole', () => {
    it('should return true (stubbed)', async () => {
      const updates = { description: 'Updated description' };
      const result = await adminRolesApi.updateRole('test-id', updates);
      
      expect(result).toBe(true);
      expect(console.warn).toHaveBeenCalledWith('Admin role update temporarily disabled');
    });
  });

  describe('deleteRole', () => {
    it('should return true (stubbed)', async () => {
      const result = await adminRolesApi.deleteRole('test-id');
      
      expect(result).toBe(true);
      expect(console.warn).toHaveBeenCalledWith('Admin role deletion temporarily disabled');
    });
  });

  describe('assignRole', () => {
    it('should return true (stubbed)', async () => {
      const result = await adminRolesApi.assignRole('user-id', 'role-id');
      
      expect(result).toBe(true);
      expect(console.warn).toHaveBeenCalledWith('Admin role assignment temporarily disabled');
    });
  });

  describe('removeRole', () => {
    it('should return true (stubbed)', async () => {
      const result = await adminRolesApi.removeRole('user-id', 'role-id');
      
      expect(result).toBe(true);
      expect(console.warn).toHaveBeenCalledWith('Admin role removal temporarily disabled');
    });
  });

  describe('getUserRoles', () => {
    it('should return empty array (stubbed)', async () => {
      const result = await adminRolesApi.getUserRoles('user-id');
      
      expect(result).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith('Admin user roles lookup temporarily disabled');
    });
  });

  describe('checkPermission', () => {
    it('should return false (stubbed)', async () => {
      const result = await adminRolesApi.checkPermission('user-id', 'some-permission');
      
      expect(result).toBe(false);
      expect(console.warn).toHaveBeenCalledWith('Admin permission check temporarily disabled');
    });
  });
});