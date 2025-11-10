import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import ComponentBlockEditor from '@/components/BlockEditor/ComponentBlockEditor';
import DynamicPageRenderer from '@/features/pages/components/DynamicPageRenderer';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { Edit, Save, X, Eye } from 'lucide-react';

interface PageData {
  id: string;
  title: string;
  slug: string;
  blocks: any[];
  content?: string;
  status: string;
  is_editable: boolean;
  is_system: boolean;
  meta_title?: string;
  meta_description?: string;
  author?: {
    name: string;
  };
  updated_at: string;
}

export default function DynamicPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedBlocks, setEditedBlocks] = useState<any[]>([]);
  const [editedTitle, setEditedTitle] = useState<string>('');
  const [editedMetaDescription, setEditedMetaDescription] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  // Removed dual editor system - now using unified ComponentBlockEditor

  // Check if user is admin (direct database check)
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
    queryKey: ['dynamic-page', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pages')
        .select(`
          *,
          author:members!author_id(name)
        `)
        .eq('slug', slug)
        .eq('status', 'published')
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
    }
  });

  // Initialize edited blocks and metadata when page loads
  useEffect(() => {
    if (page?.blocks) {
      setEditedBlocks(page.blocks);
      setEditedTitle(page.title || '');
      setEditedMetaDescription(page.meta_description || '');
    }
  }, [page]);

  // Handle save
  const handleSave = async () => {
    if (!page || !isAdmin) return;
    
    setIsSaving(true);
    try {
      // Update the main page with all edited data
      const { error } = await supabase
        .from('pages')
        .update({
          title: editedTitle,
          meta_description: editedMetaDescription,
          blocks: editedBlocks,
          version: (page.version || 1) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', page.id);

      if (error) throw error;
      
      toast.success('Page saved successfully! 📝');
      setIsEditing(false);
      refetch();
    } catch (error: any) {
      toast.error('Failed to save page: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setEditedBlocks(page?.blocks || []);
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
      toast.success('Edit mode activated! 🎉');
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-600 mb-4">The page you're looking for doesn't exist or is not published.</p>
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
                      onClick={() => navigate(`/admin/pages/${page.id}/advanced`)}
                    >
                      Advanced Edit
                    </Button>
                  </>
                )}
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                {page.is_system && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">System Page</span>
                )}
                <span>Last updated: {new Date(page.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page content */}
      <div className="px-4 py-8">
        {/* Content */}
        <div 
          className={`${!isEditing && isAdmin ? 'cursor-pointer hover:ring-2 hover:ring-blue-300 dark:hover:ring-blue-600 transition-all' : ''} ${isEditing ? 'container mx-auto max-w-4xl bg-white dark:bg-slate-800 rounded-lg shadow-sm p-8' : ''}`}
          onDoubleClick={handleDoubleClick}
          title={isAdmin && !isEditing ? 'Double-click to edit' : ''}
        >
          {isEditing ? (
            <div>
              {/* Edit mode header with editable fields */}
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
              
              {/* Unified Component Editor */}
              <ComponentBlockEditor
                content={editedBlocks}
                onChange={(blocks) => {
                  // Prevent infinite loops by checking if blocks actually changed
                  const currentBlocks = JSON.stringify(editedBlocks);
                  const newBlocks = JSON.stringify(blocks);
                  if (currentBlocks !== newBlocks) {
                    console.log('Component editor onChange:', blocks);
                    setEditedBlocks(blocks);
                  }
                }}
                editable={true}
              />
            </div>
          ) : (
            <div className="container mx-auto px-4">
              <DynamicPageRenderer blocks={page.blocks} slug={page.slug} />
            </div>
          )}
        </div>

        {/* Help text for admins */}
        {isAdmin && !isEditing && (
          <div className="container mx-auto px-4 mt-4 text-sm text-slate-500 dark:text-slate-400 text-center">
            Tip: Double-click anywhere on the page content to edit
          </div>
        )}
        
        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="container mx-auto px-4 mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs">
            <strong>Debug Info:</strong> User: {user?.id ? '✅' : '❌'} | Admin: {isAdmin ? '✅' : '❌'} | Editable: {page?.is_editable !== false ? '✅' : '❌'}
            <br />
            <strong>Page Data:</strong> Blocks: {page?.blocks?.length || 0} | Slug: {page?.slug} | Title: {page?.title}
            <br />
            <strong>Block Types:</strong> {page?.blocks?.map((b: any) => b.type).join(', ') || 'none'}
          </div>
        )}
      </div>
    </div>
  );
}