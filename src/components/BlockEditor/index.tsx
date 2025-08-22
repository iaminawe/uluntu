import React, { useCallback, useEffect, useState } from 'react';
import { useTheme } from '@/providers/EnhancedThemeProvider';

interface BlockEditorProps {
  content?: any;
  onChange?: (content: any) => void;
  onSave?: (content: any) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
  autoSave?: boolean;
  autoSaveDelay?: number;
  showToolbar?: boolean;
  showSideMenu?: boolean;
  uploadImage?: (file: File) => Promise<string>;
}

// Enhanced editor with rich text capabilities
export const BlockEditor: React.FC<BlockEditorProps> = ({
  content,
  onChange,
  onSave,
  placeholder = "Start typing...",
  editable = true,
  className = '',
  autoSave = false,
  autoSaveDelay = 2000,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [editorContent, setEditorContent] = useState<any[]>([]);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  
  const isDark = theme === 'dark';

  // Initialize content
  useEffect(() => {
    if (content) {
      if (Array.isArray(content)) {
        // Ensure each block has proper structure
        const normalizedContent = content.map(block => {
          // Handle different content formats
          let blockContent = '';
          
          if (typeof block.content === 'string') {
            blockContent = block.content;
          } else if (Array.isArray(block.content)) {
            // Extract text from nested content structure
            blockContent = block.content
              .map(item => {
                if (typeof item === 'string') return item;
                if (item?.text) return item.text;
                if (item?.content) return item.content;
                return '';
              })
              .join('');
          } else if (typeof block.content === 'object' && block.content?.text) {
            blockContent = block.content.text;
          }
          
          return {
            type: block.type || 'paragraph',
            content: blockContent
          };
        });
        setEditorContent(normalizedContent);
      } else if (typeof content === 'string') {
        try {
          const parsed = JSON.parse(content);
          setEditorContent(Array.isArray(parsed) ? parsed : [parsed]);
        } catch {
          // Convert plain text to blocks
          setEditorContent([
            { type: 'paragraph', content: content }
          ]);
        }
      } else if (typeof content === 'object') {
        setEditorContent([content]);
      }
    } else {
      // Start with an empty paragraph
      setEditorContent([
        { type: 'paragraph', content: '' }
      ]);
    }
  }, [content]);

  // Handle block content change
  const handleBlockChange = (index: number, newContent: string) => {
    const updatedContent = [...editorContent];
    updatedContent[index] = { ...updatedContent[index], content: newContent };
    setEditorContent(updatedContent);
    
    if (onChange) {
      onChange(updatedContent);
    }

    // Handle auto-save
    if (autoSave && onSave) {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      const timeout = setTimeout(async () => {
        setIsSaving(true);
        try {
          await onSave(updatedContent);
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
        setIsSaving(false);
      }, autoSaveDelay);

      setSaveTimeout(timeout);
    }
  };

  // Add new block
  const addBlock = (type: string, index?: number) => {
    const newBlock = { type, content: '' };
    const updatedContent = [...editorContent];
    
    if (index !== undefined) {
      updatedContent.splice(index + 1, 0, newBlock);
    } else {
      updatedContent.push(newBlock);
    }
    
    setEditorContent(updatedContent);
    if (onChange) onChange(updatedContent);
  };

  // Delete block
  const deleteBlock = (index: number) => {
    if (editorContent.length <= 1) return; // Keep at least one block
    
    const updatedContent = editorContent.filter((_, i) => i !== index);
    setEditorContent(updatedContent);
    if (onChange) onChange(updatedContent);
  };

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addBlock('paragraph', index);
    } else if (e.key === 'Backspace' && editorContent[index].content === '' && editorContent.length > 1) {
      e.preventDefault();
      deleteBlock(index);
    }
  };

  // Apply formatting
  const applyFormatting = (format: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    if (!selectedText) return;

    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        break;
      default:
        formattedText = selectedText;
    }

    document.execCommand('insertText', false, formattedText);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

  return (
    <div className={`block-editor-container relative ${className}`}>
      {isSaving && (
        <div className="absolute top-2 right-2 z-10 text-sm text-slate-500 dark:text-slate-400 bg-white/90 dark:bg-slate-800/90 px-2 py-1 rounded">
          Saving...
        </div>
      )}
      
      <div className={`border rounded-lg overflow-hidden transition-colors ${
        isDark 
          ? 'border-slate-600 bg-slate-800' 
          : 'border-slate-300 bg-white'
      }`}>
        {/* Toolbar */}
        {editable && (
          <div className={`border-b px-4 py-2 flex items-center space-x-2 transition-colors ${
            isDark 
              ? 'bg-slate-700 border-slate-600' 
              : 'bg-slate-50 border-slate-300'
          }`}>
            {/* Formatting buttons */}
            {[
              { action: 'bold', label: <strong>B</strong>, title: 'Bold (Ctrl+B)' },
              { action: 'italic', label: <em>I</em>, title: 'Italic (Ctrl+I)' },
              { action: 'code', label: '</>', title: 'Code', className: 'font-mono' }
            ].map(({ action, label, title, className = '' }) => (
              <button 
                key={action}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${className} ${
                  isDark 
                    ? 'text-slate-300 hover:bg-slate-600 hover:text-white' 
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
                onClick={() => applyFormatting(action)}
                title={title}
              >
                {label}
              </button>
            ))}
            
            <div className={`w-px h-6 ${isDark ? 'bg-slate-600' : 'bg-slate-300'}`} />
            
            {/* Block type buttons */}
            {[
              { type: 'heading', label: 'H', title: 'Add Heading' },
              { type: 'bulletList', label: '• List', title: 'Add List' },
              { type: 'quote', label: '" Quote', title: 'Add Quote' }
            ].map(({ type, label, title }) => (
              <button 
                key={type}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  isDark 
                    ? 'text-slate-300 hover:bg-slate-600 hover:text-white' 
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
                onClick={() => addBlock(type, selectedBlockIndex ?? editorContent.length - 1)}
                title={title}
              >
                {label}
              </button>
            ))}
            
            {/* Theme toggle */}
            <div className={`w-px h-6 ${isDark ? 'bg-slate-600' : 'bg-slate-300'}`} />
            <button 
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                isDark 
                  ? 'text-slate-300 hover:bg-slate-600 hover:text-white' 
                  : 'text-slate-700 hover:bg-slate-200'
              }`}
              onClick={toggleTheme}
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        )}

        {/* Content Blocks */}
        <div className="p-4 space-y-2 min-h-[400px]">
          {editorContent.map((block, index) => (
            <div 
              key={index} 
              className="block-item group relative"
              onFocus={() => setSelectedBlockIndex(index)}
              onBlur={() => setSelectedBlockIndex(null)}
            >
              {/* Block Type Indicator & Controls */}
              {editable && (
                <div className="absolute -left-8 top-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                  <button
                    className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1"
                    onClick={() => deleteBlock(index)}
                    title="Delete block"
                  >
                    ×
                  </button>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {block.type === 'heading' ? 'H' : 
                     block.type === 'bulletList' ? '•' :
                     block.type === 'quote' ? '"' : '¶'}
                  </span>
                </div>
              )}

              {/* Block Content */}
              {block.type === 'heading' ? (
                <input
                  type="text"
                  value={block.content || ''}
                  onChange={(e) => handleBlockChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  placeholder="Heading..."
                  disabled={!editable}
                  className={`w-full text-2xl font-bold outline-none bg-transparent transition-colors ${
                    isDark 
                      ? 'text-slate-100 placeholder-slate-500' 
                      : 'text-slate-900 placeholder-slate-400'
                  }`}
                />
              ) : block.type === 'bulletList' ? (
                <div className="flex items-start">
                  <span className={`mr-2 mt-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>•</span>
                  <input
                    type="text"
                    value={block.content || ''}
                    onChange={(e) => handleBlockChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    placeholder="List item..."
                    disabled={!editable}
                    className={`flex-1 outline-none bg-transparent transition-colors ${
                      isDark 
                        ? 'text-slate-300 placeholder-slate-500' 
                        : 'text-slate-700 placeholder-slate-400'
                    }`}
                  />
                </div>
              ) : block.type === 'quote' ? (
                <blockquote className={`border-l-4 pl-4 italic ${
                  isDark ? 'border-slate-600' : 'border-slate-300'
                }`}>
                  <input
                    type="text"
                    value={block.content || ''}
                    onChange={(e) => handleBlockChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    placeholder="Quote..."
                    disabled={!editable}
                    className={`w-full outline-none bg-transparent italic transition-colors ${
                      isDark 
                        ? 'text-slate-400 placeholder-slate-500' 
                        : 'text-slate-600 placeholder-slate-400'
                    }`}
                  />
                </blockquote>
              ) : (
                <textarea
                  value={block.content || ''}
                  onChange={(e) => handleBlockChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  placeholder="Type something..."
                  disabled={!editable}
                  className={`w-full outline-none bg-transparent resize-none transition-colors ${
                    isDark 
                      ? 'text-slate-300 placeholder-slate-500' 
                      : 'text-slate-700 placeholder-slate-400'
                  }`}
                  rows={1}
                  style={{
                    minHeight: '24px',
                    height: 'auto',
                    overflow: 'hidden'
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = target.scrollHeight + 'px';
                  }}
                />
              )}
            </div>
          ))}

          {/* Add block button */}
          {editable && (
            <button
              className={`w-full py-2 text-sm rounded transition-colors ${
                isDark 
                  ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-700' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
              onClick={() => addBlock('paragraph')}
            >
              + Add block (or press Enter)
            </button>
          )}
        </div>
      </div>

      {/* Help text */}
      {editable && (
        <div className={`mt-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          <p>Tips: Press Enter to create a new block • Click 🌙/☀️ to toggle theme • Hover over blocks to see controls</p>
        </div>
      )}

      {/* JSON Preview (for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4">
          <summary className={`text-xs cursor-pointer ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            View JSON
          </summary>
          <pre className={`mt-2 p-2 rounded text-xs overflow-auto transition-colors ${
            isDark 
              ? 'bg-slate-700 text-slate-200' 
              : 'bg-slate-100 text-slate-800'
          }`}>
            {JSON.stringify(editorContent, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default BlockEditor;