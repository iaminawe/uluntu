import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from 'react-beautiful-dnd';
import {
  Plus,
  Edit,
  Trash2,
  GripVertical,
  Save,
  RotateCcw,
  Settings,
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Loader2,
  BarChart3,
  FileText,
  Download
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import Modal from '@/shared/components/ui/Modal/Modal';
import ConfirmationModal from '@/shared/components/ui/Modal/ConfirmationModal';
import { MenuItemToggle } from '@/features/menu/components/MenuItemToggle';
import { BulkToggleToolbar } from '@/features/menu/components/BulkToggleToolbar';
import { menuToggleApi, BulkOperation } from '@/features/menu/api/menuToggleApi';
import { menuManagementApi, MenuItem, MenuStructure } from '@/features/admin/api/menuManagement';
import { adminActivityLogger } from '@/services/adminActivityLogger';
import { cn } from '@/utils/cn';

// Mock data for the enhanced page - in production, this would come from API
const MOCK_MENU_ITEMS: MenuItem[] = [
  {
    id: '1',
    label: 'Community',
    href: '/community',
    description: 'Connect with others',
    parent_id: null,
    order_index: 1,
    is_enabled: true,
    icon: 'Users',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    label: 'Business',
    href: '/business',
    description: 'Explore opportunities',
    parent_id: null,
    order_index: 2,
    is_enabled: true,
    icon: 'Building2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    label: 'Business Directory',
    href: '/business/directory',
    description: 'Find businesses',
    parent_id: '2',
    order_index: 1,
    is_enabled: true,
    icon: 'Search',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    label: 'Resources',
    href: '/resources',
    description: 'Learn and grow',
    parent_id: null,
    order_index: 3,
    is_enabled: false,
    icon: 'BookOpen',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

interface EnhancedMenuManagementPageProps {}

interface MenuItemCardProps {
  item: MenuItem;
  index: number;
  isSelected: boolean;
  onSelect: (itemId: string, selected: boolean) => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  onToggle: (itemId: string, enabled: boolean) => Promise<boolean>;
  level: number;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  index,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onToggle,
  level
}) => {
  const hasChildren = item.children && item.children.length > 0;
  const isParent = !item.parent_id;

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            'bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-200',
            snapshot.isDragging && 'shadow-lg ring-2 ring-blue-500',
            !item.is_enabled && 'opacity-60 bg-gray-50',
            isSelected && 'ring-2 ring-blue-400 bg-blue-50',
            level > 0 && 'ml-8 border-l-4 border-orange-300'
          )}
          style={{ marginLeft: level * 24 }}
        >
          <div className="p-4">
            <div className="flex items-center space-x-3">
              {/* Selection checkbox */}
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onSelect(item.id, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
              />

              {/* Drag handle */}
              <div
                {...provided.dragHandleProps}
                className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
              >
                <GripVertical className="h-5 w-5" />
              </div>
              
              {/* Menu item info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className={cn(
                    'text-sm font-medium truncate',
                    item.is_enabled ? 'text-gray-900' : 'text-gray-500'
                  )}>
                    {item.label}
                  </h3>
                  
                  {hasChildren && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {item.children!.length} child{item.children!.length !== 1 ? 'ren' : ''}
                    </span>
                  )}
                  
                  {isParent && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Parent
                    </span>
                  )}
                </div>
                
                {item.description && (
                  <p className="text-xs text-gray-500 truncate mt-1">
                    {item.description}
                  </p>
                )}
                
                <p className="text-xs text-gray-400 truncate mt-1">
                  {item.href}
                </p>
              </div>

              {/* Toggle component */}
              <MenuItemToggle
                item={item}
                onToggle={onToggle}
                showLabel={true}
                showVisualIndicator={true}
                confirmCritical={true}
                className="mx-4"
              />
              
              {/* Action buttons */}
              <div className="flex items-center space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(item)}
                  className="p-2 h-8 w-8"
                  title="Edit menu item"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(item)}
                  className="p-2 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Delete menu item"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Child items */}
          {hasChildren && (
            <div className="border-t border-gray-100">
              {item.children!.map((child, childIndex) => (
                <MenuItemCard
                  key={child.id}
                  item={child}
                  index={childIndex}
                  isSelected={isSelected}
                  onSelect={onSelect}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggle={onToggle}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

const EnhancedMenuManagementPage: React.FC<EnhancedMenuManagementPageProps> = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MOCK_MENU_ITEMS);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEnabled, setFilterEnabled] = useState<'all' | 'enabled' | 'disabled'>('all');

  // Build hierarchical menu structure using the private method through the service
  const hierarchicalItems = useMemo(() => {
    // Simple hierarchy building for demo - in production use the API
    const itemMap = new Map<string, MenuItem>();
    const rootItems: MenuItem[] = [];

    // First pass: create map and initialize children arrays
    menuItems.forEach(item => {
      itemMap.set(item.id, { ...item, children: [] });
    });

    // Second pass: build hierarchy
    menuItems.forEach(item => {
      const menuItem = itemMap.get(item.id)!;
      
      if (item.parent_id) {
        const parent = itemMap.get(item.parent_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(menuItem);
        }
      } else {
        rootItems.push(menuItem);
      }
    });

    return rootItems.sort((a, b) => a.order_index - b.order_index);
  }, [menuItems]);

  // Filter items based on search and filter
  const filteredItems = useMemo(() => {
    let filtered = hierarchicalItems;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.href.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterEnabled !== 'all') {
      filtered = filtered.filter(item =>
        filterEnabled === 'enabled' ? item.is_enabled : !item.is_enabled
      );
    }

    return filtered;
  }, [hierarchicalItems, searchTerm, filterEnabled]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = menuItems.length;
    const enabled = menuItems.filter(item => item.is_enabled).length;
    const disabled = total - enabled;
    const parents = menuItems.filter(item => !item.parent_id).length;
    const children = total - parents;

    return { total, enabled, disabled, parents, children };
  }, [menuItems]);

  const handleSelectionChange = (itemIds: Set<string>) => {
    setSelectedItems(itemIds);
  };

  const handleSelectItem = (itemId: string, selected: boolean) => {
    const newSelection = new Set(selectedItems);
    if (selected) {
      newSelection.add(itemId);
    } else {
      newSelection.delete(itemId);
    }
    setSelectedItems(newSelection);
  };

  const handleToggleItem = async (itemId: string, enabled: boolean): Promise<boolean> => {
    try {
      // Optimistic update
      setMenuItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, is_enabled: enabled } : item
      ));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setHasChanges(true);
      return true;
    } catch (error) {
      // Rollback on failure
      setMenuItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, is_enabled: !enabled } : item
      ));
      return false;
    }
  };

  const handleBulkToggle = async (itemIds: string[], enabled: boolean): Promise<BulkOperation[]> => {
    const operations: BulkOperation[] = [];
    
    for (const itemId of itemIds) {
      try {
        const success = await handleToggleItem(itemId, enabled);
        operations.push({
          id: itemId,
          operation: enabled ? 'enable' : 'disable',
          success
        });
      } catch (error) {
        operations.push({
          id: itemId,
          operation: enabled ? 'enable' : 'disable',
          success: false,
          error: 'Toggle failed'
        });
      }
    }
    
    return operations;
  };

  const handleBulkDelete = async (itemIds: string[]): Promise<BulkOperation[]> => {
    const operations: BulkOperation[] = [];
    
    for (const itemId of itemIds) {
      try {
        // Remove item and its children
        setMenuItems(prev => prev.filter(item => 
          item.id !== itemId && item.parent_id !== itemId
        ));
        
        operations.push({
          id: itemId,
          operation: 'delete',
          success: true
        });
        
        setHasChanges(true);
      } catch (error) {
        operations.push({
          id: itemId,
          operation: 'delete',
          success: false,
          error: 'Delete failed'
        });
      }
    }
    
    return operations;
  };

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(filteredItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order values
    const updatedItems = items.map((item, index) => ({
      ...item,
      order_index: index
    }));

    setMenuItems(prev => {
      const newItems = [...prev];
      updatedItems.forEach(updated => {
        const index = newItems.findIndex(item => item.id === updated.id);
        if (index !== -1) {
          newItems[index] = updated;
        }
      });
      return newItems;
    });
    
    setHasChanges(true);
  }, [filteredItems]);

  const handleEdit = (item: MenuItem) => {
    toast.info(`Edit functionality for "${item.label}" would open edit modal`);
  };

  const handleDelete = (item: MenuItem) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${item.label}"?`);
    if (confirmed) {
      setMenuItems(prev => prev.filter(i => i.id !== item.id));
      setHasChanges(true);
      toast.success(`Deleted "${item.label}"`);
    }
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasChanges(false);
      toast.success('Menu configuration saved successfully');
    } catch (error) {
      toast.error('Failed to save changes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const data = JSON.stringify(menuItems, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'menu-configuration.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Menu configuration exported');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your site's navigation menus with advanced toggle controls and bulk operations.
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowStats(!showStats)}
            className="text-gray-600"
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            {showStats ? 'Hide' : 'Show'} Stats
          </Button>
          
          <Button
            variant="outline"
            onClick={handleExport}
            className="text-gray-600"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {showStats && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Menu Statistics</h3>
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-500">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.enabled}</div>
              <div className="text-sm text-gray-500">Enabled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.disabled}</div>
              <div className="text-sm text-gray-500">Disabled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.parents}</div>
              <div className="text-sm text-gray-500">Parent Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.children}</div>
              <div className="text-sm text-gray-500">Child Items</div>
            </div>
          </div>
        </div>
      )}

      {/* Save Changes Bar */}
      {hasChanges && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-700">
                You have unsaved changes
              </span>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHasChanges(false)}
                disabled={isLoading}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Discard
              </Button>
              <Button
                size="sm"
                onClick={handleSaveChanges}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex items-center justify-between space-x-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={filterEnabled}
            onChange={(e) => setFilterEnabled(e.target.value as 'all' | 'enabled' | 'disabled')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Items</option>
            <option value="enabled">Enabled Only</option>
            <option value="disabled">Disabled Only</option>
          </select>
        </div>

        <Button onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>

      {/* Bulk Operations Toolbar */}
      <BulkToggleToolbar
        items={menuItems}
        selectedItems={selectedItems}
        onSelectionChange={handleSelectionChange}
        onBulkToggle={handleBulkToggle}
        onBulkDelete={handleBulkDelete}
        showCascade={true}
        disabled={isLoading}
      />

      {/* Menu Items List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Menu Items ({filteredItems.length})
            </h2>
            <Button>
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>
        </div>

        <div className="p-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No menu items found.</p>
              <p className="text-sm">
                {searchTerm || filterEnabled !== 'all' 
                  ? 'Try adjusting your filters.' 
                  : 'Click "Add Item" to get started.'
                }
              </p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="menu-items">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3"
                  >
                    {filteredItems.map((item, index) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        index={index}
                        isSelected={selectedItems.has(item.id)}
                        onSelect={handleSelectItem}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggle={handleToggleItem}
                        level={0}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedMenuManagementPage;