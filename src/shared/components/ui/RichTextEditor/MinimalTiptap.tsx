import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import GlobalDragHandle from 'tiptap-extension-global-drag-handle';
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
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashPosition, setSlashPosition] = useState<{ top: number; left: number } | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Type \'/\' for commands or start writing...',
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      GlobalDragHandle,
    ],
    content: value || '<p></p>',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      
      // Check for slash command
      const { from } = editor.state.selection;
      const textBefore = editor.state.doc.textBetween(from - 1, from);
      
      if (textBefore === '/') {
        // Show slash menu
        const coords = editor.view.coordsAtPos(from);
        setSlashPosition({
          top: coords.bottom + 5,
          left: coords.left
        });
        setShowSlashMenu(true);
      } else {
        setShowSlashMenu(false);
        setSlashPosition(null);
      }
    },
    editable: !disabled,
    immediatelyRender: false,
  });

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };



  const handleSlashCommand = (command: string) => {
    if (!editor) return;
    
    const { from } = editor.state.selection;
    
    // Delete the slash
    editor.chain().focus().deleteRange({ from: from - 1, to: from }).run();
    
    // Execute command
    switch (command) {
      case 'heading1':
        editor.chain().focus().setHeading({ level: 1 }).run();
        break;
      case 'heading2':
        editor.chain().focus().setHeading({ level: 2 }).run();
        break;
      case 'heading3':
        editor.chain().focus().setHeading({ level: 3 }).run();
        break;
      case 'bulletList':
        editor.chain().focus().toggleBulletList().run();
        break;
      case 'orderedList':
        editor.chain().focus().toggleOrderedList().run();
        break;
      case 'blockquote':
        editor.chain().focus().toggleBlockquote().run();
        break;
      case 'image':
        addImage();
        break;
      default:
        editor.chain().focus().setParagraph().run();
    }
    
    setShowSlashMenu(false);
    setSlashPosition(null);
  };

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
      
      
      <div 
        className="border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 relative overflow-visible"
        style={{ minHeight: height }}
      >
        <EditorContent 
          editor={editor}
          className="tiptap-editor"
        />
        
        {/* Selection Toolbar (Bubble Menu) */}
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="bg-gray-900 text-white rounded-lg shadow-lg px-2 py-1 flex items-center space-x-1"
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-2 py-1 rounded text-sm font-medium hover:bg-gray-700 ${
              editor.isActive('bold') ? 'bg-gray-700' : ''
            }`}
          >
            <strong>B</strong>
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-2 py-1 rounded text-sm font-medium hover:bg-gray-700 ${
              editor.isActive('italic') ? 'bg-gray-700' : ''
            }`}
          >
            <em>I</em>
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`px-2 py-1 rounded text-sm font-medium hover:bg-gray-700 ${
              editor.isActive('strike') ? 'bg-gray-700' : ''
            }`}
          >
            <span style={{ textDecoration: 'line-through' }}>S</span>
          </button>
          
          <div className="w-px h-4 bg-gray-600 mx-1"></div>
          
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`px-2 py-1 rounded text-sm font-medium hover:bg-gray-700 ${
              editor.isActive('heading', { level: 1 }) ? 'bg-gray-700' : ''
            }`}
          >
            H1
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-2 py-1 rounded text-sm font-medium hover:bg-gray-700 ${
              editor.isActive('heading', { level: 2 }) ? 'bg-gray-700' : ''
            }`}
          >
            H2
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-2 py-1 rounded text-sm font-medium hover:bg-gray-700 ${
              editor.isActive('heading', { level: 3 }) ? 'bg-gray-700' : ''
            }`}
          >
            H3
          </button>
          
          <div className="w-px h-4 bg-gray-600 mx-1"></div>
          
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-2 py-1 rounded text-sm font-medium hover:bg-gray-700 ${
              editor.isActive('bulletList') ? 'bg-gray-700' : ''
            }`}
          >
            •
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-2 py-1 rounded text-sm font-medium hover:bg-gray-700 ${
              editor.isActive('orderedList') ? 'bg-gray-700' : ''
            }`}
          >
            1.
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`px-2 py-1 rounded text-sm font-medium hover:bg-gray-700 ${
              editor.isActive('blockquote') ? 'bg-gray-700' : ''
            }`}
          >
            "
          </button>
          
          <div className="w-px h-4 bg-gray-600 mx-1"></div>
          
          <button
            onClick={addImage}
            className="px-2 py-1 rounded text-sm font-medium hover:bg-gray-700"
          >
            🖼️
          </button>
        </BubbleMenu>
      </div>
      
      {/* Slash Command Menu */}
      {showSlashMenu && slashPosition && (
        <div 
          className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-64"
          style={{ 
            top: slashPosition.top, 
            left: slashPosition.left,
            position: 'fixed'
          }}
        >
          <div className="text-xs text-gray-500 mb-2 px-2">Choose a block type:</div>
          
          <button
            className="w-full text-left px-2 py-2 hover:bg-blue-50 rounded flex items-center space-x-3"
            onClick={() => handleSlashCommand('paragraph')}
          >
            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-sm">¶</div>
            <div>
              <div className="font-medium text-sm">Text</div>
              <div className="text-xs text-gray-500">Plain text paragraph</div>
            </div>
          </button>
          
          <button
            className="w-full text-left px-2 py-2 hover:bg-blue-50 rounded flex items-center space-x-3"
            onClick={() => handleSlashCommand('heading1')}
          >
            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-sm font-bold">H1</div>
            <div>
              <div className="font-medium text-sm">Heading 1</div>
              <div className="text-xs text-gray-500">Large section heading</div>
            </div>
          </button>
          
          <button
            className="w-full text-left px-2 py-2 hover:bg-blue-50 rounded flex items-center space-x-3"
            onClick={() => handleSlashCommand('heading2')}
          >
            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-sm font-bold">H2</div>
            <div>
              <div className="font-medium text-sm">Heading 2</div>
              <div className="text-xs text-gray-500">Medium section heading</div>
            </div>
          </button>
          
          <button
            className="w-full text-left px-2 py-2 hover:bg-blue-50 rounded flex items-center space-x-3"
            onClick={() => handleSlashCommand('bulletList')}
          >
            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-sm">•</div>
            <div>
              <div className="font-medium text-sm">Bullet List</div>
              <div className="text-xs text-gray-500">Unordered list with bullets</div>
            </div>
          </button>
          
          <button
            className="w-full text-left px-2 py-2 hover:bg-blue-50 rounded flex items-center space-x-3"
            onClick={() => handleSlashCommand('orderedList')}
          >
            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-sm">1.</div>
            <div>
              <div className="font-medium text-sm">Numbered List</div>
              <div className="text-xs text-gray-500">Ordered list with numbers</div>
            </div>
          </button>
          
          <button
            className="w-full text-left px-2 py-2 hover:bg-blue-50 rounded flex items-center space-x-3"
            onClick={() => handleSlashCommand('blockquote')}
          >
            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-sm">"</div>
            <div>
              <div className="font-medium text-sm">Quote</div>
              <div className="text-xs text-gray-500">Block quotation</div>
            </div>
          </button>
          
          <button
            className="w-full text-left px-2 py-2 hover:bg-blue-50 rounded flex items-center space-x-3"
            onClick={() => handleSlashCommand('image')}
          >
            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-sm">🖼️</div>
            <div>
              <div className="font-medium text-sm">Image</div>
              <div className="text-xs text-gray-500">Add an image from URL</div>
            </div>
          </button>
        </div>
      )}


      <style>{`
        .tiptap-editor {
          position: relative;
        }
        
        .tiptap-editor .ProseMirror {
          padding: 16px !important;
          padding-left: 40px !important;
          min-height: ${height} !important;
          outline: none !important;
          border: none !important;
          background: white !important;
          font-family: system-ui, -apple-system, sans-serif !important;
          font-size: 14px !important;
          line-height: 1.5 !important;
          color: #1f2937 !important;
          position: relative !important;
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
        
        .tiptap-editor .ProseMirror blockquote {
          border-left: 4px solid #e5e7eb !important;
          padding-left: 16px !important;
          margin: 16px 0 !important;
          font-style: italic !important;
          color: #6b7280 !important;
        }
        
        .tiptap-editor .ProseMirror img {
          max-width: 100% !important;
          height: auto !important;
          border-radius: 8px !important;
          margin: 16px 0 !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
        }
        
        .tiptap-editor .ProseMirror img.ProseMirror-selectednode {
          outline: 2px solid #3b82f6 !important;
          outline-offset: 2px !important;
        }
        
        /* Dragging styles */
        .tiptap-editor .ProseMirror .dragging {
          opacity: 0.5 !important;
        }
        
        .tiptap-editor .ProseMirror .drag-over {
          border-top: 2px solid #3b82f6 !important;
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