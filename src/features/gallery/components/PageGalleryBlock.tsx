import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Grid, 
  List,
  Layers,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  ArrowLeft,
  ArrowRight,
  X,
  Image as ImageIcon
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Gallery, Photo } from '../types';
import { galleryApi } from '../api';
import { PhotoLightbox } from './PhotoLightbox';
import { getPhotoUrl } from '../utils';

interface PageGalleryBlockProps {
  galleryIds: string[];
  layout?: 'grid' | 'carousel' | 'masonry' | 'justified';
  photoSize?: 'small' | 'medium' | 'large';
  showTitle?: boolean;
  showDescription?: boolean;
  showPhotoCount?: boolean;
  showNavigation?: boolean;
  autoplay?: boolean;
  autoplayInterval?: number;
  maxPhotos?: number;
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'auto';
  className?: string;
}

const PageGalleryBlock: React.FC<PageGalleryBlockProps> = ({
  galleryIds,
  layout = 'grid',
  photoSize = 'medium',
  showTitle = true,
  showDescription = false,
  showPhotoCount = true,
  showNavigation = true,
  autoplay = false,
  autoplayInterval = 3000,
  maxPhotos,
  aspectRatio = 'auto',
  className = ''
}) => {
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoplay);
  const [lightboxPhoto, setLightboxPhoto] = useState<{ photos: Photo[]; index: number } | null>(null);

  // Fetch galleries
  const { data: galleries, isLoading } = useQuery({
    queryKey: ['page-gallery-block', galleryIds],
    queryFn: async () => {
      const galleryPromises = galleryIds.map(id => galleryApi.getGallery(id));
      const results = await Promise.allSettled(galleryPromises);
      return results
        .filter((result): result is PromiseFulfilledResult<Gallery> => result.status === 'fulfilled')
        .map(result => result.value);
    },
    enabled: galleryIds.length > 0
  });

  const currentGallery = galleries?.[currentGalleryIndex];
  const allPhotos = galleries?.flatMap(g => g.photos || []) || [];
  const displayPhotos = maxPhotos ? allPhotos.slice(0, maxPhotos) : allPhotos;

  // Autoplay functionality
  useEffect(() => {
    if (!isAutoPlaying || !displayPhotos.length) return;

    const interval = setInterval(() => {
      setCurrentPhotoIndex(prev => (prev + 1) % displayPhotos.length);
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [isAutoPlaying, displayPhotos.length, autoplayInterval]);

  // Navigation handlers
  const goToNextGallery = () => {
    if (galleries && galleries.length > 1) {
      setCurrentGalleryIndex(prev => (prev + 1) % galleries.length);
    }
  };

  const goToPrevGallery = () => {
    if (galleries && galleries.length > 1) {
      setCurrentGalleryIndex(prev => (prev - 1 + galleries.length) % galleries.length);
    }
  };

  const goToNextPhoto = () => {
    setCurrentPhotoIndex(prev => (prev + 1) % displayPhotos.length);
  };

  const goToPrevPhoto = () => {
    setCurrentPhotoIndex(prev => (prev - 1 + displayPhotos.length) % displayPhotos.length);
  };

  // Layout-specific grid classes
  const getGridClasses = () => {
    const sizeClasses = {
      small: 'grid-cols-4 md:grid-cols-6 lg:grid-cols-8',
      medium: 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6',
      large: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    };

    const aspectClasses = {
      square: 'aspect-square',
      portrait: 'aspect-[3/4]',
      landscape: 'aspect-video',
      auto: ''
    };

    switch (layout) {
      case 'grid':
        return `grid ${sizeClasses[photoSize]} gap-4`;
      case 'masonry':
        return 'masonry-grid gap-4';
      case 'justified':
        return 'flex flex-wrap gap-2';
      default:
        return `grid ${sizeClasses[photoSize]} gap-4`;
    }
  };

  // Handle photo click
  const handlePhotoClick = (photo: Photo, index: number) => {
    setLightboxPhoto({ photos: displayPhotos, index });
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!galleries || galleries.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Grid className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-500">No galleries found</p>
      </div>
    );
  }

  if (displayPhotos.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-500">No photos to display</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Gallery Header */}
      {(showTitle || showDescription) && currentGallery && (
        <div className="space-y-2">
          {showTitle && (
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {currentGallery.title}
              </h3>
              
              {galleries.length > 1 && showNavigation && (
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={goToPrevGallery}
                    variant="outline"
                    size="sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {currentGalleryIndex + 1} of {galleries.length}
                  </span>
                  <Button
                    onClick={goToNextGallery}
                    variant="outline"
                    size="sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {showDescription && currentGallery.description && (
            <p className="text-slate-600 dark:text-slate-300">
              {currentGallery.description}
            </p>
          )}
          
          {showPhotoCount && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {displayPhotos.length} photos
              {maxPhotos && allPhotos.length > maxPhotos && (
                <span> (showing first {maxPhotos})</span>
              )}
            </p>
          )}
        </div>
      )}

      {/* Carousel Layout */}
      {layout === 'carousel' && (
        <div className="relative">
          <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
            {displayPhotos[currentPhotoIndex] && (
              <img
                src={getPhotoUrl(displayPhotos[currentPhotoIndex], 'large')}
                alt={displayPhotos[currentPhotoIndex].title || 'Photo'}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => handlePhotoClick(displayPhotos[currentPhotoIndex], currentPhotoIndex)}
              />
            )}
          </div>

          {/* Carousel Controls */}
          {displayPhotos.length > 1 && (
            <>
              <div className="absolute inset-y-0 left-0 flex items-center">
                <Button
                  onClick={goToPrevPhoto}
                  variant="outline"
                  size="sm"
                  className="ml-4 bg-white/80 hover:bg-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="absolute inset-y-0 right-0 flex items-center">
                <Button
                  onClick={goToNextPhoto}
                  variant="outline"
                  size="sm"
                  className="mr-4 bg-white/80 hover:bg-white"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Autoplay Toggle */}
              <div className="absolute top-4 right-4">
                <Button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  variant="outline"
                  size="sm"
                  className="bg-white/80 hover:bg-white"
                >
                  {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              </div>

              {/* Photo Indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {displayPhotos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPhotoIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentPhotoIndex
                        ? 'bg-orange-500'
                        : 'bg-white/60 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Photo Count */}
          <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 text-white text-sm rounded">
            {currentPhotoIndex + 1} / {displayPhotos.length}
          </div>
        </div>
      )}

      {/* Grid/Masonry/Justified Layouts */}
      {layout !== 'carousel' && (
        <div className={getGridClasses()}>
          {displayPhotos.map((photo, index) => (
            <div
              key={photo.id}
              className={`bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow ${
                aspectRatio !== 'auto' ? {
                  square: 'aspect-square',
                  portrait: 'aspect-[3/4]',
                  landscape: 'aspect-video'
                }[aspectRatio] : ''
              }`}
              onClick={() => handlePhotoClick(photo, index)}
            >
              <img
                src={getPhotoUrl(photo, photoSize)}
                alt={photo.title || 'Photo'}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}

      {/* View More Button */}
      {maxPhotos && allPhotos.length > maxPhotos && (
        <div className="text-center pt-6">
          <Button
            onClick={() => {
              // Reset max photos to show all
              // This would typically trigger a prop change from parent
            }}
            variant="outline"
            className="text-orange-600 border-orange-200 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-800 dark:hover:bg-orange-900/20"
          >
            View All {allPhotos.length} Photos
          </Button>
        </div>
      )}

      {/* Lightbox */}
      {lightboxPhoto && (
        <PhotoLightbox
          photos={lightboxPhoto.photos}
          initialIndex={lightboxPhoto.index}
          onClose={() => setLightboxPhoto(null)}
        />
      )}
    </div>
  );
};

export default PageGalleryBlock;