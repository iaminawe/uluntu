import React, { useEffect, useMemo, useRef } from 'react';
import {
  BlockNoteEditor,
  PartialBlock,
  Block,
} from '@blocknote/core';
import {
  useCreateBlockNote,
  BlockNoteDefaultUI,
} from '@blocknote/react';
import '@blocknote/react/style.css';
import '@blocknote/mantine/style.css';

// AI imports - we'll integrate these differently
import { createBlockNoteAI, isAIAvailable } from '@/lib/ai/blocknote-ai';

// Component styles
import './BlockEditor.css';

interface BlockEditorProps {
  content?: PartialBlock[];
  onChange?: (content: Block[]) => void;
  editable?: boolean;
  placeholder?: string;
  autoSave?: boolean;
  autoSaveDelay?: number;
  showToolbar?: boolean;
  showSideMenu?: boolean;
  enableAI?: boolean;
  onSave?: (content: Block[]) => Promise<void>;
  className?: string;
}

// Export the simplified version for backward compatibility
export { SimpleBlockEditor as BlockEditor } from './SimpleBlockEditor';

// Basic BlockEditor without AI (for pages that don't need AI)
export const BlockEditorBasic: React.FC<BlockEditorProps> = ({
  content = [],
  onChange,
  editable = true,
  placeholder = "Start typing or press '/' for commands...",
  autoSave = false,
  autoSaveDelay = 2000,
  showToolbar = true,
  showSideMenu = true,
  enableAI = true,
  onSave,
  className = '',
}) => {
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedContentRef = useRef<string>('');
  
  // Create AI extension if available
  const aiExtension = useMemo(() => {
    if (enableAI && isAIAvailable()) {
      return createBlockNoteAI();
    }
    return null;
  }, [enableAI]);

  // Create the editor instance with or without AI
  const editor = useCreateBlockNote({
    initialContent: content.length > 0 ? content : undefined,
    extensions: aiExtension ? [aiExtension as any] : [],
    uploadFile: async (file: File) => {
      // Handle file uploads (images, etc.)
      // This is a placeholder - implement your upload logic
      const url = URL.createObjectURL(file);
      return url;
    },
  });

  // Handle content changes
  useEffect(() => {
    if (!editor || !onChange) return;

    const handleChange = () => {
      const blocks = editor.document;
      onChange(blocks);

      // Auto-save logic
      if (autoSave && onSave) {
        const currentContent = JSON.stringify(blocks);
        
        // Only save if content has actually changed
        if (currentContent !== lastSavedContentRef.current) {
          // Clear existing timeout
          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
          }

          // Set new timeout for auto-save
          saveTimeoutRef.current = setTimeout(async () => {
            try {
              await onSave(blocks);
              lastSavedContentRef.current = currentContent;
              console.log('Auto-saved successfully');
            } catch (error) {
              console.error('Auto-save failed:', error);
            }
          }, autoSaveDelay);
        }
      }
    };

    // Subscribe to changes
    editor.onChange(handleChange);

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [editor, onChange, autoSave, autoSaveDelay, onSave]);

  // Update editable state
  useEffect(() => {
    if (editor) {
      editor.isEditable = editable;
    }
  }, [editor, editable]);

  return (
    <div className={`blocknote-editor-wrapper ${className}`}>
      <BlockNoteDefaultUI
        theme="light"
        formattingToolbar={showToolbar && editable}
        slashMenu={editable}
        sideMenu={showSideMenu && editable}
      />

      {/* AI Status Indicator */}
      {enableAI && (
        <div className="ai-status-indicator">
          {isAIAvailable() ? (
            <span className="ai-available">✨ AI Assistant Available</span>
          ) : (
            <span className="ai-unavailable">AI features not configured</span>
          )}
        </div>
      )}
    </div>
  );
};