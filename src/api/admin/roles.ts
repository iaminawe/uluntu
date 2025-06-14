import { Role } from '@/types/admin';

export const adminRolesApi = {
  // Get all roles - temporarily return empty data until DB is set up
  async getRoles() {
    console.warn('Admin roles temporarily disabled - returning empty data');
    return [] as Role[];
  },

  // Get single role - temporarily stub
  async getRole(_roleId: string) {
    console.warn('Admin role lookup temporarily disabled');
    return null;
  },

  // Create role - temporarily stub
  async createRole(_role: Omit<Role, 'id' | 'created_at' | 'updated_at'>) {
    console.warn('Admin role creation temporarily disabled');
    return { id: 'temp-id', created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Role;
  },

  // Update role - temporarily stub
  async updateRole(_roleId: string, _updates: Partial<Role>) {
    console.warn('Admin role update temporarily disabled');
    return true;
  },

  // Delete role - temporarily stub
  async deleteRole(_roleId: string) {
    console.warn('Admin role deletion temporarily disabled');
    return true;
  },

  // Assign role to user - temporarily stub
  async assignRole(_userId: string, _roleId: string) {
    console.warn('Admin role assignment temporarily disabled');
    return true;
  },

  // Remove role from user - temporarily stub
  async removeRole(_userId: string, _roleId: string) {
    console.warn('Admin role removal temporarily disabled');
    return true;
  },

  // Get user roles - temporarily stub
  async getUserRoles(_userId: string) {
    console.warn('Admin user roles lookup temporarily disabled');
    return [] as Role[];
  }
};