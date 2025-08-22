import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import PageTemplates from '@/features/pages/components/PageTemplates';
import { BlockEditor } from '@/components/BlockEditor';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export default function FeatureTestPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [editorContent, setEditorContent] = useState<any[]>([
    { type: 'heading', content: 'Feature Test Page' },
    { type: 'paragraph', content: 'Test all the dynamic page features here!' }
  ]);
  const [showTemplates, setShowTemplates] = useState(false);

  const handleTemplateSelect = (template: any) => {
    setEditorContent(template.blocks);
    setSelectedTemplate(template);
    setShowTemplates(false);
    toast.success(`Loaded "${template.name}" template`);
  };

  const handleSaveAsNewPage = async () => {
    if (!user) {
      toast.error('Please sign in to create pages');
      return;
    }

    const slug = 'test-' + Date.now();
    try {
      const { error } = await supabase
        .from('pages')
        .insert({
          title: selectedTemplate?.name || 'Test Page',
          slug,
          blocks: editorContent,
          status: 'published',
          page_type: 'block',
          published_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Page created successfully!');
      navigate(`/pages/${slug}`);
    } catch (error: any) {
      toast.error('Failed to create page: ' + error.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">🧪 Dynamic Pages Feature Test</h1>

      {/* Feature Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">✅ Completed Features</h3>
          <ul className="text-sm space-y-1 text-green-700 dark:text-green-400">
            <li>• Dynamic page viewing</li>
            <li>• Inline editing (double-click)</li>
            <li>• Dark/Light mode support</li>
            <li>• Block-based editor</li>
            <li>• Version history on save</li>
            <li>• Auto-save (3s delay)</li>
            <li>• Page templates</li>
            <li>• Admin access control</li>
          </ul>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">🔄 In Progress</h3>
          <ul className="text-sm space-y-1 text-blue-700 dark:text-blue-400">
            <li>• Static page migration</li>
            <li>• SEO metadata editing</li>
            <li>• Page analytics</li>
          </ul>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">📋 Test Links</h3>
          <div className="space-y-2">
            <a href="/direct-admin-pages" className="block text-sm text-yellow-700 dark:text-yellow-400 hover:underline">
              → Admin Pages Management
            </a>
            <a href="/pages/home" className="block text-sm text-yellow-700 dark:text-yellow-400 hover:underline">
              → Home Page (Dynamic)
            </a>
            <a href="/pages/about" className="block text-sm text-yellow-700 dark:text-yellow-400 hover:underline">
              → About Page (Dynamic)
            </a>
            <a href="/test-editor" className="block text-sm text-yellow-700 dark:text-yellow-400 hover:underline">
              → Block Editor Test
            </a>
          </div>
        </div>
      </div>

      {/* Template Selection */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Page Templates</h2>
          <Button 
            onClick={() => setShowTemplates(!showTemplates)}
            variant="secondary"
          >
            {showTemplates ? 'Hide Templates' : 'Browse Templates'}
          </Button>
        </div>

        {showTemplates && (
          <PageTemplates onSelectTemplate={handleTemplateSelect} />
        )}

        {selectedTemplate && !showTemplates && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm">
              <strong>Using template:</strong> {selectedTemplate.name}
            </p>
          </div>
        )}
      </div>

      {/* Live Editor */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Live Editor Preview</h2>
          <Button 
            onClick={handleSaveAsNewPage}
            variant="primary"
          >
            Save as New Page
          </Button>
        </div>

        <BlockEditor
          content={editorContent}
          onChange={setEditorContent}
          editable={true}
          autoSave={false}
          className="min-h-[400px]"
        />
      </div>

      {/* Feature Documentation */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">📚 Feature Documentation</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">How to Use Dynamic Pages:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li>Create pages via admin interface or templates</li>
              <li>Double-click any page content to edit inline</li>
              <li>Changes auto-save after 3 seconds of inactivity</li>
              <li>Version history tracks all changes</li>
              <li>Toggle dark/light mode with editor button</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Block Types:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li><strong>Heading:</strong> Section titles (H key)</li>
              <li><strong>Paragraph:</strong> Regular text content</li>
              <li><strong>Bullet List:</strong> Unordered lists</li>
              <li><strong>Quote:</strong> Highlighted quotations</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Keyboard Shortcuts:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li><kbd>Enter</kbd> - Create new block</li>
              <li><kbd>Backspace</kbd> (empty block) - Delete block</li>
              <li><kbd>Ctrl+B</kbd> - Bold text</li>
              <li><kbd>Ctrl+I</kbd> - Italic text</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}