import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { MenuItemToggle } from './MenuItemToggle';
import { BulkToggleToolbar } from './BulkToggleToolbar';
import { BulkOperation } from '../api/menuToggleApi';
import { RefreshCw, Settings } from 'lucide-react';

// Mock MenuItem interface for demo
interface DemoMenuItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  menu_type: 'main' | 'footer';
  parent_id?: string | null;
  sort_order: number;
  is_enabled: boolean;
  target: '_self' | '_blank';
  icon?: string | null;
  children?: DemoMenuItem[];
}

// Mock data for demonstration
const DEMO_MENU_ITEMS: DemoMenuItem[] = [
  {
    id: '1',
    title: 'Community Hub',
    url: '/community',
    description: 'Connect with other members',
    menu_type: 'main',
    parent_id: null,
    sort_order: 1,
    is_enabled: true,
    target: '_self',
    icon: 'Users'
  },
  {
    id: '2',
    title: 'Business Center',
    url: '/business',
    description: 'Business opportunities and networking',
    menu_type: 'main',
    parent_id: null,
    sort_order: 2,
    is_enabled: true,
    target: '_self',
    icon: 'Building2',
    children: [
      {
        id: '3',
        title: 'Business Directory',
        url: '/business/directory',
        description: 'Find local businesses',
        menu_type: 'main',
        parent_id: '2',
        sort_order: 1,
        is_enabled: true,
        target: '_self',
        icon: 'Search'
      },
      {
        id: '4',
        title: 'Opportunities',
        url: '/business/opportunities',
        description: 'Job and partnership opportunities',
        menu_type: 'main',
        parent_id: '2',
        sort_order: 2,
        is_enabled: false,
        target: '_self',
        icon: 'Briefcase'
      }
    ]
  },
  {
    id: '5',
    title: 'Resources',
    url: '/resources',
    description: 'Educational and development resources',
    menu_type: 'main',
    parent_id: null,
    sort_order: 3,
    is_enabled: false,
    target: '_self',
    icon: 'BookOpen'
  },
  {
    id: '6',
    title: 'About Us',
    url: '/about',
    description: 'Learn about our mission',
    menu_type: 'footer',
    parent_id: null,
    sort_order: 1,
    is_enabled: true,
    target: '_self',
    icon: 'Info'
  }
];

