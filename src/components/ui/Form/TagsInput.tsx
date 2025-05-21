import React, { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { TagsInputProps } from './types';

/**
 * Reusable tags input component
 * Allows users to enter multiple tags with keyboard support
 */
const TagsInput: React.FC<TagsInputProps> = ({
  tags,
  onChange,
  label = 'Tags',
  helperText = 'Press Enter or comma to add a tag',
  disabled = false,
  required = false,
  placeholder = 'Add a tag...',
  maxTags,
  className = '',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Add a new tag
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (
      trimmedTag && 
      !tags.includes(trimmedTag) && 
      (!maxTags || tags.length < maxTags)
    ) {
      onChange([...tags, trimmedTag]);
    }
    setInputValue('');
  };

  // Remove a tag
  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle key presses
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove the last tag if backspace is pressed on an empty input
      removeTag(tags[tags.length - 1]);
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const pastedTags = pastedText
      .split(/,|\n/)
      .map(tag => tag.trim())
      .filter(tag => tag);
    
    // Add each pasted tag
    const newTags = [...tags];
    for (const tag of pastedTags) {
      if (!newTags.includes(tag) && (!maxTags || newTags.length < maxTags)) {
        newTags.push(tag);
      }
    }
    
    onChange(newTags);
  };

  // Handle input change for comma-separated values
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Check if the user entered a comma
    if (value.includes(',')) {
      const parts = value.split(',');
      // Add all parts except the last one as tags
      for (let i = 0; i < parts.length - 1; i++) {
        addTag(parts[i]);
      }
      // Set the last part as the current input value
      setInputValue(parts[parts.length - 1]);
    } else {
      setInputValue(value);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div
        className={`
          border border-slate-300 dark:border-slate-600 rounded-md 
          ${isFocused ? 'ring-2 ring-orange-500' : ''}
          p-2 flex flex-wrap gap-2 bg-white dark:bg-slate-800 min-h-[42px]
        `}
      >
        {/* Render existing tags */}
        {tags.map(tag => (
          <div 
            key={tag}
            className="flex items-center bg-orange-100 dark:bg-orange-900/30 
                     text-orange-800 dark:text-orange-300 rounded-md px-2 py-1 text-sm"
          >
            <span className="mr-1">{tag}</span>
            {!disabled && (
              <button 
                type="button"
                onClick={() => removeTag(tag)}
                className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
        
        {/* Input for new tags */}
        {(!maxTags || tags.length < maxTags) && (
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              if (inputValue) {
                addTag(inputValue);
              }
            }}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-grow min-w-[120px] border-0 p-1 bg-transparent focus:outline-none 
                     focus:ring-0 text-slate-700 dark:text-slate-300"
          />
        )}
      </div>
      
      {/* Helper text and counter */}
      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{helperText}</span>
        {maxTags && (
          <span>
            {tags.length} / {maxTags}
          </span>
        )}
      </div>
    </div>
  );
};

export default TagsInput;
