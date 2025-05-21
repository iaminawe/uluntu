import React from 'react';
import { PlusCircle, BookOpen, FileType2 } from 'lucide-react';
import { ActionBar as SharedActionBar } from '../../components/ui/PageLayout';

const ActionBar: React.FC = () => {
  // These would normally come from a hook or state
  const searchTerm = '';
  const handleSearch = (value: string) => {
    console.log('Searching for resources:', value);
    // This would normally update state or call a hook
  };

  return (
    <SharedActionBar
      searchTerm={searchTerm}
      onSearch={handleSearch}
      searchPlaceholder="Search resources..."
      createUrl="/resources/create"
      createText="Add New Resource"
      createIcon={<PlusCircle className="h-5 w-5" />}
      showSearch={true}
      filters={
        <div className="flex space-x-4 items-center">
          <button className="flex items-center px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 rounded-md">
            <BookOpen className="h-4 w-4 mr-2" />
            All Categories
          </button>
          <button className="flex items-center px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 rounded-md">
            <FileType2 className="h-4 w-4 mr-2" />
            Resource Type
          </button>
        </div>
      }
    />
  );
};

export default ActionBar;
