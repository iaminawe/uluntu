import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/react/style.css';
import '@blocknote/mantine/style.css';
import { callAI, checkAIConfiguration } from '@/lib/ai/blocknote-ai-simplified';
import { unsplashService } from '@/lib/ai/unsplash-service';
import { markdownToBlocks } from '@/lib/ai/markdown-to-blocks';
import { Button } from '@/components/ui/Button';

// AI Commands
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
  { id: 'how-to', label: '📖 How-To Guide', prompt: 'Write a detailed step-by-step guide of 600-1000 words with numbered steps, tips, and explanations on how to: ', needsInput: true, needsSelection: false },
  { id: 'product-description', label: '🛍️ Product Description', prompt: 'Write a detailed product description of 300-500 words covering features, benefits, specifications, and use cases for: ', needsInput: true, needsSelection: false },
];

const AI_COMMANDS = [...AI_CREATE_COMMANDS, ...AI_EDIT_COMMANDS];

interface FixedBlockEditorProps {
  initialContent?: any[];
  onChange?: (content: any[]) => void;
  editable?: boolean;
  className?: string;
}

export const FixedBlockEditor: React.FC<FixedBlockEditorProps> = ({
  initialContent,
  onChange,
  editable = true,
  className = '',
}) => {
  const [showAIMenu, setShowAIMenu] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [includeImages, setIncludeImages] = useState(true);
  
  const aiConfig = checkAIConfiguration();
  const unsplashConfigured = unsplashService.isConfigured();

  // Create editor with memoized initial content
  const editor = useMemo(() => {
    return useCreateBlockNote({
      initialContent: initialContent && initialContent.length > 0 ? initialContent : undefined,
    });
  }, []); // Only create once

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
      if (unsubscribe) unsubscribe();
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

  // Handle AI command
  const handleAICommand = async (command: typeof AI_COMMANDS[0]) => {
    const hasSelection = handleTextSelection();
    
    if (command.needsSelection && !hasSelection) {
      alert('Please select some text first for this command');
      return;
    }

    let userInput = '';
    if (command.needsInput) {
      const topic = prompt(`${command.prompt}`);
      if (!topic) return;
      userInput = topic;
    }

    setAiProcessing(true);
    setShowAIMenu(false);
    
    try {
      let fullPrompt = command.prompt;
      if (command.needsInput) {
        fullPrompt = command.prompt + userInput;
      }
      
      const result = await callAI(fullPrompt, command.needsSelection ? selectedText : '');
      
      if (result && editor) {
        try {
          // For blog posts and longer content, try to fetch relevant images
          let images: Array<{ url: string; caption: string; placement: string }> = [];
          
          const imageEnabledCommands = ['blog-post', 'article-outline', 'how-to', 'comparison', 'product-description'];
          const shouldFetchImages = includeImages && imageEnabledCommands.includes(command.id) && unsplashService.isConfigured();
          
          if (shouldFetchImages) {
            const topic = userInput || (command.needsSelection ? selectedText.substring(0, 50) : '');
            console.log('Fetching relevant images for content about:', topic);
            
            let imageCount = 3;
            if (command.id === 'article-outline') imageCount = 1;
            if (command.id === 'product-description') imageCount = 2;
            
            const photos = await unsplashService.findRelevantPhotos(
              result.substring(0, 500),
              topic,
              imageCount
            );
            
            images = photos.map(({ photo, placement }) => ({
              url: unsplashService.getOptimalImageUrl(photo),
              caption: unsplashService.formatAttribution(photo),
              placement
            }));
            
            console.log(`Found ${images.length} images for ${command.id}`);
          }
          
          // Convert markdown to BlockNote blocks with images
          const blocks = markdownToBlocks(result, images);
          
          console.log('Generated blocks from markdown:', blocks);
          
          // Get current position
          const currentPosition = editor.getTextCursorPosition();
          
          if (currentPosition && currentPosition.block) {
            if (command.needsSelection && hasSelection) {
              editor.insertBlocks(blocks, currentPosition.block, 'after');
            } else {
              editor.insertBlocks(blocks, currentPosition.block, 'after');
            }
            editor.focus();
          } else {
            const lastBlock = editor.document[editor.document.length - 1];
            if (lastBlock) {
              editor.insertBlocks(blocks, lastBlock, 'after');
            }
          }
        } catch (insertError) {
          console.error('Failed to insert content:', insertError);
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

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className={`blocknote-editor-wrapper ${className}`}>
      {/* AI Toolbar */}
      {aiConfig.isConfigured && editable && (
        <div className="ai-toolbar p-4 bg-white border-b">
          <div className="flex items-center gap-2">
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
            
            {unsplashConfigured && (
              <label className="ml-4 inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeImages}
                  onChange={(e) => setIncludeImages(e.target.checked)}
                  disabled={aiProcessing}
                />
                <span className="text-sm">📷 Include Images</span>
              </label>
            )}
          </div>
          
          {showAIMenu && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-semibold mb-2 text-sm">Create Content</div>
                  {AI_CREATE_COMMANDS.map((cmd) => (
                    <button
                      key={cmd.id}
                      className="block w-full text-left px-3 py-2 text-sm hover:bg-white rounded"
                      onClick={() => handleAICommand(cmd)}
                      disabled={aiProcessing}
                    >
                      {cmd.label}
                    </button>
                  ))}
                </div>
                <div>
                  <div className="font-semibold mb-2 text-sm">Edit Selected Text</div>
                  {AI_EDIT_COMMANDS.map((cmd) => (
                    <button
                      key={cmd.id}
                      className="block w-full text-left px-3 py-2 text-sm hover:bg-white rounded"
                      onClick={() => handleAICommand(cmd)}
                      disabled={aiProcessing}
                    >
                      {cmd.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <BlockNoteView 
        editor={editor} 
        editable={editable}
        theme="light"
      />

      {/* AI Status Indicator */}
      <div className="p-2 bg-gray-50 border-t text-sm text-center">
        {aiConfig.isConfigured ? (
          <span className="text-green-600">
            ✨ AI Ready ({aiConfig.provider})
            {unsplashConfigured && <span className="ml-2">📷 Images Available</span>}
          </span>
        ) : (
          <span className="text-gray-500">Configure API keys in .env.local to enable AI</span>
        )}
        {!unsplashConfigured && aiConfig.isConfigured && (
          <span className="ml-2 text-gray-500 text-xs">
            (Add Unsplash API key for images)
          </span>
        )}
        {aiProcessing && <span className="ml-2 text-blue-600">Processing...</span>}
      </div>
    </div>
  );
};