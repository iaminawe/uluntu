import React, { useState, Dispatch, SetStateAction } from 'react';
import { PlusCircle, Tag, X } from 'lucide-react';
import { ActionBar as SharedActionBar } from '@/shared/components/ui/PageLayout';
import { FilterOptions, SKILL_OPTIONS } from '@/features/directory/components/MembersList/types';

interface ActionBarProps {
  filters: FilterOptions;
  setFilters: Dispatch<SetStateAction<FilterOptions>>;
}

const ActionBar: React.FC<ActionBarProps> = ({ filters, setFilters }) => {
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  
  const handleSearch = (value: string) => {
    console.log('Searching for members:', value);
    setFilters(prev => ({ ...prev, search: value }));
  };
  
  // Handle skill selection
  const toggleSkill = (skill: string) => {
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
  
  // Clear all selected skills
  const clearSkills = () => {
    setFilters(prev => ({ ...prev, skills: undefined }));
  };

  return (
    <SharedActionBar
      searchTerm={filters.search}
      onSearch={handleSearch}
      searchPlaceholder="Search members..."
      createUrl="/directory/create"
      createText="Add New Member"
      createIcon={<PlusCircle className="h-5 w-5" />}
      showSearch={true}
      filters={
        <div className="flex flex-wrap gap-3 items-center">
          {/* Skills Filter Button */}
          <div className="relative">
            <button 
              onClick={() => setShowSkillsDropdown(!showSkillsDropdown)}
              className="flex items-center px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 rounded-md"
            >
              <Tag className="h-4 w-4 mr-2" />
              Filter by Skills
              {filters.skills && filters.skills.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-orange-500 rounded-full">
                  {filters.skills.length}
                </span>
              )}
            </button>
            
            {/* Skills Dropdown */}
            {showSkillsDropdown && (
              <div className="absolute z-10 mt-2 w-64 bg-white dark:bg-slate-800 rounded-md shadow-lg py-2 px-3 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Select Skills</h3>
                  {filters.skills && filters.skills.length > 0 && (
                    <button 
                      onClick={clearSkills}
                      className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                
                <div className="max-h-60 overflow-y-auto">
                  {SKILL_OPTIONS.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 py-2">No skills available</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {SKILL_OPTIONS.map((skill: string) => (
                        <button
                          key={skill}
                          onClick={() => toggleSkill(skill)}
                          className={`px-2 py-1 rounded-full text-xs font-medium transition-colors
                            ${filters.skills?.includes(skill)
                              ? 'bg-orange-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Selected Skills Display */}
          {filters.skills && filters.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              {filters.skills.map((skill: string) => (
                <span 
                  key={skill} 
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300"
                >
                  {skill}
                  <button 
                    onClick={() => toggleSkill(skill)}
                    className="ml-1 text-orange-500 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <button
                onClick={clearSkills}
                className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      }
    />
  );
};

export default ActionBar;
