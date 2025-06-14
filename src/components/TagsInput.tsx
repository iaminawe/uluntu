import React, { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  label?: string;
  helperText?: string;
}

export const TagsInput: React.FC<TagsInputProps> = ({
  value = [],
  onChange,
  placeholder = 'Add a tag and press Enter',
  label,
  helperText,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (!value.includes(newTag)) {
        onChange([...value, newTag]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="min-h-[42px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500">
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-md text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-primary-900 focus:outline-none"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[120px] border-0 bg-transparent p-0 text-sm placeholder-gray-400 focus:outline-none focus:ring-0"
          />
        </div>
      </div>
      {helperText && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};