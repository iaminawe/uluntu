import React, { useState } from 'react';
import { SimpleBlockEditor } from '@/components/SimpleBlockEditor';
import { Button } from '@/components/ui/Button';
import { checkAIConfiguration } from '@/lib/ai/blocknote-ai-simplified';
import { unsplashService } from '@/lib/ai/unsplash-service';

export default function AIEditorDemo() {
  const aiConfig = checkAIConfiguration();
  const unsplashConfigured = unsplashService.isConfigured();
  const [content, setContent] = useState<any[]>([
    {
      type: 'heading',
      content: 'AI-Powered BlockNote Editor Demo',
      props: { level: 1 },
    },
    {
      type: 'paragraph',
      content: 'Welcome to the AI-enhanced BlockNote editor! This powerful editor includes AI assistance for content creation with automatic image insertion from Unsplash.',
    },
    {
      type: 'heading',
      content: 'How to Use AI Features',
      props: { level: 2 },
    },
    {
      type: 'paragraph',
      content: 'Click the ✨ AI Assistant button in the toolbar to access all AI commands, or type "/" to use the slash menu.',
    },
    {
      type: 'paragraph',
      content: 'Try selecting this paragraph and using AI to improve it, make it longer, or change its tone!',
    },
  ]);

  const [savedContent, setSavedContent] = useState<any[] | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate saving to backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSavedContent(content);
    setIsSaving(false);
  };

  const handleLoad = () => {
    if (savedContent) {
      setContent(savedContent);
    }
  };

  // Removed auto-save for now to debug the issue

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI BlockNote Editor</h1>
              <p className="text-sm text-gray-500">
                {aiConfig.isConfigured ? `✨ AI Features Enabled (${aiConfig.provider})` : '⚠️ Configure API keys to enable AI'}
                {unsplashConfigured && <span className="ml-2">📷 Images Enabled</span>}
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
                📥 Load Saved
              </Button>
              
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? '⏳ Saving...' : '💾 Save'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Editor Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50">
            <h2 className="text-lg font-semibold text-gray-900">
              {isPreview ? '👁️ Preview Mode' : '✏️ Edit Mode'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {isPreview 
                ? 'This is how your content will appear to readers'
                : 'Select text and use AI commands to enhance your content'}
            </p>
          </div>
          
          <div className="p-6">
            <SimpleBlockEditor
              initialContent={content}
              onChange={setContent}
              editable={!isPreview}
              className="min-h-[400px]"
            />
          </div>
        </div>

        {/* AI Commands Reference */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="text-2xl mr-2">✨</span>
            Available AI Commands
          </h3>
          
          {/* Content Creation Commands */}
          <div className="mb-6">
            <h4 className="text-md font-semibold mb-3 text-gray-700">📝 Content Creation (Type "/" to access)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { icon: '📄', title: 'Blog Post', desc: '1000-1500 words + images' },
                { icon: '📋', title: 'Article Outline', desc: 'Detailed multi-level structure' },
                { icon: '🎯', title: 'Introduction', desc: '200-300 word openings' },
                { icon: '🏁', title: 'Conclusion', desc: '200-300 word closings' },
                { icon: '📊', title: 'Executive Summary', desc: '300-500 word summaries' },
                { icon: '📱', title: 'Social Media Post', desc: '150-200 word posts' },
                { icon: '✉️', title: 'Email Draft', desc: '250-400 word emails' },
                { icon: '📰', title: 'Press Release', desc: '400-600 word announcements' },
                { icon: '🛍️', title: 'Product Description', desc: '300-500 words + images' },
                { icon: '❓', title: 'FAQ Section', desc: '8-10 detailed Q&As' },
                { icon: '📖', title: 'How-To Guide', desc: '600-1000 words + images' },
                { icon: '⚖️', title: 'Comparison', desc: '500-800 word analysis' },
                { icon: '➡️', title: 'Continue Writing', desc: '300-500 more words' },
                { icon: '💡', title: 'Generate Ideas', desc: '10-15 detailed ideas' },
                { icon: '📰', title: 'Headlines', desc: '15-20 varied headlines' },
              ].map((cmd, idx) => (
                <div key={idx} className="border border-blue-100 bg-blue-50 rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-start">
                    <span className="text-lg mr-2">{cmd.icon}</span>
                    <div>
                      <h5 className="font-medium text-sm text-blue-900">{cmd.title}</h5>
                      <p className="text-xs text-blue-700 mt-1">{cmd.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Editing Commands */}
          <div>
            <h4 className="text-md font-semibold mb-3 text-gray-700">✏️ Content Editing (Select text first)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { icon: '✨', title: 'Improve Writing', desc: 'Enhance grammar and clarity' },
                { icon: '📝', title: 'Make Shorter', desc: 'Condense while keeping key info' },
                { icon: '📖', title: 'Make Longer', desc: 'Add details and examples' },
                { icon: '👔', title: 'Professional Tone', desc: 'Formal business language' },
                { icon: '😊', title: 'Casual Tone', desc: 'Friendly, informal style' },
                { icon: '•', title: 'Convert to Bullets', desc: 'Create bullet points' },
                { icon: '✅', title: 'Fix Grammar', desc: 'Correct all errors' },
              ].map((cmd, idx) => (
                <div key={idx} className="border border-green-100 bg-green-50 rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-start">
                    <span className="text-lg mr-2">{cmd.icon}</span>
                    <div>
                      <h5 className="font-medium text-sm text-green-900">{cmd.title}</h5>
                      <p className="text-xs text-green-700 mt-1">{cmd.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Setup Instructions */}
        {!aiConfig.isConfigured && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-3 text-yellow-900">
              🔧 Setup AI Features
            </h3>
            <p className="text-sm text-yellow-800 mb-4">
              To enable AI features, add your API key to the environment variables:
            </p>
            <div className="bg-white rounded-lg p-4 font-mono text-sm">
              <div className="text-gray-600"># In your .env file:</div>
              <div className="mt-2">
                <div>VITE_OPENAI_API_KEY=your-openai-api-key</div>
                <div className="text-gray-500"># or</div>
                <div>VITE_ANTHROPIC_API_KEY=your-anthropic-api-key</div>
                <div className="mt-2 text-gray-500"># For automatic images:</div>
                <div>VITE_UNSPLASH_ACCESS_KEY=your-unsplash-key</div>
              </div>
            </div>
            <p className="text-xs text-yellow-700 mt-3">
              After adding your API key, restart the development server.
            </p>
          </div>
        )}

        {/* Features Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">🚀 Key Features</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-sm">Real-time AI suggestions with streaming responses</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-sm">15+ AI commands for content enhancement</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-sm">Support for OpenAI and Anthropic models</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-sm">Auto-save with configurable delay</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-sm">Block-based editing with drag & drop</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-sm">Automatic relevant images from Unsplash</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-sm">Smart image placement in content</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">💡 Pro Tips</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">→</span>
                <span className="text-sm">Select text before using AI for targeted improvements</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">→</span>
                <span className="text-sm">Use "/" to quickly access all editor commands</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">→</span>
                <span className="text-sm">Drag blocks using the handle on the left</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">→</span>
                <span className="text-sm">Chain AI commands for complex transformations</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">→</span>
                <span className="text-sm">Review AI suggestions before accepting them</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}