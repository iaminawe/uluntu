import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { checkAIConfiguration, callAI } from '@/lib/ai/blocknote-ai-simplified';
import { unsplashService } from '@/lib/ai/unsplash-service';
import { supabase } from '@/lib/supabase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Link2, 
  Image, 
  Heading1, 
  Heading2, 
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  ChevronDown,
  Sparkles,
  Camera,
  FileText,
  Type,
  Palette,
  Upload,
  Eye,
  Edit3,
  ImagePlus
} from 'lucide-react';

interface EnhancedContentAIEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  contentType?: string;
  includeImages?: boolean;
  className?: string;
  height?: string;
  disabled?: boolean;
}

// Formatting commands
const formatCommands = {
  bold: { icon: Bold, label: 'Bold', markdown: '**', html: 'strong' },
  italic: { icon: Italic, label: 'Italic', markdown: '_', html: 'em' },
  underline: { icon: Underline, label: 'Underline', markdown: '', html: 'u' },
  h1: { icon: Heading1, label: 'Heading 1', markdown: '# ', html: 'h1' },
  h2: { icon: Heading2, label: 'Heading 2', markdown: '## ', html: 'h2' },
  h3: { icon: Heading3, label: 'Heading 3', markdown: '### ', html: 'h3' },
  ul: { icon: List, label: 'Bullet List', markdown: '- ', html: 'ul' },
  ol: { icon: ListOrdered, label: 'Numbered List', markdown: '1. ', html: 'ol' },
  quote: { icon: Quote, label: 'Quote', markdown: '> ', html: 'blockquote' },
  code: { icon: Code, label: 'Code', markdown: '`', html: 'code' },
  link: { icon: Link2, label: 'Link', markdown: '[', html: 'a' }
};

// Text alignment options
const alignmentOptions = [
  { icon: AlignLeft, value: 'left', label: 'Align Left' },
  { icon: AlignCenter, value: 'center', label: 'Align Center' },
  { icon: AlignRight, value: 'right', label: 'Align Right' }
];

// Font size options
const fontSizeOptions = [
  { label: 'Small', value: 'small' },
  { label: 'Normal', value: 'normal' },
  { label: 'Large', value: 'large' },
  { label: 'Extra Large', value: 'x-large' }
];

// Text color presets
const colorPresets = [
  { label: 'Default', value: 'inherit' },
  { label: 'Red', value: '#dc2626' },
  { label: 'Blue', value: '#2563eb' },
  { label: 'Green', value: '#16a34a' },
  { label: 'Purple', value: '#9333ea' },
  { label: 'Orange', value: '#ea580c' },
  { label: 'Gray', value: '#6b7280' }
];

export const EnhancedContentAIEditor: React.FC<EnhancedContentAIEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter your content here...',
  contentType = 'general',
  includeImages = true,
  className = '',
  height = '500px',
  disabled = false
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAIMenu, setShowAIMenu] = useState(false);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'rendered' | 'source'>('rendered');
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const aiConfig = checkAIConfiguration();
  const unsplashConfigured = unsplashService.isConfigured();

  // Save to undo stack
  const saveToUndoStack = useCallback(() => {
    setUndoStack(prev => [...prev.slice(-19), value]);
    setRedoStack([]);
  }, [value]);

  // Apply formatting
  const applyFormat = useCallback((format: keyof typeof formatCommands) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    if (!selectedText) {
      // If no text selected, just insert the markdown
      const cmd = formatCommands[format];
      let insertion = '';
      
      if (format === 'h1' || format === 'h2' || format === 'h3') {
        // For headings, add at the beginning of the line
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const newValue = value.substring(0, lineStart) + cmd.markdown + value.substring(lineStart);
        onChange(newValue);
        textarea.setSelectionRange(lineStart + cmd.markdown.length, lineStart + cmd.markdown.length);
      } else if (format === 'ul' || format === 'ol' || format === 'quote') {
        // For lists and quotes, add at the beginning of the line
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const newValue = value.substring(0, lineStart) + cmd.markdown + value.substring(lineStart);
        onChange(newValue);
        textarea.setSelectionRange(lineStart + cmd.markdown.length, lineStart + cmd.markdown.length);
      } else {
        // For inline formatting, add placeholder text
        insertion = cmd.markdown + 'text' + (cmd.markdown || '');
        const newValue = value.substring(0, start) + insertion + value.substring(end);
        onChange(newValue);
        textarea.setSelectionRange(start + cmd.markdown.length, start + cmd.markdown.length + 4);
      }
    } else {
      // Apply formatting to selected text
      saveToUndoStack();
      const cmd = formatCommands[format];
      let formattedText = '';
      
      if (format === 'bold') {
        formattedText = `**${selectedText}**`;
      } else if (format === 'italic') {
        formattedText = `_${selectedText}_`;
      } else if (format === 'code') {
        formattedText = selectedText.includes('\n') ? 
          `\`\`\`\n${selectedText}\n\`\`\`` : 
          `\`${selectedText}\``;
      } else if (format === 'link') {
        const url = prompt('Enter URL:');
        if (url) {
          formattedText = `[${selectedText}](${url})`;
        } else {
          return;
        }
      } else if (format === 'h1' || format === 'h2' || format === 'h3') {
        formattedText = cmd.markdown + selectedText;
      } else if (format === 'ul' || format === 'ol') {
        formattedText = selectedText.split('\n').map(line => cmd.markdown + line).join('\n');
      } else if (format === 'quote') {
        formattedText = selectedText.split('\n').map(line => '> ' + line).join('\n');
      } else {
        formattedText = selectedText;
      }
      
      const newValue = value.substring(0, start) + formattedText + value.substring(end);
      onChange(newValue);
      
      // Restore selection
      textarea.setSelectionRange(start, start + formattedText.length);
    }
    
    textarea.focus();
  }, [value, onChange, saveToUndoStack]);

  // Insert link
  const insertLink = useCallback(() => {
    const url = prompt('Enter URL:');
    const text = prompt('Enter link text:') || url;
    if (url && text) {
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const markdown = `[${text}](${url})`;
        const newValue = value.substring(0, start) + markdown + value.substring(start);
        onChange(newValue);
        textarea.focus();
      }
    }
  }, [value, onChange]);

  // Undo/Redo
  const handleUndo = useCallback(() => {
    if (undoStack.length > 0) {
      const previousValue = undoStack[undoStack.length - 1];
      setUndoStack(prev => prev.slice(0, -1));
      setRedoStack(prev => [...prev, value]);
      onChange(previousValue);
    }
  }, [undoStack, value, onChange]);

  const handleRedo = useCallback(() => {
    if (redoStack.length > 0) {
      const nextValue = redoStack[redoStack.length - 1];
      setRedoStack(prev => prev.slice(0, -1));
      setUndoStack(prev => [...prev, value]);
      onChange(nextValue);
    }
  }, [redoStack, value, onChange]);

  // AI content generation
  const generateContent = useCallback(async () => {
    const topic = prompt(`Enter a topic for your ${contentType}:`);
    if (!topic) return;

    setIsProcessing(true);
    try {
      const prompt = contentType === 'news' ? 
        `Write a comprehensive news article about: ${topic}` :
        contentType === 'events' ? 
        `Write a detailed event description for: ${topic}` :
        contentType === 'marketplace' ? 
        `Write a compelling product/service description for: ${topic}` :
        `Write comprehensive content about: ${topic}`;
      
      const result = await callAI(prompt, '');
      
      let finalContent = result;
      
      // Add images if enabled
      if (includeImages && unsplashConfigured) {
        const photos = await unsplashService.findRelevantPhotos(result.substring(0, 500), topic, 2);
        if (photos.length > 0) {
          const lines = result.split('\n');
          const processedLines = [];
          let addedHero = false;
          
          for (let i = 0; i < lines.length; i++) {
            processedLines.push(lines[i]);
            
            if (!addedHero && lines[i].trim().startsWith('#') && photos[0]) {
              processedLines.push('');
              processedLines.push(`![${photos[0].photo.alt_description || topic}](${unsplashService.getOptimalImageUrl(photos[0].photo)})`);
              processedLines.push(`*${unsplashService.formatAttribution(photos[0].photo)}*`);
              processedLines.push('');
              addedHero = true;
            }
          }
          
          finalContent = processedLines.join('\n');
        }
      }
      
      onChange(finalContent);
    } catch (error) {
      console.error('Content generation failed:', error);
      alert('Failed to generate content. Please check your API configuration.');
    } finally {
      setIsProcessing(false);
    }
  }, [contentType, includeImages, unsplashConfigured, onChange]);

  // Insert image from Unsplash
  const insertUnsplashImage = useCallback(async () => {
    const query = prompt('Search for images:');
    if (!query) return;

    setIsProcessing(true);
    try {
      const photos = await unsplashService.searchPhotos(query, { perPage: 1 });
      if (photos.length > 0) {
        const photo = photos[0];
        const markdown = `\n![${photo.alt_description || query}](${unsplashService.getOptimalImageUrl(photo)})\n*${unsplashService.formatAttribution(photo)}*\n`;
        
        const textarea = textareaRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const newValue = value.substring(0, start) + markdown + value.substring(start);
          onChange(newValue);
        }
      } else {
        alert('No images found.');
      }
    } catch (error) {
      console.error('Failed to insert image:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [value, onChange]);

  // Handle image upload
  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `${contentType}-${timestamp}.${fileExt}`;
      const filePath = `content-images/${fileName}`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('content-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('content-images')
        .getPublicUrl(filePath);

      // Insert markdown for uploaded image
      const altText = prompt('Enter alt text for the image:') || file.name;
      const markdown = `\n![${altText}](${publicUrl})\n`;
      
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const newValue = value.substring(0, start) + markdown + value.substring(start);
        onChange(newValue);
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  }, [contentType, value, onChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled || !textareaRef.current) return;
      
      // Ctrl/Cmd + B = Bold
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        applyFormat('bold');
      }
      // Ctrl/Cmd + I = Italic
      else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        applyFormat('italic');
      }
      // Ctrl/Cmd + K = Link
      else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        applyFormat('link');
      }
      // Ctrl/Cmd + Z = Undo
      else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y = Redo
      else if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') || 
               ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault();
        handleRedo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [disabled, applyFormat, handleUndo, handleRedo]);

  return (
    <div className={`enhanced-content-ai-editor ${className}`}>
      {/* Rich Formatting Toolbar */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-t-lg p-2">
        <div className="flex flex-wrap items-center gap-1">
          {/* Undo/Redo */}
          <div className="flex items-center border-r border-slate-200 dark:border-slate-700 pr-2 mr-2">
            <button
              onClick={handleUndo}
              disabled={disabled || undoStack.length === 0 || viewMode === 'rendered'}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={disabled || redoStack.length === 0 || viewMode === 'rendered'}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
              title="Redo (Ctrl+Y)"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          {/* Text Formatting */}
          <div className="flex items-center border-r border-slate-200 dark:border-slate-700 pr-2 mr-2">
            <button
              onClick={() => applyFormat('bold')}
              disabled={disabled || viewMode === 'rendered'}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => applyFormat('italic')}
              disabled={disabled || viewMode === 'rendered'}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => applyFormat('underline')}
              disabled={disabled || viewMode === 'rendered'}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
              title="Underline"
            >
              <Underline className="w-4 h-4" />
            </button>
            <button
              onClick={() => applyFormat('code')}
              disabled={disabled || viewMode === 'rendered'}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
              title="Code"
            >
              <Code className="w-4 h-4" />
            </button>
          </div>

          {/* Headings Dropdown */}
          <div className="relative border-r border-slate-200 dark:border-slate-700 pr-2 mr-2">
            <button
              onClick={() => setShowFormatMenu(!showFormatMenu)}
              disabled={disabled || viewMode === 'rendered'}
              className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              <Type className="w-4 h-4" />
              <span className="text-sm">Heading</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showFormatMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-lg z-10">
                <button
                  onClick={() => { applyFormat('h1'); setShowFormatMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Heading1 className="w-4 h-4" />
                  <span className="text-sm">Heading 1</span>
                </button>
                <button
                  onClick={() => { applyFormat('h2'); setShowFormatMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Heading2 className="w-4 h-4" />
                  <span className="text-sm">Heading 2</span>
                </button>
                <button
                  onClick={() => { applyFormat('h3'); setShowFormatMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Heading3 className="w-4 h-4" />
                  <span className="text-sm">Heading 3</span>
                </button>
              </div>
            )}
          </div>

          {/* Lists */}
          <div className="flex items-center border-r border-slate-200 dark:border-slate-700 pr-2 mr-2">
            <button
              onClick={() => applyFormat('ul')}
              disabled={disabled || viewMode === 'rendered'}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => applyFormat('ol')}
              disabled={disabled || viewMode === 'rendered'}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              onClick={() => applyFormat('quote')}
              disabled={disabled || viewMode === 'rendered'}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </button>
          </div>

          {/* Links & Images */}
          <div className="flex items-center border-r border-slate-200 dark:border-slate-700 pr-2 mr-2">
            <button
              onClick={insertLink}
              disabled={disabled || viewMode === 'rendered'}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
              title="Insert Link (Ctrl+K)"
            >
              <Link2 className="w-4 h-4" />
            </button>
            
            {/* Image dropdown menu */}
            {includeImages && (
              <div className="relative">
                <button
                  onClick={() => setShowImageMenu(!showImageMenu)}
                  disabled={disabled || viewMode === 'rendered'}
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
                  title="Insert Image"
                >
                  <ImagePlus className="w-4 h-4" />
                </button>
                {showImageMenu && (
                  <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-lg z-10 p-2 w-48">
                    <button
                      onClick={() => {
                        fileInputRef.current?.click();
                        setShowImageMenu(false);
                      }}
                      disabled={uploadingImage}
                      className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-sm"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Image</span>
                    </button>
                    {unsplashConfigured && (
                      <button
                        onClick={() => {
                          insertUnsplashImage();
                          setShowImageMenu(false);
                        }}
                        disabled={isProcessing}
                        className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-sm"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Search Unsplash</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI Tools */}
          <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-700 pr-2 mr-2">
            <button
              onClick={generateContent}
              disabled={disabled || isProcessing || !aiConfig.isConfigured || viewMode === 'rendered'}
              className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">Generate</span>
            </button>
            <button
              onClick={() => setShowAIMenu(!showAIMenu)}
              disabled={disabled || isProcessing || !aiConfig.isConfigured || viewMode === 'rendered'}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              <span className="text-sm">AI Tools</span>
            </button>
          </div>

          {/* Preview Toggle */}
          <div className="flex items-center">
            <button
              onClick={() => setViewMode(viewMode === 'rendered' ? 'source' : 'rendered')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded transition-colors ${
                viewMode === 'source' 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-slate-600 text-white hover:bg-slate-700'
              }`}
              title={viewMode === 'source' ? 'Switch to Rendered View' : 'Switch to Source View'}
            >
              {viewMode === 'source' ? (
                <>
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">Rendered</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" />
                  <span className="text-sm">Source</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* AI Menu Dropdown */}
        {showAIMenu && (
          <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-900 rounded">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <button
                onClick={async () => {
                  setIsProcessing(true);
                  try {
                    const result = await callAI('Improve the writing quality, grammar, and clarity', value);
                    onChange(result);
                  } catch (error) {
                    alert('Failed to improve content');
                  } finally {
                    setIsProcessing(false);
                    setShowAIMenu(false);
                  }
                }}
                className="text-left p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✨ Improve Writing
              </button>
              <button
                onClick={async () => {
                  setIsProcessing(true);
                  try {
                    const result = await callAI('Fix all grammar and spelling errors', value);
                    onChange(result);
                  } catch (error) {
                    alert('Failed to fix grammar');
                  } finally {
                    setIsProcessing(false);
                    setShowAIMenu(false);
                  }
                }}
                className="text-left p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✅ Fix Grammar
              </button>
              <button
                onClick={async () => {
                  setIsProcessing(true);
                  try {
                    const result = await callAI('Make this content more concise', value);
                    onChange(result);
                  } catch (error) {
                    alert('Failed to shorten content');
                  } finally {
                    setIsProcessing(false);
                    setShowAIMenu(false);
                  }
                }}
                className="text-left p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                📝 Make Shorter
              </button>
              <button
                onClick={async () => {
                  setIsProcessing(true);
                  try {
                    const result = await callAI('Expand this content with more details', value);
                    onChange(result);
                  } catch (error) {
                    alert('Failed to expand content');
                  } finally {
                    setIsProcessing(false);
                    setShowAIMenu(false);
                  }
                }}
                className="text-left p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                📖 Make Longer
              </button>
              <button
                onClick={async () => {
                  setIsProcessing(true);
                  try {
                    const result = await callAI('Rewrite in a professional tone', value);
                    onChange(result);
                  } catch (error) {
                    alert('Failed to make professional');
                  } finally {
                    setIsProcessing(false);
                    setShowAIMenu(false);
                  }
                }}
                className="text-left p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                👔 Professional
              </button>
              <button
                onClick={async () => {
                  setIsProcessing(true);
                  try {
                    const result = await callAI('Rewrite in a casual, friendly tone', value);
                    onChange(result);
                  } catch (error) {
                    alert('Failed to make casual');
                  } finally {
                    setIsProcessing(false);
                    setShowAIMenu(false);
                  }
                }}
                className="text-left p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                😊 Casual
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Editor/Preview Area */}
      {viewMode === 'rendered' ? (
        <div 
          className="w-full p-4 border-x border-b border-slate-200 dark:border-slate-700 rounded-b-lg bg-white dark:bg-slate-900 overflow-auto"
          style={{ height, minHeight: '200px' }}
        >
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                img: ({ node, ...props }) => (
                  <img {...props} className="max-w-full h-auto rounded-lg shadow-md" />
                ),
                a: ({ node, ...props }) => (
                  <a {...props} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer" />
                ),
                pre: ({ node, ...props }) => (
                  <pre {...props} className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto" />
                ),
                code: ({ node, inline, ...props }) => (
                  inline 
                    ? <code {...props} className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-sm" />
                    : <code {...props} />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote {...props} className="border-l-4 border-slate-300 dark:border-slate-600 pl-4 italic" />
                ),
                table: ({ node, ...props }) => (
                  <table {...props} className="border-collapse border border-slate-300 dark:border-slate-600" />
                ),
                th: ({ node, ...props }) => (
                  <th {...props} className="border border-slate-300 dark:border-slate-600 px-4 py-2 bg-slate-100 dark:bg-slate-800" />
                ),
                td: ({ node, ...props }) => (
                  <td {...props} className="border border-slate-300 dark:border-slate-600 px-4 py-2" />
                )
              }}
            >
              {value || '*No content to preview*'}
            </ReactMarkdown>
          </div>
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || isProcessing}
          className="w-full p-4 border-x border-b border-slate-200 dark:border-slate-700 rounded-b-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          style={{ height, minHeight: '200px' }}
          onSelect={() => {
            const textarea = textareaRef.current;
            if (textarea && textarea.selectionStart !== textarea.selectionEnd) {
              setSelectedText(value.substring(textarea.selectionStart, textarea.selectionEnd));
            }
          }}
        />
      )}

      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Status Bar */}
      <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4">
          {aiConfig.isConfigured ? (
            <span className="text-green-600">✨ AI Ready</span>
          ) : (
            <span className="text-red-600">⚠️ Configure AI</span>
          )}
          {isProcessing && <span className="text-orange-600">⏳ Processing...</span>}
          {uploadingImage && <span className="text-blue-600">📤 Uploading image...</span>}
          {viewMode === 'rendered' && <span className="text-purple-600">👁️ Rendered View</span>}
        </div>
        <div className="flex items-center gap-4">
          <span>{value.split(/\s+/).filter(w => w).length} words</span>
          <span>{value.length} characters</span>
          {selectedText && viewMode === 'source' && <span>{selectedText.length} selected</span>}
        </div>
      </div>
    </div>
  );
};

export default EnhancedContentAIEditor;