import React from 'react';
import { PlusCircle } from 'lucide-react';
import { ActionBar as SharedActionBar } from '../../components/ui/PageLayout';

const ActionBar: React.FC = () => {
  // This would normally come from a hook or state
  const searchTerm = '';
  const handleSearch = (value: string) => {
    console.log('Searching for:', value);
    // This would normally update state or call a hook
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
    />
  );
};

export default ActionBar;
