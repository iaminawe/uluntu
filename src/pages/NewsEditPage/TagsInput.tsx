import { KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';
import { TagsInputProps } from './types';

const TagsInput: React.FC<TagsInputProps> = ({ 
  tags, 
  newTag, 
  setNewTag, 
  handleAddTag,
  handleRemoveTag,
  errors
}) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        Tags
      </label>
      
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map(tag => (
          <div 
            key={tag}
            className="flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-700 
                      text-slate-700 dark:text-slate-300 rounded-full text-sm"
          >
            {tag}
            <button 
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      
      <div className="flex">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add tag..."
          className="flex-1 block w-full rounded-l-lg border-slate-300 dark:border-slate-600 
                    dark:bg-slate-800 dark:text-white shadow-sm focus:border-orange-500 
                    focus:ring-orange-500 sm:text-sm"
        />
        <button
          type="button"
          onClick={handleAddTag}
          className="inline-flex items-center justify-center px-4 py-2 bg-orange-500 
                    text-white rounded-r-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {errors.tags && (
        <p className="mt-1 text-sm text-red-600">{errors.tags}</p>
      )}
    </div>
  );
};

export default TagsInput;
