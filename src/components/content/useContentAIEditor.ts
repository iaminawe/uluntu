import { useState, useCallback, useMemo } from 'react';
import { callAI, checkAIConfiguration } from '@/lib/ai/blocknote-ai-simplified';
import { unsplashService } from '@/lib/ai/unsplash-service';
import { ContentType, EditorMode, AIPrompt } from './types';

export interface UseContentAIEditorOptions {
  initialContent?: string;
  contentType?: ContentType;
  mode?: EditorMode;
  includeImages?: boolean;
  customPrompts?: AIPrompt[];
  onContentChange?: (content: string) => void;
  onSave?: (content: string) => Promise<void>;
}

export interface UseContentAIEditorReturn {
  // State
  content: string;
  mode: EditorMode;
  isProcessing: boolean;
  selectedText: string;
  showAIMenu: boolean;
  aiMenuPosition: { x: number; y: number };
  
  // Configuration
  aiConfig: { isConfigured: boolean; provider: string | null };
  unsplashConfigured: boolean;
  availablePrompts: AIPrompt[];
  
  // Actions
  setContent: (content: string) => void;
  setMode: (mode: EditorMode) => void;
  setSelectedText: (text: string) => void;
  setShowAIMenu: (show: boolean) => void;
  setAIMenuPosition: (position: { x: number; y: number }) => void;
  
  // AI Operations
  executeAIPrompt: (prompt: string, useSelection?: boolean) => Promise<void>;
  generateContentWithImages: (topic: string) => Promise<void>;
  insertUnsplashImage: (query?: string) => Promise<void>;
  improveContent: () => Promise<void>;
  fixGrammar: () => Promise<void>;
  
  // Utility
  getWordCount: () => number;
  getCharacterCount: () => number;
  copyToClipboard: () => Promise<void>;
  clearContent: () => void;
  handleTextSelection: () => void;
  handleSave: () => Promise<void>;
}

