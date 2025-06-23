import React, { memo, useCallback } from 'react';
import { Photo } from '../../types';
import { useGalleryHybrid } from '../../hooks/useGalleryHybrid';
import { PhotoCard } from '../PhotoCard';
import { Lightbox } from '../Lightbox';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';

interface GalleryGridProps {
  galleryId: string;
  editable?: boolean;
}

export const GalleryGrid: React.FC<GalleryGridProps> = memo(({ galleryId, editable = false }) => {
  const {
    // Data from React Query
    photos,
    isLoading,
    error,
    
    // UI state from Redux
    selectedPhotos,
    viewMode,
    photoSize,
    lightbox,
    isBatchMode,
    
    // Actions
    togglePhotoSelect,
    isPhotoSelected,
    showLightbox,
    hideLightbox,
    deletePhoto,
  } = useGalleryHybrid(galleryId);
  
  // Handle photo click
  const handlePhotoClick = useCallback((photo: Photo, index: number) => {
    if (isBatchMode) {
      togglePhotoSelect(photo.id);
    } else {
      showLightbox(photos, index);
    }
  }, [isBatchMode, togglePhotoSelect, showLightbox, photos]);
  
  // Handle photo deletion
  const handleDeletePhoto = useCallback(async (photoId: string) => {
    if (!editable) return;
    
    if (confirm('Are you sure you want to delete this photo?')) {
      try {
        await deletePhoto({ photoId, galleryId });
      } catch (error) {
        console.error('Failed to delete photo:', error);
      }
    }
  }, [deletePhoto, galleryId, editable]);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <ErrorDisplay
        error={error}
        title="Failed to load photos"
        retry={() => window.location.reload()}
      />
    );
  }
  
  // Empty state
  if (!photos || photos.length === 0) {
    return (
      <EmptyState
        title="No photos yet"
        description="Upload your first photo to get started"
        icon="photo"
      />
    );
  }
  
  // Grid classes based on view mode and photo size
  const gridClasses = {
    grid: {
      small: 'grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2',
      medium: 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4',
      large: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
    },
    masonry: 'masonry-grid',
    list: 'space-y-4'
  };
  
  const containerClass = viewMode === 'masonry' 
    ? gridClasses.masonry 
    : viewMode === 'list'
    ? gridClasses.list
    : gridClasses.grid[photoSize];
  
  return (
    <>
      <div className={containerClass}>
        {photos.map((photo, index) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            size={photoSize}
            viewMode={viewMode}
            selected={isPhotoSelected(photo.id)}
            selectable={isBatchMode}
            editable={editable}
            onClick={() => handlePhotoClick(photo, index)}
            onSelect={() => togglePhotoSelect(photo.id)}
            onDelete={() => handleDeletePhoto(photo.id)}
          />
        ))}
      </div>
      
      {/* Lightbox component */}
      {lightbox.isOpen && (
        <Lightbox
          photos={lightbox.photos}
          currentIndex={lightbox.currentPhotoIndex}
          onClose={hideLightbox}
        />
      )}
    </>
  );
});

GalleryGrid.displayName = 'GalleryGrid';