export const MenuToggleDemo: React.FC = () => {
  const [menuItems, setMenuItems] = useState<DemoMenuItem[]>(DEMO_MENU_ITEMS);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [operationCount, setOperationCount] = useState(0);

  // Simulate API toggle operation
  const handleToggleItem = async (itemId: string, enabled: boolean): Promise<boolean> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
    // Simulate 10% failure rate for demo purposes
    if (Math.random() < 0.1) {
      throw new Error('Simulated network error');
    }
    
    setMenuItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, is_enabled: enabled };
      }
      // Update children if they exist
      if (item.children) {
        return {
          ...item,
          children: item.children.map(child => 
            child.id === itemId ? { ...child, is_enabled: enabled } : child
          )
        };
      }
      return item;
    }));
    
    setOperationCount(prev => prev + 1);
    return true;
  };

  // Simulate bulk toggle operations
  const handleBulkToggle = async (itemIds: string[], enabled: boolean): Promise<BulkOperation[]> => {
    const operations: BulkOperation[] = [];
    
    for (const itemId of itemIds) {
      try {
        await handleToggleItem(itemId, enabled);
        operations.push({
          id: itemId,
          operation: enabled ? 'enable' : 'disable',
          success: true
        });
      } catch (error) {
        operations.push({
          id: itemId,
          operation: enabled ? 'enable' : 'disable',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return operations;
  };

  // Simulate bulk delete operations
  const handleBulkDelete = async (itemIds: string[]): Promise<BulkOperation[]> => {
    const operations: BulkOperation[] = [];
    
    // Simulate delete operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setMenuItems(prev => prev.filter(item => !itemIds.includes(item.id)));
    
    itemIds.forEach(id => {
      operations.push({
        id,
        operation: 'delete',
        success: true
      });
    });
    
    setOperationCount(prev => prev + itemIds.length);
    return operations;
  };

  const resetDemo = () => {
    setMenuItems(DEMO_MENU_ITEMS);
    setSelectedItems(new Set());
    setOperationCount(0);
    toast.success('Demo data reset');
  };

  // Flatten items for display
  const flattenedItems: DemoMenuItem[] = [];
  const flattenItems = (items: DemoMenuItem[]) => {
    items.forEach(item => {
      flattenedItems.push(item);
      if (item.children) {
        flattenItems(item.children);
      }
    });
  };
  flattenItems(menuItems);

  const stats = {
    total: flattenedItems.length,
    enabled: flattenedItems.filter(item => item.is_enabled).length,
    disabled: flattenedItems.filter(item => !item.is_enabled).length,
    mainMenu: flattenedItems.filter(item => item.menu_type === 'main').length,
    footerMenu: flattenedItems.filter(item => item.menu_type === 'footer').length
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Demo Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Menu Toggle System Demo
        </h1>
        <p className="text-gray-600 mb-4">
          Interactive demonstration of the comprehensive menu toggle system with bulk operations, 
          audit trails, and advanced UI features.
        </p>
        <div className="flex justify-center space-x-4 mb-6">
          <Button onClick={resetDemo} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Demo Data
          </Button>
          <div className="bg-blue-50 px-4 py-2 rounded-lg">
            <span className="text-blue-700 font-medium">
              Operations Performed: {operationCount}
            </span>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Current Statistics
        </h3>
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
            <div className="text-2xl font-bold text-blue-600">{stats.mainMenu}</div>
            <div className="text-sm text-gray-500">Main Menu</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.footerMenu}</div>
            <div className="text-sm text-gray-500">Footer Menu</div>
          </div>
        </div>
      </div>

      {/* Bulk Operations Toolbar */}
      <BulkToggleToolbar
        items={flattenedItems as any}
        selectedItems={selectedItems}
        onSelectionChange={setSelectedItems}
        onBulkToggle={handleBulkToggle}
        onBulkDelete={handleBulkDelete}
        showCascade={true}
        className="shadow-lg"
      />

      {/* Individual Menu Items */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Menu Items</h3>
          <p className="text-sm text-gray-500">
            Click toggles to see optimistic UI updates, error handling, and undo functionality.
            Some operations have a simulated 10% failure rate for testing.
          </p>
        </div>
        
        <div className="p-4 space-y-4">
          {menuItems.map((item) => (
            <div key={item.id}>
              {/* Parent Item */}
              <div className={`p-4 border border-gray-200 rounded-lg flex items-center justify-between ${
                !item.is_enabled ? 'bg-gray-50 opacity-75' : 'bg-white'
              }`}>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={(e) => {
                      const newSelection = new Set(selectedItems);
                      if (e.target.checked) {
                        newSelection.add(item.id);
                      } else {
                        newSelection.delete(item.id);
                      }
                      setSelectedItems(newSelection);
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  
                  <div>
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-500">{item.description}</p>
                    <p className="text-xs text-gray-400">{item.url}</p>
                    <div className="flex space-x-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.menu_type === 'main' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {item.menu_type} menu
                      </span>
                      {item.children && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {item.children.length} child{item.children.length !== 1 ? 'ren' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <MenuItemToggle
                  item={item as any}
                  onToggle={handleToggleItem}
                  showLabel={true}
                  showVisualIndicator={true}
                  confirmCritical={true}
                />
              </div>
              
              {/* Child Items */}
              {item.children && (
                <div className="ml-8 mt-2 space-y-2">
                  {item.children.map((child) => (
                    <div key={child.id} className={`p-3 border border-gray-100 rounded-md flex items-center justify-between ${
                      !child.is_enabled ? 'bg-gray-50 opacity-75' : 'bg-white'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(child.id)}
                          onChange={(e) => {
                            const newSelection = new Set(selectedItems);
                            if (e.target.checked) {
                              newSelection.add(child.id);
                            } else {
                              newSelection.delete(child.id);
                            }
                            setSelectedItems(newSelection);
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        
                        <div>
                          <h5 className="text-sm font-medium text-gray-900">{child.title}</h5>
                          <p className="text-xs text-gray-500">{child.description}</p>
                          <p className="text-xs text-gray-400">{child.url}</p>
                        </div>
                      </div>
                      
                      <MenuItemToggle
                        item={child as any}
                        onToggle={handleToggleItem}
                        showLabel={false}
                        showVisualIndicator={true}
                        confirmCritical={false}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuToggleDemo;