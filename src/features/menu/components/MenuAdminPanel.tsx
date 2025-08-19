import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Trash2, Edit, Plus, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useMenuItems } from '../contexts/MenuContext';
import { useMenuCache } from '../hooks/useMenuCache';
import { 
  fetchMenuPositions, 
  createMenuItem, 
  updateMenuItem, 
  deleteMenuItem,
  reorderMenuItems 
} from '../api/menuApi';
import type { MenuItem, MenuPosition } from '@/types/menu';

/**
 * Admin panel component for managing dynamic menus
 * Only accessible to users with admin privileges
 */
export const MenuAdminPanel: React.FC = () => {
  const [selectedPosition, setSelectedPosition] = useState<string>('main_header');
  const [menuPositions, setMenuPositions] = useState<MenuPosition[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { items, loading: itemsLoading, refresh } = useMenuItems(selectedPosition);
  const { refreshAllMenus, clearPositionCache } = useMenuCache();

  // Load menu positions on mount
  useEffect(() => {
    const loadPositions = async () => {
      try {
        const positions = await fetchMenuPositions();
        setMenuPositions(positions);
      } catch (err) {
        console.error('Failed to load menu positions:', err);
        setError('Failed to load menu positions');
      }
    };
    loadPositions();
  }, []);

  // Handle creating/updating menu items
  const handleSaveItem = async () => {
    if (!editingItem.title) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const positionData = menuPositions.find(p => p.name === selectedPosition);
      if (!positionData) {
        throw new Error('Invalid menu position');
      }

      if (isEditing) {
        // Update existing item
        await updateMenuItem(isEditing, editingItem);
      } else {
        // Create new item
        await createMenuItem({
          ...editingItem as Omit<MenuItem, 'id' | 'children'>,
          position_id: positionData.id,
          sort_order: editingItem.sort_order || items.length
        });
      }

      // Refresh menu data and clear cache
      await refresh();
      clearPositionCache(selectedPosition);
      
      // Reset form
      setIsEditing(null);
      setEditingItem({});
    } catch (err) {
      console.error('Failed to save menu item:', err);
      setError(err instanceof Error ? err.message : 'Failed to save menu item');
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting menu items
  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item? This will also delete all its children.')) {
      return;
    }

    setLoading(true);
    try {
      await deleteMenuItem(id);
      await refresh();
      clearPositionCache(selectedPosition);
    } catch (err) {
      console.error('Failed to delete menu item:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete menu item');
    } finally {
      setLoading(false);
    }
  };

  // Handle refreshing all menus
  const handleRefreshAll = async () => {
    setLoading(true);
    try {
      await refreshAllMenus();
    } catch (err) {
      console.error('Failed to refresh menus:', err);
      setError('Failed to refresh menus');
    } finally {
      setLoading(false);
    }
  };

  // Start editing an item
  const startEditing = (item: MenuItem) => {
    setIsEditing(item.id);
    setEditingItem(item);
  };

  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(null);
    setEditingItem({});
    setError(null);
  };

  // Render menu item for editing
  const renderMenuItem = (item: MenuItem, level = 0) => (
    <div key={item.id} className={`border rounded-lg p-3 ${level > 0 ? 'ml-6 border-dashed' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{item.title}</span>
            {item.feature_flag && (
              <Badge variant="secondary" className="text-xs">
                {item.feature_flag}
              </Badge>
            )}
            {!item.url && <EyeOff className="w-4 h-4 text-gray-400" />}
          </div>
          {item.url && (
            <div className="text-sm text-gray-600">
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {item.url}
              </a>
            </div>
          )}
          {item.description && (
            <div className="text-sm text-gray-500 mt-1">{item.description}</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => startEditing(item)}
            disabled={loading}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteItem(item.id)}
            disabled={loading}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Render children */}
      {item.children && item.children.length > 0 && (
        <div className="mt-3 space-y-2">
          {item.children.map(child => renderMenuItem(child, level + 1))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Menu Management</h2>
        <Button 
          onClick={handleRefreshAll}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh All
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError(null)}
            className="mt-2"
          >
            Dismiss
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Position Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Menu Position</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedPosition} onValueChange={setSelectedPosition}>
              <SelectTrigger>
                <SelectValue placeholder="Select menu position" />
              </SelectTrigger>
              <SelectContent>
                {menuPositions.map(position => (
                  <SelectItem key={position.id} value={position.name}>
                    {position.name} ({position.location})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="mt-4 text-sm text-gray-600">
              <p>Selected: <strong>{selectedPosition}</strong></p>
              {menuPositions.find(p => p.name === selectedPosition)?.description && (
                <p className="mt-1">
                  {menuPositions.find(p => p.name === selectedPosition)?.description}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Menu Items List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Menu Items</CardTitle>
              <Button
                onClick={() => {
                  setIsEditing('new');
                  setEditingItem({ sort_order: items.length });
                }}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {itemsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No menu items found. Add your first item to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {items.map(item => renderMenuItem(item))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal/Form */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isEditing === 'new' ? 'Add Menu Item' : 'Edit Menu Item'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <Input
                  value={editingItem.title || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder="Menu item title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">URL</label>
                <Input
                  value={editingItem.url || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                  placeholder="/path or https://example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Target</label>
                <Select 
                  value={editingItem.target || '_self'} 
                  onValueChange={(value) => setEditingItem({ ...editingItem, target: value as MenuItem['target'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_self">Same window</SelectItem>
                    <SelectItem value="_blank">New window</SelectItem>
                    <SelectItem value="_parent">Parent frame</SelectItem>
                    <SelectItem value="_top">Top frame</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Sort Order</label>
                <Input
                  type="number"
                  value={editingItem.sort_order || 0}
                  onChange={(e) => setEditingItem({ ...editingItem, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <Input
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Feature Flag</label>
                <Input
                  value={editingItem.feature_flag || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, feature_flag: e.target.value })}
                  placeholder="e.g., events_system"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">CSS Classes</label>
                <Input
                  value={editingItem.css_classes || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, css_classes: e.target.value })}
                  placeholder="Additional CSS classes"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={cancelEditing} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleSaveItem} disabled={loading}>
                {loading ? 'Saving...' : (isEditing === 'new' ? 'Create' : 'Update')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};