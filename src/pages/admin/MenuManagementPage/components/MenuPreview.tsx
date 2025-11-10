/**
 * MenuPreview Component
 * Live preview of menu structure styled by menu type
 */

import React from 'react';
import { Menu as MenuIcon, FileText, ExternalLink, Link } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { MenuItem } from '@/types/menu';
import { MenuPreviewProps, HierarchicalMenuItem } from '../types';
import { ICON_COMPONENTS } from '../constants';
import { buildHierarchy } from '../utils/menuHelpers';

export const MenuPreview: React.FC<MenuPreviewProps> = ({ items, type }) => {
  const enabledItems = items.filter(item => item.is_enabled);
  const hierarchicalItems = buildHierarchy(enabledItems);

  const renderMenuItem = (item: HierarchicalMenuItem, depth = 0) => {
    const IconComponent = (item.icon && ICON_COMPONENTS[item.icon as keyof typeof ICON_COMPONENTS]) || Link;

    return (
      <div key={item.id} className={`${depth > 0 ? 'ml-4' : ''}`}>
        <div className="flex items-center space-x-2 py-1">
          <IconComponent className="h-4 w-4 text-current" />
          <span className="text-sm">{item.title}</span>
          {item.target === '_blank' && (
            <ExternalLink className="h-3 w-3 text-current opacity-70" />
          )}
          {item.is_external && (
            <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-1 rounded">
              EXT
            </span>
          )}
        </div>
        {item.children.map(child => renderMenuItem(child, depth + 1))}
      </div>
    );
  };

  if (type === 'main') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <MenuIcon className="h-5 w-5 mr-2" />
            Main Menu Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-lg text-white">
            {hierarchicalItems.length > 0 ? (
              <div className="space-y-1">
                {hierarchicalItems.map(item => renderMenuItem(item))}
              </div>
            ) : (
              <p className="text-white/70 italic">No enabled menu items</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'footer') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Footer Menu Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-800 p-4 rounded-lg text-white">
            {hierarchicalItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {hierarchicalItems.map(item => (
                  <div key={item.id} className="space-y-1">
                    {renderMenuItem(item)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">No enabled menu items</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mobile menu preview
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <MenuIcon className="h-5 w-5 mr-2" />
          Mobile Menu Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-900 p-4 rounded-lg text-white max-w-sm mx-auto">
          {hierarchicalItems.length > 0 ? (
            <div className="space-y-2">
              {hierarchicalItems.map(item => renderMenuItem(item))}
            </div>
          ) : (
            <p className="text-gray-400 italic">No enabled menu items</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
