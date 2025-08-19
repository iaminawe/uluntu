import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DragStart,
  DragUpdate,
  BeforeCapture,
  ResponderProvided
} from 'react-beautiful-dnd';
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  Check,
  RotateCcw,
  Save,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { MenuItem } from '../../../types/menu';
import { MenuItemIcon } from './MenuItemIcon';
import { TouchGestures } from './TouchGestures';
import { AccessibleDragHandle } from './AccessibleDragHandle';
import { menuManagementApi } from '../../admin/api/menuManagement';

// Animation duration constants
const ANIMATION_DURATION = 200;
const DEBOUNCE_DELAY = 1000;

// Drag state interface
interface DragState {
  isDragging: boolean;
  draggedItemId: string | null;
  draggedOverId: string | null;
  placeholderProps: PlaceholderProps | null;
  isValidDrop: boolean;
}

// Placeholder props for smooth animations
interface PlaceholderProps {
  clientY: number;
  clientHeight: number;
  clientX: number;
}

// Menu tree item with expanded state
interface MenuTreeItem extends MenuItem {
  children: MenuTreeItem[];
  isExpanded: boolean;
  level: number;
  hasChildren: boolean;
}

// Component props
interface DragDropMenuTreeProps {
  items: MenuItem[];
  onItemsChange: (items: MenuItem[]) => void;
  onItemEdit?: (item: MenuItem) => void;
  onItemDelete?: (item: MenuItem) => void;
  onItemAdd?: (parentId?: string) => void;
  menuType?: 'main' | 'footer';
  className?: string;
  disabled?: boolean;
  maxDepth?: number;
  autoSave?: boolean;
  showActions?: boolean;
  allowNesting?: boolean;
}

// Keyboard navigation hook
const useKeyboardNavigation = (
  items: MenuTreeItem[],
  onMove: (fromIndex: number, toIndex: number) => void
) => {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (focusedIndex > 0) {
            onMove(focusedIndex, focusedIndex - 1);
            setFocusedIndex(focusedIndex - 1);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (focusedIndex < items.length - 1) {
            onMove(focusedIndex, focusedIndex + 1);
            setFocusedIndex(focusedIndex + 1);
          }
          break;
      }
    } else {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(Math.max(0, focusedIndex - 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(Math.min(items.length - 1, focusedIndex + 1));
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          // Trigger edit for focused item
          break;
      }
    }
  }, [focusedIndex, items.length, onMove]);

  return { focusedIndex, setFocusedIndex, handleKeyDown };
};

