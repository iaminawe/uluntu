import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/providers/EnhancedThemeProvider';
import { 
  Edit3, 
  Type, 
  List, 
  Quote, 
  Image as ImageIcon, 
  Plus,
  Trash2,
  Move,
  Eye,
  Edit
} from 'lucide-react';

interface Block {
  id: string;
  type: 'heading' | 'paragraph' | 'bulletList' | 'quote' | 'image';
  content: string;
  level?: number; // for headings
  imageUrl?: string; // for images
}

interface VisualPageEditorProps {
  content?: any[];
  onChange?: (content: Block[]) => void;
  onSave?: (content: Block[]) => void;
  className?: string;
  editable?: boolean;
}

export const VisualPageEditor: React.FC<VisualPageEditorProps> = ({
  content = [],
  onChange,
  onSave,
  className = '',
  editable = true
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const [dragOverBlock, setDragOverBlock] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Initialize blocks from content
  useEffect(() => {
    if (content && content.length > 0) {
      const normalizedBlocks: Block[] = content.map((block, index) => ({
        id: block.id || `block-${Date.now()}-${index}`,
        type: block.type || 'paragraph',
        content: typeof block.content === 'string' ? block.content : '',
        level: block.level || (block.type === 'heading' ? 1 : undefined),
        imageUrl: block.imageUrl
      }));
      setBlocks(normalizedBlocks);
    } else {
      setBlocks([{
        id: `block-${Date.now()}`,
        type: 'paragraph',
        content: 'Click to start editing...'
      }]);
    }
  }, [content]);

  // Focus input when editing starts
  useEffect(() => {
    if (editingBlock && editInputRef.current) {
      editInputRef.current.focus();
      if (editInputRef.current instanceof HTMLInputElement) {
        editInputRef.current.select();
      }
    }
  }, [editingBlock]);

  // Handle block content change
  const updateBlock = (id: string, updates: Partial<Block>) => {
    const updatedBlocks = blocks.map(block => 
      block.id === id ? { ...block, ...updates } : block
    );
    setBlocks(updatedBlocks);
    
    // Call onChange immediately for live updates
    onChange?.(updatedBlocks);
  };

  // Add new block
  const addBlock = (afterId: string, type: Block['type'] = 'paragraph') => {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type,
      content: '',
      level: type === 'heading' ? 1 : undefined
    };
    
    const afterIndex = blocks.findIndex(b => b.id === afterId);
    const updatedBlocks = [
      ...blocks.slice(0, afterIndex + 1),
      newBlock,
      ...blocks.slice(afterIndex + 1)
    ];
    
    setBlocks(updatedBlocks);
    setEditingBlock(newBlock.id);
    onChange?.(updatedBlocks);
  };

  // Delete block
  const deleteBlock = (id: string) => {
    if (blocks.length <= 1) return;
    const updatedBlocks = blocks.filter(b => b.id !== id);
    setBlocks(updatedBlocks);
    onChange?.(updatedBlocks);
  };

  // Start editing a block
  const startEditing = (id: string) => {
    if (!editable) return;
    setEditingBlock(id);
    setIsPreviewMode(false);
  };

  // Stop editing
  const stopEditing = () => {
    setEditingBlock(null);
  };

  // Handle key events in edit mode
  const handleKeyDown = (e: React.KeyboardEvent, blockId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      stopEditing();
      addBlock(blockId);
    } else if (e.key === 'Escape') {
      stopEditing();
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, blockId: string) => {
    setDraggedBlock(blockId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
  };

  const handleDragOver = (e: React.DragEvent, blockId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverBlock(blockId);
  };

  const handleDragLeave = () => {
    setDragOverBlock(null);
  };

  const handleDrop = (e: React.DragEvent, dropBlockId: string) => {
    e.preventDefault();
    if (draggedBlock && draggedBlock !== dropBlockId) {
      const dragIndex = blocks.findIndex(b => b.id === draggedBlock);
      const dropIndex = blocks.findIndex(b => b.id === dropBlockId);
      
      if (dragIndex !== -1 && dropIndex !== -1) {
        const newBlocks = [...blocks];
        const [moved] = newBlocks.splice(dragIndex, 1);
        newBlocks.splice(dropIndex, 0, moved);
        setBlocks(newBlocks);
        onChange?.(newBlocks);
      }
    }
    setDraggedBlock(null);
    setDragOverBlock(null);
  };

  const handleDragEnd = () => {
    setDraggedBlock(null);
    setDragOverBlock(null);
  };

  // Render block in preview mode
  const renderPreviewBlock = (block: Block) => {
    const baseClasses = `
      relative group transition-all duration-200 rounded-lg
      ${hoveredBlock === block.id && editable ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
      ${draggedBlock === block.id ? 'opacity-50' : ''}
      ${dragOverBlock === block.id ? 'ring-2 ring-green-400 ring-opacity-70 bg-green-50 dark:bg-green-900/20' : ''}
      ${editable ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50' : ''}
      p-2 -m-2
    `;

    const content = (() => {
      switch (block.type) {
        case 'heading':
          const HeadingTag = `h${Math.min(block.level || 1, 6)}` as keyof JSX.IntrinsicElements;
          return (
            <HeadingTag className={`font-bold leading-tight ${
              block.level === 1 ? 'text-4xl mb-4' :
              block.level === 2 ? 'text-3xl mb-3' :
              block.level === 3 ? 'text-2xl mb-2' :
              'text-xl mb-2'
            } ${isDark ? 'text-gray-100' : 'text-gray-900'} ${
              !block.content ? 'text-gray-400 dark:text-gray-600' : ''
            }`}>
              {block.content || 'Click to add heading...'}
            </HeadingTag>
          );
        
        case 'bulletList':
          return (
            <div className="flex items-start mb-2">
              <span className={`mr-3 mt-1 text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>•</span>
              <p className={`leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'} ${
                !block.content ? 'text-gray-400 dark:text-gray-600' : ''
              }`}>
                {block.content || 'Click to add list item...'}
              </p>
            </div>
          );
        
        case 'quote':
          return (
            <blockquote className={`border-l-4 pl-6 py-2 italic text-lg leading-relaxed mb-4 ${
              isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
            } ${!block.content ? 'text-gray-400 dark:text-gray-600' : ''}`}>
              {block.content || 'Click to add quote...'}
            </blockquote>
          );
        
        case 'image':
          return block.imageUrl ? (
            <img 
              src={block.imageUrl} 
              alt={block.content || 'Image'} 
              className="max-w-full h-auto rounded-lg"
            />
          ) : (
            <div className={`border-2 border-dashed rounded-lg p-8 text-center ${
              isDark ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'
            }`}>
              <ImageIcon className="mx-auto mb-2 h-8 w-8" />
              <p>Click to add image...</p>
            </div>
          );
        
        default: // paragraph
          return (
            <p className={`leading-relaxed text-base mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'} ${
              !block.content ? 'text-gray-400 dark:text-gray-600' : ''
            }`}>
              {block.content || 'Click to add text...'}
            </p>
          );
      }
    })();

    return (
      <div
        className={baseClasses}
        draggable={editable}
        onMouseEnter={() => setHoveredBlock(block.id)}
        onMouseLeave={() => setHoveredBlock(null)}
        onClick={() => startEditing(block.id)}
        onDragStart={(e) => handleDragStart(e, block.id)}
        onDragOver={(e) => handleDragOver(e, block.id)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, block.id)}
        onDragEnd={handleDragEnd}
      >
        {content}
        
        {/* Block Controls */}
        {editable && hoveredBlock === block.id && (
          <div className="absolute -right-2 -top-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                startEditing(block.id);
              }}
              className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow-lg"
              title="Edit block"
            >
              <Edit3 className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteBlock(block.id);
              }}
              className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
              title="Delete block"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}
        
        {/* Add Block Button */}
        {editable && hoveredBlock === block.id && (
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center space-x-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addBlock(block.id, 'paragraph');
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400"
                title="Add paragraph"
              >
                <Type className="h-3 w-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addBlock(block.id, 'heading');
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400"
                title="Add heading"
              >
                <span className="text-xs font-bold">H</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addBlock(block.id, 'bulletList');
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400"
                title="Add list"
              >
                <List className="h-3 w-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addBlock(block.id, 'quote');
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400"
                title="Add quote"
              >
                <Quote className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render block in edit mode
  const renderEditBlock = (block: Block) => {
    const isMultiline = block.type === 'paragraph' || block.type === 'quote';
    
    const inputClasses = `
      w-full bg-transparent border-2 border-blue-400 rounded-lg p-3 outline-none
      ${isDark ? 'text-gray-100' : 'text-gray-900'}
      ${block.type === 'heading' ? `font-bold ${
        block.level === 1 ? 'text-3xl' :
        block.level === 2 ? 'text-2xl' :
        block.level === 3 ? 'text-xl' :
        'text-lg'
      }` : ''}
      ${block.type === 'quote' ? 'italic' : ''}
    `;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      updateBlock(block.id, { content: e.target.value });
    };

    const handleBlur = () => {
      setTimeout(() => stopEditing(), 100);
    };

    return (
      <div className="relative">
        {isMultiline ? (
          <textarea
            ref={editInputRef as React.RefObject<HTMLTextAreaElement>}
            value={block.content}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={(e) => handleKeyDown(e, block.id)}
            className={`${inputClasses} resize-none`}
            rows={3}
            placeholder={`Enter ${block.type}...`}
          />
        ) : (
          <input
            ref={editInputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={block.content}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={(e) => handleKeyDown(e, block.id)}
            className={inputClasses}
            placeholder={`Enter ${block.type}...`}
          />
        )}
        
        {/* Edit Mode Controls */}
        <div className="absolute -right-2 -top-2 flex items-center space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              stopEditing();
            }}
            className="p-1 bg-green-500 text-white rounded-full hover:bg-green-600 shadow-lg"
            title="Save"
          >
            <Eye className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`visual-page-editor ${className}`}>
      {/* Editor Header */}
      {editable && (
        <div className={`flex items-center justify-between p-4 border-b ${
          isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors ${
                isPreviewMode 
                  ? 'bg-blue-500 text-white' 
                  : isDark 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {isPreviewMode ? <Eye className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
              <span>{isPreviewMode ? 'Preview' : 'Edit'} Mode</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {blocks.length} block{blocks.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className={`p-6 min-h-[400px] ${
        isDark ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="max-w-4xl mx-auto space-y-6">
          {blocks.map((block) => (
            <div key={block.id}>
              {editingBlock === block.id && isPreviewMode === false
                ? renderEditBlock(block)
                : renderPreviewBlock(block)
              }
            </div>
          ))}
          
          {/* Add First Block */}
          {blocks.length === 0 && editable && (
            <div className="text-center py-12">
              <button
                onClick={() => addBlock('', 'paragraph')}
                className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg border-2 border-dashed transition-colors ${
                  isDark 
                    ? 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300' 
                    : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700'
                }`}
              >
                <Plus className="h-5 w-5" />
                <span>Add your first block</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualPageEditor;