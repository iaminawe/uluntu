import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Edit, Eye, Trash2, Globe, Lock, Archive } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

interface Page {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  page_type: string;
  is_system: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  author?: {
    name: string;
  };
}

export default function DirectAdminPages() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Check if user is admin (direct database check)
  const { data: isAdmin } = useQuery({
    queryKey: ['user-admin-check', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'superadmin']);
      
      return !error && data && data.length > 0;
    },
    enabled: !!user
  });

  // Fetch pages
  const { data: pages, isLoading, refetch } = useQuery({
    queryKey: ['admin-pages-direct'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pages')
        .select(`
          *,
          author:members!author_id(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Page[];
    },
    enabled: !!isAdmin
  });

  // Create test page
  const createTestPage = async () => {
    if (!user || !isAdmin) {
      toast.error('Admin access required');
      return;
    }

    setCreating(true);
    try {
      const testPage = {
        title: 'Test Page ' + Date.now(),
        slug: 'test-page-' + Date.now(),
        blocks: [
          { type: 'heading', content: 'Welcome to Our Test Page' },
          { type: 'paragraph', content: 'This is a test of the dynamic page system.' },
          { type: 'heading', content: 'Key Features' },
          { type: 'bulletList', content: 'Block-based content editing' },
          { type: 'bulletList', content: 'Auto-save functionality' },
          { type: 'bulletList', content: 'Version history tracking' },
          { type: 'quote', content: 'Building amazing content management systems!' }
        ],
        page_type: 'block',
        status: 'published' as const,
        is_featured: true,
        published_at: new Date().toISOString()
      };

      const { data: page, error } = await supabase
        .from('pages')
        .insert(testPage)
        .select()
        .single();

      if (error) throw error;

      toast.success('Test page created successfully!');
      refetch();
      
      alert(`Page created!\\n\\nView at: /pages/${page.slug}\\nPage ID: ${page.id}`);
      
    } catch (error: any) {
      toast.error('Failed to create page: ' + error.message);
    } finally {
      setCreating(false);
    }
  };

  // Delete page
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Page deleted successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to delete page');
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  // Show access denied if not admin
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <Button onClick={() => navigate('/signin')}>Sign In</Button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
          <p className="mb-4">You need admin permissions to access this page.</p>
          <Button onClick={() => navigate('/debug-admin')}>Check Admin Status</Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        <span className="capitalize">{status}</span>
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Pages Management (Direct Access)</h1>
      
      {/* Quick Actions */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            onClick={createTestPage}
            variant="primary"
            disabled={creating}
          >
            <Plus className="h-4 w-4 mr-2" />
            {creating ? 'Creating...' : 'Create Test Page'}
          </Button>
          
          <Button
            onClick={() => navigate('/test-editor')}
            variant="ghost"
          >
            Test Editor
          </Button>
        </div>

        <div className="text-sm text-gray-600">
          {pages?.length || 0} pages total
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Updated
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Loading pages...
                </td>
              </tr>
            ) : pages?.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No pages found. Create your first page!
                </td>
              </tr>
            ) : (
              pages?.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {page.title}
                        </div>
                        {page.is_featured && (
                          <span className="text-xs text-orange-600">Featured</span>
                        )}
                        {page.is_system && (
                          <span className="text-xs text-blue-600 ml-2">System</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono">
                      /{page.slug}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(page.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(page.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(`/pages/${page.slug}`, '_blank')}
                        title="View page"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!page.is_system && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(page.id, page.title)}
                          disabled={deletingId === page.id}
                          title="Delete page"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold mb-2">Next Steps:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Create a test page using the button above</li>
          <li>View the page by clicking the eye icon</li>
          <li>Test inline editing by double-clicking content on the page</li>
          <li>Try the admin toolbar features</li>
        </ol>
      </div>
    </div>
  );
}