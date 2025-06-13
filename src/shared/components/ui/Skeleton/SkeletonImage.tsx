import React from 'react';
import { SkeletonImageProps } from '@/shared/components/ui/Skeleton/types';

/**
 * Skeleton component for image placeholders
 * Used to represent loading states for images
 */
const SkeletonImage: React.FC<SkeletonImageProps> = ({
  className = '',
  width = 'w-full',
  height,
  rounded = 'rounded-lg',
  aspectRatio = '16:9',
  colorMode,
}) => {
  // Determine color class based on color mode or system preference
  const colorClass = colorMode === 'light' 
    ? 'bg-slate-200' 
    : colorMode === 'dark' 
      ? 'bg-slate-700' 
      : 'bg-slate-200 dark:bg-slate-700';

  // Determine border radius class
  const roundedClass = rounded === true 
    ? 'rounded-lg' 
    : typeof rounded === 'string' 
      ? rounded 
      : '';
      
  // Handle aspect ratio
  let aspectRatioClass = '';
  switch (aspectRatio) {
    case '1:1':
      aspectRatioClass = 'aspect-square';
      break;
    case '4:3':
      aspectRatioClass = 'aspect-4/3';
      break;
    case '16:9':
      aspectRatioClass = 'aspect-video';
      break;
    case '21:9':
      aspectRatioClass = 'aspect-[21/9]';
      break;
    default:
      // For custom aspect ratios like '3:2'
      if (aspectRatio.includes(':')) {
        const [width, height] = aspectRatio.split(':');
        aspectRatioClass = `aspect-[${width}/${height}]`;
      }
  }

  // If height is provided, it takes precedence over aspect ratio
  const heightClass = height || (aspectRatioClass ? '' : 'h-48');

  return (
    <div 
      className={`
        ${width} 
        ${heightClass} 
        ${aspectRatioClass} 
        ${colorClass} 
        ${roundedClass} 
        ${className}
      `}
    />
  );
};

export default SkeletonImage;
