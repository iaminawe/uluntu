import React from 'react';
import { X } from 'lucide-react';

interface ContentFiltersProps {
  activeTab: string;
  filters: any;
  onFiltersChange: (filters: any) => void;
  onClose: () => void;
}

const STATUS_OPTIONS = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
];

const getFilterCount = (filters: any): number => {
  return Object.values(filters).filter(value => value !== undefined && value !== null && value !== '').length;
};

export const ContentFilters: React.FC<ContentFiltersProps> = ({
  activeTab,
  filters,
  onFiltersChange,
  onClose
}) => {
  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-900 dark:text-white">
          Advanced Filters
        </h3>
        <button 
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Featured Toggle */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
            Featured
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="featured"
              checked={filters.featured || false}
              onChange={(e) => handleFilterChange('featured', e.target.checked || undefined)}
              className="rounded border-slate-300 dark:border-slate-600 text-orange-500 focus:ring-orange-500"
            />
            <label htmlFor="featured" className="text-sm text-slate-600 dark:text-slate-400">
              Show only featured
            </label>
          </div>
        </div>

        {/* Date Range - simplified for now */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
            Created After
          </label>
          <input
            type="date"
            value={filters.createdAfter || ''}
            onChange={(e) => handleFilterChange('createdAfter', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
            Sort Order
          </label>
          <select
            value={filters.sortOrder || 'desc'}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Filter Actions */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
        <button
          onClick={clearAllFilters}
          className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          Clear All
        </button>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {getFilterCount(filters)} filters applied
        </div>
      </div>
    </div>
  );
};

export default ContentFilters;