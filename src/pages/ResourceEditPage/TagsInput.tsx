import { X } from 'lucide-react';
import { TagsInputProps } from './types';

const TagsInput: React.FC<TagsInputProps> = ({
  formData,
  handleChange,
  handleAddTag,
  handleRemoveTag
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        Tags
      </label>
      
      <div className="flex flex-wrap gap-2 mb-2">
        {formData.tags.map(tag => (
          <div 
            key={tag}
            className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 
                       px-3 py-1 rounded-full flex items-center text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      
      <div className="flex">
        <input
          type="text"
          name="newTag"
          value={formData.newTag}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-l-md 
                   bg-white dark:bg-slate-800 text-slate-900 dark:text-white 
                   focus:ring-2 focus:ring-orange-500"
          placeholder="Add a tag"
        />
        <button
          type="button"
          onClick={handleAddTag}
          className="px-4 py-2 bg-orange-500 text-white rounded-r-md 
                   hover:bg-orange-600 transition-colors"
        >
          Add
        </button>
      </div>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Tags help users find your resource
      </p>
    </div>
  );
};

export default TagsInput;
