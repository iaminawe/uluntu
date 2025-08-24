import React, { useState, useCallback } from 'react';
import { 
  GripVertical, 
  Star, 
  StarOff, 
  Trash2, 
  Eye, 
  Edit, 
  Grid,
  Users,
  Globe,
  Lock,
  MoreVertical,
  Image as ImageIcon
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Gallery } from '@/features/gallery/types';

interface EntityGalleryListProps {
  galleries: Gallery[];
  onReorder: (galleries: Gallery[]) => void;
  onSetFeatured: (galleryId: string, featured: boolean) => void;
  onRemove: (galleryId: string) => void;
  onEdit?: (galleryId: string) => void;
  onView?: (galleryId: string) => void;
  featuredGalleryId?: string;
  editable?: boolean;
  showPrivacy?: boolean;
}

const EntityGalleryList: React.FC<EntityGalleryListProps> = ({
  galleries,
  onReorder,
  onSetFeatured,
  onRemove,
  onEdit,
  onView,
  featuredGalleryId,
  editable = true,
  showPrivacy = true
}) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);

  // Handle drag start
  const handleDragStart = useCallback((e: React.DragEvent, galleryId: string) => {
    if (!editable) return;
    setDraggedItem(galleryId);
    e.dataTransfer.effectAllowed = 'move';
  }, [editable]);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent, galleryId: string) => {
    e.preventDefault();
    if (draggedItem && draggedItem !== galleryId) {
      setDropTarget(galleryId);
    }
  }, [draggedItem]);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent, targetGalleryId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetGalleryId) {
      setDraggedItem(null);
      setDropTarget(null);
      return;
    }

    const reorderedGalleries = [...galleries];
    const draggedIndex = reorderedGalleries.findIndex(g => g.id === draggedItem);
    const targetIndex = reorderedGalleries.findIndex(g => g.id === targetGalleryId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [draggedGallery] = reorderedGalleries.splice(draggedIndex, 1);
      reorderedGalleries.splice(targetIndex, 0, draggedGallery);
      
      // Update sort_order based on new positions
      const updatedGalleries = reorderedGalleries.map((gallery, index) => ({
        ...gallery,
        sort_order: index
      }));
      
      onReorder(updatedGalleries);
    }

    setDraggedItem(null);
    setDropTarget(null);
  }, [draggedItem, galleries, onReorder]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDropTarget(null);
  }, []);

  // Toggle featured status
  const handleToggleFeatured = useCallback((gallery: Gallery) => {
    const isFeatured = gallery.id === featuredGalleryId || gallery.is_featured;
    onSetFeatured(gallery.id, !isFeatured);
  }, [featuredGalleryId, onSetFeatured]);

  // Handle remove with confirmation
  const handleRemove = useCallback((galleryId: string) => {
    if (confirm('Are you sure you want to remove this gallery attachment?')) {
      onRemove(galleryId);
    }
  }, [onRemove]);

  // Get privacy icon
  const getPrivacyIcon = (privacyLevel: Gallery['privacy_level']) => {
    switch (privacyLevel) {
      case 'public':
        return <Globe className="w-4 h-4 text-green-500" />;
      case 'members_only':
        return <Users className="w-4 h-4 text-orange-500" />;
      case 'private':
        return <Lock className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  if (galleries.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
        <Grid className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-500 mb-2">No galleries attached</p>
        <p className="text-slate-400 text-sm">Add galleries to showcase content</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {galleries.map((gallery, index) => {
        const isFeatured = gallery.id === featuredGalleryId || gallery.is_featured;
        const isDragging = draggedItem === gallery.id;
        const isDropTarget = dropTarget === gallery.id;

        return (
          <div
            key={gallery.id}
            draggable={editable}
            onDragStart={(e) => handleDragStart(e, gallery.id)}
            onDragOver={(e) => handleDragOver(e, gallery.id)}
            onDrop={(e) => handleDrop(e, gallery.id)}
            onDragEnd={handleDragEnd}
            className={`group flex items-center space-x-4 p-4 bg-white dark:bg-slate-800 border rounded-lg transition-all ${
              isDragging ? 'opacity-50 transform rotate-2' : ''
            } ${
              isDropTarget ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-slate-200 dark:border-slate-700'
            } ${
              editable ? 'hover:border-slate-300 dark:hover:border-slate-600' : ''
            }`}
          >
            {/* Drag handle */}
            {editable && (
              <div className="cursor-move text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <GripVertical className="w-5 h-5" />
              </div>
            )}

            {/* Gallery thumbnail */}
            <div className="flex-shrink-0 w-16 h-12 bg-slate-100 dark:bg-slate-700 rounded overflow-hidden">
              {gallery.cover_photo_url ? (
                <img
                  src={gallery.cover_photo_url}
                  alt={gallery.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                </div>
              )}
            </div>

            {/* Gallery info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-medium text-slate-900 dark:text-white truncate">
                  {gallery.title}
                </h4>
                {isFeatured && (
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                )}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                <span>{gallery.photo_count} photos</span>
                {showPrivacy && getPrivacyIcon(gallery.privacy_level)}
                <span className="text-xs">
                  Updated {new Date(gallery.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onView && (
                <Button
                  onClick={() => onView(gallery.id)}
                  variant="ghost"
                  size="sm"
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              )}

              {editable && onEdit && (
                <Button
                  onClick={() => onEdit(gallery.id)}
                  variant="ghost"
                  size="sm"
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}

              {editable && (
                <Button
                  onClick={() => handleToggleFeatured(gallery)}
                  variant="ghost"
                  size="sm"
                  className={`transition-colors ${
                    isFeatured
                      ? 'text-yellow-500 hover:text-yellow-600'
                      : 'text-slate-500 hover:text-yellow-500 dark:text-slate-400'
                  }`}
                  title={isFeatured ? 'Remove from featured' : 'Set as featured'}
                >
                  {isFeatured ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                </Button>
              )}

              {editable && (
                <Button
                  onClick={() => handleRemove(gallery.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EntityGalleryList;