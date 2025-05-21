import React from 'react';
import { PlusCircle } from 'lucide-react';
import { ActionBar as SharedActionBar } from '../../components/ui/PageLayout';

const ActionBar: React.FC = () => {
  // These would normally come from a hook or state
  const searchTerm = '';
  const handleSearch = (value: string) => {
    console.log('Searching for groups:', value);
    // This would normally update state or call a hook
  };

  return (
    <SharedActionBar
      searchTerm={searchTerm}
      onSearch={handleSearch}
      searchPlaceholder="Search groups..."
      createUrl="/groups/create"
      createText="Create New Group"
      createIcon={<PlusCircle className="h-5 w-5" />}
      showSearch={true}
    />
  );
};

export default ActionBar;
