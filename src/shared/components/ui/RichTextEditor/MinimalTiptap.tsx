import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { RichTextEditorProps } from './types';

const MinimalTiptap = ({
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
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
    ],
    content: value || '<p></p>',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      console.log('Minimal Tiptap updated:', html);
      onChange(html);
    },
    editable: !disabled,
    immediatelyRender: false,
  });

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '<p></p>');
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div className={className}>
        <div className="bg-yellow-100 p-2 text-sm text-yellow-800 mb-2">
          Editor is loading...
        </div>
        <div className="w-full h-32 bg-gray-100 border border-gray-300 rounded animate-pulse"></div>
      </div>
    );
  }

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
      
      <div className="bg-blue-100 p-2 text-sm text-blue-800 mb-2">
        Minimal Tiptap Editor - Click in the bordered area below to edit
      </div>
      
      <div 
        className="border-2 border-blue-500 rounded-md bg-white"
        style={{ minHeight: height }}
      >
        <EditorContent 
          editor={editor}
          className="tiptap-editor"
        />
      </div>
      
      <div className="mt-2 text-xs text-slate-500">
        Editor Status: {editor ? 'Ready' : 'Loading'} | 
        Content Length: {value?.length || 0} characters
      </div>

      <style>{`
        .tiptap-editor .ProseMirror {
          padding: 16px !important;
          min-height: ${height} !important;
          outline: none !important;
          border: none !important;
          background: white !important;
          font-family: system-ui, -apple-system, sans-serif !important;
          font-size: 14px !important;
          line-height: 1.5 !important;
          color: #1f2937 !important;
        }
        
        .tiptap-editor .ProseMirror:focus {
          outline: none !important;
          box-shadow: none !important;
        }
        
        .tiptap-editor .ProseMirror p {
          margin: 0 0 8px 0 !important;
        }
        
        .tiptap-editor .ProseMirror h1 {
          font-size: 24px !important;
          font-weight: bold !important;
          margin: 16px 0 8px 0 !important;
        }
        
        .tiptap-editor .ProseMirror h2 {
          font-size: 20px !important;
          font-weight: bold !important;
          margin: 12px 0 6px 0 !important;
        }
        
        .tiptap-editor .ProseMirror strong {
          font-weight: bold !important;
        }
        
        .tiptap-editor .ProseMirror em {
          font-style: italic !important;
        }
        
        .tiptap-editor .ProseMirror ul {
          list-style-type: disc !important;
          margin-left: 20px !important;
          margin-bottom: 8px !important;
        }
        
        .tiptap-editor .ProseMirror ol {
          list-style-type: decimal !important;
          margin-left: 20px !important;
          margin-bottom: 8px !important;
        }
        
        .tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
          content: "${placeholder}" !important;
          color: #9ca3af !important;
          pointer-events: none !important;
          float: left !important;
          height: 0 !important;
        }
      `}</style>
    </div>
  );
};

export default MinimalTiptap;