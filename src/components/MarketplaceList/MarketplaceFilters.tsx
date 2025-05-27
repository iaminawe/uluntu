import { Dispatch, SetStateAction } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { 
  ListingType, 
  ListingCondition, 
  ListingPriceRange,
  FilterOptions 
} from './types';
import { getTypeIcon, getTypeDisplayName, getConditionDisplayName } from './utils';

interface MarketplaceFiltersProps {
  filters: FilterOptions;
  setFilters: Dispatch<SetStateAction<FilterOptions>>;
  advancedFiltersOpen: boolean;
  setAdvancedFiltersOpen: Dispatch<SetStateAction<boolean>>;
}

const MarketplaceFilters = ({
  filters,
  setFilters,
  advancedFiltersOpen,
  setAdvancedFiltersOpen
}: MarketplaceFiltersProps) => {
  // Available options for filters
  const types: ListingType[] = ['product', 'service', 'equipment'];
  const conditions: ListingCondition[] = ['new', 'like-new', 'good', 'fair', 'poor'];
  const priceRanges: { value: ListingPriceRange | 'all'; label: string }[] = [
    { value: 'all', label: 'Any Price' },
    { value: 'under-50', label: 'Under $50' },
    { value: '50-100', label: '$50 - $100' },
    { value: '100-250', label: '$100 - $250' },
    { value: '250-500', label: '$250 - $500' },
    { value: '500-plus', label: 'Over $500' }
  ];
  
  // Toggle listing type filter
  const handleTypeClick = (type: ListingType | 'all') => {
    setFilters(prev => ({ ...prev, type }));
  };
  
  // Reset all filters
  const clearAllFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      condition: 'all',
      priceRange: 'all',
      tags: []
    });
    setAdvancedFiltersOpen(false);
  };
  
  // Check if any filters are active
  const hasActiveFilters = 
    filters.search || 
    filters.type !== 'all' || 
    filters.condition !== 'all' || 
    filters.priceRange !== 'all' || 
    (filters.tags && filters.tags.length > 0);

  return (
    <div className="mb-8">
      {/* Search and basic filters */}
      <div className="flex justify-between items-center mb-4">
        <div className="relative flex-1 max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search marketplace..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full px-4 py-2 pl-10 border border-slate-300 dark:border-slate-600 rounded-lg 
                     bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          {filters.search && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-slate-400 hover:text-slate-500" />
            </button>
          )}
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="ml-3 px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 
                     text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-200 
                     dark:hover:bg-slate-600 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>
      
      {/* Type filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleTypeClick('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
              ${filters.type === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
          >
            All Types
          </button>
          {types.map(type => (
            <button
              key={type}
              onClick={() => handleTypeClick(type)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center
                ${filters.type === type
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
            >
              {getTypeIcon(type)}
              <span className="ml-2 capitalize">{getTypeDisplayName(type)}</span>
            </button>
          ))}
        </div>
        
        <button
          onClick={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
          className="px-3 py-1 rounded-full text-sm font-medium bg-slate-100 dark:bg-slate-700 
                   text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 
                   transition-colors flex items-center"
        >
          <Filter className="h-4 w-4 mr-2" />
          {advancedFiltersOpen ? 'Hide Filters' : 'More Filters'}
        </button>
      </div>
      
      {/* Advanced filters */}
      {advancedFiltersOpen && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Condition filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Condition
              </label>
              <select
                value={filters.condition}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  condition: e.target.value as ListingCondition | 'all' 
                }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Any Condition</option>
                {conditions.map(condition => (
                  <option key={condition} value={condition}>
                    {getConditionDisplayName(condition)}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Price range filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Price Range
              </label>
              <select
                value={filters.priceRange}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  priceRange: e.target.value as ListingPriceRange | 'all' 
                }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {priceRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceFilters;
