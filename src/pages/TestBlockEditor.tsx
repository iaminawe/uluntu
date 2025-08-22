import React, { useState } from 'react';
import { BlockEditor } from '@/components/BlockEditor';
import { Button } from '@/components/ui/Button';

export default function TestBlockEditor() {
  const [content, setContent] = useState<any[]>([
    {
      type: 'heading',
      content: 'Welcome to the Block Editor'
    },
    {
      type: 'paragraph',
      content: 'This is a powerful block-based editor for your pages. Try these features:'
    },
    {
      type: 'bulletList',
      content: 'Press Enter to create new blocks'
    },
    {
      type: 'bulletList',
      content: 'Click the toolbar buttons to add different block types'
    },
    {
      type: 'bulletList',
      content: 'Select text and use the formatting buttons'
    },
    {
      type: 'bulletList',
      content: 'Hover over blocks to see the delete option'
    },
    {
      type: 'paragraph',
      content: 'This editor provides an intuitive way for users to create and edit content without needing to know HTML or markdown.'
    }
  ]);
  
  const [savedContent, setSavedContent] = useState<any[] | null>(null);
  const [isPreview, setIsPreview] = useState(false);

  const handleSave = () => {
    setSavedContent(content);
    alert('Content saved! Check the console for the JSON structure.');
    console.log('Saved content:', JSON.stringify(content, null, 2));
  };

  const handleLoad = () => {
    if (savedContent) {
      setContent(savedContent);
      alert('Content loaded from saved state!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold">BlockNote Editor Test</h1>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPreview(!isPreview)}
              >
                {isPreview ? 'Edit Mode' : 'Preview Mode'}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLoad}
                disabled={!savedContent}
              >
                Load Saved
              </Button>
              
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
              >
                Save Content
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-4">
            {isPreview ? 'Preview Mode' : 'Edit Mode'}
          </h2>
          
          {isPreview ? (
            <div className="prose max-w-none">
              <p className="text-gray-600 mb-4">
                This is how your content will appear to readers:
              </p>
              <BlockEditor
                content={content}
                editable={false}
                showToolbar={false}
                showSideMenu={false}
              />
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-4">
                Try editing the content below. Use the slash command (/) to add new blocks.
              </p>
              <BlockEditor
                content={content}
                onChange={setContent}
                placeholder="Start typing or press '/' for commands..."
                autoSave={false}
              />
            </>
          )}
        </div>

        {/* Features List */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Key Features</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">📝 Rich Text Editing</h4>
              <p className="text-sm text-gray-600">
                Bold, italic, underline, strikethrough, code, and more formatting options
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">🎯 Slash Commands</h4>
              <p className="text-sm text-gray-600">
                Type '/' to quickly add headings, lists, quotes, and other blocks
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">🖼️ Media Support</h4>
              <p className="text-sm text-gray-600">
                Drag and drop images, embed videos, and add other media
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">✋ Drag & Drop</h4>
              <p className="text-sm text-gray-600">
                Reorder blocks by dragging them with the handle on the left
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">💾 Auto-save</h4>
              <p className="text-sm text-gray-600">
                Automatic saving with configurable delay (when enabled)
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">🌙 Dark Mode</h4>
              <p className="text-sm text-gray-600">
                Full dark mode support for comfortable editing at night
              </p>
            </div>
          </div>
        </div>

        {/* JSON Output */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">JSON Output</h3>
          <p className="text-sm text-gray-600 mb-4">
            The editor outputs clean JSON that can be stored in your database:
          </p>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-xs">
            {JSON.stringify(content, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}