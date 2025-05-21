import { Dispatch, SetStateAction } from 'react';
import { Search, X, Building } from 'lucide-react';
import { FilterOptions, INDUSTRY_OPTIONS } from './types';

interface CompaniesFiltersProps {
  filters: FilterOptions;
  setFilters: Dispatch<SetStateAction<FilterOptions>>;
}

const CompaniesFilters = ({ filters, setFilters }: CompaniesFiltersProps) => {
  // Local state for search input (before debounce)
  const [searchInput, setSearchInput] = useState(filters.search);
  
  // Handle industry selection toggle
  const handleIndustryToggle = (industry: string) => {
    setFilters(prev => {
      if (prev.industries.includes(industry)) {
        return {
          ...prev,
          industries: prev.industries.filter(i => i !== industry)
        };
      } else {
        return {
          ...prev,
          industries: [...prev.industries, industry]
        };
      }
    });
  };
  
  // Clear search input
  const clearSearch = () => {
    setSearchInput('');
    setFilters(prev => ({ ...prev, search: '' }));
  };
  
  // Reset all filters
  const clearFilters = () => {
    setSearchInput('');
    setFilters({ search: '', industries: [] });
  };

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
    }, 300);
    
    return () => {
      clearTimeout(handler);
    };
  }, [searchInput, setFilters]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search companies by name, industry, or location..."
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-500"
                aria-label="Clear search"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 md:w-auto">
          {(filters.industries.length > 0 || filters.search) && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm"
            >
              Clear All <X className="h-4 w-4 ml-1" />
            </button>
          )}
        </div>
      </div>
      
      {/* Industry Filters */}
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-2">
          <Building className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Filter by industry:</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {INDUSTRY_OPTIONS.map(industry => (
            <button
              key={industry}
              onClick={() => handleIndustryToggle(industry)}
              className={`px-3 py-1 rounded-full text-sm ${
                filters.industries.includes(industry) 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {industry}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Add missing imports
import { useState, useEffect } from 'react';

export default CompaniesFilters;
