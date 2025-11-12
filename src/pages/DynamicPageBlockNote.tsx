import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Block, PartialBlock } from '@blocknote/core';
import BlockNoteEditor from '@/features/pages/components/BlockNoteEditor';
import BlockNoteRenderer from '@/features/pages/components/BlockNoteRenderer';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useEnabledFeatures } from '@/hooks/useSettings';
import { toast } from 'react-hot-toast';
import { Edit, Save, X, FileX, Menu, ExternalLink } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface PageData {
  id: string;
  title: string;
  slug: string;
  content: PartialBlock[] | Block[];
  status: string;
  is_editable: boolean;
  is_system: boolean;
  meta_title?: string;
  meta_description?: string;
  author?: {
    name: string;
  };
  updated_at: string;
  version?: number;
}

// Helper to detect if data is in BlockNote format
const isBlockNoteFormat = (content: any): boolean => {
  return Array.isArray(content) && content.length > 0 &&
         content[0] && typeof content[0] === 'object' &&
         ('type' in content[0] || 'id' in content[0]);
};

export default function DynamicPageBlockNote() {
  const { slug: slugParam } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Get slug from params or derive from pathname
  const slug = slugParam || location.pathname.replace(/^\//, '').replace(/\/$/, '');
  const { user } = useAuth();
  const { isFeatureEnabled, loading: featuresLoading } = useEnabledFeatures();
  const pagesEnabled = isFeatureEnabled('pages_system');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState<Block[]>([]);
  const [editedTitle, setEditedTitle] = useState<string>('');
  const [editedMetaDescription, setEditedMetaDescription] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Redirect if pages feature is disabled
  if (!featuresLoading && !pagesEnabled) {
    return <Navigate to="/" replace />;
  }

  if (featuresLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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
    queryKey: ['dynamic-page-blocknote', slug, isAdmin],
    queryFn: async () => {
      const query = supabase
        .from('pages')
        .select(`
          *,
          author:members!author_id(name)
        `)
        .eq('slug', slug);

      // Only filter by 'published' status if user is not admin
      // This allows admins to view unpublished pages
      if (!isAdmin) {
        query.eq('status', 'published');
      }

      const { data, error } = await query.single();

      if (error) throw error;

      // Parse content if it's stored as string
      if (data.content && typeof data.content === 'string') {
        try {
          data.content = JSON.parse(data.content);
        } catch (e) {
          console.error('Failed to parse content:', e);
          data.content = [];
        }
      }

      // If content is in old blocks format, try to use it
      if (data.blocks && !data.content) {
        data.content = data.blocks;
      }

      // Ensure content is valid BlockNote format
      if (!data.content || !isBlockNoteFormat(data.content)) {
        // Initialize with empty BlockNote document
        data.content = [
          {
            type: 'paragraph',
            content: '',
          }
        ];
      }

      return data as PageData;
    },
    enabled: isAdmin !== undefined
  });

  // Initialize edited data when page loads
  useEffect(() => {
    if (page?.content) {
      setEditedContent(page.content as Block[]);
      setEditedTitle(page.title || '');
      setEditedMetaDescription(page.meta_description || '');
    }
  }, [page]);

  // Handle save
  const handleSave = async () => {
    if (!page || !isAdmin) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('pages')
        .update({
          title: editedTitle,
          meta_description: editedMetaDescription,
          content: editedContent,
          version: (page.version || 1) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', page.id);

      if (error) throw error;

      toast.success('Page saved successfully!');
      setIsEditing(false);
      refetch();
    } catch (error: any) {
      toast.error('Failed to save page: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle unpublish
  const handleUnpublish = async () => {
    if (!page || !isAdmin) return;

    if (!confirm('Are you sure you want to unpublish this page? It will no longer be accessible to visitors.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('pages')
        .update({
          status: 'draft',
          updated_at: new Date().toISOString()
        })
        .eq('id', page.id);

      if (error) throw error;

      toast.success('Page unpublished successfully');
      refetch();
    } catch (error: any) {
      toast.error('Failed to unpublish page: ' + error.message);
    }
  };

  // Handle add to menu
  const handleAddToMenu = async () => {
    if (!page || !isAdmin) return;

    try {
      // Check if already in menu
      const { data: existing } = await supabase
        .from('menu_items')
        .select('id')
        .eq('url', `/${page.slug}`)
        .single();

      if (existing) {
        toast.error('This page is already in the menu');
        return;
      }

      // Get max sort order for main menu
      const { data: maxOrder } = await supabase
        .from('menu_items')
        .select('sort_order')
        .eq('menu_type', 'main')
        .is('parent_id', null)
        .order('sort_order', { ascending: false })
        .limit(1)
        .single();

      const nextOrder = (maxOrder?.sort_order || 0) + 1;

      // Add to menu
      const { error } = await supabase
        .from('menu_items')
        .insert({
          label: page.title,
          url: `/${page.slug}`,
          menu_type: 'main',
          is_enabled: true,
          sort_order: nextOrder,
          target: '_self',
          visibility: 'public'
        });

      if (error) throw error;

      toast.success('Page added to menu successfully! Visit Menu Management to customize.');
    } catch (error: any) {
      toast.error('Failed to add to menu: ' + error.message);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (page?.content) {
      setEditedContent(page.content as Block[]);
    }
    setEditedTitle(page?.title || '');
    setEditedMetaDescription(page?.meta_description || '');
    setIsEditing(false);
  };

  // Handle double-click to edit
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (isAdmin && page?.is_editable !== false) {
      e.preventDefault();
      e.stopPropagation();
      setIsEditing(true);
      toast.success('Edit mode activated!');
    } else if (!isAdmin) {
      toast.error('Admin access required to edit');
    } else if (page?.is_editable === false) {
      toast.error('This page is not editable');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !page) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Page Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The page you're looking for doesn't exist or is not published.</p>
          <Button onClick={() => navigate('/')} variant="primary">
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Admin toolbar */}
      {isAdmin && (
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {isEditing ? (
                  <>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancel}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditing(true)}
                      disabled={page.is_editable === false}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit Page
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleUnpublish}
                      disabled={page.status !== 'published'}
                      title={page.status !== 'published' ? 'Page is not published' : 'Unpublish this page'}
                    >
                      <FileX className="h-4 w-4 mr-1" />
                      Unpublish
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleAddToMenu}
                      title="Add this page to the navigation menu"
                    >
                      <Menu className="h-4 w-4 mr-1" />
                      Add to Menu
                    </Button>
                    <a
                      href="/admin/menu-management"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        size="sm"
                        variant="ghost"
                        title="Open menu management in new tab"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Menu Manager
                      </Button>
                    </a>
                  </>
                )}
              </div>

              <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                <span className={`px-2 py-1 rounded font-medium ${
                  page.status === 'published'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : page.status === 'draft'
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                    : 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300'
                }`}>
                  {page.status.charAt(0).toUpperCase() + page.status.slice(1)}
                </span>
                {page.is_system && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">System Page</span>
                )}
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                  BlockNote Editor
                </span>
                <span>Last updated: {new Date(page.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page content */}
      <div className="py-8">
        <div
          className={`${!isEditing && isAdmin ? 'cursor-pointer hover:ring-2 hover:ring-blue-300 dark:hover:ring-blue-600 transition-all' : ''}`}
          onDoubleClick={handleDoubleClick}
          title={isAdmin && !isEditing ? 'Double-click to edit' : ''}
        >
          {isEditing ? (
            <div className="container mx-auto max-w-4xl px-4">
              {/* Metadata editing */}
              <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Page Title
                  </label>
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full text-4xl font-bold bg-transparent border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                    placeholder="Enter page title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={editedMetaDescription}
                    onChange={(e) => setEditedMetaDescription(e.target.value)}
                    rows={2}
                    className="w-full text-lg bg-transparent border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-600 dark:text-slate-400 focus:border-blue-500 focus:outline-none resize-none"
                    placeholder="Enter meta description for SEO..."
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {editedMetaDescription.length}/160 characters (recommended for SEO)
                  </p>
                </div>
              </div>

              {/* BlockNote Editor */}
              <BlockNoteEditor
                initialContent={editedContent as PartialBlock[]}
                onChange={(blocks) => setEditedContent(blocks)}
                onSave={async (blocks) => {
                  setEditedContent(blocks);
                  await handleSave();
                }}
                editable={true}
              />
            </div>
          ) : (
            <div className="container mx-auto max-w-4xl px-4">
              {/* Page Title */}
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                {page.title}
              </h1>

              {/* BlockNote Renderer */}
              {editedContent && editedContent.length > 0 ? (
                <BlockNoteRenderer content={editedContent} />
              ) : (
                <div className="text-center py-16">
                  <div className="text-slate-600 dark:text-slate-400">
                    <p className="text-xl mb-4">No content yet</p>
                    {isAdmin && (
                      <p className="text-sm">Double-click to start editing</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Help text for admins */}
        {isAdmin && !isEditing && (
          <div className="container mx-auto px-4 mt-4 text-sm text-slate-500 dark:text-slate-400 text-center">
            Tip: Double-click anywhere on the page content to edit
          </div>
        )}
      </div>
    </div>
  );
}
