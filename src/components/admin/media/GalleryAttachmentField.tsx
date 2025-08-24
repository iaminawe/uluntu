import React, { useState, useCallback } from 'react';
import { Plus, Grid } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Gallery } from '@/features/gallery/types';
import GallerySelector from './GallerySelector';
import EntityGalleryList from './EntityGalleryList';

interface GalleryAttachmentFieldProps {
  value: Gallery[];
  onChange: (galleries: Gallery[]) => void;
  entityType?: 'user' | 'group' | 'company' | 'page';
  entityId?: string;
  label?: string;
  description?: string;
  maxGalleries?: number;
  featuredGalleryId?: string;
  onFeaturedChange?: (galleryId: string | null) => void;
  editable?: boolean;
  required?: boolean;
  error?: string;
}

const GalleryAttachmentField: React.FC<GalleryAttachmentFieldProps> = ({
  value = [],
  onChange,
  entityType,
  entityId,
  label = 'Attached Galleries',
  description = 'Select galleries to attach to this entity',
  maxGalleries,
  featuredGalleryId,
  onFeaturedChange,
  editable = true,
  required = false,
  error
}) => {
  const [showSelector, setShowSelector] = useState(false);

  // Handle gallery selection from modal
  const handleSelectGalleries = useCallback((selectedGalleries: Gallery[]) => {
    const existingIds = new Set(value.map(g => g.id));
    const newGalleries = selectedGalleries.filter(g => !existingIds.has(g.id));
    
    let updatedGalleries = [...value, ...newGalleries];
    
    // Respect max galleries limit
    if (maxGalleries && updatedGalleries.length > maxGalleries) {
      updatedGalleries = updatedGalleries.slice(0, maxGalleries);
    }
    
    // Update sort order based on position
    updatedGalleries = updatedGalleries.map((gallery, index) => ({
      ...gallery,
      sort_order: index
    }));
    
    onChange(updatedGalleries);
    setShowSelector(false);
  }, [value, onChange, maxGalleries]);

  // Handle gallery reordering
  const handleReorder = useCallback((reorderedGalleries: Gallery[]) => {
    onChange(reorderedGalleries);
  }, [onChange]);

  // Handle setting featured gallery
  const handleSetFeatured = useCallback((galleryId: string, featured: boolean) => {
    if (onFeaturedChange) {
      onFeaturedChange(featured ? galleryId : null);
    } else {
      // Update gallery is_featured property if no external handler
      const updatedGalleries = value.map(gallery => ({
        ...gallery,
        is_featured: gallery.id === galleryId ? featured : false
      }));
      onChange(updatedGalleries);
    }
  }, [value, onChange, onFeaturedChange]);

  // Handle removing gallery
  const handleRemove = useCallback((galleryId: string) => {
    const updatedGalleries = value.filter(g => g.id !== galleryId);
    onChange(updatedGalleries);
    
    // Clear featured if it was the removed gallery
    if (featuredGalleryId === galleryId && onFeaturedChange) {
      onFeaturedChange(null);
    }
  }, [value, onChange, featuredGalleryId, onFeaturedChange]);

  // Check if we can add more galleries
  const canAddMore = !maxGalleries || value.length < maxGalleries;
  const currentGalleryIds = value.map(g => g.id);

  return (
    <div className="space-y-4">
      {/* Field Label */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
            {description}
          </p>
        )}
      </div>

      {/* Add Gallery Button */}
      {editable && canAddMore && (
        <div className="flex items-center justify-between mb-4">
          <Button
            onClick={() => setShowSelector(true)}
            variant="outline"
            className="border-dashed"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Gallery
            {maxGalleries && ` (${value.length}/${maxGalleries})`}
          </Button>

          {maxGalleries && value.length > 0 && (
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {value.length} of {maxGalleries} galleries
            </span>
          )}
        </div>
      )}

      {/* Gallery List */}
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
        {value.length > 0 ? (
          <EntityGalleryList
            galleries={value}
            onReorder={handleReorder}
            onSetFeatured={handleSetFeatured}
            onRemove={handleRemove}
            featuredGalleryId={featuredGalleryId}
            editable={editable}
          />
        ) : (
          <div className="text-center py-8">
            <Grid className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 mb-2">No galleries attached</p>
            <p className="text-slate-400 text-sm mb-4">
              {editable ? 'Click "Add Gallery" to get started' : 'No galleries have been attached to this entity'}
            </p>
            
            {editable && (
              <Button
                onClick={() => setShowSelector(true)}
                variant="outline"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Gallery
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
          {error}
        </p>
      )}

      {/* Validation Info */}
      {required && value.length === 0 && (
        <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
          At least one gallery is required
        </p>
      )}

      {/* Gallery Selector Modal */}
      <GallerySelector
        isOpen={showSelector}
        onClose={() => setShowSelector(false)}
        onSelectGalleries={handleSelectGalleries}
        selectedGalleryIds={currentGalleryIds}
        entityType={entityType}
        entityId={entityId}
        title="Select Galleries to Attach"
      />
    </div>
  );
};

export default GalleryAttachmentField;