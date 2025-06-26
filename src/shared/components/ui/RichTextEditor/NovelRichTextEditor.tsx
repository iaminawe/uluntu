import React from 'react';
import { EditorRoot, EditorContent } from 'novel';
import { type JSONContent } from 'novel';
import { RichTextEditorProps } from './types';
import { defaultExtensions } from './extensions';

const NovelRichTextEditor = ({
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
      
      <div 
        className={`novel-rich-text-editor border border-slate-300 dark:border-slate-600 rounded-md 
                 bg-white dark:bg-slate-700 text-slate-900 dark:text-white relative
                 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
        style={{ minHeight: height }}
      >
        <EditorRoot>
          <EditorContent
            extensions={defaultExtensions}
            initialContent={{
              type: 'doc',
              content: [{
                type: 'paragraph',
                content: []
              }]
            }}
            onUpdate={({ editor }) => {
              const html = editor.getHTML();
              console.log('Novel editor updated:', html);
              onChange(html);
            }}
            className="min-h-[200px] w-full p-4"
            editorProps={{
              attributes: {
                class: 'prose prose-sm max-w-full focus:outline-none min-h-[200px] p-2',
                'data-placeholder': placeholder || 'Type \'/\' for commands or start writing...',
              },
            }}
          />
        </EditorRoot>
      </div>
      
      <style>{`
        .novel-rich-text-editor .ProseMirror {
          outline: none;
          min-height: ${height};
        }
        
        .novel-rich-text-editor .ProseMirror:focus {
          outline: none;
        }
        
        .novel-rich-text-editor .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        
        .novel-rich-text-editor .ProseMirror-focused {
          outline: 2px solid #f97316;
          outline-offset: -2px;
          border-radius: 0.375rem;
        }
        
        /* Ensure proper styling for lists */
        .novel-rich-text-editor .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5rem;
        }
        
        .novel-rich-text-editor .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
        }
        
        /* Table styles */
        .novel-rich-text-editor .ProseMirror table {
          border-collapse: collapse;
          margin: 0;
          overflow: hidden;
          table-layout: fixed;
          width: 100%;
        }
        
        .novel-rich-text-editor .ProseMirror table td,
        .novel-rich-text-editor .ProseMirror table th {
          border: 1px solid #e5e7eb;
          padding: 0.5rem;
          vertical-align: top;
        }
        
        .dark .novel-rich-text-editor .ProseMirror table td,
        .dark .novel-rich-text-editor .ProseMirror table th {
          border-color: #374151;
        }
      `}</style>
    </div>
  );
};

export default NovelRichTextEditor;