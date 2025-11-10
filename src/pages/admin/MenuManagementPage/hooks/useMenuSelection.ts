/**
 * useMenuSelection Hook
 * Manages menu item selection and bulk operations
 */

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { MenuItem } from '@/types/menu';
import { MenuSecurityHook } from '@/features/menu/hooks/useMenuSecurity';
import { UseMutationResult } from '@tanstack/react-query';

interface UseMenuSelectionProps {
  allMenuItems: MenuItem[];
  menuSecurity: MenuSecurityHook;
  toggleMutation: UseMutationResult<any, any, { id: string; isEnabled: boolean }, unknown>;
  deleteMutation: UseMutationResult<void, any, string, unknown>;
}

export const useMenuSelection = ({
  allMenuItems,
  menuSecurity,
  toggleMutation,
  deleteMutation
}: UseMenuSelectionProps) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  /**
   * Handle item selection toggle
   */
  const handleSelectItem = (item: MenuItem, selected: boolean) => {
    setSelectedItems(prev => {
      if (selected) {
        return [...prev, item.id];
      } else {
        return prev.filter(id => id !== item.id);
      }
    });
  };

  /**
   * Clear all selections
   */
  const handleDeselectAll = () => {
    setSelectedItems([]);
  };

  /**
   * Get selected menu items
   */
  const selectedMenuItems = allMenuItems.filter(item => selectedItems.includes(item.id));

  /**
   * Bulk enable selected items
   */
  const handleBulkEnable = async () => {
    const itemsToEnable = selectedItems
      .map(id => allMenuItems.find(item => item.id === id))
      .filter((item): item is MenuItem => item !== undefined && !item.is_enabled);

    // Validate bulk operation
    const validation = await menuSecurity.validateBulkOperation('toggle', itemsToEnable);
    if (!validation.allowed) {
      toast.error(`Bulk enable failed: ${validation.errors.join(', ')}`);
      return;
    }

    itemsToEnable.forEach(item => {
      toggleMutation.mutate({ id: item.id, isEnabled: true });
    });
    setSelectedItems([]);
  };

  /**
   * Bulk disable selected items
   */
  const handleBulkDisable = async () => {
    const itemsToDisable = selectedItems
      .map(id => allMenuItems.find(item => item.id === id))
      .filter((item): item is MenuItem => item !== undefined && item.is_enabled);

    // Validate bulk operation
    const validation = await menuSecurity.validateBulkOperation('toggle', itemsToDisable);
    if (!validation.allowed) {
      toast.error(`Bulk disable failed: ${validation.errors.join(', ')}`);
      return;
    }

    itemsToDisable.forEach(item => {
      toggleMutation.mutate({ id: item.id, isEnabled: false });
    });
    setSelectedItems([]);
  };

  /**
   * Bulk delete selected items
   */
  const handleBulkDelete = async () => {
    const itemsToDelete = selectedItems
      .map(id => allMenuItems.find(item => item.id === id))
      .filter((item): item is MenuItem => item !== undefined);

    // Validate bulk operation
    const validation = await menuSecurity.validateBulkOperation('delete', itemsToDelete);
    if (!validation.allowed) {
      toast.error(`Bulk delete failed: ${validation.errors.join(', ')}`);
      return;
    }

    if (confirm(`Delete ${selectedItems.length} menu items? This action cannot be undone.`)) {
      selectedItems.forEach(id => {
        deleteMutation.mutate(id);
      });
      setSelectedItems([]);
    }
  };

  return {
    selectedItems,
    selectedMenuItems,
    handleSelectItem,
    handleDeselectAll,
    handleBulkEnable,
    handleBulkDisable,
    handleBulkDelete
  };
};
