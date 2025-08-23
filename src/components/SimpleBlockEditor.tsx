import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Block } from '@blocknote/core';
import { 
  useCreateBlockNote,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems
} from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/react/style.css';
import '@blocknote/mantine/style.css';

// AI imports
import { callAI, checkAIConfiguration } from '@/lib/ai/blocknote-ai-simplified';
import { markdownToBlocks } from '@/lib/ai/markdown-to-blocks';
import { Button } from '@/components/ui/Button';

// Component styles
import './BlockEditor.css';

interface SimpleBlockEditorProps {
  initialContent?: any[];
  onChange?: (content: any[]) => void;
  editable?: boolean;
  className?: string;
}

// AI Commands - separated into categories
const AI_EDIT_COMMANDS = [
  { id: 'improve', label: '✨ Improve Writing', prompt: 'Improve the writing quality, grammar, and clarity', needsSelection: true },
  { id: 'shorten', label: '📝 Make Shorter', prompt: 'Make this text more concise', needsSelection: true },
  { id: 'expand', label: '📖 Make Longer', prompt: 'Expand this text with more details', needsSelection: true },
  { id: 'professional', label: '👔 Professional', prompt: 'Rewrite in a professional tone', needsSelection: true },
  { id: 'casual', label: '😊 Casual', prompt: 'Rewrite in a casual, friendly tone', needsSelection: true },
  { id: 'bullets', label: '• Bullet Points', prompt: 'Convert to bullet points', needsSelection: true },
  { id: 'fix', label: '✅ Fix Grammar', prompt: 'Fix grammar and spelling errors', needsSelection: true },
];

const AI_CREATE_COMMANDS = [
  { id: 'blog-post', label: '📄 Blog Post', prompt: 'Write a comprehensive, engaging blog post of 1000-1500 words (8-12 paragraphs) with introduction, main body sections, and conclusion about: ', needsInput: true, needsSelection: false },
  { id: 'article-outline', label: '📋 Article Outline', prompt: 'Create a detailed article outline with at least 5 main sections and 3-4 subsections each for: ', needsInput: true, needsSelection: false },
  { id: 'introduction', label: '🎯 Introduction', prompt: 'Write an engaging introduction of 200-300 words (2-3 substantial paragraphs) that hooks the reader for an article about: ', needsInput: true, needsSelection: false },
  { id: 'conclusion', label: '🏁 Conclusion', prompt: 'Write a compelling conclusion of 200-300 words (2-3 substantial paragraphs) that summarizes key points and provides a call to action for: ', needsInput: true, needsSelection: false },
  { id: 'summary', label: '📊 Executive Summary', prompt: 'Write a comprehensive executive summary of 300-500 words covering all key points, findings, and recommendations for: ', needsInput: true, needsSelection: false },
  { id: 'social-post', label: '📱 Social Media Post', prompt: 'Create an engaging social media post (150-200 words) with relevant hashtags about: ', needsInput: true, needsSelection: false },
  { id: 'email', label: '✉️ Email Draft', prompt: 'Write a complete professional email (250-400 words) with subject line, greeting, detailed body paragraphs, and professional closing about: ', needsInput: true, needsSelection: false },
  { id: 'press-release', label: '📰 Press Release', prompt: 'Write a professional press release of 400-600 words with headline, dateline, lead paragraph, body paragraphs, boilerplate, and contact info for: ', needsInput: true, needsSelection: false },
  { id: 'product-description', label: '🛍️ Product Description', prompt: 'Write a detailed product description of 300-500 words covering features, benefits, specifications, and use cases for: ', needsInput: true, needsSelection: false },
  { id: 'faq', label: '❓ FAQ Section', prompt: 'Create a comprehensive FAQ section with 8-10 questions and detailed answers (50-100 words each) about: ', needsInput: true, needsSelection: false },
  { id: 'how-to', label: '📖 How-To Guide', prompt: 'Write a detailed step-by-step guide of 600-1000 words with numbered steps, tips, and explanations on how to: ', needsInput: true, needsSelection: false },
  { id: 'comparison', label: '⚖️ Comparison', prompt: 'Write a detailed comparison of 500-800 words with introduction, feature-by-feature analysis, pros/cons, and recommendations for: ', needsInput: true, needsSelection: false },
  { id: 'continue', label: '➡️ Continue Writing', prompt: 'Continue writing the next 300-500 words (3-5 paragraphs) from where this text ends, maintaining the same style, tone, and depth', needsSelection: false },
  { id: 'ideas', label: '💡 Generate Ideas', prompt: 'Generate 10-15 creative and actionable ideas with brief explanations (30-50 words each) about: ', needsInput: true, needsSelection: false },
  { id: 'headlines', label: '📰 Headlines', prompt: 'Generate 15-20 catchy, compelling headlines with variety in style and approach for: ', needsInput: true, needsSelection: false },
];

