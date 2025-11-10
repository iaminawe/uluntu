import React, { useState } from 'react';
import { FixedBlockEditor } from '@/components/FixedBlockEditor';
import { Button } from '@/components/ui/Button';
import { checkAIConfiguration } from '@/lib/ai/blocknote-ai-simplified';
import { unsplashService } from '@/lib/ai/unsplash-service';

export default function FixedAIEditor() {
  const aiConfig = checkAIConfiguration();
  const unsplashConfigured = unsplashService.isConfigured();
  
  // Simple initial content without IDs
  const [content, setContent] = useState<any[]>([
    {
      type: 'heading',
      content: 'AI-Powered BlockNote Editor',
      props: { level: 1 },
    },
    {
      type: 'paragraph',
      content: 'Welcome! This editor combines the power of AI content generation with automatic image insertion from Unsplash.',
    },
    {
      type: 'heading',
      content: 'Features',
      props: { level: 2 },
    },
    {
      type: 'paragraph',
      content: '• Generate 1000-1500 word blog posts with AI',
    },
    {
      type: 'paragraph',
      content: '• Automatic relevant image insertion from Unsplash',
    },
    {
      type: 'paragraph',
      content: '• Multiple content types: Blog posts, introductions, conclusions, how-to guides, and more',
    },
    {
      type: 'paragraph',
      content: '• Edit and improve existing text with AI assistance',
    },
    {
      type: 'heading',
      content: 'How to Use',
      props: { level: 2 },
    },
    {
      type: 'paragraph',
      content: 'Click the ✨ AI Assistant button above to see all available commands. Select text first for editing commands, or use creation commands to generate new content.',
    },
  ]);

  const [savedContent, setSavedContent] = useState<any[] | null>(null);
  const [isPreview, setIsPreview] = useState(false);

  const handleSave = () => {
    setSavedContent(content);
  };

  const handleLoad = () => {
    if (savedContent) {
      setContent(savedContent);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Fixed AI BlockNote Editor</h1>
              <p className="text-sm text-gray-500">
                {aiConfig.isConfigured ? `✨ AI: ${aiConfig.provider}` : '⚠️ Configure API keys'}
                {unsplashConfigured && ' | 📷 Images: Ready'}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPreview(!isPreview)}
              >
                {isPreview ? '✏️ Edit' : '👁️ Preview'}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLoad}
                disabled={!savedContent}
              >
                📥 Load
              </Button>
              
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
              >
                💾 Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <FixedBlockEditor
            initialContent={content}
            onChange={setContent}
            editable={!isPreview}
            className="min-h-[600px]"
          />
        </div>

        {/* Command Reference */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold mb-4">📝 Content Creation</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="mr-2">📄</span>
                <div>
                  <strong>Blog Post:</strong> 1000-1500 words with images
                </div>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📋</span>
                <div>
                  <strong>Article Outline:</strong> Detailed structure
                </div>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🎯</span>
                <div>
                  <strong>Introduction:</strong> 200-300 word openings
                </div>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🏁</span>
                <div>
                  <strong>Conclusion:</strong> 200-300 word closings
                </div>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📖</span>
                <div>
                  <strong>How-To Guide:</strong> 600-1000 word tutorials
                </div>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🛍️</span>
                <div>
                  <strong>Product Description:</strong> 300-500 words
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold mb-4">✏️ Text Editing</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="mr-2">✨</span>
                <div>
                  <strong>Improve:</strong> Enhance grammar and clarity
                </div>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📝</span>
                <div>
                  <strong>Shorten:</strong> Make text more concise
                </div>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📖</span>
                <div>
                  <strong>Expand:</strong> Add more details
                </div>
              </li>
              <li className="flex items-start">
                <span className="mr-2">👔</span>
                <div>
                  <strong>Professional:</strong> Formal tone
                </div>
              </li>
              <li className="flex items-start">
                <span className="mr-2">😊</span>
                <div>
                  <strong>Casual:</strong> Friendly tone
                </div>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✅</span>
                <div>
                  <strong>Fix Grammar:</strong> Correct errors
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Setup Instructions */}
        {!aiConfig.isConfigured && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-3 text-yellow-900">
              🔧 Setup Required
            </h3>
            <div className="bg-white rounded-lg p-4 font-mono text-sm">
              <div className="text-gray-600"># Add to .env.local:</div>
              <div className="mt-2">
                <div>VITE_OPENAI_API_KEY=your-openai-api-key</div>
                <div className="text-gray-500"># or</div>
                <div>VITE_ANTHROPIC_API_KEY=your-anthropic-api-key</div>
                <div className="mt-2 text-gray-500"># For images:</div>
                <div>VITE_UNSPLASH_ACCESS_KEY=your-unsplash-key</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}