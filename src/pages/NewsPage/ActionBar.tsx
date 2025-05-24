import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { PlusCircle, Tag, X } from 'lucide-react';
import { ActionBar as SharedActionBar } from '../../components/ui/PageLayout';
import { useNewsArticlesWithFilters } from '../../hooks/useSupabaseQueries';
import { extractTags } from '../../components/NewsArticlesList/utils';

interface ActionBarProps {
  searchTerm: string;
  onSearch: Dispatch<SetStateAction<string>>;
  selectedTags: string[];
  onTagsChange: Dispatch<SetStateAction<string[]>>;
}

const ActionBar: React.FC<ActionBarProps> = ({
  searchTerm,
  onSearch,
  selectedTags,
  onTagsChange
}) => {
  // State for dropdown UI
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  // Fetch articles to extract available tags
  const { data: articles = [] } = useNewsArticlesWithFilters({
    search: '',
    tags: undefined
  });
  
  // Extract available tags from articles
  useEffect(() => {
    if (articles && articles.length > 0) {
      setAvailableTags(extractTags(articles));
    }
  }, [articles]);
  
  const handleSearch = (value: string) => {
    onSearch(value);
  };
  
  // Handle tag selection
  const handleTagToggle = (tag: string) => {
    onTagsChange(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };
  
  // Clear all selected tags
  const clearTags = () => {
    onTagsChange([]);
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
        <div className="flex flex-wrap gap-3 items-center">
          {/* Tags Filter Button */}
          <div className="relative">
            <button 
              onClick={() => setShowTagsDropdown(!showTagsDropdown)}
              className="flex items-center px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 rounded-md"
            >
              <Tag className="h-4 w-4 mr-2" />
              Filter by Tags
              {selectedTags.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-orange-500 rounded-full">
                  {selectedTags.length}
                </span>
              )}
            </button>
            
            {/* Tags Dropdown */}
            {showTagsDropdown && (
              <div className="absolute z-10 mt-2 w-64 bg-white dark:bg-slate-800 rounded-md shadow-lg py-2 px-3 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Select Tags</h3>
                  {selectedTags.length > 0 && (
                    <button 
                      onClick={clearTags}
                      className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                
                <div className="max-h-60 overflow-y-auto">
                  {availableTags.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 py-2">No tags available</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => handleTagToggle(tag)}
                          className={`px-2 py-1 rounded-full text-xs font-medium transition-colors
                            ${selectedTags.includes(tag)
                              ? 'bg-orange-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                            }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Selected Tags Display */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              {selectedTags.map(tag => (
                <span 
                  key={tag} 
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300"
                >
                  {tag}
                  <button 
                    onClick={() => handleTagToggle(tag)}
                    className="ml-1 text-orange-500 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <button
                onClick={clearTags}
                className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      }
    />
  );
};

export default ActionBar;
