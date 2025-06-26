import React, { memo, useCallback } from 'react';
import { Photo } from '../../types';
import { useGalleryHybrid } from '../../hooks/useGalleryHybrid';
import PhotoCard from '../PhotoCard';
import { PhotoLightbox } from '../PhotoLightbox';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';

interface GalleryGridProps {
  galleryId: string;
  editable?: boolean;
  onSetCover?: (photoId: string) => void;
  coverPhotoId?: string;
}

export const GalleryGrid: React.FC<GalleryGridProps> = memo(({ galleryId, editable = false, onSetCover, coverPhotoId }) => {
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
    togglePhotoLike,
    addPhotoComment,
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
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <ErrorDisplay
        title="Failed to load photos"
        primaryAction={{
          onClick: () => window.location.reload(),
          text: "Retry"
        }}
      />
    );
  }
  
  // Empty state
  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No photos yet</p>
        <p className="text-gray-400 text-sm">Upload your first photo to get started</p>
      </div>
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
            isSelected={isPhotoSelected(photo.id)}
            onSelect={() => togglePhotoSelect(photo.id)}
            onClick={() => handlePhotoClick(photo, index)}
            onDelete={editable ? handleDeletePhoto : undefined}
            onSetCover={editable && onSetCover ? onSetCover : undefined}
            isCover={photo.id === coverPhotoId || photo.is_cover}
            showSelection={isBatchMode}
          />
        ))}
      </div>
      
      {/* Lightbox component */}
      {lightbox.isOpen && lightbox.photos && (
        <PhotoLightbox
          photos={lightbox.photos}
          initialIndex={lightbox.currentPhotoIndex}
          onClose={hideLightbox}
          onLike={async (photoId) => {
            try {
              await togglePhotoLike(photoId);
            } catch (error) {
              console.error('Failed to like photo:', error);
            }
          }}
          onComment={async (photoId, comment) => {
            try {
              await addPhotoComment({ photoId, content: comment });
            } catch (error) {
              console.error('Failed to add comment:', error);
            }
          }}
        />
      )}
    </>
  );
});

GalleryGrid.displayName = 'GalleryGrid';