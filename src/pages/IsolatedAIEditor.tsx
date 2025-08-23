import React, { useState, useCallback } from 'react';
import { callAI, checkAIConfiguration } from '@/lib/ai/blocknote-ai-simplified';
import { unsplashService } from '@/lib/ai/unsplash-service';
import { Button } from '@/components/ui/Button';
import ReactMarkdown from 'react-markdown';

const AI_CREATE_COMMANDS = [
  { id: 'blog-post', label: '📄 Blog Post', prompt: 'Write a comprehensive, engaging blog post of 1000-1500 words (8-12 paragraphs) with introduction, main body sections, and conclusion about: ', needsInput: true },
  { id: 'article-outline', label: '📋 Article Outline', prompt: 'Create a detailed article outline with at least 5 main sections and 3-4 subsections each for: ', needsInput: true },
  { id: 'introduction', label: '🎯 Introduction', prompt: 'Write an engaging introduction of 200-300 words (2-3 substantial paragraphs) that hooks the reader for an article about: ', needsInput: true },
  { id: 'conclusion', label: '🏁 Conclusion', prompt: 'Write a compelling conclusion of 200-300 words (2-3 substantial paragraphs) that summarizes key points and provides a call to action for: ', needsInput: true },
  { id: 'how-to', label: '📖 How-To Guide', prompt: 'Write a detailed step-by-step guide of 600-1000 words with numbered steps, tips, and explanations on how to: ', needsInput: true },
  { id: 'product-description', label: '🛍️ Product Description', prompt: 'Write a detailed product description of 300-500 words covering features, benefits, specifications, and use cases for: ', needsInput: true },
];

const AI_EDIT_COMMANDS = [
  { id: 'improve', label: '✨ Improve Writing', prompt: 'Improve the writing quality, grammar, and clarity', needsSelection: true },
  { id: 'shorten', label: '📝 Make Shorter', prompt: 'Make this text more concise', needsSelection: true },
  { id: 'expand', label: '📖 Make Longer', prompt: 'Expand this text with more details', needsSelection: true },
  { id: 'professional', label: '👔 Professional', prompt: 'Rewrite in a professional tone', needsSelection: true },
  { id: 'casual', label: '😊 Casual', prompt: 'Rewrite in a casual, friendly tone', needsSelection: true },
  { id: 'fix', label: '✅ Fix Grammar', prompt: 'Fix grammar and spelling errors', needsSelection: true },
];

