import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Edit, Eye, Trash2, Globe, Lock, Archive } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/ui/PageLayout';
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

export default function PagesManagement() {
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch pages
  const { data: pages, isLoading, refetch } = useQuery({
    queryKey: ['admin-pages'],
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
    }
  });

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <Globe className="h-4 w-4 text-green-600" />;
      case 'draft':
        return <Lock className="h-4 w-4 text-yellow-600" />;
      case 'archived':
        return <Archive className="h-4 w-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="Pages Management"
        description="Create and manage dynamic pages for your site"
      />

      {/* Actions Bar */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate('/admin/pages/new')}
            variant="primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Page
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
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Author
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
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  Loading pages...
                </td>
              </tr>
            ) : pages?.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
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
                    {page.page_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {page.author?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(page.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/pages/${page.slug}`)}
                        title="View page"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/admin/pages/${page.id}/edit`)}
                        title="Edit page"
                      >
                        <Edit className="h-4 w-4" />
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

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Published</div>
          <div className="text-2xl font-bold text-green-600">
            {pages?.filter(p => p.status === 'published').length || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Drafts</div>
          <div className="text-2xl font-bold text-yellow-600">
            {pages?.filter(p => p.status === 'draft').length || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">System Pages</div>
          <div className="text-2xl font-bold text-blue-600">
            {pages?.filter(p => p.is_system).length || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Featured</div>
          <div className="text-2xl font-bold text-orange-600">
            {pages?.filter(p => p.is_featured).length || 0}
          </div>
        </div>
      </div>
    </div>
  );
}