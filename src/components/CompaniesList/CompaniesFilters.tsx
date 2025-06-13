import { Dispatch, SetStateAction } from 'react';
import { X, Building } from 'lucide-react';
import { FilterOptions, INDUSTRY_OPTIONS } from '@/features/companies/components/CompaniesList/types';

interface CompaniesFiltersProps {
  filters: FilterOptions;
  setFilters: Dispatch<SetStateAction<FilterOptions>>;
}

const CompaniesFilters = ({ filters, setFilters }: CompaniesFiltersProps) => {
  
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
  

  
  // Reset all filters
  const clearFilters = () => {
    setFilters(prev => ({ ...prev, industries: [] }));
  };



  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
          <Building className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          Filter by industry:
        </div>
        
        {filters.industries.length > 0 && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm"
          >
            Clear Filters <X className="h-4 w-4 ml-1" />
          </button>
        )}
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
  );
};



export default CompaniesFilters;
