import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extension-placeholder';
import { RichTextEditorProps } from './types';

const TiptapEditor = ({
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
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || 'Start typing...',
      }),
    ],
    content: value || '<p></p>',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      console.log('Tiptap editor updated:', html);
      onChange(html);
    },
    editable: !disabled,
  });

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
        className={`border border-slate-300 dark:border-slate-600 rounded-md 
                 bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
        style={{ minHeight: height }}
      >
        <div className="bg-green-100 p-2 text-sm text-green-800 mb-2">
          Tiptap Editor Test - This should work!
        </div>
        
        <EditorContent 
          editor={editor} 
          className="min-h-[200px] p-4 prose prose-sm max-w-full focus:outline-none"
        />
      </div>
      
      <style>{`
        .ProseMirror {
          outline: none;
          min-height: ${height};
          padding: 1rem;
        }
        
        .ProseMirror:focus {
          outline: 2px solid #3b82f6;
          outline-offset: -2px;
        }
        
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  );
};

export default TiptapEditor;