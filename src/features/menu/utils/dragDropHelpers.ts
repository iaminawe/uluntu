import { MenuItem } from '../../../types/menu';

// Enhanced menu item with drag/drop specific properties
export interface DragDropMenuItem extends MenuItem {
  children: DragDropMenuItem[];
  isExpanded: boolean;
  level: number;
  hasChildren: boolean;
  isDragging?: boolean;
  isDraggedOver?: boolean;
}

// Drag validation result
export interface DragValidationResult {
  isValid: boolean;
  reason?: string;
  canNest?: boolean;
  maxDepthReached?: boolean;
}

// Drop position types
export type DropPosition = 'before' | 'after' | 'inside';

// Drop zone configuration
export interface DropZoneConfig {
  position: DropPosition;
  targetId: string;
  insertIndex: number;
  level: number;
  isValid: boolean;
}

/**
 * Build hierarchical tree structure from flat menu items
 */
export const buildMenuTree = (
  items: MenuItem[], 
  expandedIds: Set<string> = new Set()
): DragDropMenuItem[] => {
  const itemMap = new Map<string, DragDropMenuItem>();
  const rootItems: DragDropMenuItem[] = [];

  // First pass: create tree items
  items.forEach(item => {
    itemMap.set(item.id, {
      ...item,
      children: [],
      isExpanded: expandedIds.has(item.id) || expandedIds.size === 0, // Default expanded if none specified
      level: 0,
      hasChildren: false
    });
  });

  // Second pass: build hierarchy and calculate levels
  items.forEach(item => {
    const treeItem = itemMap.get(item.id)!;
    
    if (item.parent_id && itemMap.has(item.parent_id)) {
      const parent = itemMap.get(item.parent_id)!;
      parent.children.push(treeItem);
      parent.hasChildren = true;
      treeItem.level = parent.level + 1;
    } else {
      rootItems.push(treeItem);
    }
  });

  // Sort items by order_index recursively
  const sortTreeItems = (items: DragDropMenuItem[]): DragDropMenuItem[] => {
    return items
      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
      .map(item => ({
        ...item,
        children: sortTreeItems(item.children)
      }));
  };

  return sortTreeItems(rootItems);
};

/**
 * Flatten tree structure for linear operations (like drag and drop)
 */
export const flattenMenuTree = (
  tree: DragDropMenuItem[], 
  includeCollapsed: boolean = false
): DragDropMenuItem[] => {
  const flattened: DragDropMenuItem[] = [];
  
  const traverse = (items: DragDropMenuItem[]) => {
    items.forEach(item => {
      flattened.push(item);
      
      // Include children if expanded or if we're including collapsed items
      if (item.children.length > 0 && (item.isExpanded || includeCollapsed)) {
        traverse(item.children);
      }
    });
  };
  
  traverse(tree);
  return flattened;
};

/**
 * Validate if a drag operation is allowed
 */
export const validateDragOperation = (
  draggedItem: DragDropMenuItem,
  targetItem: DragDropMenuItem,
  dropPosition: DropPosition,
  maxDepth: number = 3
): DragValidationResult => {
  // Can't drop item on itself
  if (draggedItem.id === targetItem.id) {
    return { isValid: false, reason: 'Cannot drop item on itself' };
  }

  // Check if target is a descendant of dragged item (would create circular reference)
  const isDescendant = (item: DragDropMenuItem, ancestorId: string): boolean => {
    return item.children.some(child => 
      child.id === ancestorId || isDescendant(child, ancestorId)
    );
  };

  if (isDescendant(draggedItem, targetItem.id)) {
    return { 
      isValid: false, 
      reason: 'Cannot drop item into its own descendant' 
    };
  }

  // Check depth limits for nesting
  if (dropPosition === 'inside') {
    const newLevel = targetItem.level + 1;
    if (newLevel >= maxDepth) {
      return { 
        isValid: false, 
        reason: `Maximum nesting depth (${maxDepth}) would be exceeded`,
        maxDepthReached: true 
      };
    }

    // Check if dragged item's children would exceed depth
    const maxChildDepth = getMaxChildDepth(draggedItem);
    if (newLevel + maxChildDepth >= maxDepth) {
      return { 
        isValid: false, 
        reason: `Maximum nesting depth (${maxDepth}) would be exceeded by children`,
        maxDepthReached: true 
      };
    }
  }

  return { isValid: true, canNest: dropPosition === 'inside' };
};

/**
 * Get the maximum depth of children for a menu item
 */
export const getMaxChildDepth = (item: DragDropMenuItem): number => {
  if (item.children.length === 0) return 0;
  
  return 1 + Math.max(...item.children.map(child => getMaxChildDepth(child)));
};

/**
 * Calculate drop position based on mouse coordinates
 */
export const calculateDropPosition = (
  mouseY: number,
  elementRect: DOMRect,
  allowNesting: boolean = true
): DropPosition => {
  const relativeY = mouseY - elementRect.top;
  const elementHeight = elementRect.height;
  
  const topThreshold = elementHeight * 0.25;
  const bottomThreshold = elementHeight * 0.75;
  
  if (relativeY < topThreshold) {
    return 'before';
  } else if (relativeY > bottomThreshold) {
    return 'after';
  } else if (allowNesting) {
    return 'inside';
  } else {
    // If nesting is not allowed, prefer 'after' for middle area
    return 'after';
  }
};

/**
 * Apply drag operation to menu tree
 */
export const applyDragOperation = (
  tree: DragDropMenuItem[],
  draggedItemId: string,
  targetItemId: string,
  dropPosition: DropPosition
): DragDropMenuItem[] => {
  // Deep clone the tree
  const newTree = JSON.parse(JSON.stringify(tree)) as DragDropMenuItem[];
  
  // Find and remove dragged item
  let draggedItem: DragDropMenuItem | null = null;
  const removeDraggedItem = (items: DragDropMenuItem[]): DragDropMenuItem[] => {
    return items.filter(item => {
      if (item.id === draggedItemId) {
        draggedItem = { ...item };
        return false;
      }
      item.children = removeDraggedItem(item.children);
      return true;
    });
  };

  const treeWithoutDragged = removeDraggedItem(newTree);
  
  if (!draggedItem) return tree; // Item not found

  // Find target item and insert dragged item
  const insertItem = (items: DragDropMenuItem[]): DragDropMenuItem[] => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (item.id === targetItemId) {
        switch (dropPosition) {
          case 'before':
            items.splice(i, 0, { ...draggedItem, level: item.level });
            return items;
            
          case 'after':
            items.splice(i + 1, 0, { ...draggedItem, level: item.level });
            return items;
            
          case 'inside':
            // Update levels for dragged item and its children
            const updateLevels = (menuItem: DragDropMenuItem, newLevel: number): DragDropMenuItem => ({
              ...menuItem,
              level: newLevel,
              children: menuItem.children.map(child => updateLevels(child, newLevel + 1))
            });
            
            const updatedDraggedItem = updateLevels(draggedItem, item.level + 1);
            item.children.push(updatedDraggedItem);
            item.hasChildren = true;
            
            return items;
        }
      }
      
      // Recursively search children
      item.children = insertItem(item.children);
    }
    
    return items;
  };

  const finalTree = insertItem(treeWithoutDragged);
  
  // Update order indices
  return updateOrderIndices(finalTree);
};

/**
 * Update order indices throughout the tree
 */
export const updateOrderIndices = (tree: DragDropMenuItem[]): DragDropMenuItem[] => {
  const updateIndices = (items: DragDropMenuItem[], parentIndex: number = 0): DragDropMenuItem[] => {
    return items.map((item, index) => ({
      ...item,
      order_index: index,
      children: updateIndices(item.children, index)
    }));
  };

  return updateIndices(tree);
};

/**
 * Convert tree back to flat MenuItem array
 */
export const treeToFlatItems = (tree: DragDropMenuItem[]): MenuItem[] => {
  const flatItems: MenuItem[] = [];
  
  const traverse = (items: DragDropMenuItem[], parentId: string | null = null) => {
    items.forEach((item, index) => {
      const { children, isExpanded, level, hasChildren, isDragging, isDraggedOver, ...menuItem } = item;
      
      flatItems.push({
        ...menuItem,
        parent_id: parentId,
        order_index: index
      });
      
      if (children.length > 0) {
        traverse(children, item.id);
      }
    });
  };
  
  traverse(tree);
  return flatItems;
};

/**
 * Find item in tree by ID
 */
export const findItemInTree = (
  tree: DragDropMenuItem[], 
  itemId: string
): DragDropMenuItem | null => {
  for (const item of tree) {
    if (item.id === itemId) {
      return item;
    }
    
    const found = findItemInTree(item.children, itemId);
    if (found) {
      return found;
    }
  }
  
  return null;
};

/**
 * Get all expanded item IDs from tree
 */
export const getExpandedIds = (tree: DragDropMenuItem[]): Set<string> => {
  const expanded = new Set<string>();
  
  const traverse = (items: DragDropMenuItem[]) => {
    items.forEach(item => {
      if (item.isExpanded && item.hasChildren) {
        expanded.add(item.id);
      }
      traverse(item.children);
    });
  };
  
  traverse(tree);
  return expanded;
};

/**
 * Toggle expanded state for an item
 */
export const toggleItemExpanded = (
  tree: DragDropMenuItem[], 
  itemId: string
): DragDropMenuItem[] => {
  return tree.map(item => {
    if (item.id === itemId) {
      return { ...item, isExpanded: !item.isExpanded };
    }
    
    return {
      ...item,
      children: toggleItemExpanded(item.children, itemId)
    };
  });
};

/**
 * Calculate statistics for menu tree
 */
export interface MenuTreeStats {
  totalItems: number;
  enabledItems: number;
  disabledItems: number;
  rootItems: number;
  maxDepth: number;
  itemsByLevel: Record<number, number>;
}

export const calculateTreeStats = (tree: DragDropMenuItem[]): MenuTreeStats => {
  const stats: MenuTreeStats = {
    totalItems: 0,
    enabledItems: 0,
    disabledItems: 0,
    rootItems: tree.length,
    maxDepth: 0,
    itemsByLevel: {}
  };
  
  const traverse = (items: DragDropMenuItem[]) => {
    items.forEach(item => {
      stats.totalItems++;
      
      if (item.is_enabled) {
        stats.enabledItems++;
      } else {
        stats.disabledItems++;
      }
      
      stats.maxDepth = Math.max(stats.maxDepth, item.level + 1);
      stats.itemsByLevel[item.level] = (stats.itemsByLevel[item.level] || 0) + 1;
      
      traverse(item.children);
    });
  };
  
  traverse(tree);
  return stats;
};