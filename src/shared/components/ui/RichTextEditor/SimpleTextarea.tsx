import React from 'react';
import { RichTextEditorProps } from './types';

const SimpleTextarea = ({
  value,
  onChange,
  placeholder = 'Enter content here...',
  height = '200px',
  disabled = false,
  label,
  required = false,
  id,
  className = ''
}: RichTextEditorProps) => {
  console.log('SimpleTextarea rendering with:', { value, placeholder, height });

  return (
    <div className={className}>
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="bg-red-100 p-2 text-sm text-red-800 mb-2">
        Simple Textarea Test - This MUST work or there's a deeper issue
      </div>
      
      <textarea
        id={id}
        value={value || ''}
        onChange={(e) => {
          console.log('Textarea changed:', e.target.value);
          onChange(e.target.value);
        }}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full p-4 border border-slate-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        style={{ minHeight: height }}
        rows={8}
      />
      
      <div className="mt-2 text-xs text-slate-500">
        Value: "{value || 'empty'}" | Placeholder: "{placeholder}"
      </div>
    </div>
  );
};

export default SimpleTextarea;