const AI_COMMANDS = [...AI_CREATE_COMMANDS, ...AI_EDIT_COMMANDS];

export const SimpleBlockEditor: React.FC<SimpleBlockEditorProps> = ({
  initialContent = [],
  onChange,
  editable = true,
  className = '',
}) => {
  const [showAIMenu, setShowAIMenu] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const editorRef = useRef<any>(null);
  
  const aiConfig = checkAIConfiguration();

  // Handle AI command - moved up so it's available for slash menu
  const handleAICommand = async (command: typeof AI_COMMANDS[0]) => {
    // Get current selection
    const hasSelection = handleTextSelection();
    
    // Check if command needs selection
    if (command.needsSelection && !hasSelection) {
      alert('Please select some text first for this command');
      return;
    }

    // Get user input for content creation commands
    let userInput = '';
    if (command.needsInput) {
      const topic = prompt(`${command.prompt}`);
      if (!topic) return; // User cancelled
      userInput = topic;
    }

    setAiProcessing(true);
    setShowAIMenu(false);
    
    try {
      // Build the full prompt
      let fullPrompt = command.prompt;
      if (command.needsInput) {
        fullPrompt = command.prompt + userInput;
      }
      
      const result = await callAI(fullPrompt, command.needsSelection ? selectedText : '');
      
      // Insert the AI result using BlockNote's API
      if (result && editorRef.current) {
        const editor = editorRef.current;
        
        try {
          // Convert markdown to BlockNote blocks
          const blocks = markdownToBlocks(result);
          
          console.log('Generated blocks from markdown:', blocks);
          
          // Get current position
          const currentPosition = editor.getTextCursorPosition();
          
          if (currentPosition && currentPosition.block) {
            // If replacing selected text, we need to handle differently
            if (command.needsSelection && hasSelection) {
              // For editing commands, replace the current block's content
              const currentBlockId = currentPosition.block.id;
              // For now, just insert after current block
              editor.insertBlocks(blocks, currentPosition.block, 'after');
            } else {
              // Insert new content as blocks after current position
              editor.insertBlocks(blocks, currentPosition.block, 'after');
            }
            
            // Focus back on editor
            editor.focus();
          } else {
            // If no position, append at the end
            const lastBlock = editor.document[editor.document.length - 1];
            if (lastBlock) {
              editor.insertBlocks(blocks, lastBlock, 'after');
            }
          }
        } catch (insertError) {
          console.error('Failed to insert content:', insertError);
          // Fallback: Try to insert as plain paragraphs
          try {
            const paragraphs = result.split('\n\n').filter(p => p.trim());
            const fallbackBlocks = paragraphs.map(p => ({
              type: 'paragraph' as const,
              content: p.trim()
            }));
            editor.insertBlocks(fallbackBlocks);
          } catch (fallbackError) {
            console.error('Fallback insertion also failed:', fallbackError);
            alert('Failed to insert AI content. Please try again.');
          }
        }
      }
      
      setSelectedText('');
    } catch (error) {
      console.error('AI processing failed:', error);
      alert('AI processing failed. Please check your API configuration.');
    } finally {
      setAiProcessing(false);
    }
  };

  // Create custom slash menu items function
  const getCustomSlashMenuItems = useMemo(() => {
    return (editor: any) => [
      // Default BlockNote slash menu items
      ...getDefaultReactSlashMenuItems(editor),
      // AI Create Commands
      ...AI_CREATE_COMMANDS.map(command => ({
        title: command.label,
        onItemClick: () => {
          if (!aiConfig.isConfigured) {
            alert('Please configure your AI API key in .env.local');
            return;
          }
          handleAICommand(command);
        },
        aliases: [command.id, command.label.toLowerCase(), 'ai'],
        group: "AI Content Creation",
        subtext: `Generate ${command.label.toLowerCase()}`,
      })),
      // AI Edit Commands  
      ...AI_EDIT_COMMANDS.map(command => ({
        title: command.label,
        onItemClick: () => {
          if (!aiConfig.isConfigured) {
            alert('Please configure your AI API key in .env.local');
            return;
          }
          handleAICommand(command);
        },
        aliases: [command.id, command.label.toLowerCase(), 'ai'],
        group: "AI Text Editing", 
        subtext: `Apply ${command.label.toLowerCase()} to selected text`,
      })),
    ];
  }, [aiConfig.isConfigured]);

  // Create the editor instance
  const editor = useCreateBlockNote({
    initialContent: initialContent && initialContent.length > 0 ? initialContent : undefined,
  });

  // Store editor reference
  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  // Handle content changes
  useEffect(() => {
    if (!editor || !onChange) return;

    const handleChange = () => {
      try {
        onChange(editor.document);
      } catch (error) {
        console.error('Error in onChange handler:', error);
      }
    };

    const unsubscribe = editor.onChange(handleChange);
    return () => {
      unsubscribe?.();
    };
  }, [editor, onChange]);

  // Handle text selection
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString());
      return true;
    }
    return false;
  };


  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className={`blocknote-editor-wrapper ${className}`}>
      {/* AI Toolbar */}
      {aiConfig.isConfigured && editable && (
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
            {aiProcessing ? '⏳ Processing...' : '✨ AI Assistant'}
          </Button>
          
          {showAIMenu && (
            <div className="ai-menu-dropdown">
              <div className="ai-menu-section">
                <div className="ai-menu-section-title">Create Content</div>
                {AI_CREATE_COMMANDS.map((cmd) => (
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
              <div className="ai-menu-section">
                <div className="ai-menu-section-title">Edit Selected Text</div>
                {AI_EDIT_COMMANDS.map((cmd) => (
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
            </div>
          )}
        </div>
      )}

      <BlockNoteView 
        editor={editor} 
        editable={editable}
        theme="light"
        slashMenu={false}
      >
        <SuggestionMenuController
          triggerCharacter={"/"}
          getItems={async (query) => {
            const items = getCustomSlashMenuItems(editor);
            if (!query) return items;
            
            // Simple filtering logic
            const filtered = items.filter(item => 
              item.title.toLowerCase().includes(query.toLowerCase()) ||
              (item.aliases && item.aliases.some((alias: string) => 
                alias.toLowerCase().includes(query.toLowerCase())
              ))
            );
            return filtered;
          }}
        />
      </BlockNoteView>

      {/* AI Status Indicator */}
      <div className="ai-status-indicator">
        {aiConfig.isConfigured ? (
          <span className="ai-available">
            ✨ AI Ready ({aiConfig.provider})
          </span>
        ) : (
          <span className="ai-unavailable">Configure API keys in .env.local to enable AI</span>
        )}
        {aiProcessing && <span className="ai-processing"> Processing...</span>}
      </div>
    </div>
  );
};