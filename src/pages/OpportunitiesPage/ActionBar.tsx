import React from 'react';
import { PlusCircle, MapPin, Briefcase, Clock, Users, Handshake } from 'lucide-react';
import { ActionBar as SharedActionBar } from '@/shared/components/ui/PageLayout';
import { OpportunityType } from '@/features/opportunities/components/OpportunitiesList/types';
import { getOpportunityTypeLabel } from '@/features/opportunities/components/OpportunitiesList/utils';

interface ActionBarProps {
  searchTerm: string;
  onSearch: (value: string) => void;
  selectedType: OpportunityType | 'all';
  onTypeChange: (type: OpportunityType | 'all') => void;
  remoteFilter: boolean | 'all';
  onRemoteFilterChange: (remote: boolean | 'all') => void;
}

const ActionBar: React.FC<ActionBarProps> = ({
  searchTerm,
  onSearch,
  selectedType,
  onTypeChange,
  remoteFilter,
  onRemoteFilterChange
}) => {
  
  // Options for filter select elements
  const typeOptions: (OpportunityType | 'all')[] = ['all', 'full-time', 'part-time', 'contract', 'volunteer', 'internship'];
  
  // Get icon for opportunity type
  const getTypeIcon = (type: OpportunityType | 'all') => {
    switch (type) {
      case 'full-time':
        return <Briefcase className="h-4 w-4 mr-2" />;
      case 'part-time':
        return <Clock className="h-4 w-4 mr-2" />;
      case 'contract':
        return <Handshake className="h-4 w-4 mr-2" />;
      case 'volunteer':
        return <Users className="h-4 w-4 mr-2" />;
      case 'internship':
        return <Users className="h-4 w-4 mr-2" />;
      default:
        return <Briefcase className="h-4 w-4 mr-2" />;
    }
  };
  
  const handleSearch = (value: string) => {
    onSearch(value);
  };

  return (
    <SharedActionBar
      searchTerm={searchTerm}
      onSearch={handleSearch}
      searchPlaceholder="Search opportunities..."
      createUrl="/opportunities/create"
      createText="Post New Opportunity"
      createIcon={<PlusCircle className="h-5 w-5" />}
      showSearch={true}
      filters={
        <div className="flex flex-wrap gap-3 items-center">
          {/* Job Type Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-0">
            <button
              onClick={() => onTypeChange('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-sm
                ${selectedType === 'all'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg scale-105'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
            >
              <Briefcase className="h-4 w-4" />
              All Types
            </button>
            
            {typeOptions.filter(t => t !== 'all').map(type => (
              <button
                key={type}
                onClick={() => onTypeChange(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-sm
                  ${selectedType === type
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
              >
                {getTypeIcon(type)}
                {getOpportunityTypeLabel(type)}
              </button>
            ))}
          </div>
          
          {/* Experience Level Filter removed */}
          
          {/* Remote Filter */}
          <div className="relative">
            <select
              value={remoteFilter === 'all' ? 'all' : remoteFilter.toString()}
              onChange={(e) => {
                const value = e.target.value;
                onRemoteFilterChange(value === 'all' ? 'all' : value === 'true');
              }}
              className="appearance-none pl-10 pr-10 py-2 bg-white dark:bg-slate-800 rounded-lg text-sm shadow-sm border border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 transition-colors font-medium"
            >
              <option value="all">All Locations</option>
              <option value="true">Remote Only</option>
              <option value="false">On-site Only</option>
            </select>
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-500" />
          </div>
          
          {/* Additional filters can be added here in the future */}
        </div>
      }
    />
  );
};

export default ActionBar;
