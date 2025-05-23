import React, { useState } from 'react';
import { PlusCircle, Building2, ChevronDown, X } from 'lucide-react';
import { ActionBar as SharedActionBar } from '../../components/ui/PageLayout';
import { INDUSTRY_OPTIONS } from '../../components/CompaniesList/types';

interface ActionBarProps {
  searchTerm?: string;
  onSearch?: (value: string) => void;
  selectedIndustries?: string[];
  onIndustryChange?: (industries: string[]) => void;
}

const ActionBar: React.FC<ActionBarProps> = ({
  searchTerm = '',
  onSearch = () => {},
  selectedIndustries = [],
  onIndustryChange = () => {}
}) => {
  const [isIndustryDropdownOpen, setIsIndustryDropdownOpen] = useState(false);
  
  const toggleIndustry = (industry: string) => {
    const updatedIndustries = selectedIndustries.includes(industry)
      ? selectedIndustries.filter(i => i !== industry)
      : [...selectedIndustries, industry];
    onIndustryChange(updatedIndustries);
  };
  
  const clearIndustries = () => {
    onIndustryChange([]);
  };

  return (
    <SharedActionBar
      searchTerm={searchTerm}
      onSearch={onSearch}
      searchPlaceholder="Search companies..."
      createUrl="/companies/create"
      createText="Add New Company"
      createIcon={<PlusCircle className="h-5 w-5" />}
      showSearch={true}
      filters={
        <div className="flex space-x-4 items-center">
          <div className="relative">
            <button 
              className="flex items-center px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600"
              onClick={() => setIsIndustryDropdownOpen(!isIndustryDropdownOpen)}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Industry
              <ChevronDown className="h-4 w-4 ml-2" />
            </button>
            
            {isIndustryDropdownOpen && (
              <div className="absolute z-10 mt-1 w-64 bg-white dark:bg-slate-800 rounded-md shadow-lg p-2 border border-slate-200 dark:border-slate-700">
                <div className="max-h-60 overflow-y-auto">
                  {INDUSTRY_OPTIONS.map((industry) => (
                    <div 
                      key={industry}
                      className="flex items-center p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded cursor-pointer"
                      onClick={() => toggleIndustry(industry)}
                    >
                      <input 
                        type="checkbox" 
                        checked={selectedIndustries.includes(industry)}
                        onChange={() => {}} // Handled by parent div click
                        className="mr-2"
                      />
                      <span>{industry}</span>
                    </div>
                  ))}
                </div>
                {selectedIndustries.length > 0 && (
                  <div className="border-t border-slate-200 dark:border-slate-700 mt-2 pt-2">
                    <button 
                      className="w-full text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center"
                      onClick={clearIndustries}
                    >
                      <X className="h-3 w-3 mr-1" /> Clear selections
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {selectedIndustries.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedIndustries.map(industry => (
                <span 
                  key={industry}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100"
                >
                  {industry}
                  <button 
                    onClick={() => toggleIndustry(industry)}
                    className="ml-1 text-orange-600 dark:text-orange-300 hover:text-orange-800 dark:hover:text-orange-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      }
    />
  );
};

export default ActionBar;
