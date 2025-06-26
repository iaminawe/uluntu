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
    case 'link':
      return 'Link';
    case 'gallery':
      return 'Gallery';
    default: {
      // This should never happen since we've covered all possible ResourceType values
      // But TypeScript needs this for type safety
      const unknownType = type as string;
      return unknownType.charAt(0).toUpperCase() + unknownType.slice(1);
    }
  }
};

interface ActionBarProps {
  onSearch?: (value: string) => void;
  onTypeChange?: (type: string) => void;
  currentFilters?: { search?: string; types?: string[] };
}

const ActionBar: React.FC<ActionBarProps> = ({ onSearch, onTypeChange, currentFilters }) => {
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<ResourceType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  
  // Resource types from the main application's Resource type
  const resourceTypes: ResourceType[] = ['document', 'video', 'guide', 'tool', 'article', 'link', 'gallery'];
  
  // Sample categories - would come from API in real implementation
  const categories = ['Guides', 'Tutorials', 'Research', 'Tools', 'Templates'];
  
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch?.(value);
  };
  
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedType(value as ResourceType | 'all');
    onTypeChange?.(value);
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
              onChange={handleTypeChange}
              className="appearance-none pl-9 pr-8 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md text-sm shadow-sm border border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 focus:border-orange-500 focus:ring focus:ring-orange-200 dark:focus:ring-orange-500/20 transition-colors font-medium"
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
              className="appearance-none pl-9 pr-8 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md text-sm shadow-sm border border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 focus:border-orange-500 focus:ring focus:ring-orange-200 dark:focus:ring-orange-500/20 transition-colors font-medium"
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
