import React from 'react';
import { PlusCircle, ChevronDown, X, Eye, EyeOff, Lock } from 'lucide-react';
import { ActionBar as SharedActionBar } from '../../components/ui/PageLayout';
import { GroupVisibility } from '../../components/GroupsList/types';
import { getVisibilityIcon } from '../../components/GroupsList/utils';

interface ActionBarProps {
  searchTerm: string;
  onSearch: (value: string) => void;
  visibilityFilter: GroupVisibility[];
  onVisibilityChange: (visibilities: GroupVisibility[]) => void;
}

const ActionBar: React.FC<ActionBarProps> = ({
  searchTerm,
  onSearch,
  visibilityFilter,
  onVisibilityChange
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  
  const toggleVisibilityFilter = (visibility: GroupVisibility) => {
    const newFilter = visibilityFilter.includes(visibility)
      ? visibilityFilter.filter(v => v !== visibility)
      : [...visibilityFilter, visibility];
    onVisibilityChange(newFilter);
  };
  
  const clearVisibilityFilter = () => {
    onVisibilityChange([]);
  };

  return (
    <SharedActionBar
      searchTerm={searchTerm}
      onSearch={onSearch}
      searchPlaceholder="Search groups..."
      createUrl="/groups/create"
      createText="Create New Group"
      createIcon={<PlusCircle className="h-5 w-5" />}
      showSearch={true}
      filters={
        <div className="flex flex-wrap gap-3 items-center">
          {/* Visibility Filter Dropdown */}
          <div className="relative">
            <button 
              className="flex items-center px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Visibility
              <ChevronDown className="h-4 w-4 ml-2" />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute z-10 mt-1 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg p-2 border border-slate-200 dark:border-slate-700">
                <div className="space-y-2">
                  <div 
                    className="flex items-center p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded cursor-pointer"
                    onClick={() => toggleVisibilityFilter('open')}
                  >
                    <input 
                      type="checkbox" 
                      checked={visibilityFilter.includes('open')}
                      onChange={() => {}} // Handled by parent div click
                      className="mr-2"
                    />
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-2 text-green-500" />
                      <span>Open</span>
                    </div>
                  </div>
                  
                  <div 
                    className="flex items-center p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded cursor-pointer"
                    onClick={() => toggleVisibilityFilter('closed')}
                  >
                    <input 
                      type="checkbox" 
                      checked={visibilityFilter.includes('closed')}
                      onChange={() => {}} // Handled by parent div click
                      className="mr-2"
                    />
                    <div className="flex items-center">
                      <EyeOff className="h-4 w-4 mr-2 text-amber-500" />
                      <span>Closed</span>
                    </div>
                  </div>
                  
                  <div 
                    className="flex items-center p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded cursor-pointer"
                    onClick={() => toggleVisibilityFilter('secret')}
                  >
                    <input 
                      type="checkbox" 
                      checked={visibilityFilter.includes('secret')}
                      onChange={() => {}} // Handled by parent div click
                      className="mr-2"
                    />
                    <div className="flex items-center">
                      <Lock className="h-4 w-4 mr-2 text-red-500" />
                      <span>Secret</span>
                    </div>
                  </div>
                </div>
                
                {visibilityFilter.length > 0 && (
                  <div className="border-t border-slate-200 dark:border-slate-700 mt-2 pt-2">
                    <button 
                      className="w-full text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center"
                      onClick={clearVisibilityFilter}
                    >
                      <X className="h-3 w-3 mr-1" /> Clear selections
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Selected Visibility Filters */}
          {visibilityFilter.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {visibilityFilter.map(visibility => {
                let bgColor = '';
                let textColor = '';
                
                if (visibility === 'open') {
                  bgColor = 'bg-green-100 dark:bg-green-900';
                  textColor = 'text-green-800 dark:text-green-100';
                } else if (visibility === 'closed') {
                  bgColor = 'bg-amber-100 dark:bg-amber-900';
                  textColor = 'text-amber-800 dark:text-amber-100';
                } else if (visibility === 'secret') {
                  bgColor = 'bg-red-100 dark:bg-red-900';
                  textColor = 'text-red-800 dark:text-red-100';
                }
                
                return (
                  <span 
                    key={visibility}
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${bgColor} ${textColor}`}
                  >
                    {getVisibilityIcon(visibility)}
                    <span className="ml-1 mr-1">{visibility.charAt(0).toUpperCase() + visibility.slice(1)}</span>
                    <button 
                      onClick={() => toggleVisibilityFilter(visibility)}
                      className={`hover:text-slate-800 dark:hover:text-slate-100`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      }
    />
  );
};

export default ActionBar;
