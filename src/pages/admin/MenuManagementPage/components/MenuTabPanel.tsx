/**
 * MenuTabPanel Component
 * Tab navigation for switching between menu types
 */

import React from 'react';
import { TabPanelProps } from '../types';
import { MenuType } from '@/types/menu';

export const MenuTabPanel: React.FC<TabPanelProps> = ({ activeTab, onTabChange, menuCounts }) => {
  const tabs = [
    { id: 'main', label: 'Main Menu', count: menuCounts.main || 0 },
    { id: 'footer', label: 'Footer Menu', count: menuCounts.footer || 0 },
    { id: 'mobile', label: 'Mobile Menu', count: menuCounts.mobile || 0 }
  ] as const;

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
      <nav className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as MenuType)}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors relative ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            {tab.label}
            <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs ${
              activeTab === tab.id
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};
