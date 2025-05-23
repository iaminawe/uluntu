import React from 'react';
import { PlusCircle, MapPin, Briefcase, Clock, Users, Handshake } from 'lucide-react';
import { ActionBar as SharedActionBar } from '../../components/ui/PageLayout';
import { OpportunityType } from '../../components/OpportunitiesList/types';
import { getOpportunityTypeLabel } from '../../components/OpportunitiesList/utils';

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
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center
                ${selectedType === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
            >
              <Briefcase className="h-4 w-4 mr-2" />
              All Types
            </button>
            
            {typeOptions.filter(t => t !== 'all').map(type => (
              <button
                key={type}
                onClick={() => onTypeChange(type)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center
                  ${selectedType === type
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
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
              className="appearance-none pl-9 pr-8 py-2 bg-slate-100 dark:bg-slate-700 rounded-md text-sm"
            >
              <option value="all">All Locations</option>
              <option value="true">Remote Only</option>
              <option value="false">On-site Only</option>
            </select>
            <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
          </div>
          
          {/* Additional filters can be added here in the future */}
        </div>
      }
    />
  );
};

export default ActionBar;
