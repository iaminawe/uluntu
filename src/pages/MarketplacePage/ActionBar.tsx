import React, { Dispatch, SetStateAction } from 'react';
import { PlusCircle, ShoppingBag, Briefcase, Monitor, Tag } from 'lucide-react';
import { ActionBar as SharedActionBar } from '../../components/ui/PageLayout';
import { ListingType, ListingCondition } from '../../components/MarketplaceList/types';
import { getTypeDisplayName, getConditionDisplayName } from '../../components/MarketplaceList/utils';

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
              className="appearance-none pl-9 pr-8 py-2 bg-slate-100 dark:bg-slate-700 rounded-md text-sm"
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
              className="appearance-none pl-9 pr-8 py-2 bg-slate-100 dark:bg-slate-700 rounded-md text-sm"
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
