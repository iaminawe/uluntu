import React, { useState } from 'react';
import { ContentAIEditor, ContentType } from './ContentAIEditor';
import { Button } from '@/components/ui/Button';

/**
 * Example component demonstrating ContentAIEditor usage across different content types
 */
export const ContentAIEditorExample: React.FC = () => {
  const [contentType, setContentType] = useState<ContentType>('blog');
  const [content, setContent] = useState('');
  const [mode, setMode] = useState<'visual' | 'markdown' | 'html'>('visual');
  const [includeImages, setIncludeImages] = useState(true);

  // Example custom prompts for specific use cases
  const customPrompts = [
    {
      id: 'community-guidelines',
      label: '📜 Community Guidelines',
      prompt: 'Create comprehensive community guidelines that promote respectful and productive interactions.',
      icon: '📜'
    },
    {
      id: 'welcome-message',
      label: '👋 Welcome Message',
      prompt: 'Write a warm welcome message for new community members.',
      icon: '👋'
    },
    {
      id: 'event-reminder',
      label: '⏰ Event Reminder',
      prompt: 'Create an engaging event reminder that encourages attendance.',
      icon: '⏰'
    }
  ];

  const contentTypes: Array<{ value: ContentType; label: string; description: string }> = [
    { value: 'news', label: 'News Article', description: 'Press releases, announcements, updates' },
    { value: 'events', label: 'Event Content', description: 'Event descriptions, agendas, announcements' },
    { value: 'resources', label: 'Resource Guide', description: 'Tutorials, guides, documentation' },
    { value: 'groups', label: 'Group Content', description: 'Group descriptions, guidelines, discussions' },
    { value: 'gallery', label: 'Gallery Content', description: 'Photo captions, collection descriptions' },
    { value: 'marketplace', label: 'Marketplace Listing', description: 'Product descriptions, service listings' },
    { value: 'opportunities', label: 'Opportunities', description: 'Job postings, volunteer opportunities' },
    { value: 'blog', label: 'Blog Post', description: 'Long-form articles, thought leadership' },
    { value: 'general', label: 'General Content', description: 'Any other type of content' }
  ];

  const handleSave = () => {
    console.log('Saving content:', { contentType, content, mode });
    alert(`Content saved! Type: ${contentType}, Length: ${content.length} characters`);
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all content?')) {
      setContent('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          ContentAIEditor Demo
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Experience AI-powered content creation for different content types
        </p>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-600 p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Configuration
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Content Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Content Type
            </label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as ContentType)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              {contentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {contentTypes.find(t => t.value === contentType)?.description}
            </p>
          </div>

          {/* Editor Mode */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Editor Mode
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as 'visual' | 'markdown' | 'html')}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="visual">Visual Editor</option>
              <option value="markdown">Markdown</option>
              <option value="html">HTML</option>
            </select>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Choose your preferred editing format
            </p>
          </div>

          {/* Include Images */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Options
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeImages}
                onChange={(e) => setIncludeImages(e.target.checked)}
                className="mr-2 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Enable Unsplash Images
              </span>
            </label>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Requires Unsplash API key
            </p>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Content Editor
        </h2>
        
        <ContentAIEditor
          value={content}
          onChange={setContent}
          contentType={contentType}
          mode={mode}
          includeImages={includeImages}
          height="500px"
          placeholder={`Start creating your ${contentType} content...`}
          customPrompts={customPrompts}
          className="mb-4"
        />

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleSave} variant="primary">
            💾 Save Content
          </Button>
          <Button onClick={handleClear} variant="secondary">
            🗑️ Clear Content
          </Button>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(content);
              alert('Content copied to clipboard!');
            }}
            variant="ghost"
            disabled={!content}
          >
            📋 Copy Content
          </Button>
        </div>
      </div>

      {/* Content Preview */}
      {content && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-600 p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Content Preview ({mode})
          </h2>
          
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 max-h-96 overflow-auto">
            {mode === 'visual' || mode === 'markdown' ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-sm">{content}</pre>
              </div>
            ) : (
              <div 
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            )}
          </div>
        </div>
      )}

      {/* Usage Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          How to Use ContentAIEditor
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              AI Features
            </h3>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li>• Generate complete content based on content type</li>
              <li>• Use AI Assistant with content-specific prompts</li>
              <li>• Insert relevant images from Unsplash</li>
              <li>• Improve and edit selected text</li>
              <li>• Fix grammar and enhance writing quality</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              Editor Modes
            </h3>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li>• <strong>Visual:</strong> WYSIWYG-style editing</li>
              <li>• <strong>Markdown:</strong> Write in Markdown format</li>
              <li>• <strong>HTML:</strong> Direct HTML editing</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Setup Required:</strong> Configure your AI provider (OpenAI/Anthropic) and optionally Unsplash API keys in your environment variables to enable all features.
          </p>
        </div>
      </div>

      {/* Integration Example */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-600 p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Integration Example
        </h2>
        
        <pre className="text-sm bg-slate-100 dark:bg-slate-700 rounded-lg p-4 overflow-x-auto">
{`import { ContentAIEditor } from '@/components/content';

// Basic usage
<ContentAIEditor
  value={content}
  onChange={setContent}
  contentType="news"
  includeImages={true}
/>

// Advanced usage with custom prompts
<ContentAIEditor
  value={content}
  onChange={setContent}
  contentType="events"
  mode="markdown"
  height="600px"
  customPrompts={[
    {
      id: 'agenda',
      label: '📅 Create Agenda',
      prompt: 'Generate a detailed event agenda',
      icon: '📅'
    }
  ]}
/>`}
        </pre>
      </div>
    </div>
  );
};

export default ContentAIEditorExample;