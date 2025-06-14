import { supabase } from '@/lib/supabase';
import { Role } from '@/types/admin';

export const adminRolesApi = {
  // Get all roles
  async getRoles() {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('name');

    if (error) throw error;
    return data as Role[];
  },

  // Get single role
  async getRole(roleId: string) {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('id', roleId)
      .single();

    if (error) throw error;
    return data as Role;
  },

  // Create role
  async createRole(role: Omit<Role, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('roles')
      .insert(role)
      .select()
      .single();

    if (error) throw error;
    return data as Role;
  },

  // Update role
  async updateRole(roleId: string, updates: Partial<Role>) {
    const { data, error } = await supabase
      .from('roles')
      .update(updates)
      .eq('id', roleId)
      .eq('is_system', false) // Prevent updating system roles
      .select()
      .single();

    if (error) throw error;
    return data as Role;
  },

  // Delete role
  async deleteRole(roleId: string) {
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', roleId)
      .eq('is_system', false); // Prevent deleting system roles

    if (error) throw error;
  },

  // Get user roles
  async getUserRoles(userId: string) {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        *,
        role:roles(*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  // Assign role to user
  async assignRole(userId: string, roleId: string) {
    const { data, error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: roleId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Remove role from user
  async removeRole(userId: string, roleId: string) {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', roleId);

    if (error) throw error;
  },

  // Check if user has permission
  async checkPermission(
    userId: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    try {
      const userRoles = await this.getUserRoles(userId);
      
      for (const userRole of userRoles) {
        const permissions = userRole.role?.permissions || {};
        
        // Check for wildcard permission
        if (permissions['*']?.includes('*')) return true;
        
        // Check for specific resource wildcard
        if (permissions[resource]?.includes('*')) return true;
        
        // Check for specific permission
        if (permissions[resource]?.includes(action)) return true;
      }
      
      return false;
    } catch {
      return false;
    }
  }
};