import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, PlusCircle, X } from 'lucide-react';
import { ActionBarProps } from '@/shared/components/ui/PageLayout/types';

/**
 * Reusable action bar component
 * Provides search, filters, and action buttons for listing pages
 */
const ActionBar: React.FC<ActionBarProps> = ({
  onSearch,
  searchTerm = '',
  searchPlaceholder = 'Search...',
  createUrl,
  createText = 'Create',
  createIcon,
  showSearch = true,
  filters,
  actions,
  className = '',
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [isFocused, setIsFocused] = useState(false);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalSearchTerm(newValue);
    onSearch?.(newValue);
  };

  // Clear search input
  const handleClearSearch = () => {
    setLocalSearchTerm('');
    onSearch?.('');
  };

  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex flex-col gap-4">
        {/* Top row: Search input and actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search input */}
          {showSearch && (
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={localSearchTerm}
                onChange={handleSearchChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={`
                  block w-full pl-10 pr-10 py-2 rounded-md border
                  border-slate-300 dark:border-slate-600
                  bg-white dark:bg-slate-800
                  text-slate-900 dark:text-white
                  focus:ring-2 focus:outline-none
                  ${isFocused ? 'focus:ring-orange-500 focus:border-orange-500' : ''}
                `}
                placeholder={searchPlaceholder}
              />
              {localSearchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-500"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}

          {/* Create button and other actions */}
          <div className="flex flex-wrap items-center gap-3 ml-auto">
            {actions}
            
            {createUrl && (
              <Link
                to={createUrl}
                className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
              >
                {createIcon || <PlusCircle className="h-5 w-5 mr-2" />}
                {createText}
              </Link>
            )}
          </div>
        </div>

        {/* Bottom row: Filters */}
        {filters && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {filters}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionBar;
