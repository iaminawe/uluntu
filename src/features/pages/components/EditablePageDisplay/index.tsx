import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  Edit, 
  Save, 
  X, 
  Eye,
  EyeOff,
  Settings,
  History
} from 'lucide-react';
import { BlockEditor } from '@/components/BlockEditor';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';

interface PageData {
  id: string;
  title: string;
  slug: string;
  blocks: any[];
  content?: string;
  page_type: string;
  status: string;
  meta_title?: string;
  meta_description?: string;
  author_id: string;
  is_editable: boolean;
  is_system: boolean;
}

export const EditablePageDisplay: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedBlocks, setEditedBlocks] = useState<any[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [showEditBar, setShowEditBar] = useState(false);

  // Check if user can edit pages
  const canEdit = hasPermission('pages', 'update');

  // Fetch page data
  const { data: page, isLoading, error } = useQuery({
    queryKey: ['page-display', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
      
      if (error) throw error;
      
      // Parse blocks if stored as string
      if (typeof data.blocks === 'string') {
        data.blocks = JSON.parse(data.blocks);
      }
      
      return data as PageData;
    },
    enabled: !!slug
  });

  // Save page mutation
  const savePage = useMutation({
    mutationFn: async (blocks: any[]) => {
      if (!page || !user) throw new Error('Page or user not found');

      const member = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!member.data) {
        throw new Error('Member profile not found');
      }

      // Create a version before updating
      await supabase.rpc('create_page_version', {
        p_page_id: page.id,
        p_change_summary: 'Quick edit from page view'
      });

      // Update the page
      const { error } = await supabase
        .from('pages')
        .update({
          blocks: JSON.stringify(blocks),
          last_edited_by: member.data.id,
          last_edited_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', page.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Page updated successfully');
      queryClient.invalidateQueries({ queryKey: ['page-display', slug] });
      setIsEditMode(false);
      setHasChanges(false);
    },
    onError: (error) => {
      toast.error('Failed to save page');
      console.error(error);
    }
  });

  // Load blocks when page data is available
  useEffect(() => {
    if (page?.blocks) {
      setEditedBlocks(page.blocks);
    }
  }, [page]);

  // Show edit bar when user hovers near top of page
  useEffect(() => {
    if (!canEdit || !page?.is_editable) return;

    const handleMouseMove = (e: MouseEvent) => {
      const shouldShow = e.clientY < 100;
      setShowEditBar(shouldShow);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [canEdit, page]);

  // Handle content change
  const handleContentChange = useCallback((blocks: any[]) => {
    setEditedBlocks(blocks);
    setHasChanges(true);
  }, []);

  // Handle save
  const handleSave = useCallback(async () => {
    await savePage.mutateAsync(editedBlocks);
  }, [editedBlocks, savePage]);

  // Handle cancel edit
  const handleCancel = useCallback(() => {
    if (hasChanges && !confirm('Discard unsaved changes?')) {
      return;
    }
    
    setIsEditMode(false);
    setHasChanges(false);
    if (page?.blocks) {
      setEditedBlocks(page.blocks);
    }
  }, [hasChanges, page]);

  // Handle double-click to edit
  const handleDoubleClick = useCallback(() => {
    if (canEdit && page?.is_editable && !isEditMode) {
      setIsEditMode(true);
    }
  }, [canEdit, page, isEditMode]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading page...</p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>Go to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* Floating Edit Bar */}
      {canEdit && page.is_editable && showEditBar && !isEditMode && (
        <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg p-2 flex items-center space-x-2 transition-opacity">
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsEditMode(true)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit Page
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/admin/pages/${page.id}/edit`)}
          >
            <Settings className="h-4 w-4 mr-1" />
            Advanced Edit
          </Button>
        </div>
      )}

      {/* Edit Mode Toolbar */}
      {isEditMode && (
        <div className="sticky top-0 z-40 bg-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center space-x-3">
                <Edit className="h-5 w-5" />
                <span className="font-medium">Editing Mode</span>
                {hasChanges && (
                  <span className="text-xs bg-blue-700 px-2 py-1 rounded">
                    Unsaved changes
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-blue-700"
                  onClick={() => navigate(`/admin/pages/${page.id}/versions`)}
                >
                  <History className="h-4 w-4 mr-1" />
                  History
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-blue-700"
                  onClick={handleCancel}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleSave}
                  disabled={!hasChanges || savePage.isPending}
                >
                  <Save className="h-4 w-4 mr-1" />
                  {savePage.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Content */}
      <div 
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        onDoubleClick={handleDoubleClick}
      >
        {/* Page Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          {page.title}
        </h1>

        {/* Page Metadata for SEO */}
        {page.meta_description && (
          <meta name="description" content={page.meta_description} />
        )}
        {page.meta_title && (
          <title>{page.meta_title}</title>
        )}

        {/* Content Editor/Display */}
        <div className={`prose prose-lg max-w-none ${isEditMode ? 'border-2 border-blue-200 rounded-lg p-4' : ''}`}>
          <BlockEditor
            content={editedBlocks}
            onChange={isEditMode ? handleContentChange : undefined}
            editable={isEditMode}
            showToolbar={isEditMode}
            showSideMenu={isEditMode}
            placeholder="Start typing to add content..."
          />
        </div>

        {/* Edit Hint */}
        {canEdit && page.is_editable && !isEditMode && !showEditBar && (
          <div className="mt-12 text-center text-sm text-gray-500">
            <p>
              <EyeOff className="inline h-4 w-4 mr-1" />
              Double-click anywhere on the page to edit
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditablePageDisplay;