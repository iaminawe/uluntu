import React, { useEffect, useRef, useState } from 'react';
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

// AI imports
import { callAI, checkAIConfiguration } from '@/lib/ai/blocknote-ai-simplified';
import { Button } from '@/components/ui/Button';

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

// AI Commands
const AI_COMMANDS = [
  { id: 'improve', label: '✨ Improve Writing', prompt: 'Improve the writing quality, grammar, and clarity' },
  { id: 'shorten', label: '📝 Make Shorter', prompt: 'Make this text more concise' },
  { id: 'expand', label: '📖 Make Longer', prompt: 'Expand this text with more details' },
  { id: 'professional', label: '👔 Professional', prompt: 'Rewrite in a professional tone' },
  { id: 'casual', label: '😊 Casual', prompt: 'Rewrite in a casual, friendly tone' },
  { id: 'bullets', label: '• Bullet Points', prompt: 'Convert to bullet points' },
  { id: 'fix', label: '✅ Fix Grammar', prompt: 'Fix grammar and spelling errors' },
  { id: 'continue', label: '➡️ Continue', prompt: 'Continue writing from here' },
];

export const BlockEditorWithAI: React.FC<BlockEditorProps> = ({
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
  const [showAIMenu, setShowAIMenu] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  
  const aiConfig = checkAIConfiguration();

  // Create the editor instance
  const editor = useCreateBlockNote({
    initialContent: content.length > 0 ? content : undefined,
    uploadFile: async (file: File) => {
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
        
        if (currentContent !== lastSavedContentRef.current) {
          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
          }

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

    editor.onChange(handleChange);

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

  // Handle text selection
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString());
    }
  };

  // Handle AI command
  const handleAICommand = async (command: typeof AI_COMMANDS[0]) => {
    if (!selectedText && command.id !== 'continue') {
      alert('Please select some text first');
      return;
    }

    setAiProcessing(true);
    try {
      const result = await callAI(command.prompt, selectedText);
      
      // Insert the AI-generated text
      if (editor && result) {
        const selection = editor.getSelection();
        if (selection) {
          // Replace selected text with AI result
          editor.insertInlineContent([result]);
        }
      }
      
      setShowAIMenu(false);
      setSelectedText('');
    } catch (error) {
      console.error('AI processing failed:', error);
      alert('AI processing failed. Please check your API configuration.');
    } finally {
      setAiProcessing(false);
    }
  };

  return (
    <div className={`blocknote-editor-wrapper ${className}`}>
      {/* AI Toolbar */}
      {enableAI && aiConfig.isConfigured && editable && (
        <div className="ai-toolbar">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              handleTextSelection();
              setShowAIMenu(!showAIMenu);
            }}
            disabled={aiProcessing}
          >
            ✨ AI Assistant
          </Button>
          
          {showAIMenu && (
            <div className="ai-menu-dropdown">
              {AI_COMMANDS.map((cmd) => (
                <button
                  key={cmd.id}
                  className="ai-menu-item"
                  onClick={() => handleAICommand(cmd)}
                  disabled={aiProcessing}
                >
                  {cmd.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <BlockNoteDefaultUI
        editor={editor}
        editable={editable}
        theme="light"
        formattingToolbar={showToolbar && editable}
        slashMenu={editable}
        sideMenu={showSideMenu && editable}
      />

      {/* AI Status Indicator */}
      {enableAI && (
        <div className="ai-status-indicator">
          {aiConfig.isConfigured ? (
            <span className="ai-available">
              ✨ AI Ready ({aiConfig.provider})
            </span>
          ) : (
            <span className="ai-unavailable">AI not configured</span>
          )}
          {aiProcessing && <span className="ai-processing"> Processing...</span>}
        </div>
      )}
    </div>
  );
};