export default function IsolatedAIEditor() {
  const [content, setContent] = useState(`# AI-Powered Content Editor

Welcome to the AI-enhanced editor! This powerful editor includes AI assistance for content creation with automatic image insertion from Unsplash.

## How to Use AI Features

Click the AI buttons above to generate content or improve selected text. When generating blog posts, images will be automatically inserted at optimal positions.

Try selecting this paragraph and using AI to improve it!`);
  
  const [processing, setProcessing] = useState(false);
  const [includeImages, setIncludeImages] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  
  const aiConfig = checkAIConfiguration();
  const unsplashConfigured = unsplashService.isConfigured();

  const handleAICommand = useCallback(async (command: any) => {
    let userInput = '';
    let selectedText = '';
    
    if (command.needsInput) {
      userInput = prompt(command.prompt) || '';
      if (!userInput) return;
    }
    
    if (command.needsSelection) {
      const textarea = document.querySelector('textarea');
      if (textarea) {
        const start = (textarea as HTMLTextAreaElement).selectionStart;
        const end = (textarea as HTMLTextAreaElement).selectionEnd;
        selectedText = content.substring(start, end);
        if (!selectedText) {
          alert('Please select some text first');
          return;
        }
      }
    }
    
    setProcessing(true);
    setShowMenu(false);
    
    try {
      const fullPrompt = command.needsInput ? command.prompt + userInput : command.prompt;
      const result = await callAI(fullPrompt, selectedText);
      
      let finalContent = result;
      
      // Add images for content creation commands
      const imageEnabledCommands = ['blog-post', 'article-outline', 'how-to', 'product-description'];
      if (includeImages && imageEnabledCommands.includes(command.id) && unsplashConfigured) {
        const topic = userInput || selectedText.substring(0, 50);
        console.log('Fetching images for:', topic);
        
        const imageCount = command.id === 'blog-post' ? 3 : 2;
        const photos = await unsplashService.findRelevantPhotos(
          result.substring(0, 500),
          topic,
          imageCount
        );
        
        if (photos.length > 0) {
          const lines = result.split('\n');
          const processedLines = [];
          let imageIndex = 0;
          
          for (let i = 0; i < lines.length; i++) {
            processedLines.push(lines[i]);
            
            // Add hero image after first heading
            if (imageIndex === 0 && lines[i].startsWith('#') && photos[imageIndex]) {
              processedLines.push('');
              processedLines.push(`![${photos[imageIndex].photo.alt_description || topic}](${unsplashService.getOptimalImageUrl(photos[imageIndex].photo)})`);
              processedLines.push(`*${unsplashService.formatAttribution(photos[imageIndex].photo)}*`);
              processedLines.push('');
              imageIndex++;
            }
            // Add section images after h2 headings
            else if (imageIndex < photos.length && lines[i].startsWith('##') && photos[imageIndex]) {
              processedLines.push('');
              processedLines.push(`![${photos[imageIndex].photo.alt_description || 'Section image'}](${unsplashService.getOptimalImageUrl(photos[imageIndex].photo)})`);
              processedLines.push(`*${unsplashService.formatAttribution(photos[imageIndex].photo)}*`);
              processedLines.push('');
              imageIndex++;
            }
          }
          
          finalContent = processedLines.join('\n');
        }
      }
      
      // Update content
      if (command.needsSelection) {
        const textarea = document.querySelector('textarea');
        if (textarea) {
          const start = (textarea as HTMLTextAreaElement).selectionStart;
          const end = (textarea as HTMLTextAreaElement).selectionEnd;
          setContent(content.substring(0, start) + finalContent + content.substring(end));
        }
      } else {
        setContent(prevContent => prevContent + '\n\n' + finalContent);
      }
      
    } catch (error) {
      console.error('AI processing failed:', error);
      alert('AI processing failed. Please check your API configuration.');
    } finally {
      setProcessing(false);
    }
  }, [content, includeImages, unsplashConfigured]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">AI Content Editor with Images</h1>
        
        {/* Status Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-4 flex items-center justify-between">
          <div>
            {aiConfig.isConfigured ? (
              <span className="text-green-600 font-medium">✨ AI Ready ({aiConfig.provider})</span>
            ) : (
              <span className="text-red-600">Configure API keys in .env.local</span>
            )}
            {unsplashConfigured && (
              <span className="ml-4 text-blue-600">📷 Images Available</span>
            )}
          </div>
          {unsplashConfigured && (
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={includeImages}
                onChange={(e) => setIncludeImages(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Include Images</span>
            </label>
          )}
        </div>
        
        {/* AI Toolbar */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowMenu(!showMenu)}
              disabled={processing}
            >
              {processing ? '⏳ Processing...' : '✨ AI Assistant'}
            </Button>
            
            {/* Quick Actions */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAICommand(AI_CREATE_COMMANDS[0])}
              disabled={processing || !aiConfig.isConfigured}
            >
              📄 Blog Post
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAICommand(AI_CREATE_COMMANDS[2])}
              disabled={processing || !aiConfig.isConfigured}
            >
              🎯 Introduction
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAICommand(AI_CREATE_COMMANDS[3])}
              disabled={processing || !aiConfig.isConfigured}
            >
              🏁 Conclusion
            </Button>
          </div>
          
          {/* Dropdown Menu */}
          {showMenu && (
            <div className="mt-4 border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2 text-sm text-gray-700">Create Content</h3>
                  <div className="space-y-1">
                    {AI_CREATE_COMMANDS.map(cmd => (
                      <button
                        key={cmd.id}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                        onClick={() => handleAICommand(cmd)}
                        disabled={processing}
                      >
                        {cmd.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-sm text-gray-700">Edit Selected Text</h3>
                  <div className="space-y-1">
                    {AI_EDIT_COMMANDS.map(cmd => (
                      <button
                        key={cmd.id}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                        onClick={() => handleAICommand(cmd)}
                        disabled={processing}
                      >
                        {cmd.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Editor */}
        <div className="bg-white rounded-lg shadow">
          {/* Tab switcher */}
          <div className="border-b flex">
            <button
              className={`px-6 py-3 font-medium text-sm ${!isPreview ? 'bg-white border-b-2 border-blue-500 text-blue-600' : 'bg-gray-50 text-gray-600'}`}
              onClick={() => setIsPreview(false)}
            >
              ✏️ Edit
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm ${isPreview ? 'bg-white border-b-2 border-blue-500 text-blue-600' : 'bg-gray-50 text-gray-600'}`}
              onClick={() => setIsPreview(true)}
            >
              👁️ Preview
            </button>
          </div>
          
          {/* Content area */}
          {!isPreview ? (
            <>
              <textarea
                className="w-full p-6 rounded-lg font-mono text-sm resize-none focus:outline-none"
                style={{ minHeight: '600px' }}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={processing}
                placeholder="Start typing or use AI commands..."
              />
              <div className="border-t p-4 text-sm text-gray-600">
                Words: {content.split(/\s+/).filter(w => w).length} | 
                Characters: {content.length}
              </div>
            </>
          ) : (
            <div className="p-6 prose prose-lg max-w-none" style={{ minHeight: '600px' }}>
              <ReactMarkdown
                components={{
                  img: ({node, ...props}) => (
                    <img {...props} className="rounded-lg shadow-md my-4 w-full" />
                  ),
                  h1: ({node, ...props}) => (
                    <h1 {...props} className="text-3xl font-bold mt-6 mb-4" />
                  ),
                  h2: ({node, ...props}) => (
                    <h2 {...props} className="text-2xl font-semibold mt-5 mb-3" />
                  ),
                  h3: ({node, ...props}) => (
                    <h3 {...props} className="text-xl font-medium mt-4 mb-2" />
                  ),
                  p: ({node, ...props}) => (
                    <p {...props} className="mb-4 leading-relaxed" />
                  ),
                  ul: ({node, ...props}) => (
                    <ul {...props} className="list-disc pl-6 mb-4 space-y-2" />
                  ),
                  ol: ({node, ...props}) => (
                    <ol {...props} className="list-decimal pl-6 mb-4 space-y-2" />
                  ),
                  li: ({node, ...props}) => (
                    <li {...props} className="mb-1" />
                  ),
                  blockquote: ({node, ...props}) => (
                    <blockquote {...props} className="border-l-4 border-gray-300 pl-4 italic my-4" />
                  ),
                  code: ({node, inline, ...props}) => 
                    inline ? (
                      <code {...props} className="bg-gray-100 px-1 py-0.5 rounded text-sm" />
                    ) : (
                      <code {...props} className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto" />
                    ),
                  em: ({node, ...props}) => (
                    <em {...props} className="italic text-gray-700" />
                  ),
                  strong: ({node, ...props}) => (
                    <strong {...props} className="font-bold text-gray-900" />
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        
        {/* Instructions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="font-semibold mb-3">✨ Features</h3>
            <ul className="space-y-2 text-sm">
              <li>• Generate 1000-1500 word blog posts</li>
              <li>• Automatic image insertion from Unsplash</li>
              <li>• Smart image placement at headings</li>
              <li>• Multiple content types available</li>
              <li>• Edit and improve existing text</li>
            </ul>
          </div>
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="font-semibold mb-3">📝 Markdown Support</h3>
            <ul className="space-y-2 text-sm">
              <li>• # Heading 1</li>
              <li>• ## Heading 2</li>
              <li>• **Bold** and *italic*</li>
              <li>• - Bullet lists</li>
              <li>• ![alt](url) for images</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}