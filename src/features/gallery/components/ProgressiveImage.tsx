import React, { useState, useEffect, useRef } from 'react';
import { ImageIcon } from 'lucide-react';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  dominantColor?: string;
  width?: number;
  height?: number;
  onLoad?: () => void;
  onError?: () => void;
  quality?: 'thumbnail' | 'small' | 'medium' | 'large' | 'original';
  enableLazyLoading?: boolean;
}

interface ImageSources {
  thumbnail?: string;
  small?: string;
  medium?: string;
  large?: string;
  original?: string;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  alt,
  className = '',
  placeholder,
  dominantColor,
  width,
  height,
  onLoad,
  onError,
  quality = 'medium',
  enableLazyLoading = true
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isInView, setIsInView] = useState(!enableLazyLoading);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Parse image sources from src if it contains multiple sizes
  const imageSources: ImageSources = React.useMemo(() => {
    if (typeof src === 'string') {
      // Assume single source
      return { [quality]: src };
    }
    return src as any; // Type assertion for multiple sources
  }, [src, quality]);

  // Get the best available source based on quality preference
  const getBestSource = (targetQuality: string): string => {
    const qualityOrder = ['thumbnail', 'small', 'medium', 'large', 'original'];
    const targetIndex = qualityOrder.indexOf(targetQuality);
    
    // Try target quality first
    if (imageSources[targetQuality as keyof ImageSources]) {
      return imageSources[targetQuality as keyof ImageSources]!;
    }
    
    // Fall back to next available quality
    for (let i = targetIndex + 1; i < qualityOrder.length; i++) {
      const qual = qualityOrder[i] as keyof ImageSources;
      if (imageSources[qual]) {
        return imageSources[qual]!;
      }
    }
    
    // Fall back to previous quality
    for (let i = targetIndex - 1; i >= 0; i--) {
      const qual = qualityOrder[i] as keyof ImageSources;
      if (imageSources[qual]) {
        return imageSources[qual]!;
      }
    }
    
    // Return first available
    return Object.values(imageSources)[0] || '';
  };

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (!enableLazyLoading || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '50px' // Start loading 50px before image comes into view
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [enableLazyLoading]);

  // Progressive loading logic
  useEffect(() => {
    if (!isInView) return;

    const loadImage = async () => {
      // Start with thumbnail if available and we're not targeting thumbnail
      if (quality !== 'thumbnail' && imageSources.thumbnail) {
        const thumbnailImg = new Image();
        thumbnailImg.onload = () => {
          setCurrentSrc(imageSources.thumbnail!);
        };
        thumbnailImg.src = imageSources.thumbnail;
      }

      // Load target quality
      const targetSrc = getBestSource(quality);
      if (targetSrc) {
        const img = new Image();
        img.onload = () => {
          setCurrentSrc(targetSrc);
          setIsLoaded(true);
          onLoad?.();
        };
        img.onerror = () => {
          setIsError(true);
          onError?.();
        };
        img.src = targetSrc;
      }
    };

    loadImage();
  }, [isInView, quality, imageSources, onLoad, onError]);

  // Background color from dominant color or placeholder
  const backgroundColor = dominantColor || '#f3f4f6';

  if (!isInView && enableLazyLoading) {
    return (
      <div
        ref={imgRef}
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={{
          backgroundColor,
          width,
          height,
          aspectRatio: width && height ? `${width}/${height}` : undefined
        }}
      >
        <ImageIcon className="w-8 h-8 text-gray-400" />
      </div>
    );
  }

  if (isError) {
    return (
      <div
        ref={imgRef}
        className={`flex items-center justify-center bg-gray-100 text-gray-500 ${className}`}
        style={{
          backgroundColor,
          width,
          height,
          aspectRatio: width && height ? `${width}/${height}` : undefined
        }}
      >
        <div className="text-center">
          <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <span className="text-sm">Failed to load</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{
        backgroundColor,
        width,
        height,
        aspectRatio: width && height ? `${width}/${height}` : undefined
      }}
    >
      {/* Placeholder/dominant color background */}
      {placeholder && !isLoaded && (
        <img
          src={placeholder}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
        />
      )}
      
      {/* Main image */}
      {currentSrc && (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          width={width}
          height={height}
        />
      )}
      
      {/* Loading state */}
      {!isLoaded && !placeholder && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};