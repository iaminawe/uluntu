import React, { useState, useRef, useEffect } from 'react';
import { Edit3, Check, X } from 'lucide-react';
import { useContent } from '@/shared/contexts/ContentContext';

interface EditableTextProps {
  pageId?: string;
  sectionId?: string;
  content: Record<string, string> | string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  field?: 'title' | 'description';
  multiline?: boolean;
  placeholder?: string;
}

export const EditableText: React.FC<EditableTextProps> = ({
  pageId,
  sectionId,
  content,
  className = '',
  as: Component = 'div',
  field,
  multiline = false,
  placeholder = 'Click to edit...'
}) => {
  const { 
    isEditMode, 
    currentLanguage, 
    getLocalizedContent, 
    updatePageContent, 
    updateSectionContent 
  } = useContent();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const displayText = typeof content === 'string' 
    ? content 
    : getLocalizedContent(content);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEdit = () => {
    if (!isEditMode) return;
    setEditValue(displayText);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (pageId && field) {
      updatePageContent({
        pageId,
        field,
        language: currentLanguage,
        content: editValue
      });
    } else if (sectionId) {
      updateSectionContent({
        sectionId,
        language: currentLanguage,
        content: editValue
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue('');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    const InputComponent = multiline ? 'textarea' : 'input';
    return (
      <div className="relative group">
        <InputComponent
          ref={inputRef as unknown}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`${className} border-2 border-blue-500 bg-white dark:bg-slate-800 rounded px-2 py-1 w-full resize-none`}
          placeholder={placeholder}
          rows={multiline ? 3 : undefined}
        />
        <div className="absolute -right-2 -top-2 flex gap-1">
          <button
            onClick={handleSave}
            className="p-1 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
            title="Save"
          >
            <Check className="h-3 w-3" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            title="Cancel"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <Component
      className={`${className} ${isEditMode ? 'relative group cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded px-2 py-1 transition-colors' : ''}`}
      onClick={handleEdit}
    >
      {displayText || (isEditMode ? placeholder : '')}
      {isEditMode && (
        <Edit3 className="absolute -right-2 -top-2 h-4 w-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-800 rounded-full p-0.5" />
      )}
    </Component>
  );
};
