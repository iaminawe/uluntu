/**
 * useDragDrop Hook
 * Handles drag-and-drop functionality for menu reordering
 */

import { useCallback } from 'react';
import { DropResult } from 'react-beautiful-dnd';
import { MenuItem, MenuType } from '@/types/menu';
import { UseMutationResult } from '@tanstack/react-query';

interface UseDragDropProps {
  currentItems: MenuItem[];
  activeTab: MenuType;
  reorderMutation: UseMutationResult<any, any, Array<{ id: string; order_index: number; parent_id?: string | null }>, unknown>;
}

export const useDragDrop = ({ currentItems, activeTab, reorderMutation }: UseDragDropProps) => {
  /**
   * Handle drag end event
   * Validates the drag result and triggers reorder mutation
   */
  const handleDragEnd = useCallback((result: DropResult) => {
    // Validate the drag result
    if (!result.destination) return;
    if (!result.draggableId) return;
    if (result.source.index === result.destination.index) return;

    // Ensure we're working with the right droppable
    const expectedDroppableId = `${activeTab}-menu`;
    if (result.source.droppableId !== expectedDroppableId ||
        result.destination.droppableId !== expectedDroppableId) {
      console.warn('Droppable ID mismatch', {
        expected: expectedDroppableId,
        source: result.source.droppableId,
        destination: result.destination.droppableId
      });
      return;
    }

    const items = Array.from(currentItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Create reorder updates with increments of 100 for easier future reordering
    const updates = items.map((item, index) => ({
      id: item.id,
      order_index: index * 100,
      parent_id: item.parent_id
    }));

    reorderMutation.mutate(updates);
  }, [currentItems, reorderMutation, activeTab]);

  return {
    handleDragEnd
  };
};
