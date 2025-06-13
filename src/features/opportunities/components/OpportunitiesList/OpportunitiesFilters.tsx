import { useState } from 'react';
import { 
  X, 
  Filter, 
  MapPin, 
  Monitor 
} from 'lucide-react';
import { 
  OpportunityType, 
  ExperienceLevel,
  FilterOptions 
} from './types';
import { 
  getOpportunityTypeLabel,
  getExperienceLevelLabel
} from './utils';

interface OpportunitiesFiltersProps {
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
  resultsCount: number;
  totalCount: number;
}

const OpportunitiesFilters = ({ 
  filters, 
  setFilters, 
  resultsCount, 
  totalCount 
}: OpportunitiesFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);
  
  // Options for filter select elements
  const typeOptions: (OpportunityType | 'all')[] = ['all', 'full-time', 'part-time', 'contract', 'volunteer', 'internship'];
  const experienceLevelOptions: (ExperienceLevel | 'all')[] = ['all', 'entry', 'mid', 'senior', 'lead', 'executive'];
  
  // Reset all filters to default values
  const resetFilters = () => {
    setFilters({
      type: 'all',
      experienceLevel: 'all',
      remote: 'all',
      search: ''
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 mb-6">
      
      {/* Filter toggle and results count */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300
                   hover:text-orange-500 dark:hover:text-orange-400"
        >
          <Filter className="h-4 w-4 mr-1" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
        
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Showing <span className="font-medium text-slate-700 dark:text-slate-300">{resultsCount}</span> of {totalCount} opportunities
        </div>
      </div>
      
      {/* Expanded filters */}
      {showFilters && (
        <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Type filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Type
              </label>
              <select
                value={filters.type}
                onChange={e => setFilters({ ...filters, type: e.target.value as OpportunityType | 'all' })}
                className="w-full py-2 px-3 border border-slate-300 dark:border-slate-600 rounded-lg
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {typeOptions.map(option => (
                  <option key={option} value={option}>
                    {option === 'all' ? 'All Types' : getOpportunityTypeLabel(option)}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Experience level filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Experience Level
              </label>
              <select
                value={filters.experienceLevel}
                onChange={e => setFilters({ ...filters, experienceLevel: e.target.value as ExperienceLevel | 'all' })}
                className="w-full py-2 px-3 border border-slate-300 dark:border-slate-600 rounded-lg
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {experienceLevelOptions.map(option => (
                  <option key={option} value={option}>
                    {option === 'all' ? 'All Levels' : getExperienceLevelLabel(option)}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Remote filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Remote Work
              </label>
              <select
                value={filters.remote === 'all' ? 'all' : filters.remote.toString()}
                onChange={e => {
                  const value = e.target.value;
                  setFilters({ 
                    ...filters, 
                    remote: value === 'all' ? 'all' : value === 'true' 
                  });
                }}
                className="w-full py-2 px-3 border border-slate-300 dark:border-slate-600 rounded-lg
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Locations</option>
                <option value="true">Remote Only</option>
                <option value="false">On-site Only</option>
              </select>
            </div>
          </div>
          
          {/* Active filters and reset */}
          <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap items-center gap-2">
              {/* Show active filters as badges */}
              {filters.type !== 'all' && (
                <span className="flex items-center px-3 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 
                               text-slate-700 dark:text-slate-300 rounded-full">
                  {getOpportunityTypeLabel(filters.type)}
                  <button 
                    onClick={() => setFilters({ ...filters, type: 'all' })}
                    className="ml-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {filters.experienceLevel !== 'all' && filters.experienceLevel && (
                <span className="flex items-center px-3 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 
                               text-slate-700 dark:text-slate-300 rounded-full">
                  {getExperienceLevelLabel(filters.experienceLevel)}
                  <button 
                    onClick={() => setFilters({ ...filters, experienceLevel: 'all' })}
                    className="ml-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {filters.remote !== 'all' && (
                <span className="flex items-center px-3 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 
                               text-slate-700 dark:text-slate-300 rounded-full">
                  {filters.remote ? (
                    <>
                      <Monitor className="h-3 w-3 mr-1" />
                      Remote
                    </>
                  ) : (
                    <>
                      <MapPin className="h-3 w-3 mr-1" />
                      On-site
                    </>
                  )}
                  <button 
                    onClick={() => setFilters({ ...filters, remote: 'all' })}
                    className="ml-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
            
            <button
              onClick={resetFilters}
              className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunitiesFilters;
