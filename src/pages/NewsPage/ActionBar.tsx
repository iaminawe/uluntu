import React from 'react';
import { PlusCircle, Hash } from 'lucide-react';
import { ActionBar as SharedActionBar } from '../../components/ui/PageLayout';

const ActionBar: React.FC = () => {
  // These would normally come from a hook or state
  const searchTerm = '';
  const handleSearch = (value: string) => {
    console.log('Searching for articles:', value);
    // This would normally update state or call a hook
  };

  return (
    <SharedActionBar
      searchTerm={searchTerm}
      onSearch={handleSearch}
      searchPlaceholder="Search articles..."
      createUrl="/news/create"
      createText="Create New Article"
      createIcon={<PlusCircle className="h-5 w-5" />}
      showSearch={true}
      filters={
        <div className="flex space-x-4 items-center">
          <button className="flex items-center px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 rounded-md">
            <Hash className="h-4 w-4 mr-2" />
            Filter by Tags
          </button>
        </div>
      }
    />
  );
};

export default ActionBar;
