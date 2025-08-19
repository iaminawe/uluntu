import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { MenuItem } from '../../../types/menu';
import { menuManagementApi } from '../../admin/api/menuManagement';

// Hook for managing drag and drop menu operations
export const useDragDropMenu = (
  initialItems: MenuItem[] = [],
  autoSave: boolean = false,
  debounceMs: number = 1000
) => {
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const originalItemsRef = useRef<MenuItem[]>(initialItems);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Update items and track changes
  const updateItems = useCallback((newItems: MenuItem[]) => {
    setItems(newItems);
    setHasChanges(JSON.stringify(newItems) !== JSON.stringify(originalItemsRef.current));
    setError(null);
  }, []);

  // Auto-save functionality with debouncing
  const saveChanges = useCallback(async (itemsToSave: MenuItem[]) => {
    if (isSaving) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Convert to reorder format
      const updates = itemsToSave.map((item, index) => ({
        id: item.id,
        order_index: index,
        parent_id: item.parent_id || null
      }));

      await menuManagementApi.reorderMenuItems(updates);
      
      setLastSaved(new Date());
      setHasChanges(false);
      originalItemsRef.current = [...itemsToSave];
      
      if (autoSave) {
        toast.success('Menu changes saved automatically', { duration: 2000 });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save changes';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err; // Re-throw for caller to handle rollback
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, autoSave]);

  // Debounced auto-save effect
  useEffect(() => {
    if (!autoSave || !hasChanges || isSaving) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout
    saveTimeoutRef.current = setTimeout(() => {
      saveChanges(items).catch(console.error);
    }, debounceMs);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [items, autoSave, hasChanges, debounceMs, saveChanges, isSaving]);

  // Manual save
  const manualSave = useCallback(async () => {
    if (!hasChanges) return;
    await saveChanges(items);
  }, [hasChanges, items, saveChanges]);

  // Rollback changes
  const rollbackChanges = useCallback(() => {
    setItems([...originalItemsRef.current]);
    setHasChanges(false);
    setError(null);
    toast.info('Changes discarded');
  }, []);

  // Reset to new initial items
  const resetItems = useCallback((newInitialItems: MenuItem[]) => {
    setItems(newInitialItems);
    originalItemsRef.current = [...newInitialItems];
    setHasChanges(false);
    setError(null);
  }, []);

  // Create new item
  const createItem = useCallback(async (
    itemData: Omit<MenuItem, 'id' | 'order_index'>,
    menuType: 'main' | 'footer'
  ): Promise<MenuItem> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newItem = await menuManagementApi.createMenuItem(itemData, menuType);
      const updatedItems = [...items, newItem].sort((a, b) => 
        (a.order_index || 0) - (b.order_index || 0)
      );
      updateItems(updatedItems);
      toast.success('Menu item created successfully');
      return newItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create item';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [items, updateItems]);

  // Update existing item
  const updateItem = useCallback(async (updatedItem: MenuItem): Promise<MenuItem> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const savedItem = await menuManagementApi.updateMenuItem(updatedItem);
      const updatedItems = items.map(item => 
        item.id === savedItem.id ? savedItem : item
      );
      updateItems(updatedItems);
      toast.success('Menu item updated successfully');
      return savedItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update item';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [items, updateItems]);

  // Delete item
  const deleteItem = useCallback(async (itemId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await menuManagementApi.deleteMenuItem(itemId);
      const updatedItems = items.filter(item => item.id !== itemId);
      updateItems(updatedItems);
      toast.success('Menu item deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete item';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [items, updateItems]);

  // Toggle item enabled status
  const toggleItemEnabled = useCallback(async (
    itemId: string, 
    enabled: boolean
  ): Promise<void> => {
    setError(null);
    
    try {
      const updatedItem = await menuManagementApi.toggleMenuItemStatus(itemId, enabled);
      const updatedItems = items.map(item => 
        item.id === itemId ? updatedItem : item
      );
      updateItems(updatedItems);
      toast.success(`Menu item ${enabled ? 'enabled' : 'disabled'}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle item status';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, [items, updateItems]);

  // Reorder items (for drag and drop)
  const reorderItems = useCallback(async (
    sourceIndex: number, 
    destinationIndex: number,
    optimisticUpdate: boolean = true
  ): Promise<void> => {
    const newItems = [...items];
    const [movedItem] = newItems.splice(sourceIndex, 1);
    newItems.splice(destinationIndex, 0, movedItem);

    // Update order indices
    const reorderedItems = newItems.map((item, index) => ({
      ...item,
      order_index: index
    }));

    if (optimisticUpdate) {
      updateItems(reorderedItems);
    }

    if (autoSave) {
      try {
        await saveChanges(reorderedItems);
      } catch (err) {
        // Rollback on error
        if (optimisticUpdate) {
          rollbackChanges();
        }
        throw err;
      }
    }
  }, [items, updateItems, autoSave, saveChanges, rollbackChanges]);

  // Get statistics
  const getStats = useCallback(() => {
    const enabled = items.filter(item => item.is_enabled).length;
    const disabled = items.length - enabled;
    const hasChildren = items.filter(item => 
      items.some(child => child.parent_id === item.id)
    ).length;

    return {
      total: items.length,
      enabled,
      disabled,
      hasChildren
    };
  }, [items]);

  return {
    // State
    items,
    isLoading,
    isSaving,
    hasChanges,
    error,
    lastSaved,
    
    // Actions
    updateItems,
    manualSave,
    rollbackChanges,
    resetItems,
    createItem,
    updateItem,
    deleteItem,
    toggleItemEnabled,
    reorderItems,
    
    // Utils
    getStats
  };
};

export default useDragDropMenu;