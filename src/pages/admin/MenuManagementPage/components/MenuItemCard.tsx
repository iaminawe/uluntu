/**
 * MenuItemCard Component
 * Draggable menu item card with actions and nested children support
 */

import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import {
  GripVertical,
  Edit,
  Trash2,
  Copy,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Link
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { MenuItemCardProps } from '../types';
import { ICON_COMPONENTS } from '../constants';

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  index,
  onEdit,
  onDelete,
  onToggleEnabled,
  onDuplicate,
  isSelected,
  onSelect,
  children = [],
  isExpanded = false,
  onToggleExpand,
  depth = 0
}) => {
  const IconComponent = (item.icon && ICON_COMPONENTS[item.icon as keyof typeof ICON_COMPONENTS]) || Link;
  const hasChildren = children.length > 0;

  /**
   * Get visibility badge color and text
   */
  const getVisibilityBadge = () => {
    switch (item.visibility) {
      case 'public':
        return (
          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
            Public
          </span>
        );
      case 'authenticated':
        return (
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
            Auth
          </span>
        );
      case 'admin':
        return (
          <span className="text-xs px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full">
            Admin
          </span>
        );
      case 'role_based':
        return (
          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full">
            Role
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Draggable draggableId={item.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-all hover:shadow-md ${
              snapshot.isDragging ? 'shadow-lg rotate-1' : ''
            } ${!item.is_enabled ? 'opacity-60' : ''} ${
              isSelected ? 'ring-2 ring-blue-500' : ''
            }`}
            style={{
              marginLeft: `${depth * 20}px`,
              ...provided.draggableProps.style
            }}
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3 flex-1">
                {/* Checkbox for bulk selection */}
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => onSelect(item, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />

                {/* Drag handle */}
                <div
                  {...provided.dragHandleProps}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing"
                >
                  <GripVertical className="h-5 w-5" />
                </div>

                {/* Expand/collapse for hierarchical items */}
                {hasChildren && onToggleExpand && (
                  <button
                    onClick={() => onToggleExpand(item)}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                )}

                <div className="flex items-center space-x-3 flex-1">
                  <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <IconComponent className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {item.title}
                      </h3>
                      {getVisibilityBadge()}
                      {item.is_external && <ExternalLink className="h-3 w-3 text-blue-500" />}
                    </div>
                    {item.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 text-xs text-gray-400 dark:text-gray-500">
                      <span>{item.url}</span>
                      <span>•</span>
                      <span>Order: {item.sort_order}</span>
                      {item.required_roles && (
                        <>
                          <span>•</span>
                          <span>Roles: {item.required_roles.join(', ')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Status indicator */}
                <div
                  className={`w-2 h-2 rounded-full ${
                    item.is_enabled ? 'bg-green-400' : 'bg-gray-300'
                  }`}
                  title={item.is_enabled ? 'Enabled' : 'Disabled'}
                />

                {/* Enable/Disable Toggle */}
                <Switch
                  checked={item.is_enabled}
                  onCheckedChange={(enabled) => onToggleEnabled(item, enabled)}
                  className="mr-2"
                />

                {/* Action Buttons */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDuplicate(item)}
                  className="p-2"
                  title="Duplicate item"
                >
                  <Copy className="h-4 w-4" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(item)}
                  className="p-2"
                  title="Edit item"
                >
                  <Edit className="h-4 w-4" />
                </Button>

                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => onDelete(item)}
                  className="p-2"
                  title="Delete item"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Draggable>

      {/* Render children if expanded */}
      {hasChildren && isExpanded && (
        <div className="ml-6 mt-2 space-y-2">
          {children.map((child, childIndex) => (
            <MenuItemCard
              key={child.id}
              item={child}
              index={childIndex}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleEnabled={onToggleEnabled}
              onDuplicate={onDuplicate}
              isSelected={isSelected}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </>
  );
};
