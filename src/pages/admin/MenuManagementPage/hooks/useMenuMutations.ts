/**
 * useMenuMutations Hook
 * Handles all CRUD operations for menu items
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { MenuItemInput, MenuItemUpdate } from '@/types/menu';
import { menuManagementAdapter } from '@/features/admin/api/menuManagementAdapter';
import { SecureMenuApi } from '@/features/menu/api/secureMenuApi';
import { MenuSecurityHook } from '@/features/menu/hooks/useMenuSecurity';
import { logger } from '@/utils/logger';

interface UseMenuMutationsProps {
  secureMenuApi: SecureMenuApi;
  menuSecurity: MenuSecurityHook;
}

export const useMenuMutations = ({ secureMenuApi, menuSecurity }: UseMenuMutationsProps) => {
  const queryClient = useQueryClient();

  /**
   * Create menu item mutation
   */
  const createMutation = useMutation({
    mutationFn: async (data: MenuItemInput) => {
      // Validate permissions before creation
      const validation = menuSecurity.validateMenuItem(data);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      const result = await secureMenuApi.createMenuItem(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create menu item');
      }
      return result.data!;
    },
    onSuccess: (newItem) => {
      toast.success('Menu item created successfully');
      queryClient.invalidateQueries({ queryKey: ['secure-menu-items'] });
      // Log the action
      menuSecurity.logMenuAction('create', 'menu_item', {
        menuItemId: newItem.id,
        newValues: newItem
      });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create menu item');
      logger.error('Menu item creation failed', 'MENU_UI', error);
    }
  });

  /**
   * Update menu item mutation
   */
  const updateMutation = useMutation({
    mutationFn: async (data: MenuItemUpdate) => {
      // Validate permissions before update
      const validation = menuSecurity.validateMenuItem(data);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      const result = await secureMenuApi.updateMenuItem(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update menu item');
      }
      return result.data!;
    },
    onSuccess: () => {
      toast.success('Menu item updated successfully');
      queryClient.invalidateQueries({ queryKey: ['secure-menu-items'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update menu item');
      logger.error('Menu item update failed', 'MENU_UI', error);
    }
  });

  /**
   * Delete menu item mutation
   */
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await secureMenuApi.deleteMenuItem(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete menu item');
      }
    },
    onSuccess: () => {
      toast.success('Menu item deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['secure-menu-items'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete menu item');
      logger.error('Menu item deletion failed', 'MENU_UI', error);
    }
  });

  /**
   * Toggle menu item enabled state mutation
   */
  const toggleMutation = useMutation({
    mutationFn: async ({ id, isEnabled }: { id: string; isEnabled: boolean }) => {
      const result = await secureMenuApi.toggleMenuItem(id, 'is_enabled');
      if (!result.success) {
        throw new Error(result.error || 'Failed to toggle menu item');
      }
      return result.data!;
    },
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({ queryKey: ['secure-menu-items'] });
      toast.success(`Menu item ${updatedItem.is_enabled ? 'enabled' : 'disabled'} successfully`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update menu item status');
      logger.error('Menu item toggle failed', 'MENU_UI', error);
    }
  });

  /**
   * Reorder menu items mutation
   */
  const reorderMutation = useMutation({
    mutationFn: (updates: Array<{ id: string; order_index: number; parent_id?: string | null }>) =>
      menuManagementAdapter.reorderMenuItems(updates),
    onSuccess: () => {
      toast.success('Menu items reordered successfully');
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reorder menu items');
    }
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    toggleMutation,
    reorderMutation
  };
};
