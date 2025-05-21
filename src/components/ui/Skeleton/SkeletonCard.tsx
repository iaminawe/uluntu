import React from 'react';
import { SkeletonCardProps } from './types';
import SkeletonImage from './SkeletonImage';
import SkeletonText from './SkeletonText';

/**
 * Skeleton component for card placeholders
 * Used to represent loading states for card-based UI components
 */
const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className = '',
  hasImage = true,
  hasContent = true,
  hasFooter = true,
  lines = 3,
  rounded = 'rounded-lg',
  colorMode,
}) => {
  // Determine color class based on color mode or system preference
  const colorClass = colorMode === 'light' 
    ? 'bg-slate-200' 
    : colorMode === 'dark' 
      ? 'bg-slate-700' 
      : 'bg-slate-200 dark:bg-slate-700';

  // Determine background class for the card
  const cardBgClass = 'bg-white dark:bg-slate-800';

  // Determine border radius class
  const roundedClass = rounded === true 
    ? 'rounded-lg' 
    : typeof rounded === 'string' 
      ? rounded 
      : '';

  return (
    <div className={`${cardBgClass} shadow-md overflow-hidden ${roundedClass} ${className}`}>
      {hasImage && (
        <div className="h-48 overflow-hidden">
          <SkeletonImage height="h-full" rounded="rounded-none" colorMode={colorMode} />
        </div>
      )}
      
      <div className="p-4">
        {/* Card Header - Title and badge */}
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-2">
            <SkeletonText height="h-6" width="w-3/4" colorMode={colorMode} />
            <SkeletonText height="h-4" width="w-1/3" colorMode={colorMode} />
          </div>
          <div className={`h-10 w-10 ${colorClass} rounded-md`}></div>
        </div>

        {/* Card Content */}
        {hasContent && (
          <div className="mb-4">
            <SkeletonText lines={lines} varyWidth colorMode={colorMode} />
          </div>
        )}

        {/* Card Footer - Meta information */}
        {hasFooter && (
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className={`h-8 w-8 ${colorClass} rounded-full mr-2`}></div>
              <SkeletonText height="h-4" width="w-20" colorMode={colorMode} />
            </div>
            <SkeletonText height="h-4" width="w-16" colorMode={colorMode} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SkeletonCard;
