import { Dispatch, SetStateAction } from 'react';
import { Search, X, Tag } from 'lucide-react';
import { FilterOptions } from './types';
import { getSkillColor } from './utils';

interface DirectoryFiltersProps {
  filters: FilterOptions;
  setFilters: Dispatch<SetStateAction<FilterOptions>>;
  availableSkills: string[];
}

const DirectoryFilters = ({ 
  filters, 
  setFilters, 
  availableSkills 
}: DirectoryFiltersProps) => {
  // Local state for search input (before debounce)
  const [searchInput, setSearchInput] = useState(filters.search);
  
  // Handle skill selection
  const toggleSkill = (skill: string) => {
    setFilters(prev => {
      if (prev.skills.includes(skill)) {
        return {
          ...prev,
          skills: prev.skills.filter(s => s !== skill)
        };
      } else {
        return {
          ...prev,
          skills: [...prev.skills, skill]
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
    setFilters({ search: '', skills: [] });
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
    <div className="mb-6 space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search by name, title, company, or location..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full px-4 py-2 pl-10 border border-slate-300 dark:border-slate-600 rounded-lg 
                   bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                   focus:outline-none focus:ring-2 focus:ring-orange-500"
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

      {availableSkills.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Tag className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Filter by Skills</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableSkills.map(skill => (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                  ${filters.skills.includes(skill)
                    ? 'bg-orange-500 text-white'
                    : `${getSkillColor(skill)} hover:opacity-80`
                  }`}
              >
                {skill}
              </button>
            ))}
            
            {(filters.search || filters.skills.length > 0) && (
              <button
                onClick={clearFilters}
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

// Add missing imports
import { useState, useEffect } from 'react';

export default DirectoryFilters;
