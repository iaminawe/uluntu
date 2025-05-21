import React from 'react';
import { PlusCircle, MapPin, Building2 } from 'lucide-react';
import { ActionBar as SharedActionBar } from '../../components/ui/PageLayout';

const ActionBar: React.FC = () => {
  // These would normally come from a hook or state
  const searchTerm = '';
  const handleSearch = (value: string) => {
    console.log('Searching for opportunities:', value);
    // This would normally update state or call a hook
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
        <div className="flex space-x-4 items-center">
          <button className="flex items-center px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 rounded-md">
            <MapPin className="h-4 w-4 mr-2" />
            Location
          </button>
          <button className="flex items-center px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 rounded-md">
            <Building2 className="h-4 w-4 mr-2" />
            Company
          </button>
        </div>
      }
    />
  );
};

export default ActionBar;
