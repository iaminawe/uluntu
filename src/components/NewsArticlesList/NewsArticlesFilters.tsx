import { Dispatch, SetStateAction } from 'react';
import { Search, X, Tag } from 'lucide-react';
import { FilterOptions } from './types';

interface NewsArticlesFiltersProps {
  filters: FilterOptions;
  setFilters: Dispatch<SetStateAction<FilterOptions>>;
  availableTags: string[];
}

const NewsArticlesFilters = ({ 
  filters, 
  setFilters, 
  availableTags 
}: NewsArticlesFiltersProps) => {
  // Handle tag selection
  const handleTagClick = (tag: string) => {
    setFilters(prev => {
      const currentTags = [...prev.tags];
      
      // If tag is already selected, remove it
      if (currentTags.includes(tag)) {
        return {
          ...prev,
          tags: currentTags.filter(t => t !== tag)
        };
      }
      
      // Otherwise add it
      return {
        ...prev,
        tags: [...currentTags, tag]
      };
    });
  };
  
  // Clear search input
  const clearSearch = () => {
    setFilters(prev => ({ ...prev, search: '' }));
  };
  
  // Reset all filters
  const resetFilters = () => {
    setFilters({ search: '', tags: [] });
  };

  return (
    <div className="mb-8 space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search news articles..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="w-full px-4 py-2 pl-10 border border-slate-300 dark:border-slate-600 rounded-lg 
                   bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                   focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        {filters.search && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-500"
            aria-label="Clear search"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {availableTags.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Tag className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Filter by Tags</h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                  ${filters.tags.includes(tag)
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
              >
                {tag}
              </button>
            ))}
            
            {(filters.search || filters.tags.length > 0) && (
              <button
                onClick={resetFilters}
                className="ml-auto px-3 py-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 
                        dark:hover:text-slate-300"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsArticlesFilters;
