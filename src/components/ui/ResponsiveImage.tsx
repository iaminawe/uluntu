import React, { useState, useEffect, useRef } from 'react';
import { Photo } from '@/features/gallery/types';

export interface ResponsiveImageProps {
  photo: Photo;
  size?: 'thumbnail' | 'small' | 'medium' | 'large' | 'original';
  className?: string;
  alt?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  showPlaceholder?: boolean;
  aspectRatio?: 'square' | 'landscape' | 'portrait' | 'auto';
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
}

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  photo,
  size = 'medium',
  className = '',
  alt,
  loading = 'lazy',
  onLoad,
  onError,
  showPlaceholder = true,
  aspectRatio = 'auto',
  objectFit = 'cover'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get the appropriate image URL based on size
  const getImageUrl = (requestedSize: typeof size): string => {
    switch (requestedSize) {
      case 'thumbnail':
        return photo.thumbnail_url || photo.small_url || photo.medium_url || photo.url || '';
      case 'small':
        return photo.small_url || photo.medium_url || photo.url || '';
      case 'medium':
        return photo.medium_url || photo.large_url || photo.url || '';
      case 'large':
        return photo.large_url || photo.original_url || photo.url || '';
      case 'original':
        return photo.original_url || photo.url || '';
      default:
        return photo.url || '';
    }
  };

  // Get dimensions for the requested size
  const getDimensions = (requestedSize: typeof size) => {
    switch (requestedSize) {
      case 'thumbnail':
        return {
          width: photo.thumbnail_width || 150,
          height: photo.thumbnail_height || 150
        };
      case 'small':
        return {
          width: photo.small_width || 300,
          height: photo.small_height || 300
        };
      case 'medium':
        return {
          width: photo.medium_width || 800,
          height: photo.medium_height || 600
        };
      case 'large':
        return {
          width: photo.large_width || 1200,
          height: photo.large_height || 900
        };
      case 'original':
        return {
          width: photo.width || 1920,
          height: photo.height || 1080
        };
      default:
        return {
          width: photo.width || 800,
          height: photo.height || 600
        };
    }
  };

  const imageUrl = getImageUrl(size);
  const dimensions = getDimensions(size);
  const imageAlt = alt || photo.alt_text || photo.title || photo.original_file_name || 'Gallery image';

  // Handle image load
  const handleImageLoad = () => {
    setIsLoaded(true);
    setShowFullImage(true);
    onLoad?.();
  };

  // Handle image error
  const handleImageError = () => {
    setHasError(true);
    onError?.();
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (loading === 'eager') {
      setShowFullImage(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShowFullImage(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px'
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [loading]);

  // Generate srcSet for responsive images
  const generateSrcSet = (): string => {
    const srcSet: string[] = [];

    if (photo.thumbnail_url) {
      srcSet.push(`${photo.thumbnail_url} ${photo.thumbnail_width || 150}w`);
    }
    if (photo.small_url) {
      srcSet.push(`${photo.small_url} ${photo.small_width || 300}w`);
    }
    if (photo.medium_url) {
      srcSet.push(`${photo.medium_url} ${photo.medium_width || 800}w`);
    }
    if (photo.large_url) {
      srcSet.push(`${photo.large_url} ${photo.large_width || 1200}w`);
    }
    if (photo.original_url) {
      srcSet.push(`${photo.original_url} ${photo.width || 1920}w`);
    }

    return srcSet.join(', ');
  };

  // Generate sizes attribute for responsive images
  const generateSizes = (): string => {
    switch (size) {
      case 'thumbnail':
        return '150px';
      case 'small':
        return '(max-width: 640px) 100vw, 300px';
      case 'medium':
        return '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 800px';
      case 'large':
        return '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px';
      case 'original':
        return '100vw';
      default:
        return '(max-width: 768px) 100vw, 800px';
    }
  };

  // Get aspect ratio classes
  const getAspectRatioClass = (): string => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'landscape':
        return 'aspect-video';
      case 'portrait':
        return 'aspect-[3/4]';
      case 'auto':
      default:
        return '';
    }
  };

  // Get object fit class
  const getObjectFitClass = (): string => {
    switch (objectFit) {
      case 'cover':
        return 'object-cover';
      case 'contain':
        return 'object-contain';
      case 'fill':
        return 'object-fill';
      case 'scale-down':
        return 'object-scale-down';
      default:
        return 'object-cover';
    }
  };

  if (hasError) {
    return (
      <div 
        ref={containerRef}
        className={`flex items-center justify-center bg-slate-100 dark:bg-slate-800 ${getAspectRatioClass()} ${className}`}
        style={{ 
          width: dimensions.width,
          height: aspectRatio === 'auto' ? dimensions.height : undefined
        }}
      >
        <div className="text-center p-4">
          <div className="w-12 h-12 mx-auto mb-2 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Failed to load image</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${getAspectRatioClass()} ${className}`}
      style={{ 
        backgroundColor: photo.dominant_color || '#f1f5f9',
        width: aspectRatio === 'auto' ? dimensions.width : undefined,
        height: aspectRatio === 'auto' ? dimensions.height : undefined
      }}
    >
      {/* Placeholder */}
      {showPlaceholder && photo.placeholder_data && !isLoaded && (
        <img
          src={photo.placeholder_data}
          alt=""
          className={`absolute inset-0 w-full h-full ${getObjectFitClass()} filter blur-sm scale-110 transition-opacity duration-300`}
          style={{ opacity: showFullImage ? 0 : 1 }}
        />
      )}

      {/* Main image */}
      {showFullImage && imageUrl && (
        <img
          ref={imgRef}
          src={imageUrl}
          srcSet={generateSrcSet()}
          sizes={generateSizes()}
          alt={imageAlt}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`w-full h-full ${getObjectFitClass()} transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading={loading}
        />
      )}

      {/* Loading spinner */}
      {!isLoaded && !hasError && showFullImage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default ResponsiveImage;