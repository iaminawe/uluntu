import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  Save, 
  X, 
  Eye, 
  History, 
  Settings,
  ChevronLeft,
  Globe,
  Lock,
  Trash2
} from 'lucide-react';
import { BlockEditor } from '@/components/BlockEditor';
import { VisualPageEditor } from '@/components/VisualPageEditor';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/Form';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface PageData {
  id?: string;
  title: string;
  slug: string;
  blocks: any[];
  content?: string;
  page_type: 'block' | 'visual' | 'hybrid';
  status: 'draft' | 'published' | 'archived';
  meta_title?: string;
  meta_description?: string;
  seo_keywords?: string[];
  og_image?: string;
  template_id?: string;
  is_featured?: boolean;
}

export const EnhancedPageEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [pageData, setPageData] = useState<PageData>({
    title: '',
    slug: '',
    blocks: [],
    page_type: 'block',
    status: 'draft'
  });
  
  const [showSettings, setShowSettings] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [editorMode, setEditorMode] = useState<'visual' | 'block'>('visual');

  // Fetch existing page data
  const { data: existingPage, isLoading } = useQuery({
    queryKey: ['page', id],
    queryFn: async () => {
      if (!id || id === 'new') return null;
      
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id && id !== 'new'
  });

  // Load existing page data
  useEffect(() => {
    if (existingPage) {
      setPageData({
        id: existingPage.id,
        title: existingPage.title,
        slug: existingPage.slug,
        blocks: existingPage.blocks || [],
        content: existingPage.content,
        page_type: existingPage.page_type || 'block',
        status: existingPage.status,
        meta_title: existingPage.meta_title,
        meta_description: existingPage.meta_description,
        seo_keywords: existingPage.seo_keywords,
        og_image: existingPage.og_image,
        template_id: existingPage.template_id,
        is_featured: existingPage.is_featured
      });
    }
  }, [existingPage]);

  // Save page mutation
  const savePage = useMutation({
    mutationFn: async (data: PageData) => {
      const member = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!member.data) {
        throw new Error('Member profile not found');
      }

      // Ensure blocks is properly formatted
      const blocksData = Array.isArray(data.blocks) ? data.blocks : [];
      
      const pagePayload = {
        title: data.title,
        slug: data.slug,
        blocks: blocksData,
        content: data.content || '',
        page_type: data.page_type || 'block',
        status: data.status || 'draft',
        meta_title: data.meta_title || null,
        meta_description: data.meta_description || null,
        seo_keywords: data.seo_keywords || null,
        og_image: data.og_image || null,
        template_id: data.template_id || null,
        is_featured: data.is_featured || false,
        author_id: member.data.id,
        updated_at: new Date().toISOString()
      };

      if (data.id) {
        // Update existing page
        const { error } = await supabase
          .from('pages')
          .update(pagePayload)
          .eq('id', data.id);
        
        if (error) throw error;
        
        // Create version if published (optional, ignore errors)
        if (data.status === 'published') {
          try {
            await supabase.rpc('create_page_version', {
              p_page_id: data.id,
              p_change_summary: 'Page updated'
            });
          } catch (error) {
            console.warn('Failed to create version:', error);
            // Continue without failing the save
          }
        }
      } else {
        // Create new page
        const { data: newPage, error } = await supabase
          .from('pages')
          .insert([pagePayload])
          .select()
          .single();
        
        if (error) throw error;
        return newPage;
      }
    },
    onSuccess: (data) => {
      toast.success('Page saved successfully');
      queryClient.invalidateQueries({ queryKey: ['page', id] });
      setHasChanges(false);
      
      if (data?.id && !pageData.id) {
        navigate(`/admin/pages/${data.id}/edit`);
      }
    },
    onError: (error) => {
      toast.error('Failed to save page');
      console.error(error);
    }
  });

  // Handle content change
  const handleContentChange = useCallback((blocks: any[]) => {
    // Prevent infinite loops by checking if blocks actually changed
    setPageData(prev => {
      const currentBlocks = JSON.stringify(prev.blocks);
      const newBlocks = JSON.stringify(blocks);
      if (currentBlocks === newBlocks) {
        return prev;
      }
      return { ...prev, blocks };
    });
    setHasChanges(true);
  }, []);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!pageData.title || !pageData.slug) {
      toast.error('Title and slug are required');
      return;
    }
    
    await savePage.mutateAsync(pageData);
  }, [pageData, savePage]);

  // Auto-generate slug from title
  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }, []);

  // Handle title change
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setPageData(prev => ({
      ...prev,
      title,
      slug: !prev.slug || prev.slug === generateSlug(prev.title) 
        ? generateSlug(title) 
        : prev.slug
    }));
    setHasChanges(true);
  }, [generateSlug]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/pages')}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                <select
                  value={pageData.status}
                  onChange={(e) => {
                    setPageData(prev => ({ 
                      ...prev, 
                      status: e.target.value as PageData['status'] 
                    }));
                    setHasChanges(true);
                  }}
                  className="text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {hasChanges && (
                <span className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded">
                  Unsaved changes
                </span>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVersions(!showVersions)}
              >
                <History className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditorMode(editorMode === 'visual' ? 'block' : 'visual')}
                title={`Switch to ${editorMode === 'visual' ? 'block' : 'visual'} editor`}
              >
                {editorMode === 'visual' ? '🎨' : '📝'}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPreview(!isPreview)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/pages')}
              >
                <X className="h-4 w-4" />
              </Button>
              
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                disabled={!hasChanges || savePage.isPending}
              >
                <Save className="h-4 w-4 mr-1" />
                {savePage.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <FormInput
                  label="Page Title"
                  value={pageData.title}
                  onChange={handleTitleChange}
                  placeholder="Enter page title"
                  className="text-2xl font-bold"
                  required
                />
                
                <div className="mt-4">
                  <FormInput
                    label="URL Slug"
                    value={pageData.slug}
                    onChange={(e) => {
                      setPageData(prev => ({ ...prev, slug: e.target.value }));
                      setHasChanges(true);
                    }}
                    placeholder="page-url-slug"
                    className="font-mono text-sm"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {window.location.origin}/pages/{pageData.slug || 'page-url-slug'}
                  </p>
                </div>
              </div>

              <div className="p-6">
                {isPreview ? (
                  <div className="prose max-w-none">
                    <h1>{pageData.title}</h1>
                    <VisualPageEditor
                      content={pageData.blocks}
                      editable={false}
                    />
                  </div>
                ) : editorMode === 'visual' ? (
                  <VisualPageEditor
                    content={pageData.blocks}
                    onChange={handleContentChange}
                    onSave={handleSave}
                    editable={true}
                  />
                ) : (
                  <BlockEditor
                    content={pageData.blocks}
                    onChange={handleContentChange}
                    onSave={handleSave}
                    autoSave={true}
                    autoSaveDelay={5000}
                    placeholder="Start writing your page content..."
                  />
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* SEO Settings */}
            {showSettings && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">SEO Settings</h3>
                
                <div className="space-y-4">
                  <FormInput
                    label="Meta Title"
                    value={pageData.meta_title || ''}
                    onChange={(e) => {
                      setPageData(prev => ({ ...prev, meta_title: e.target.value }));
                      setHasChanges(true);
                    }}
                    placeholder="SEO page title"
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Meta Description
                    </label>
                    <textarea
                      value={pageData.meta_description || ''}
                      onChange={(e) => {
                        setPageData(prev => ({ ...prev, meta_description: e.target.value }));
                        setHasChanges(true);
                      }}
                      placeholder="SEO page description"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                  
                  <FormInput
                    label="OG Image URL"
                    value={pageData.og_image || ''}
                    onChange={(e) => {
                      setPageData(prev => ({ ...prev, og_image: e.target.value }));
                      setHasChanges(true);
                    }}
                    placeholder="Social media preview image"
                  />
                  
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={pageData.is_featured || false}
                        onChange={(e) => {
                          setPageData(prev => ({ ...prev, is_featured: e.target.checked }));
                          setHasChanges(true);
                        }}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Featured Page</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Version History */}
            {showVersions && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Version History</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Version history will be displayed here
                </p>
              </div>
            )}

            {/* Page Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Page Information</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Type:</span>
                  <span className="font-medium capitalize text-gray-900 dark:text-gray-100">{pageData.page_type}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    pageData.status === 'published' 
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                      : pageData.status === 'draft'
                      ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                  }`}>
                    {pageData.status === 'published' && <Globe className="inline h-3 w-3 mr-1" />}
                    {pageData.status === 'draft' && <Lock className="inline h-3 w-3 mr-1" />}
                    {pageData.status}
                  </span>
                </div>
                
                {existingPage && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Created:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {new Date(existingPage.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Updated:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {new Date(existingPage.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {existingPage && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="danger"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this page?')) {
                        // Handle delete
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete Page
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPageEditor;