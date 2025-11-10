/**
 * MenuSearchFilter Component
 * Search and filter controls for menu items
 */

import React from 'react';
import { Search, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SearchAndFilterProps } from '../types';
import { MenuVisibility } from '@/types/menu';

export const MenuSearchFilter: React.FC<SearchAndFilterProps> = ({
  searchTerm,
  onSearchChange,
  visibilityFilter,
  onVisibilityFilterChange,
  enabledFilter,
  onEnabledFilterChange,
  onRefresh,
  isLoading
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Visibility Filter */}
        <div>
          <select
            value={visibilityFilter}
            onChange={(e) => onVisibilityFilterChange(e.target.value as MenuVisibility | 'all')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Visibility</option>
            <option value="public">Public</option>
            <option value="authenticated">Authenticated</option>
            <option value="admin">Admin</option>
            <option value="role_based">Role Based</option>
          </select>
        </div>

        {/* Enabled Filter */}
        <div>
          <select
            value={enabledFilter === 'all' ? 'all' : enabledFilter.toString()}
            onChange={(e) => {
              const value = e.target.value;
              onEnabledFilterChange(value === 'all' ? 'all' : value === 'true');
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Status</option>
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>
        </div>

        {/* Refresh Button */}
        <div>
          <Button
            onClick={onRefresh}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
};