export const useContentAIEditor = ({
  initialContent = '',
  contentType = 'general',
  mode = 'visual',
  includeImages = true,
  customPrompts = [],
  onContentChange,
  onSave
}: UseContentAIEditorOptions = {}): UseContentAIEditorReturn => {
  const [content, setContentState] = useState(initialContent);
  const [editorMode, setEditorMode] = useState<EditorMode>(mode);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [showAIMenu, setShowAIMenu] = useState(false);
  const [aiMenuPosition, setAIMenuPosition] = useState({ x: 0, y: 0 });
  
  const aiConfig = useMemo(() => checkAIConfiguration(), []);
  const unsplashConfigured = useMemo(() => unsplashService.isConfigured(), []);
  
  // Content-type specific prompts
  const defaultPrompts = useMemo(() => {
    const universalPrompts: AIPrompt[] = [
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
    
    const contentTypePrompts: Record<ContentType, AIPrompt[]> = {
      news: [
        {
          id: 'news-article',
          label: '📰 Generate News Article',
          prompt: 'Write a comprehensive news article with headline, lead paragraph, body paragraphs, and conclusion.',
          icon: '📰'
        },
        {
          id: 'news-summary',
          label: '📝 Create News Summary',
          prompt: 'Create a concise news summary highlighting the key points and main developments.',
          icon: '📝'
        }
      ],
      events: [
        {
          id: 'event-description',
          label: '🎉 Event Description',
          prompt: 'Write an engaging event description that includes what attendees can expect.',
          icon: '🎉'
        },
        {
          id: 'event-agenda',
          label: '📅 Create Agenda',
          prompt: 'Create a detailed event agenda with time slots and activities.',
          icon: '📅'
        }
      ],
      resources: [
        {
          id: 'resource-guide',
          label: '📚 Resource Guide',
          prompt: 'Create a comprehensive resource guide with step-by-step instructions.',
          icon: '📚'
        },
        {
          id: 'tutorial',
          label: '🎯 How-to Tutorial',
          prompt: 'Write a detailed tutorial with clear steps and expected outcomes.',
          icon: '🎯'
        }
      ],
      marketplace: [
        {
          id: 'product-description',
          label: '🛍️ Product Description',
          prompt: 'Write a compelling product description highlighting features and benefits.',
          icon: '🛍️'
        }
      ],
      opportunities: [
        {
          id: 'job-description',
          label: '💼 Job Description',
          prompt: 'Create a comprehensive job description with responsibilities and requirements.',
          icon: '💼'
        }
      ],
      groups: [
        {
          id: 'group-description',
          label: '👥 Group Description',
          prompt: 'Write an engaging group description explaining the purpose and benefits.',
          icon: '👥'
        }
      ],
      gallery: [
        {
          id: 'photo-captions',
          label: '📸 Photo Captions',
          prompt: 'Generate engaging photo captions that tell a story.',
          icon: '📸'
        }
      ],
      blog: [
        {
          id: 'blog-post',
          label: '✍️ Full Blog Post',
          prompt: 'Write a comprehensive blog post of 1000-1500 words with introduction and conclusion.',
          icon: '✍️'
        }
      ],
      general: []
    };
    
    return [...(contentTypePrompts[contentType] || []), ...universalPrompts];
  }, [contentType]);
  
  const availablePrompts = useMemo(() => [
    ...defaultPrompts,
    ...customPrompts
  ], [defaultPrompts, customPrompts]);
  
  // Set content with callback
  const setContent = useCallback((newContent: string) => {
    setContentState(newContent);
    onContentChange?.(newContent);
  }, [onContentChange]);
  
  // Execute AI prompt
  const executeAIPrompt = useCallback(async (prompt: string, useSelection = true) => {
    setIsProcessing(true);
    setShowAIMenu(false);
    
    try {
      let contextText = '';
      
      if (useSelection && selectedText) {
        contextText = selectedText;
      } else if (!useSelection) {
        contextText = content;
      }
      
      // Add content-type specific context to the prompt
      let enhancedPrompt = prompt;
      if (contentType !== 'general') {
        enhancedPrompt = `For ${contentType} content: ${prompt}`;
      }
      
      const result = await callAI(enhancedPrompt, contextText);
      
      if (useSelection && selectedText) {
        // Replace selected text (this would need to be handled by the component using this hook)
        const newContent = content.replace(selectedText, result);
        setContent(newContent);
      } else {
        // Add to existing content or replace all
        const newContent = useSelection ? content + '\n\n' + result : result;
        setContent(newContent);
      }
      
      setSelectedText('');
    } catch (error) {
      console.error('AI processing failed:', error);
      throw new Error('AI processing failed. Please check your API configuration.');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedText, content, contentType, setContent]);
  
  // Generate content with images
  const generateContentWithImages = useCallback(async (topic: string) => {
    setIsProcessing(true);
    
    try {
      // Content-specific prompts
      let contentPrompt = '';
      switch (contentType) {
        case 'news':
          contentPrompt = `Write a comprehensive news article about: ${topic}`;
          break;
        case 'events':
          contentPrompt = `Write an engaging event description for: ${topic}`;
          break;
        case 'resources':
          contentPrompt = `Create a comprehensive resource guide about: ${topic}`;
          break;
        case 'marketplace':
          contentPrompt = `Write a compelling product or service description for: ${topic}`;
          break;
        case 'opportunities':
          contentPrompt = `Create a detailed opportunity posting for: ${topic}`;
          break;
        case 'groups':
          contentPrompt = `Write an engaging group description for: ${topic}`;
          break;
        case 'gallery':
          contentPrompt = `Write compelling gallery content about: ${topic}`;
          break;
        case 'blog':
        default:
          contentPrompt = `Write a comprehensive blog post about: ${topic}`;
          break;
      }
      
      const result = await callAI(contentPrompt, '');
      let finalContent = result;
      
      // Add images if configured
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
            
            // Add conclusion image
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
      
      setContent(finalContent);
    } catch (error) {
      console.error('Content generation failed:', error);
      throw new Error('Content generation failed. Please check your API configuration.');
    } finally {
      setIsProcessing(false);
    }
  }, [contentType, includeImages, unsplashConfigured, setContent]);
  
  // Insert Unsplash image
  const insertUnsplashImage = useCallback(async (query?: string) => {
    if (!query) {
      query = prompt('Search for images:') || '';
    }
    if (!query) return;
    
    setIsProcessing(true);
    try {
      const photos = await unsplashService.searchPhotos(query, { perPage: 1 });
      if (photos.length > 0) {
        const photo = photos[0];
        const imageMarkdown = `\n![${photo.alt_description || query}](${unsplashService.getOptimalImageUrl(photo)})\n*${unsplashService.formatAttribution(photo)}*\n`;
        setContent(content + imageMarkdown);
      } else {
        throw new Error('No images found for that search term.');
      }
    } catch (error) {
      console.error('Error inserting image:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [content, setContent]);
  
  // Convenience methods
  const improveContent = useCallback(() => {
    return executeAIPrompt('Improve the writing quality, grammar, and clarity', false);
  }, [executeAIPrompt]);
  
  const fixGrammar = useCallback(() => {
    return executeAIPrompt('Fix all grammar, spelling, and punctuation errors', false);
  }, [executeAIPrompt]);
  
  // Handle text selection
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim());
      
      // Position AI menu near selection
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setAIMenuPosition({
        x: rect.left,
        y: rect.bottom + window.scrollY
      });
    }
  }, []);
  
  // Utility functions
  const getWordCount = useCallback(() => {
    return content.split(/\s+/).filter(w => w).length;
  }, [content]);
  
  const getCharacterCount = useCallback(() => {
    return content.length;
  }, [content]);
  
  const copyToClipboard = useCallback(async () => {
    await navigator.clipboard.writeText(content);
  }, [content]);
  
  const clearContent = useCallback(() => {
    setContent('');
    setSelectedText('');
  }, [setContent]);
  
  const handleSave = useCallback(async () => {
    if (onSave) {
      await onSave(content);
    }
  }, [content, onSave]);
  
  return {
    // State
    content,
    mode: editorMode,
    isProcessing,
    selectedText,
    showAIMenu,
    aiMenuPosition,
    
    // Configuration
    aiConfig,
    unsplashConfigured,
    availablePrompts,
    
    // Actions
    setContent,
    setMode: setEditorMode,
    setSelectedText,
    setShowAIMenu,
    setAIMenuPosition,
    
    // AI Operations
    executeAIPrompt,
    generateContentWithImages,
    insertUnsplashImage,
    improveContent,
    fixGrammar,
    
    // Utility
    getWordCount,
    getCharacterCount,
    copyToClipboard,
    clearContent,
    handleTextSelection,
    handleSave
  };
};