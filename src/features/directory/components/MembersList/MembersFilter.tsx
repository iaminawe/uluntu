import { Dispatch, SetStateAction } from 'react';
import { Search, X } from 'lucide-react';
import { FilterOptions, SKILL_OPTIONS } from './types';

interface MembersFilterProps {
  filters: FilterOptions;
  setFilters: Dispatch<SetStateAction<FilterOptions>>;
  clearFilters: () => void;
}

const MembersFilter = ({ filters, setFilters, clearFilters }: MembersFilterProps) => {
  // Handle toggling a skill filter
  const handleSkillToggle = (skill: string) => {
    setFilters(prev => {
      const currentSkills = prev.skills || [];
      const newSkills = currentSkills.includes(skill)
        ? currentSkills.filter(s => s !== skill)
        : [...currentSkills, skill];
      
      return {
        ...prev,
        skills: newSkills.length > 0 ? newSkills : undefined
      };
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Search input */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search members by name, title, or company..."
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg 
                     bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 
                     focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
        </div>
        
        {/* Clear filters button */}
        <div className="flex flex-wrap gap-2 md:w-auto">
          {(filters.search || (filters.skills && filters.skills.length > 0)) && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-3 py-1 bg-slate-200 dark:bg-slate-700 
                       text-slate-700 dark:text-slate-300 rounded-full text-sm"
            >
              Clear All <X className="h-4 w-4 ml-1" />
            </button>
          )}
        </div>
      </div>
      
      {/* Skill Filters */}
      <div className="mt-4">
        <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
          Filter by skills:
        </div>
        <div className="flex flex-wrap gap-2">
          {SKILL_OPTIONS.map(skill => (
            <button
              key={skill}
              onClick={() => handleSkillToggle(skill)}
              className={`px-3 py-1 rounded-full text-sm ${
                filters.skills?.includes(skill) 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MembersFilter;
