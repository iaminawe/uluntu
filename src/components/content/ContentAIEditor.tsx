import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { callAI, checkAIConfiguration } from '@/lib/ai/blocknote-ai-simplified';
import { unsplashService } from '@/lib/ai/unsplash-service';

export type ContentType = 
  | 'news' 
  | 'events' 
  | 'resources' 
  | 'groups' 
  | 'gallery' 
  | 'marketplace' 
  | 'opportunities'
  | 'blog'
  | 'general';

export type EditorMode = 'visual' | 'markdown' | 'html';

export interface ContentAIEditorProps {
  /** Current content value */
  value: string;
  /** Callback when content changes */
  onChange: (content: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Content type for customized AI prompts */
  contentType?: ContentType;
  /** Whether to include image insertion functionality */
  includeImages?: boolean;
  /** Editor mode */
  mode?: EditorMode;
  /** Whether the editor is disabled */
  disabled?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Editor height */
  height?: string;
  /** Custom AI prompts for specific use cases */
  customPrompts?: Array<{
    id: string;
    label: string;
    prompt: string;
    icon?: string;
  }>;
}

// Content-type specific AI prompts
const CONTENT_TYPE_PROMPTS = {
  news: [
    {
      id: 'news-article',
      label: '📰 Generate News Article',
      prompt: 'Write a comprehensive news article with headline, lead paragraph, body paragraphs, and conclusion. Include quotes and factual information.',
      icon: '📰'
    },
    {
      id: 'news-summary',
      label: '📝 Create News Summary',
      prompt: 'Create a concise news summary highlighting the key points and main developments.',
      icon: '📝'
    },
    {
      id: 'news-headline',
      label: '📌 Generate Headlines',
      prompt: 'Create 5 compelling news headlines for this story, each with different angles.',
      icon: '📌'
    }
  ],
  events: [
    {
      id: 'event-description',
      label: '🎉 Event Description',
      prompt: 'Write an engaging event description that includes what attendees can expect, key highlights, and call-to-action.',
      icon: '🎉'
    },
    {
      id: 'event-agenda',
      label: '📅 Create Agenda',
      prompt: 'Create a detailed event agenda with time slots, activities, and speaker information.',
      icon: '📅'
    },
    {
      id: 'event-announcement',
      label: '📢 Event Announcement',
      prompt: 'Write an exciting event announcement to promote attendance and generate interest.',
      icon: '📢'
    }
  ],
  resources: [
    {
      id: 'resource-guide',
      label: '📚 Resource Guide',
      prompt: 'Create a comprehensive resource guide with step-by-step instructions and helpful tips.',
      icon: '📚'
    },
    {
      id: 'tutorial',
      label: '🎯 How-to Tutorial',
      prompt: 'Write a detailed tutorial with clear steps, prerequisites, and expected outcomes.',
      icon: '🎯'
    },
    {
      id: 'faq',
      label: '❓ FAQ Section',
      prompt: 'Generate frequently asked questions and detailed answers for this topic.',
      icon: '❓'
    }
  ],
  marketplace: [
    {
      id: 'product-description',
      label: '🛍️ Product Description',
      prompt: 'Write a compelling product description highlighting features, benefits, and unique selling points.',
      icon: '🛍️'
    },
    {
      id: 'service-listing',
      label: '⚙️ Service Listing',
      prompt: 'Create a professional service listing with details about what is offered and pricing information.',
      icon: '⚙️'
    },
    {
      id: 'marketplace-pitch',
      label: '💡 Sales Pitch',
      prompt: 'Write a persuasive sales pitch that converts browsers into buyers.',
      icon: '💡'
    }
  ],
  opportunities: [
    {
      id: 'job-description',
      label: '💼 Job Description',
      prompt: 'Create a comprehensive job description with responsibilities, requirements, and benefits.',
      icon: '💼'
    },
    {
      id: 'volunteer-opportunity',
      label: '🤝 Volunteer Description',
      prompt: 'Write an inspiring volunteer opportunity description that motivates people to get involved.',
      icon: '🤝'
    },
    {
      id: 'internship-post',
      label: '🎓 Internship Posting',
      prompt: 'Create an engaging internship posting with learning objectives and application requirements.',
      icon: '🎓'
    }
  ],
  groups: [
    {
      id: 'group-description',
      label: '👥 Group Description',
      prompt: 'Write an engaging group description that explains the purpose, activities, and benefits of joining.',
      icon: '👥'
    },
    {
      id: 'member-guidelines',
      label: '📋 Member Guidelines',
      prompt: 'Create clear community guidelines and rules for group members.',
      icon: '📋'
    }
  ],
  gallery: [
    {
      id: 'photo-captions',
      label: '📸 Photo Captions',
      prompt: 'Generate engaging photo captions that tell a story and provide context.',
      icon: '📸'
    },
    {
      id: 'gallery-description',
      label: '🖼️ Gallery Description',
      prompt: 'Write a compelling gallery description that introduces the collection and its significance.',
      icon: '🖼️'
    }
  ],
  blog: [
    {
      id: 'blog-post',
      label: '✍️ Full Blog Post',
      prompt: 'Write a comprehensive, engaging blog post of 1000-1500 words with introduction, main sections, and conclusion.',
      icon: '✍️'
    },
    {
      id: 'blog-intro',
      label: '🎯 Blog Introduction',
      prompt: 'Write an engaging introduction of 200-300 words that hooks the reader.',
      icon: '🎯'
    },
    {
      id: 'blog-conclusion',
      label: '🏁 Blog Conclusion',
      prompt: 'Write a compelling conclusion that summarizes key points and includes a call to action.',
      icon: '🏁'
    }
  ],
  general: [
    {
      id: 'improve',
      label: '✨ Improve Writing',
      prompt: 'Improve the writing quality, grammar, and clarity while maintaining the original meaning.',
      icon: '✨'
    },
    {
      id: 'expand',
      label: '📖 Expand Content',
      prompt: 'Expand this content with more details, examples, and explanations.',
      icon: '📖'
    },
    {
      id: 'summarize',
      label: '📝 Summarize',
      prompt: 'Create a concise summary of the main points.',
      icon: '📝'
    }
  ]
};

// Universal AI prompts that work with any content type
const UNIVERSAL_PROMPTS = [
  {
    id: 'improve',
    label: '✨ Improve Writing',
    prompt: 'Improve the writing quality, grammar, and clarity while maintaining the original meaning and tone.',
    icon: '✨'
  },
  {
    id: 'shorten',
    label: '📝 Make Shorter',
    prompt: 'Make this text more concise while preserving all key information.',
    icon: '📝'
  },
  {
    id: 'expand',
    label: '📖 Make Longer',
    prompt: 'Expand this text with more details, examples, and explanations while maintaining the original context.',
    icon: '📖'
  },
  {
    id: 'professional',
    label: '👔 Make Professional',
    prompt: 'Rewrite this text in a professional, formal tone suitable for business communication.',
    icon: '👔'
  },
  {
    id: 'casual',
    label: '😊 Make Casual',
    prompt: 'Rewrite this text in a casual, friendly tone while keeping the main message.',
    icon: '😊'
  },
  {
    id: 'fix-grammar',
    label: '✅ Fix Grammar',
    prompt: 'Fix all grammar, spelling, and punctuation errors in this text.',
    icon: '✅'
  }
];

export const ContentAIEditor: React.FC<ContentAIEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter your content here...',
  contentType = 'general',
  includeImages = true,
  mode = 'visual',
  disabled = false,
  className = '',
  height = '400px',
  customPrompts = []
}) => {
  const [editorMode, setEditorMode] = useState<EditorMode>(mode);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAIMenu, setShowAIMenu] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [aiMenuPosition, setAiMenuPosition] = useState({ x: 0, y: 0 });
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const aiConfig = checkAIConfiguration();
  const unsplashConfigured = unsplashService.isConfigured();

  // Get prompts for current content type
  const contentTypePrompts = CONTENT_TYPE_PROMPTS[contentType] || [];
  const allPrompts = [...contentTypePrompts, ...UNIVERSAL_PROMPTS, ...customPrompts];

  // Handle text selection
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    const textarea = textareaRef.current;
    
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim());
      
      // Position AI menu near selection
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setAiMenuPosition({
        x: rect.left,
        y: rect.bottom + window.scrollY
      });
    } else if (textarea && textarea.selectionStart !== textarea.selectionEnd) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value.substring(start, end);
      setSelectedText(text);
      
      // Position menu near textarea selection
      const rect = textarea.getBoundingClientRect();
      setAiMenuPosition({
        x: rect.left,
        y: rect.bottom + window.scrollY
      });
    }
  }, []);

  // Handle AI prompt execution
  const executeAIPrompt = useCallback(async (prompt: string, useSelection = true) => {
    setIsProcessing(true);
    setShowAIMenu(false);
    
    try {
      let contextText = '';
      
      if (useSelection && selectedText) {
        contextText = selectedText;
      } else if (!useSelection) {
        contextText = value;
      }
      
      // Add content-type specific context to the prompt
      let enhancedPrompt = prompt;
      if (contentType !== 'general') {
        enhancedPrompt = `For ${contentType} content: ${prompt}`;
      }
      
      const result = await callAI(enhancedPrompt, contextText);
      
      if (useSelection && selectedText && textareaRef.current) {
        // Replace selected text
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent = value.substring(0, start) + result + value.substring(end);
        onChange(newContent);
      } else {
        // Add to existing content or replace all
        const newContent = useSelection ? value + '\n\n' + result : result;
        onChange(newContent);
      }
      
      setSelectedText('');
    } catch (error) {
      console.error('AI processing failed:', error);
      alert('AI processing failed. Please check your API configuration.');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedText, value, onChange, contentType]);

  // Generate content with images
  const generateContentWithImages = useCallback(async (topic: string) => {
    if (!topic) return;
    
    setIsProcessing(true);
    
    try {
      // Content-specific prompts
      let contentPrompt = '';
      switch (contentType) {
        case 'news':
          contentPrompt = `Write a comprehensive news article about: ${topic}. Include headline, lead paragraph, body sections, and conclusion.`;
          break;
        case 'events':
          contentPrompt = `Write an engaging event description for: ${topic}. Include event details, what attendees can expect, and call-to-action.`;
          break;
        case 'resources':
          contentPrompt = `Create a comprehensive resource guide about: ${topic}. Include step-by-step instructions and helpful tips.`;
          break;
        case 'marketplace':
          contentPrompt = `Write a compelling product or service description for: ${topic}. Highlight features, benefits, and unique selling points.`;
          break;
        case 'opportunities':
          contentPrompt = `Create a detailed opportunity posting for: ${topic}. Include requirements, responsibilities, and benefits.`;
          break;
        case 'groups':
          contentPrompt = `Write an engaging group description for: ${topic}. Explain the purpose, activities, and benefits of joining.`;
          break;
        case 'gallery':
          contentPrompt = `Write compelling gallery content about: ${topic}. Include descriptions and context for the visual content.`;
          break;
        case 'blog':
        default:
          contentPrompt = `Write a comprehensive, engaging blog post of 1000-1500 words about: ${topic}. Include introduction, main sections, and conclusion.`;
          break;
      }
      
      // Generate content
      const result = await callAI(contentPrompt, '');
      let finalContent = result;
      
      // Add images if configured and enabled
      if (includeImages && unsplashConfigured) {
        try {
          const photos = await unsplashService.findRelevantPhotos(
            result.substring(0, 500),
            topic,
            3
          );
          
          if (photos.length > 0) {
            const lines = result.split('\n');
            const processedLines = [];
            let addedHero = false;
            let addedSection = false;
            
            for (let i = 0; i < lines.length; i++) {
              processedLines.push(lines[i]);
              
              // Add hero image after first heading
              if (!addedHero && lines[i].trim().startsWith('#') && photos[0]) {
                processedLines.push('');
                processedLines.push(`![${photos[0].photo.alt_description || topic}](${unsplashService.getOptimalImageUrl(photos[0].photo)})`);
                processedLines.push(`*${unsplashService.formatAttribution(photos[0].photo)}*`);
                processedLines.push('');
                addedHero = true;
              }
              
              // Add section image in the middle
              if (!addedSection && i > Math.floor(lines.length / 2) && photos[1]) {
                processedLines.push('');
                processedLines.push(`![${photos[1].photo.alt_description || 'Section image'}](${unsplashService.getOptimalImageUrl(photos[1].photo)})`);
                processedLines.push(`*${unsplashService.formatAttribution(photos[1].photo)}*`);
                processedLines.push('');
                addedSection = true;
              }
            }
            
            // Add conclusion image if available
            if (photos[2] && !processedLines.some(line => line.includes(photos[2].photo.urls.regular))) {
              processedLines.push('');
              processedLines.push(`![${photos[2].photo.alt_description || 'Conclusion image'}](${unsplashService.getOptimalImageUrl(photos[2].photo)})`);
              processedLines.push(`*${unsplashService.formatAttribution(photos[2].photo)}*`);
            }
            
            finalContent = processedLines.join('\n');
          }
        } catch (error) {
          console.error('Error adding images:', error);
        }
      }
      
      onChange(finalContent);
    } catch (error) {
      console.error('Content generation failed:', error);
      alert('Content generation failed. Please check your API configuration.');
    } finally {
      setIsProcessing(false);
    }
  }, [contentType, includeImages, unsplashConfigured, onChange]);

  // Handle generate content button
  const handleGenerateContent = useCallback(() => {
    const topic = prompt('Enter a topic for your content:');
    if (topic) {
      generateContentWithImages(topic);
    }
  }, [generateContentWithImages]);

  // Insert image from Unsplash
  const insertUnsplashImage = useCallback(async () => {
    const query = prompt('Search for images (e.g., "business meeting", "nature", "technology"):');
    if (!query) return;
    
    setIsProcessing(true);
    try {
      const photos = await unsplashService.searchPhotos(query, { perPage: 1 });
      if (photos.length > 0) {
        const photo = photos[0];
        const imageMarkdown = `\n![${photo.alt_description || query}](${unsplashService.getOptimalImageUrl(photo)})\n*${unsplashService.formatAttribution(photo)}*\n`;
        
        if (textareaRef.current) {
          const textarea = textareaRef.current;
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const newContent = value.substring(0, start) + imageMarkdown + value.substring(end);
          onChange(newContent);
        } else {
          onChange(value + imageMarkdown);
        }
      } else {
        alert('No images found for that search term.');
      }
    } catch (error) {
      console.error('Error inserting image:', error);
      alert('Failed to insert image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [value, onChange]);

  // Render AI menu
  const renderAIMenu = () => {
    if (!showAIMenu) return null;
    
    return (
      <div 
        className="fixed bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg z-50 p-2 max-w-sm"
        style={{
          left: Math.min(aiMenuPosition.x, window.innerWidth - 250),
          top: aiMenuPosition.y
        }}
      >
        <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 px-2">
          AI Assistant{selectedText ? ` (${selectedText.length} chars selected)` : ''}
        </div>
        <div className="max-h-64 overflow-y-auto">
          {allPrompts.map((prompt) => (
            <button
              key={prompt.id}
              className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
              onClick={() => executeAIPrompt(prompt.prompt, !!selectedText)}
              disabled={isProcessing}
            >
              <span className="mr-2">{prompt.icon || '🤖'}</span>
              {prompt.label}
            </button>
          ))}
        </div>
        <div className="border-t border-slate-200 dark:border-slate-600 mt-2 pt-2">
          <button
            className="w-full text-left px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
            onClick={() => setShowAIMenu(false)}
          >
            Close Menu
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`content-ai-editor ${className}`}>
      {/* Status and Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-600 p-4 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* AI Status */}
          <div className="flex items-center gap-4">
            {aiConfig.isConfigured ? (
              <span className="text-green-600 dark:text-green-400 text-sm">
                ✨ AI Ready ({aiConfig.provider})
              </span>
            ) : (
              <span className="text-red-600 dark:text-red-400 text-sm">
                ⚠️ Configure AI in settings
              </span>
            )}
            {unsplashConfigured && includeImages && (
              <span className="text-blue-600 dark:text-blue-400 text-sm">
                📷 Images Available
              </span>
            )}
            {isProcessing && (
              <span className="text-orange-600 dark:text-orange-400 text-sm">
                ⏳ Processing...
              </span>
            )}
          </div>
          
          {/* Editor Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">Mode:</span>
            <select
              value={editorMode}
              onChange={(e) => setEditorMode(e.target.value as EditorMode)}
              className="text-sm border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-700"
              disabled={disabled}
            >
              <option value="visual">Visual</option>
              <option value="markdown">Markdown</option>
              <option value="html">HTML</option>
            </select>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-600 p-4 mb-4">
        <div className="flex flex-wrap gap-2">
          {/* Generate Content */}
          <Button
            onClick={handleGenerateContent}
            disabled={isProcessing || !aiConfig.isConfigured || disabled}
            variant="primary"
            size="sm"
          >
            {contentType === 'general' ? '✍️ Generate Content' : `✍️ Generate ${contentType}`}
          </Button>
          
          {/* AI Assistant */}
          <Button
            onClick={() => {
              handleTextSelection();
              setShowAIMenu(!showAIMenu);
            }}
            disabled={isProcessing || !aiConfig.isConfigured || disabled}
            variant="secondary"
            size="sm"
          >
            🤖 AI Assistant
          </Button>
          
          {/* Insert Image */}
          {includeImages && unsplashConfigured && (
            <Button
              onClick={insertUnsplashImage}
              disabled={isProcessing || disabled}
              variant="secondary"
              size="sm"
            >
              📷 Insert Image
            </Button>
          )}
          
          {/* Quick Actions */}
          <Button
            onClick={() => executeAIPrompt('Improve the writing quality, grammar, and clarity', false)}
            disabled={isProcessing || !aiConfig.isConfigured || disabled || !value.trim()}
            variant="ghost"
            size="sm"
          >
            ✨ Improve All
          </Button>
          
          <Button
            onClick={() => executeAIPrompt('Fix all grammar, spelling, and punctuation errors', false)}
            disabled={isProcessing || !aiConfig.isConfigured || disabled || !value.trim()}
            variant="ghost"
            size="sm"
          >
            ✅ Fix Grammar
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-600">
          {editorMode === 'visual' ? (
            // Visual Editor (using textarea with enhanced styling for now)
            <textarea
              ref={textareaRef}
              className="w-full p-4 border-0 rounded-lg bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-inset"
              style={{ height, minHeight: '200px' }}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onSelect={handleTextSelection}
              placeholder={placeholder}
              disabled={disabled || isProcessing}
            />
          ) : (
            // Code Editor (markdown/html)
            <div className="relative">
              <div className="absolute top-2 right-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                {editorMode.toUpperCase()}
              </div>
              <textarea
                ref={textareaRef}
                className="w-full p-4 border-0 rounded-lg bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-inset font-mono text-sm"
                style={{ height, minHeight: '200px' }}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onSelect={handleTextSelection}
                placeholder={`Enter ${editorMode} content...`}
                disabled={disabled || isProcessing}
                spellCheck={false}
              />
            </div>
          )}
        </div>
        
        {/* Stats */}
        <div className="flex items-center justify-between mt-2 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span>Words: {value.split(/\s+/).filter(w => w).length}</span>
            <span>Characters: {value.length}</span>
            {selectedText && <span>Selected: {selectedText.length} chars</span>}
          </div>
          <div className="text-xs">
            Content Type: {contentType}
          </div>
        </div>
      </div>

      {/* AI Menu */}
      {renderAIMenu()}

      {/* Click outside to close AI menu */}
      {showAIMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowAIMenu(false)}
        />
      )}
    </div>
  );
};

export default ContentAIEditor;