// Auto-save hook with debouncing
const useAutoSave = (
  items: MenuItem[],
  autoSave: boolean,
  debounceMs: number = DEBOUNCE_DELAY
) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const saveChanges = useCallback(async () => {
    if (!autoSave || isSaving) return;

    setIsSaving(true);
    try {
      // Convert items to reorder format and save
      const updates = items.map((item, index) => ({
        id: item.id,
        order_index: index,
        parent_id: item.parent_id || null
      }));

      await menuManagementApi.reorderMenuItems(updates);
      setLastSaved(new Date());
      toast.success('Menu changes saved automatically', { duration: 2000 });
    } catch (error) {
      console.error('Auto-save failed:', error);
      toast.error('Failed to auto-save changes', { duration: 3000 });
    } finally {
      setIsSaving(false);
    }
  }, [items, autoSave, isSaving]);

  useEffect(() => {
    if (!autoSave) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(saveChanges, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [items, saveChanges, debounceMs, autoSave]);

  return { isSaving, lastSaved };
};

// Helper function to build tree structure
const buildTreeStructure = (items: MenuItem[]): MenuTreeItem[] => {
  const itemMap = new Map<string, MenuTreeItem>();
  const rootItems: MenuTreeItem[] = [];

  // First pass: create tree items
  items.forEach(item => {
    itemMap.set(item.id, {
      ...item,
      children: [],
      isExpanded: true,
      level: 0,
      hasChildren: false
    });
  });

  // Second pass: build hierarchy
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

  // Sort by order_index
  const sortItems = (items: MenuTreeItem[]): MenuTreeItem[] => {
    return items.sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
      .map(item => ({
        ...item,
        children: sortItems(item.children)
      }));
  };

  return sortItems(rootItems);
};

// Helper function to flatten tree for drag operations
const flattenTree = (items: MenuTreeItem[]): MenuTreeItem[] => {
  const flattened: MenuTreeItem[] = [];
  
  const traverse = (items: MenuTreeItem[]) => {
    items.forEach(item => {
      flattened.push(item);
      if (item.children.length > 0 && item.isExpanded) {
        traverse(item.children);
      }
    });
  };
  
  traverse(items);
  return flattened;
};

// Drop zone indicator component
const DropZoneIndicator: React.FC<{
  isActive: boolean;
  isValid: boolean;
  level: number;
}> = ({ isActive, isValid, level }) => {
  if (!isActive) return null;

  return (
    <div 
      className={`absolute left-0 right-0 h-0.5 transition-all duration-150 ${
        isValid 
          ? 'bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.5)]' 
          : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]'
      }`}
      style={{ marginLeft: `${level * 24}px` }}
    />
  );
};

// Menu item component
const MenuTreeItem: React.FC<{
  item: MenuTreeItem;
  index: number;
  dragState: DragState;
  onToggleExpanded: (id: string) => void;
  onToggleEnabled: (item: MenuItem, enabled: boolean) => void;
  onEdit?: (item: MenuItem) => void;
  onDelete?: (item: MenuItem) => void;
  onAddChild?: (parentId: string) => void;
  showActions: boolean;
  allowNesting: boolean;
  maxDepth: number;
  focusedIndex: number;
  onFocus: (index: number) => void;
}> = ({
  item,
  index,
  dragState,
  onToggleExpanded,
  onToggleEnabled,
  onEdit,
  onDelete,
  onAddChild,
  showActions,
  allowNesting,
  maxDepth,
  focusedIndex,
  onFocus
}) => {
  const isDragging = dragState.draggedItemId === item.id;
  const isDraggedOver = dragState.draggedOverId === item.id;
  const isFocused = focusedIndex === index;

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <TouchGestures
          onLongPress={() => console.log('Long press detected')}
          onSwipeLeft={() => onDelete?.(item)}
          onSwipeRight={() => onEdit?.(item)}
        >
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`
              relative group transition-all duration-${ANIMATION_DURATION} 
              ${isDragging ? 'z-50 rotate-2 scale-105' : ''} 
              ${snapshot.isDragging ? 'shadow-2xl' : ''}
              ${isFocused ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
            `}
            onFocus={() => onFocus(index)}
            tabIndex={0}
            role="treeitem"
            aria-expanded={allowNesting && item.hasChildren ? item.isExpanded : undefined}
            aria-level={item.level + 1}
            aria-selected={isFocused}
          >
            {/* Drop zone indicator */}
            <DropZoneIndicator 
              isActive={isDraggedOver && !isDragging}
              isValid={dragState.isValidDrop}
              level={item.level}
            />

            <div
              className={`
                bg-white border border-gray-200 rounded-lg p-4 mb-2 transition-all duration-${ANIMATION_DURATION}
                ${isDragging ? 'shadow-2xl border-blue-300 bg-blue-50' : 'hover:shadow-md hover:border-gray-300'}
                ${!item.is_enabled ? 'opacity-60' : ''}
                ${isDraggedOver && !isDragging ? 'bg-blue-50 border-blue-200' : ''}
              `}
              style={{ marginLeft: `${item.level * 24}px` }}
            >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {/* Expand/collapse button */}
                {allowNesting && item.hasChildren && (
                  <button
                    onClick={() => onToggleExpanded(item.id)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors duration-150"
                    aria-label={item.isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {item.isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-600" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-600" />
                    )}
                  </button>
                )}

                {/* Accessible drag handle */}
                <AccessibleDragHandle
                  {...provided.dragHandleProps}
                  itemTitle={item.label}
                  position={index + 1}
                  totalItems={flatItems.length}
                  level={item.level}
                  canMoveUp={index > 0}
                  canMoveDown={index < flatItems.length - 1}
                  canNest={allowNesting && item.level < maxDepth - 1}
                  dragHandleProps={provided.dragHandleProps}
                />

                {/* Menu item content */}
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {item.icon && (
                    <div className="flex-shrink-0 p-2 bg-gray-50 rounded-md">
                      <MenuItemIcon icon={item.icon} size="md" className="text-gray-600" />
                    </div>
                  )}
                  
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {item.label}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-gray-500 truncate">
                        {item.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 truncate">
                      {item.href}
                    </p>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="flex items-center space-x-2">
                  {item.is_enabled ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Actions */}
              {showActions && (
                <div className="flex items-center space-x-2 ml-4">
                  {/* Enable/disable toggle */}
                  <Switch
                    checked={item.is_enabled}
                    onCheckedChange={(enabled) => onToggleEnabled(item, enabled)}
                    size="sm"
                    aria-label={`${item.is_enabled ? 'Disable' : 'Enable'} ${item.label}`}
                  />

                  {/* Add child button */}
                  {allowNesting && item.level < maxDepth - 1 && onAddChild && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAddChild(item.id)}
                      className="p-2"
                      aria-label={`Add child to ${item.label}`}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}

                  {/* Edit button */}
                  {onEdit && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(item)}
                      className="p-2"
                      aria-label={`Edit ${item.label}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}

                  {/* Delete button */}
                  {onDelete && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(item)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      aria-label={`Delete ${item.label}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
            </div>
          </div>
        </TouchGestures>
      )}
    </Draggable>
  );
};

// Main component
export const DragDropMenuTree: React.FC<DragDropMenuTreeProps> = ({
  items = [],
  onItemsChange,
  onItemEdit,
  onItemDelete,
  onItemAdd,
  menuType = 'main',
  className = '',
  disabled = false,
  maxDepth = 3,
  autoSave = false,
  showActions = true,
  allowNesting = true
}) => {
  // State management
  const [treeItems, setTreeItems] = useState<MenuTreeItem[]>([]);
  const [flatItems, setFlatItems] = useState<MenuTreeItem[]>([]);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedItemId: null,
    draggedOverId: null,
    placeholderProps: null,
    isValidDrop: false
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [originalItems, setOriginalItems] = useState<MenuItem[]>([]);

  // Auto-save functionality
  const { isSaving, lastSaved } = useAutoSave(items, autoSave);

  // Build tree structure when items change
  useEffect(() => {
    const tree = buildTreeStructure(items);
    const flat = flattenTree(tree);
    setTreeItems(tree);
    setFlatItems(flat);
    setOriginalItems([...items]);
  }, [items]);

  // Keyboard navigation
  const handleMove = useCallback((fromIndex: number, toIndex: number) => {
    const newItems = [...flatItems];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    
    // Convert back to MenuItem format and update
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      order_index: index
    }));
    
    onItemsChange(updatedItems);
    setHasChanges(true);
  }, [flatItems, onItemsChange]);

  const { focusedIndex, setFocusedIndex, handleKeyDown } = useKeyboardNavigation(
    flatItems,
    handleMove
  );

  // Toggle item expanded state
  const toggleExpanded = useCallback((itemId: string) => {
    const updateExpanded = (items: MenuTreeItem[]): MenuTreeItem[] => {
      return items.map(item => ({
        ...item,
        isExpanded: item.id === itemId ? !item.isExpanded : item.isExpanded,
        children: updateExpanded(item.children)
      }));
    };

    const updatedTree = updateExpanded(treeItems);
    setTreeItems(updatedTree);
    setFlatItems(flattenTree(updatedTree));
  }, [treeItems]);

  // Validate drop operation
  const isValidDrop = useCallback((
    draggedItem: MenuTreeItem,
    targetItem: MenuTreeItem,
    insertIndex: number
  ): boolean => {
    // Can't drop on itself
    if (draggedItem.id === targetItem.id) return false;

    // Check if target is descendant of dragged item
    const isDescendant = (item: MenuTreeItem, ancestorId: string): boolean => {
      return item.children.some(child => 
        child.id === ancestorId || isDescendant(child, ancestorId)
      );
    };

    if (isDescendant(draggedItem, targetItem.id)) return false;

    // Check depth limit
    if (targetItem.level >= maxDepth - 1) return false;

    return true;
  }, [maxDepth]);

  // Drag start handler
  const onDragStart = useCallback((start: DragStart) => {
    const draggedItem = flatItems.find(item => item.id === start.draggableId);
    if (!draggedItem) return;

    setDragState({
      isDragging: true,
      draggedItemId: start.draggableId,
      draggedOverId: null,
      placeholderProps: null,
      isValidDrop: false
    });

    // Add haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }, [flatItems]);

  // Drag update handler
  const onDragUpdate = useCallback((update: DragUpdate) => {
    const { destination, draggableId } = update;
    
    if (!destination) {
      setDragState(prev => ({ ...prev, isValidDrop: false }));
      return;
    }

    const draggedItem = flatItems.find(item => item.id === draggableId);
    const targetItem = flatItems[destination.index];
    
    if (!draggedItem || !targetItem) return;

    const valid = isValidDrop(draggedItem, targetItem, destination.index);
    
    setDragState(prev => ({
      ...prev,
      draggedOverId: targetItem.id,
      isValidDrop: valid
    }));
  }, [flatItems, isValidDrop]);

  // Drag end handler with optimistic updates and rollback
  const onDragEnd = useCallback(async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    setDragState({
      isDragging: false,
      draggedItemId: null,
      draggedOverId: null,
      placeholderProps: null,
      isValidDrop: false
    });

    if (!destination || destination.index === source.index) {
      return;
    }

    const draggedItem = flatItems.find(item => item.id === draggableId);
    if (!draggedItem) return;

    // Optimistic update
    const newFlatItems = [...flatItems];
    const [movedItem] = newFlatItems.splice(source.index, 1);
    newFlatItems.splice(destination.index, 0, movedItem);

    // Update order indices
    const updatedItems = newFlatItems.map((item, index) => ({
      ...item,
      order_index: index
    }));

    // Apply optimistic update
    onItemsChange(updatedItems);
    setHasChanges(true);

    // If auto-save is disabled, stop here
    if (!autoSave) {
      toast.success('Item moved successfully');
      return;
    }

    // Attempt to save changes
    try {
      const updates = updatedItems.map((item, index) => ({
        id: item.id,
        order_index: index,
        parent_id: item.parent_id || null
      }));

      await menuManagementApi.reorderMenuItems(updates);
      toast.success('Menu updated successfully', { duration: 2000 });
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save menu order:', error);
      toast.error('Failed to save changes, reverting...', { duration: 3000 });
      
      // Rollback to original state
      onItemsChange(originalItems);
      setHasChanges(false);
    }
  }, [flatItems, onItemsChange, autoSave, originalItems]);

  // Handle item enable/disable
  const handleToggleEnabled = useCallback(async (item: MenuItem, enabled: boolean) => {
    try {
      await menuManagementApi.toggleMenuItemStatus(item.id, enabled);
      const updatedItems = items.map(i => 
        i.id === item.id ? { ...i, is_enabled: enabled } : i
      );
      onItemsChange(updatedItems);
      toast.success(`Menu item ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Failed to toggle item status:', error);
      toast.error('Failed to update item status');
    }
  }, [items, onItemsChange]);

  // Manual save function
  const handleSave = useCallback(async () => {
    if (!hasChanges) return;

    try {
      const updates = flatItems.map((item, index) => ({
        id: item.id,
        order_index: index,
        parent_id: item.parent_id || null
      }));

      await menuManagementApi.reorderMenuItems(updates);
      toast.success('Changes saved successfully');
      setHasChanges(false);
      setOriginalItems([...items]);
    } catch (error) {
      console.error('Failed to save changes:', error);
      toast.error('Failed to save changes');
    }
  }, [flatItems, hasChanges, items]);

  // Discard changes
  const handleDiscard = useCallback(() => {
    onItemsChange(originalItems);
    setHasChanges(false);
    toast.info('Changes discarded');
  }, [originalItems, onItemsChange]);

  if (disabled) {
    return (
      <div className={`opacity-50 ${className}`}>
        <div className="text-center py-8 text-gray-500">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p>Menu editing is currently disabled</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`} onKeyDown={handleKeyDown}>
      {/* Status bar */}
      {(hasChanges || isSaving) && !autoSave && (
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            ) : (
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            )}
            <span className="text-sm font-medium text-blue-700">
              {isSaving ? 'Saving changes...' : 'You have unsaved changes'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDiscard}
              disabled={isSaving}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Discard
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-1" />
              Save Changes
            </Button>
          </div>
        </div>
      )}

      {/* Auto-save status */}
      {autoSave && lastSaved && (
        <div className="flex items-center justify-between text-xs text-gray-500 px-2">
          <span>Auto-save enabled</span>
          <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
        </div>
      )}

      {/* Drag and drop context */}
      <DragDropContext
        onDragStart={onDragStart}
        onDragUpdate={onDragUpdate}
        onDragEnd={onDragEnd}
      >
        <Droppable droppableId={`menu-tree-${menuType}`} type="menu-item">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`min-h-[100px] transition-colors duration-${ANIMATION_DURATION} ${
                snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg' : ''
              }`}
              role="tree"
              aria-label={`${menuType} menu items`}
            >
              {flatItems.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="mb-4">
                    <GripVertical className="h-12 w-12 mx-auto text-gray-300" />
                  </div>
                  <p className="text-lg font-medium mb-2">No menu items yet</p>
                  <p className="text-sm">Add some items to get started</p>
                  {onItemAdd && (
                    <Button
                      className="mt-4"
                      onClick={() => onItemAdd()}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Item
                    </Button>
                  )}
                </div>
              ) : (
                flatItems.map((item, index) => (
                  <MenuTreeItem
                    key={item.id}
                    item={item}
                    index={index}
                    dragState={dragState}
                    onToggleExpanded={toggleExpanded}
                    onToggleEnabled={handleToggleEnabled}
                    onEdit={onItemEdit}
                    onDelete={onItemDelete}
                    onAddChild={onItemAdd}
                    showActions={showActions}
                    allowNesting={allowNesting}
                    maxDepth={maxDepth}
                    focusedIndex={focusedIndex}
                    onFocus={setFocusedIndex}
                  />
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Keyboard shortcuts help */}
      <div className="text-xs text-gray-500 space-y-1 px-2">
        <p><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl/⌘ + ↑/↓</kbd> Move items</p>
        <p><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">↑/↓</kbd> Navigate items</p>
        <p><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd> Edit item</p>
      </div>
    </div>
  );
};

export default DragDropMenuTree;