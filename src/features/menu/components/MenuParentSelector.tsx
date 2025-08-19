import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Home } from 'lucide-react';
import { MenuItem } from '@/types/menu';
import { cn } from '@/utils/cn';
import { IconPreview } from './IconPicker';

interface MenuParentSelectorProps {
  value?: string | null;
  onChange: (parentId: string | null) => void;
  options: MenuItem[];
  excludeId?: string;
  menuType?: string;
  className?: string;
}

interface MenuTreeNode extends MenuItem {
  children: MenuTreeNode[];
  level: number;
}

export const MenuParentSelector: React.FC<MenuParentSelectorProps> = ({
  value,
  onChange,
  options,
  excludeId,
  menuType,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Build hierarchical tree structure
  const menuTree = useMemo(() => {
    // Filter options by menu type and exclude the current item being edited
    const filteredOptions = options.filter(item => 
      (!menuType || item.menu_type === menuType) &&
      item.id !== excludeId
    );

    // Create a map for quick lookup
    const itemMap = new Map<string, MenuTreeNode>();
    
    // Initialize all items
    filteredOptions.forEach(item => {
      itemMap.set(item.id, {
        ...item,
        children: [],
        level: 0,
      });
    });

    // Build parent-child relationships and calculate levels
    const rootItems: MenuTreeNode[] = [];
    
    const calculateLevel = (item: MenuTreeNode, visited = new Set<string>()): number => {
      if (visited.has(item.id)) return 0; // Prevent infinite loops
      visited.add(item.id);
      
      if (!item.parent_id) return 0;
      
      const parent = itemMap.get(item.parent_id);
      return parent ? calculateLevel(parent, visited) + 1 : 0;
    };

    filteredOptions.forEach(item => {
      const node = itemMap.get(item.id)!;
      node.level = calculateLevel(node);
      
      if (item.parent_id && itemMap.has(item.parent_id)) {
        itemMap.get(item.parent_id)!.children.push(node);
      } else {
        rootItems.push(node);
      }
    });

    // Sort by sort_order
    const sortNodes = (nodes: MenuTreeNode[]) => {
      nodes.sort((a, b) => a.sort_order - b.sort_order);
      nodes.forEach(node => sortNodes(node.children));
    };

    sortNodes(rootItems);
    return rootItems;
  }, [options, menuType, excludeId]);

  // Find selected item for display
  const selectedItem = value ? options.find(item => item.id === value) : null;

  // Build breadcrumb path for selected item
  const buildPath = (itemId: string): MenuItem[] => {
    const path: MenuItem[] = [];
    let current = options.find(item => item.id === itemId);
    
    while (current) {
      path.unshift(current);
      current = current.parent_id ? options.find(item => item.id === current!.parent_id) : undefined;
    }
    
    return path;
  };

  const selectedPath = selectedItem ? buildPath(selectedItem.id) : [];

  // Toggle node expansion
  const toggleExpanded = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // Render tree node
  const renderTreeNode = (node: MenuTreeNode): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const isSelected = value === node.id;

    return (
      <div key={node.id} className="select-none">
        <div
          className={cn(
            "flex items-center py-2 px-2 hover:bg-gray-50 cursor-pointer rounded-md",
            isSelected && "bg-blue-50 text-blue-700"
          )}
          style={{ marginLeft: `${node.level * 16}px` }}
          onClick={() => onChange(node.id)}
        >
          {/* Expand/Collapse Button */}
          <div className="w-4 h-4 mr-1 flex items-center justify-center">
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(node.id);
                }}
                className="hover:bg-gray-200 rounded p-0.5"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>
            ) : (
              <div className="w-3 h-3" />
            )}
          </div>

          {/* Folder Icon */}
          <div className="mr-2">
            {hasChildren ? (
              isExpanded ? (
                <FolderOpen className="h-4 w-4 text-blue-500" />
              ) : (
                <Folder className="h-4 w-4 text-gray-500" />
              )
            ) : (
              <IconPreview iconName={node.icon} size="sm" className="text-gray-500" />
            )}
          </div>

          {/* Item Title */}
          <span className="text-sm font-medium truncate flex-1">
            {node.title}
          </span>

          {/* Level Badge */}
          {node.level > 0 && (
            <span className="ml-2 px-1.5 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">
              L{node.level + 1}
            </span>
          )}

          {/* Disabled Badge */}
          {!node.is_enabled && (
            <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded">
              Disabled
            </span>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {node.children.map(renderTreeNode)}
          </div>
        )}
      </div>
    );
  };

  // Auto-expand path to selected item
  React.useEffect(() => {
    if (selectedItem && selectedPath.length > 0) {
      const newExpanded = new Set(expandedNodes);
      selectedPath.forEach(item => {
        if (item.id !== selectedItem.id) {
          newExpanded.add(item.id);
        }
      });
      setExpandedNodes(newExpanded);
    }
  }, [selectedItem, selectedPath]);

  return (
    <div className={cn("relative", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-left flex items-center justify-between"
      >
        <div className="flex items-center min-w-0 flex-1">
          {selectedItem ? (
            <div className="flex items-center min-w-0">
              {/* Breadcrumb Path */}
              {selectedPath.length > 1 && (
                <div className="flex items-center text-gray-400 mr-2">
                  {selectedPath.slice(0, -1).map((pathItem, index) => (
                    <React.Fragment key={pathItem.id}>
                      {index > 0 && <ChevronRight className="h-3 w-3 mx-1" />}
                      <span className="text-xs truncate max-w-20">
                        {pathItem.title}
                      </span>
                    </React.Fragment>
                  ))}
                  <ChevronRight className="h-3 w-3 mx-1" />
                </div>
              )}
              
              {/* Selected Item */}
              <div className="flex items-center min-w-0">
                <IconPreview iconName={selectedItem.icon} size="sm" className="mr-2 shrink-0" />
                <span className="text-gray-900 truncate">{selectedItem.title}</span>
                {!selectedItem.is_enabled && (
                  <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded shrink-0">
                    Disabled
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center text-gray-500">
              <Home className="h-4 w-4 mr-2" />
              <span>None (Top Level)</span>
            </div>
          )}
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 text-gray-400 transition-transform shrink-0 ml-2",
          isOpen && "rotate-180"
        )} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-y-auto">
          {/* Clear Selection Option */}
          <div
            className={cn(
              "flex items-center py-2 px-2 hover:bg-gray-50 cursor-pointer border-b border-gray-200",
              !value && "bg-blue-50 text-blue-700"
            )}
            onClick={() => {
              onChange(null);
              setIsOpen(false);
            }}
          >
            <div className="w-4 h-4 mr-3" />
            <Home className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-sm font-medium">None (Top Level)</span>
          </div>

          {/* Menu Tree */}
          {menuTree.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No parent options available
              {menuType && (
                <div className="text-xs mt-1">
                  Showing only items for "{menuType}" menu
                </div>
              )}
            </div>
          ) : (
            <div className="py-2">
              {menuTree.map(renderTreeNode)}
            </div>
          )}

          {/* Hierarchy Preview Footer */}
          {selectedPath.length > 0 && (
            <div className="border-t border-gray-200 p-3 bg-gray-50">
              <div className="text-xs text-gray-500 mb-1">Hierarchy Preview:</div>
              <div className="flex items-center text-xs text-gray-600">
                <Home className="h-3 w-3 mr-1" />
                {selectedPath.map((pathItem, index) => (
                  <React.Fragment key={pathItem.id}>
                    <ChevronRight className="h-3 w-3 mx-1" />
                    <span className={cn(
                      index === selectedPath.length - 1 ? "font-medium text-blue-600" : ""
                    )}>
                      {pathItem.title}
                    </span>
                  </React.Fragment>
                ))}
              </div>
              {selectedItem && (
                <div className="text-xs text-gray-500 mt-1">
                  Level: {selectedPath.length} • 
                  Sort Order: {selectedItem.sort_order} • 
                  Status: {selectedItem.is_enabled ? 'Enabled' : 'Disabled'}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MenuParentSelector;