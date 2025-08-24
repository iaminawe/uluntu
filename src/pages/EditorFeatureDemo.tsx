import React, { useState } from 'react';
import { EnhancedContentAIEditor } from '@/components/content';

export default function EditorFeatureDemo() {
  const [content, setContent] = useState(`# Welcome to the Enhanced AI Editor

This editor now includes powerful new features:

## 🎨 Rich Formatting Toolbar
- **Bold**, *italic*, and ~~strikethrough~~ text
- Multiple heading levels
- Bullet and numbered lists
- Code blocks and inline \`code\`
- Block quotes

## 📷 Image Support
- Upload images directly from your computer
- Search and insert images from Unsplash
- Automatic alt text and attribution

## 👁️ Preview Mode
Click the Preview button to see your formatted content!

## 🤖 AI Features
- Generate content with AI
- Improve writing quality
- Fix grammar and spelling
- Adjust tone (professional/casual)
- Expand or shorten content

Try editing this content or generating new content with AI!`);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Enhanced Content AI Editor Demo
          </h1>
          <p className="text-lg text-slate-600">
            Experience all the new features: image upload, markdown preview, and rich formatting
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Try the Editor</h2>
          
          <EnhancedContentAIEditor
            value={content}
            onChange={setContent}
            contentType="general"
            includeImages={true}
            height="600px"
            placeholder="Start writing or use AI to generate content..."
          />

          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <h3 className="font-semibold mb-2">✨ New Features:</h3>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>• <strong>Upload Images:</strong> Click the image icon → Upload Image</li>
              <li>• <strong>Preview Mode:</strong> Click the Preview button to see rendered markdown</li>
              <li>• <strong>Rich Formatting:</strong> Use toolbar buttons or keyboard shortcuts</li>
              <li>• <strong>Undo/Redo:</strong> Ctrl+Z / Ctrl+Y</li>
              <li>• <strong>AI Generation:</strong> Click Generate to create content</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-3">📸 Image Features</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Upload images from your device (max 5MB)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Search Unsplash for stock photos</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Automatic image optimization</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Alt text for accessibility</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-3">👁️ Preview Features</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span>Live markdown rendering</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span>GitHub Flavored Markdown support</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span>Syntax highlighting for code blocks</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span>Responsive image display</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}