import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import ComponentBlockEditor from '@/components/BlockEditor/ComponentBlockEditor';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Save, Eye, Trash2, Calendar, User, Globe, FileText } from 'lucide-react';

interface PageData {
  id: string;
  title: string;
  slug: string;
  blocks: any[];
  content?: string;
  status: string;
  is_editable: boolean;
  is_system: boolean;
  is_featured: boolean;
  meta_title?: string;
  meta_description?: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  version: number;
  author_id?: string;
  author?: {
    name: string;
    email: string;
  };
}

export default function AdvancedPageEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Form state
  const [title, setTitle] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [metaTitle, setMetaTitle] = useState<string>('');
  const [metaDescription, setMetaDescription] = useState<string>('');
  const [blocks, setBlocks] = useState<any[]>([]);
  const [status, setStatus] = useState<string>('draft');
  const [isEditable, setIsEditable] = useState<boolean>(true);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [publishedAt, setPublishedAt] = useState<string>('');
  const [authorId, setAuthorId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Check if user is admin
  const { data: isAdmin } = useQuery({
    queryKey: ['user-admin-status', user?.id],
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

  // Fetch page data
  const { data: page, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-page', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pages')
        .select(`
          *,
          author:members!author_id(name, email)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Parse blocks if they're stored as string
      if (data.blocks && typeof data.blocks === 'string') {
        try {
          data.blocks = JSON.parse(data.blocks);
        } catch (e) {
          console.error('Failed to parse blocks:', e);
          data.blocks = [];
        }
      }
      
      return data as PageData;
    },
    enabled: !!id && !!isAdmin
  });

  // Fetch available authors (admin users)
  const { data: authors } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select('id, name, email')
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!isAdmin
  });

  // Initialize form data when page loads
  useEffect(() => {
    if (page) {
      setTitle(page.title || '');
      setSlug(page.slug || '');
      setMetaTitle(page.meta_title || '');
      setMetaDescription(page.meta_description || '');
      setBlocks(page.blocks || []);
      setStatus(page.status || 'draft');
      setIsEditable(page.is_editable !== false);
      setIsFeatured(page.is_featured || false);
      setPublishedAt(page.published_at ? new Date(page.published_at).toISOString().slice(0, 16) : '');
      setAuthorId(page.author_id || user?.id || '');
    }
  }, [page, user]);

  // Auto-generate slug from title
  const generateSlug = (titleText: string) => {
    return titleText
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    // Auto-generate slug if it's empty or matches the current title's slug
    if (!slug || slug === generateSlug(page?.title || '')) {
      setSlug(generateSlug(newTitle));
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!page || !isAdmin) return;
    
    setIsSaving(true);
    try {
      const updateData: any = {
        title,
        slug,
        meta_title: metaTitle,
        meta_description: metaDescription,
        blocks,
        status,
        is_editable: isEditable,
        is_featured: isFeatured,
        version: (page.version || 1) + 1,
        updated_at: new Date().toISOString()
      };

      // Only update published_at if status is published and date is provided
      if (status === 'published' && publishedAt) {
        updateData.published_at = new Date(publishedAt).toISOString();
      }

      // Only update author if user has permission and author is different
      if (authorId && authorId !== page.author_id) {
        updateData.author_id = authorId;
      }

      const { error } = await supabase
        .from('pages')
        .update(updateData)
        .eq('id', page.id);

      if (error) throw error;
      
      toast.success('Page saved successfully! 📝');
      refetch();
    } catch (error: any) {
      toast.error('Failed to save page: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!page || !isAdmin) return;
    
    if (!confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', page.id);

      if (error) throw error;
      
      toast.success('Page deleted successfully');
      navigate('/admin/pages');
    } catch (error: any) {
      toast.error('Failed to delete page: ' + error.message);
    }
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Page Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The page you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/admin/pages')}>
            Back to Pages
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Advanced Page Editor
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {page.is_system && <span className="text-blue-600 dark:text-blue-400">System Page</span>}
                  {page.is_system && ' • '}
                  Version {page.version} • Last updated {new Date(page.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => window.open(`/pages/${page.slug}`, '_blank')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              {!page.is_system && (
                <Button
                  variant="ghost"
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Page Content */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Page Content</h2>
              
              {/* Title Editor */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Page Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full text-2xl font-bold bg-transparent border-2 border-slate-200 dark:border-slate-600 rounded-lg px-4 py-3 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter page title..."
                />
              </div>

              {/* Block Editor */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
                  Page Content
                </label>
                <ComponentBlockEditor
                  content={blocks}
                  onChange={setBlocks}
                  editable={true}
                />
              </div>
            </div>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-6">
            {/* Publishing Settings */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-4 text-slate-900 dark:text-slate-100 flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Publishing
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    placeholder="page-url-slug"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    URL: /pages/{slug}
                  </p>
                </div>

                {status === 'published' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Publish Date
                    </label>
                    <input
                      type="datetime-local"
                      value={publishedAt}
                      onChange={(e) => setPublishedAt(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isEditable}
                      onChange={(e) => setIsEditable(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Allow editing</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Featured page</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Author Settings */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-4 text-slate-900 dark:text-slate-100 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Author
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Page Author
                </label>
                <select
                  value={authorId}
                  onChange={(e) => setAuthorId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                >
                  <option value="">Select author...</option>
                  {authors?.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name} ({author.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* SEO Settings */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-4 text-slate-900 dark:text-slate-100 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                SEO Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    placeholder="SEO title (optional)"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {metaTitle.length}/60 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 resize-none"
                    placeholder="SEO description..."
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {metaDescription.length}/160 characters
                  </p>
                </div>
              </div>
            </div>

            {/* Page Information */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-4 text-slate-900 dark:text-slate-100">Page Information</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Created:</span>
                  <span className="text-slate-900 dark:text-slate-100">
                    {new Date(page.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Updated:</span>
                  <span className="text-slate-900 dark:text-slate-100">
                    {new Date(page.updated_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Version:</span>
                  <span className="text-slate-900 dark:text-slate-100">{page.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Blocks:</span>
                  <span className="text-slate-900 dark:text-slate-100">{blocks.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}