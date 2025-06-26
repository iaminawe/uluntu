import React, { Dispatch, SetStateAction } from 'react';
import { PlusCircle, ShoppingBag, Briefcase, Monitor, Tag } from 'lucide-react';
import { ActionBar as SharedActionBar } from '@/shared/components/ui/PageLayout';
import { ListingType, ListingCondition } from '@/features/marketplace/components/MarketplaceList/types';
import { getTypeDisplayName, getConditionDisplayName } from '@/features/marketplace/components/MarketplaceList/utils';

interface ActionBarProps {
  searchTerm: string;
  onSearch: Dispatch<SetStateAction<string>>;
  selectedType: ListingType | 'all';
  setSelectedType: Dispatch<SetStateAction<ListingType | 'all'>>;
  selectedCondition: ListingCondition | 'all';
  setSelectedCondition: Dispatch<SetStateAction<ListingCondition | 'all'>>;
}

const ActionBar: React.FC<ActionBarProps> = ({
  searchTerm,
  onSearch,
  selectedType,
  setSelectedType,
  selectedCondition,
  setSelectedCondition
}) => {
  
  // Available options for filters
  const types: ListingType[] = ['product', 'service', 'equipment'];
  const conditions: ListingCondition[] = ['new', 'like-new', 'good', 'fair', 'poor'];
  
  const handleSearch = (value: string) => {
    onSearch(value);
  };

  return (
    <SharedActionBar
      searchTerm={searchTerm}
      onSearch={handleSearch}
      searchPlaceholder="Search marketplace..."
      createUrl="/marketplace/create"
      createText="List New Item"
      createIcon={<PlusCircle className="h-5 w-5" />}
      showSearch={true}
      filters={
        <div className="flex flex-wrap gap-3 items-center">
          {/* Listing Type Filter */}
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as ListingType | 'all')}
              className="appearance-none pl-9 pr-8 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md text-sm shadow-sm border border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 focus:border-orange-500 focus:ring focus:ring-orange-200 dark:focus:ring-orange-500/20 transition-colors font-medium"
            >
              <option value="all">All Types</option>
              {types.map(type => (
                <option key={type} value={type}>{getTypeDisplayName(type)}</option>
              ))}
            </select>
            {selectedType === 'product' ? (
              <ShoppingBag className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
            ) : selectedType === 'service' ? (
              <Briefcase className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
            ) : (
              <Monitor className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
            )}
          </div>
          
          {/* Condition Filter */}
          <div className="relative">
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value as ListingCondition | 'all')}
              className="appearance-none pl-9 pr-8 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md text-sm shadow-sm border border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 focus:border-orange-500 focus:ring focus:ring-orange-200 dark:focus:ring-orange-500/20 transition-colors font-medium"
            >
              <option value="all">Any Condition</option>
              {conditions.map(condition => (
                <option key={condition} value={condition}>{getConditionDisplayName(condition)}</option>
              ))}
            </select>
            <Tag className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
          </div>
        </div>
      }
    />
  );
};

export default ActionBar;
