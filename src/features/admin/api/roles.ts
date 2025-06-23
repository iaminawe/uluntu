import { supabase } from '@/lib/supabase';
import { Role } from '@/types/admin';
import { logger } from '@/utils/logger';

// API for managing custom roles
export const adminRolesApi = {
  // Get all roles including system and custom roles
  async getRoles(): Promise<Role[]> {
    try {
      const { data, error } = await supabase
        .from('custom_roles')
        .select('*')
        .order('is_system', { ascending: false })
        .order('name');

      if (error) {
        logger.apiError('getRoles', error);
        
        // If custom_roles table doesn't exist yet, return basic system roles
        if (error.code === '42P01') {
          return [
            {
              id: 'authenticated',
              name: 'Authenticated User',
              description: 'Basic authenticated user',
              permissions: {},
              is_system: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'group_member',
              name: 'Group Member',
              description: 'Member of one or more groups',
              permissions: {},
              is_system: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'admin',
              name: 'Administrator',
              description: 'Administrator with management privileges',
              permissions: {},
              is_system: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'superadmin',
              name: 'Super Administrator',
              description: 'Full system administrator',
              permissions: {},
              is_system: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ];
        }
        return [];
      }

      return data || [];
    } catch (error) {
      logger.apiError('getRoles', error);
      return [];
    }
  },

  // Get single role
  async getRole(roleId: string): Promise<Role | null> {
    try {
      const { data, error } = await supabase
        .from('custom_roles')
        .select('*')
        .eq('id', roleId)
        .single();

      if (error) {
        logger.apiError('getRole', error);
        return null;
      }

      return data;
    } catch (error) {
      logger.apiError('getRole', error);
      return null;
    }
  },

  // Create new custom role
  async createRole(role: Omit<Role, 'id' | 'created_at' | 'updated_at'>): Promise<Role | null> {
    try {
      const { data, error } = await supabase
        .from('custom_roles')
        .insert({
          name: role.name,
          description: role.description,
          permissions: role.permissions || {},
          is_system: false
        })
        .select()
        .single();

      if (error) {
        logger.apiError('createRole', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.apiError('createRole', error);
      throw error;
    }
  },

  // Update existing role
  async updateRole(roleId: string, updates: Partial<Role>): Promise<Role | null> {
    try {
      // Don't allow updating system roles
      const existingRole = await this.getRole(roleId);
      if (existingRole?.is_system) {
        throw new Error('Cannot modify system roles');
      }

      const { data, error } = await supabase
        .from('custom_roles')
        .update({
          name: updates.name,
          description: updates.description,
          permissions: updates.permissions,
          updated_at: new Date().toISOString()
        })
        .eq('id', roleId)
        .eq('is_system', false) // Extra safety check
        .select()
        .single();

      if (error) {
        logger.apiError('updateRole', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.apiError('updateRole', error);
      throw error;
    }
  },

  // Delete custom role
  async deleteRole(roleId: string): Promise<boolean> {
    try {
      // Don't allow deleting system roles
      const existingRole = await this.getRole(roleId);
      if (existingRole?.is_system) {
        throw new Error('Cannot delete system roles');
      }

      const { error } = await supabase
        .from('custom_roles')
        .delete()
        .eq('id', roleId)
        .eq('is_system', false); // Extra safety check

      if (error) {
        logger.apiError('deleteRole', error);
        throw error;
      }

      return true;
    } catch (error) {
      logger.apiError('deleteRole', error);
      throw error;
    }
  },

  // Assign role to user
  async assignRole(userId: string, roleId: string): Promise<boolean> {
    try {
      // Check if it's a custom role (UUID) or system role (string name)
      const isCustomRole = roleId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      
      if (isCustomRole) {
        // It's a custom role, store in user_custom_roles
        const { error } = await supabase
          .from('user_custom_roles')
          .insert({
            user_id: userId,
            role_id: roleId
          })
          .select();

        if (error) {
          logger.apiError('assignRole - custom', error);
          
          // If table doesn't exist, fall back to user_roles
          if (error.code === '42P01') {
            logger.warn('user_custom_roles table not found, migration may be needed', 'ROLES');
          }
          return false;
        }
      } else {
        // It's a system role, store in user_roles
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: roleId
          });

        if (error) {
          logger.apiError('assignRole - system', error);
          return false;
        }
      }

      return true;
    } catch (error) {
      logger.apiError('assignRole', error);
      return false;
    }
  },

  // Remove role from user
  async removeRole(userId: string, roleId: string): Promise<boolean> {
    try {
      // Check if it's a custom role (UUID) or system role (string name)
      const isCustomRole = roleId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      
      if (isCustomRole) {
        // It's a custom role, remove from user_custom_roles
        const { error } = await supabase
          .from('user_custom_roles')
          .delete()
          .match({
            user_id: userId,
            role_id: roleId
          });

        if (error) {
          logger.apiError('removeRole - custom', error);
          
          // If table doesn't exist, fall back to user_roles
          if (error.code === '42P01') {
            logger.warn('user_custom_roles table not found, migration may be needed', 'ROLES');
          }
          return false;
        }
      } else {
        // It's a system role, remove from user_roles
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .match({
            user_id: userId,
            role: roleId
          });

        if (error) {
          logger.apiError('removeRole - system', error);
          return false;
        }
      }

      return true;
    } catch (error) {
      logger.apiError('removeRole', error);
      return false;
    }
  },

  // Get user's roles (both system and custom)
  async getUserRoles(userId: string): Promise<(Role & { type: 'system' | 'custom' })[]> {
    try {
      const roles: (Role & { type: 'system' | 'custom' })[] = [];

      // Get system roles
      const { data: systemRoles, error: systemError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (systemError) {
        logger.apiError('getUserRoles - system', systemError);
      } else if (systemRoles) {
        // Convert system role names to Role objects
        const systemRoleObjects = systemRoles.map(sr => ({
          id: sr.role,
          name: sr.role.charAt(0).toUpperCase() + sr.role.slice(1).replace(/_/g, ' '),
          description: null,
          permissions: {},
          is_system: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          type: 'system' as const
        }));
        roles.push(...systemRoleObjects);
      }

      // Get custom roles
      const { data: customRoles, error: customError } = await supabase
        .from('user_custom_roles')
        .select('role_id, custom_roles(*)')
        .eq('user_id', userId);

      if (customError) {
        // If table doesn't exist, just return system roles
        if (customError.code === '42P01') {
          logger.warn('user_custom_roles table not found, migration may be needed', 'ROLES');
        } else {
          logger.apiError('getUserRoles - custom', customError);
        }
      } else if (customRoles) {
        const customRoleObjects = customRoles
          .map(cr => cr.custom_roles)
          .filter(Boolean)
          .map(role => ({
            ...role,
            type: 'custom' as const
          }));
        roles.push(...customRoleObjects);
      }

      return roles;
    } catch (error) {
      logger.apiError('getUserRoles', error);
      return [];
    }
  },

  // Check if user has a specific permission
  async checkPermission(userId: string, resource: string, action: string): Promise<boolean> {
    try {
      const userRoles = await this.getUserRoles(userId);

      // Check if user has superadmin role (system role)
      if (userRoles.some(role => role.id === 'superadmin')) {
        return true;
      }

      // Check custom role permissions
      for (const role of userRoles) {
        if (!role.permissions) continue;

        // Check for wildcard permissions
        if (role.permissions['*']?.includes('*')) {
          return true;
        }

        // Check specific resource permissions
        const resourcePermissions = role.permissions[resource];
        if (resourcePermissions) {
          if (resourcePermissions.includes('*') || resourcePermissions.includes(action)) {
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      logger.apiError('checkPermission', error);
      return false;
    }
  }
};