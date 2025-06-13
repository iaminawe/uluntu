import { Dispatch, SetStateAction } from 'react';
import { Search, X } from 'lucide-react';
import { FilterOptions } from '@/features/news/components/NewsList/types';

interface NewsFiltersProps {
  filters: FilterOptions;
  setFilters: Dispatch<SetStateAction<FilterOptions>>;
  tags: string[];
}

const NewsFilters = ({ filters, setFilters, tags }: NewsFiltersProps) => {
  // Handle tag selection
  const handleTagClick = (tag: string) => {
    setFilters(prev => ({ ...prev, tag }));
  };
  
  // Clear search input
  const clearSearch = () => {
    setFilters(prev => ({ ...prev, search: '' }));
  };
  
  // Reset all filters
  const resetFilters = () => {
    setFilters({ search: '', tag: 'all' });
  };

  return (
    <div className="mb-8">
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search news..."
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
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => handleTagClick('all')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
            ${filters.tag === 'all'
              ? 'bg-orange-500 text-white'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
        >
          All Tags
        </button>
        {tags.map(tag => (
          <button
            key={tag}
            onClick={() => handleTagClick(tag)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
              ${filters.tag === tag
                ? 'bg-orange-500 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
          >
            {tag}
          </button>
        ))}
        
        {(filters.search || filters.tag !== 'all') && (
          <button
            onClick={resetFilters}
            className="ml-auto px-3 py-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 
                     dark:hover:text-slate-300"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default NewsFilters;
