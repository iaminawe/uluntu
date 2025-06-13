import React, { useState } from 'react';
import { PlusCircle, FileType2, Tag } from 'lucide-react';
import { ActionBar as SharedActionBar } from '@/shared/components/ui/PageLayout';
import { Resource } from '../../types';
// Create a type alias for the Resource type property
type ResourceType = Resource['type'];

// Helper function to get a display label for each resource type
const getResourceTypeLabel = (type: ResourceType): string => {
  switch (type) {
    case 'document':
      return 'Document';
    case 'video':
      return 'Video';
    case 'guide':
      return 'Guide';
    case 'tool':
      return 'Tool';
    case 'article':
      return 'Article';
    default: {
      // This should never happen since we've covered all possible ResourceType values
      // But TypeScript needs this for type safety
      const unknownType = type as string;
      return unknownType.charAt(0).toUpperCase() + unknownType.slice(1);
    }
  }
};

const ActionBar: React.FC = () => {
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<ResourceType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  
  // Resource types from the main application's Resource type
  const resourceTypes: ResourceType[] = ['document', 'video', 'guide', 'tool', 'article'];
  
  // Sample categories - would come from API in real implementation
  const categories = ['Guides', 'Tutorials', 'Research', 'Tools', 'Templates'];
  
  const handleSearch = (value: string) => {
    console.log('Searching for resources:', value);
    setSearchTerm(value);
    // This would normally update state or call a hook to filter data
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
        <div className="flex flex-wrap gap-3 items-center">
          {/* Resource Type Filter */}
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as ResourceType | 'all')}
              className="appearance-none pl-9 pr-8 py-2 bg-slate-100 dark:bg-slate-700 rounded-md text-sm"
            >
              <option value="all">All Types</option>
              {resourceTypes.map(type => (
                <option key={type} value={type}>{getResourceTypeLabel(type)}</option>
              ))}
            </select>
            <FileType2 className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
          </div>
          
          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2 bg-slate-100 dark:bg-slate-700 rounded-md text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
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
