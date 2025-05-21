import { Plus, Tag, X } from 'lucide-react';
import { TagsSectionProps } from './types';

const TagsSection = ({
  tags,
  newTag,
  handleTagChange,
  handleAddTag,
  handleRemoveTag,
  isSubmitting
}: TagsSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-slate-800 dark:text-white">
        Tags
      </h3>
      
      <div className="flex mb-3">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Tag className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={newTag}
            onChange={handleTagChange}
            disabled={isSubmitting}
            className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-l-md 
                    bg-white dark:bg-slate-800 text-slate-900 dark:text-white 
                    focus:ring-2 focus:ring-orange-500"
            placeholder="Add tags (e.g., laptop, furniture, design)"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
          />
        </div>
        <button
          type="button"
          onClick={handleAddTag}
          disabled={!newTag.trim() || isSubmitting}
          className={`px-4 py-2 bg-orange-500 text-white rounded-r-md
                  hover:bg-orange-600 transition-colors flex items-center
                  ${(!newTag.trim() || isSubmitting) ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
      
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <div
              key={index}
              className="flex items-center bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 
                       px-3 py-1 rounded-full"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                disabled={isSubmitting}
                className="ml-1 text-slate-500 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Add tags to help buyers find your listing.
        </p>
      )}
    </div>
  );
};

export default TagsSection;
