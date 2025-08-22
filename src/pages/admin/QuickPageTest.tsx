import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { BlockEditor } from '@/components/BlockEditor';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

export default function QuickPageTest() {
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
      { type: 'bulletList', content: 'Feature 3: Version history' },
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
      // First, get or create member profile
      let { data: member, error: memberError } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (memberError && memberError.code === 'PGRST116') {
        // Member doesn't exist, create one
        const { data: newMember, error: createError } = await supabase
          .from('members')
          .insert({
            user_id: user.id,
            name: user.email?.split('@')[0] || 'Test User',
            email: user.email,
            status: 'published'
          })
          .select()
          .single();

        if (createError) throw createError;
        member = newMember;
      }

      if (!member) {
        throw new Error('Could not find or create member profile');
      }

      // Check if pages table exists
      const { error: tableCheckError } = await supabase
        .from('pages')
        .select('id')
        .limit(1);

      if (tableCheckError && tableCheckError.code === '42P01') {
        // Table doesn't exist, create it
        toast.error('Pages table not found. Please run database migrations first.');
        console.error('Pages table missing. Run this migration:', `
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content TEXT,
  blocks JSONB,
  author_id UUID REFERENCES members(id),
  status VARCHAR(20) DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
        `);
        return;
      }

      // Create the page
      const { data: page, error: pageError } = await supabase
        .from('pages')
        .insert({
          title: pageData.title,
          slug: pageData.slug,
          blocks: JSON.stringify(pageData.blocks),
          content: JSON.stringify(pageData.blocks),
          author_id: member.id,
          status: 'published',
          published_at: new Date().toISOString()
        })
        .select()
        .single();

      if (pageError) {
        if (pageError.code === '23505') {
          toast.error('A page with this slug already exists');
        } else {
          throw pageError;
        }
        return;
      }

      toast.success('Test page created successfully!');
      
      // Show success info
      const pageUrl = `/pages/${page.slug}`;
      const editUrl = `/admin/pages/${page.id}/edit`;
      
      alert(`Page created!\n\nView at: ${pageUrl}\nEdit at: ${editUrl}\n\nPage ID: ${page.id}`);
      
    } catch (error: any) {
      console.error('Error creating test page:', error);
      toast.error(error.message || 'Failed to create test page');
    } finally {
      setIsCreating(false);
    }
  };

  const handleTestTableStructure = async () => {
    try {
      // Test query to check table structure
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .limit(1);

      if (error) {
        console.error('Table check error:', error);
        alert(`Table Error: ${error.message}\n\nCode: ${error.code}`);
      } else {
        console.log('Table structure OK:', data);
        alert('Pages table exists and is accessible!');
      }
    } catch (error) {
      console.error('Error checking table:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Quick Page System Test</h1>
      
      {/* Database Check */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Step 1: Check Database</h2>
        <p className="text-sm text-gray-600 mb-4">
          First, let's verify the pages table exists in your database.
        </p>
        <Button onClick={handleTestTableStructure} variant="primary">
          Test Pages Table
        </Button>
      </div>

      {/* Test Page Creation */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
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
          disabled={isCreating}
        >
          {isCreating ? 'Creating...' : 'Create Test Page'}
        </Button>
      </div>

      {/* Editor Preview */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Step 3: Edit Content</h2>
        <p className="text-sm text-gray-600 mb-4">
          This is the content that will be saved to the test page:
        </p>
        
        <BlockEditor
          content={pageData.blocks}
          onChange={(blocks) => setPageData({ ...pageData, blocks })}
          placeholder="Add your page content here..."
        />
      </div>

      {/* Quick Links */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold mb-2">Quick Links</h3>
        <ul className="space-y-1 text-sm">
          <li>
            <a href="/test-editor" className="text-blue-600 hover:underline">
              → Test Editor
            </a>
          </li>
          <li>
            <a href="/admin/pages" className="text-blue-600 hover:underline">
              → Pages Management
            </a>
          </li>
          <li>
            <a href="/admin/pages/new" className="text-blue-600 hover:underline">
              → Create New Page
            </a>
          </li>
        </ul>
      </div>

      {/* Migration SQL */}
      <details className="mt-8">
        <summary className="cursor-pointer text-sm text-gray-600">
          If pages table is missing, run this SQL in Supabase
        </summary>
        <pre className="mt-2 p-4 bg-gray-900 text-gray-100 rounded-lg overflow-auto text-xs">
{`-- Simple pages table
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content TEXT,
  blocks JSONB,
  page_type VARCHAR(50) DEFAULT 'block',
  author_id UUID REFERENCES members(id),
  status VARCHAR(20) DEFAULT 'published',
  is_system BOOLEAN DEFAULT FALSE,
  is_editable BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  meta_title VARCHAR(255),
  meta_description TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Allow public to read published pages
CREATE POLICY "Public can read published pages" ON pages
  FOR SELECT USING (status = 'published');

-- Allow authenticated users to manage their pages
CREATE POLICY "Users can manage own pages" ON pages
  FOR ALL USING (auth.uid() IS NOT NULL);`}
        </pre>
      </details>
    </div>
  );
}