import React, { useState } from 'react';
import { DragDropMenuTree } from './DragDropMenuTree';
import { MenuItem } from '../../../types/menu';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Plus, RefreshCw, Settings } from 'lucide-react';

/**
 * Demo component showcasing all DragDropMenuTree features
 * This component demonstrates the comprehensive drag-and-drop system
 */
export const DragDropMenuDemo: React.FC = () => {
  const [demoItems, setDemoItems] = useState<MenuItem[]>([
    {
      id: 'demo-1',
      label: 'Home',
      href: '/',
      description: 'Homepage',
      order_index: 0,
      is_enabled: true,
      icon: 'Home',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'demo-2',
      label: 'Community',
      href: '/community',
      description: 'Community section with nested items',
      order_index: 1,
      is_enabled: true,
      icon: 'Users',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'demo-2-1',
      label: 'Member Directory',
      href: '/community/directory',
      description: 'Find community members',
      parent_id: 'demo-2',
      order_index: 0,
      is_enabled: true,
      icon: 'Users',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'demo-2-2',
      label: 'Events',
      href: '/community/events',
      description: 'Community events',
      parent_id: 'demo-2',
      order_index: 1,
      is_enabled: true,
      icon: 'Calendar',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'demo-2-2-1',
      label: 'Upcoming Events',
      href: '/community/events/upcoming',
      description: 'Future events',
      parent_id: 'demo-2-2',
      order_index: 0,
      is_enabled: true,
      icon: 'Calendar',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'demo-3',
      label: 'Business',
      href: '/business',
      description: 'Business opportunities',
      order_index: 2,
      is_enabled: true,
      icon: 'Building2',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'demo-4',
      label: 'Resources',
      href: '/resources',
      description: 'Learning resources',
      order_index: 3,
      is_enabled: false,
      icon: 'BookOpen',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'demo-5',
      label: 'Contact',
      href: '/contact',
      description: 'Get in touch',
      order_index: 4,
      is_enabled: true,
      icon: 'Mail',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);

  const [autoSave, setAutoSave] = useState(true);
  const [allowNesting, setAllowNesting] = useState(true);
  const [maxDepth, setMaxDepth] = useState(3);
  const [showActions, setShowActions] = useState(true);

  const handleItemsChange = (newItems: MenuItem[]) => {
    setDemoItems(newItems);
  };

  const handleItemEdit = (item: MenuItem) => {
    console.log('Edit item:', item);
  };

  const handleItemDelete = (item: MenuItem) => {
    const updatedItems = demoItems.filter(i => 
      i.id !== item.id && i.parent_id !== item.id
    );
    setDemoItems(updatedItems);
  };

  const handleItemAdd = (parentId?: string) => {
    const newItem: MenuItem = {
      id: `demo-new-${Date.now()}`,
      label: 'New Menu Item',
      href: '/new-item',
      description: 'Newly created item',
      parent_id: parentId || null,
      order_index: demoItems.length,
      is_enabled: true,
      icon: 'Plus',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setDemoItems([...demoItems, newItem]);
  };

  const resetDemo = () => {
    // Reset to original demo items
    window.location.reload();
  };

  const getStats = () => {
    const enabled = demoItems.filter(item => item.is_enabled).length;
    const disabled = demoItems.length - enabled;
    const withParent = demoItems.filter(item => item.parent_id).length;
    const rootItems = demoItems.filter(item => !item.parent_id).length;

    return {
      total: demoItems.length,
      enabled,
      disabled,
      withParent,
      rootItems
    };
  };

  const stats = getStats();

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Drag & Drop Menu System Demo
        </h1>
        <p className="text-gray-600">
          Comprehensive menu management with drag-and-drop, nesting, accessibility, 
          touch support, auto-save, and visual feedback.
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Demo Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Auto-save</label>
            <Switch
              checked={autoSave}
              onCheckedChange={setAutoSave}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Allow Nesting</label>
            <Switch
              checked={allowNesting}
              onCheckedChange={setAllowNesting}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Show Actions</label>
            <Switch
              checked={showActions}
              onCheckedChange={setShowActions}
            />
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Max Depth:</label>
            <select
              value={maxDepth}
              onChange={(e) => setMaxDepth(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value={1}>1 Level</option>
              <option value={2}>2 Levels</option>
              <option value={3}>3 Levels</option>
              <option value={4}>4 Levels</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center space-x-4">
          <Button
            onClick={() => handleItemAdd()}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Root Item
          </Button>
          
          <Button
            onClick={resetDemo}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Demo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Menu Tree */}
        <div className="lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Interactive Menu Tree</h2>
            <p className="text-sm text-gray-600 mt-1">
              Drag items to reorder, use keyboard shortcuts (Ctrl+↑/↓), or try touch gestures on mobile
            </p>
          </div>

          <DragDropMenuTree
            items={demoItems}
            onItemsChange={handleItemsChange}
            onItemEdit={handleItemEdit}
            onItemDelete={handleItemDelete}
            onItemAdd={handleItemAdd}
            menuType="main"
            autoSave={autoSave}
            showActions={showActions}
            allowNesting={allowNesting}
            maxDepth={maxDepth}
            className="border border-gray-200 rounded-lg p-4"
          />
        </div>

        {/* Stats and Features */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {/* Statistics */}
            <div className="p-4 bg-white border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Statistics</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.total}
                  </div>
                  <div className="text-gray-500">Total Items</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.enabled}
                  </div>
                  <div className="text-gray-500">Enabled</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-600">
                    {stats.disabled}
                  </div>
                  <div className="text-gray-500">Disabled</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.withParent}
                  </div>
                  <div className="text-gray-500">Nested Items</div>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div className="p-4 bg-white border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">
                <Settings className="inline h-5 w-5 mr-2" />
                Features Demonstrated
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Drag & Drop Reordering
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Nested Menu Items (up to {maxDepth} levels)
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Visual Drag Feedback
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Drop Zone Validation
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Keyboard Accessibility (Ctrl+Arrow keys)
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Touch Gestures (Mobile)
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Auto-save with Optimistic Updates
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Error Rollback on Failure
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Smooth Animations & Transitions
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Screen Reader Support
                </li>
              </ul>
            </div>

            {/* Instructions */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-blue-900">How to Use</h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p><strong>Desktop:</strong></p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Drag items by the grip handle</li>
                  <li>Use Ctrl+↑/↓ for keyboard navigation</li>
                  <li>Click expand/collapse for nested items</li>
                  <li>Toggle enable/disable with switches</li>
                </ul>
                
                <p className="mt-3"><strong>Mobile:</strong></p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Long press to start dragging</li>
                  <li>Swipe left to delete items</li>
                  <li>Swipe right to edit items</li>
                  <li>Haptic feedback on interactions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DragDropMenuDemo;