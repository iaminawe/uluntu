import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { BlockEditor } from '@/components/BlockEditor';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

export default function SimplePageTest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [pageData, setPageData] = useState({
    title: 'Test Page ' + Date.now(),
    slug: 'test-page-' + Date.now(),
    blocks: [
      { type: 'heading', content: 'Welcome to Test Page' },
      { type: 'paragraph', content: 'This is a test of the dynamic page system.' },
      { type: 'bulletList', content: 'Feature 1: Block-based editing' },
      { type: 'bulletList', content: 'Feature 2: Auto-save functionality' },
      { type: 'quote', content: 'Building amazing content management systems!' }
    ]
  });

  const handleCreateTestPage = async () => {
    if (!user) {
      toast.error('Please sign in to create pages');
      return;
    }

    setIsCreating(true);
    try {
      // Use service role to bypass RLS temporarily
      const { data: page, error: pageError } = await supabase
        .from('pages')
        .insert({
          title: pageData.title,
          slug: pageData.slug,
          blocks: pageData.blocks,
          content: JSON.stringify(pageData.blocks),
          status: 'published',
          page_type: 'block',
          published_at: new Date().toISOString()
        })
        .select()
        .single();

      if (pageError) {
        // If RLS blocks us, show instructions
        if (pageError.code === '42501') {
          toast.error('Need admin permissions. Run the SQL script first.');
          console.log('Run this SQL in Supabase SQL Editor:');
          console.log(`
-- Grant yourself admin access
INSERT INTO members (user_id, name, email, status, slug)
SELECT 
    '${user.id}',
    '${user.email?.split('@')[0] || 'admin'}',
    '${user.email}',
    'published',
    '${user.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'admin'}'
WHERE NOT EXISTS (
    SELECT 1 FROM members WHERE user_id = '${user.id}'
);

INSERT INTO user_roles (user_id, role)
SELECT '${user.id}', 'admin'
WHERE NOT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = '${user.id}' AND role = 'admin'
);

-- Temporarily disable RLS for testing
ALTER TABLE pages DISABLE ROW LEVEL SECURITY;

-- Insert test page
INSERT INTO pages (title, slug, blocks, status, page_type, published_at)
VALUES (
    '${pageData.title}',
    '${pageData.slug}',
    '${JSON.stringify(pageData.blocks)}',
    'published',
    'block',
    NOW()
);

-- Re-enable RLS
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
          `);
          return;
        }
        throw pageError;
      }

      toast.success('Test page created successfully!');
      
      // Show success info
      const pageUrl = `/pages/${page.slug}`;
      
      alert(`Page created!\\n\\nView at: ${pageUrl}\\n\\nPage ID: ${page.id}`);
      
      // Navigate to the page
      navigate(pageUrl);
      
    } catch (error: any) {
      console.error('Error creating test page:', error);
      toast.error(error.message || 'Failed to create test page');
    } finally {
      setIsCreating(false);
    }
  };

  const testDatabaseConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('id, title, slug')
        .limit(5);

      if (error) {
        console.error('Database test error:', error);
        alert(`Database Error: ${error.message}\\n\\nCode: ${error.code}`);
      } else {
        console.log('Database test success:', data);
        alert(`Database OK! Found ${data.length} pages.\\n\\nSample: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      console.error('Connection test error:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Simple Page System Test</h1>
      
      {/* User Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">User Status</h2>
        {user ? (
          <div className="space-y-2">
            <p><strong>✅ Signed in as:</strong> {user.email}</p>
            <p><strong>User ID:</strong> <code className="text-sm bg-gray-100 px-1 rounded">{user.id}</code></p>
          </div>
        ) : (
          <p className="text-red-600">❌ Not signed in</p>
        )}
      </div>

      {/* Database Test */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Step 1: Database Connection</h2>
        <p className="text-sm text-gray-600 mb-4">
          Test if we can connect to the pages table.
        </p>
        <Button onClick={testDatabaseConnection} variant="secondary">
          Test Database Connection
        </Button>
      </div>

      {/* Test Page Creation */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Step 2: Create Test Page</h2>
        
        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={pageData.title}
              onChange={(e) => setPageData({ ...pageData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug
            </label>
            <input
              type="text"
              value={pageData.slug}
              onChange={(e) => setPageData({ ...pageData, slug: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
            />
          </div>
        </div>

        <Button 
          onClick={handleCreateTestPage} 
          variant="primary"
          disabled={isCreating || !user}
        >
          {isCreating ? 'Creating...' : 'Create Test Page'}
        </Button>
      </div>

      {/* Editor Preview */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Step 3: Content Preview</h2>
        <p className="text-sm text-gray-600 mb-4">
          This is the content that will be saved to the test page:
        </p>
        
        <BlockEditor
          content={pageData.blocks}
          onChange={(blocks) => setPageData({ ...pageData, blocks })}
          placeholder="Add your page content here..."
        />
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold mb-2">If you get "Permission Denied":</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Check the browser console for the SQL script</li>
          <li>Copy and run the SQL in your Supabase SQL Editor</li>
          <li>This will grant you admin access and create the test page</li>
          <li>Then try visiting <code>/pages/[your-slug]</code></li>
        </ol>
      </div>
    </div>
  );
}