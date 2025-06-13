import React from 'react';
import { SkeletonTextProps } from '@/shared/components/ui/Skeleton/types';

/**
 * Skeleton component for text placeholders
 * Used to represent loading states for text content
 */
const SkeletonText: React.FC<SkeletonTextProps> = ({
  className = '',
  height = 'h-4',
  width,
  rounded = true,
  lines = 1,
  varyWidth = true,
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
    ? 'rounded' 
    : typeof rounded === 'string' 
      ? rounded 
      : '';

  // Generate multiple lines with varying widths if requested
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => {
        // Calculate varying widths for different lines if varyWidth is true
        let lineWidth = width;
        if (varyWidth && !width) {
          const widthVariations = ['w-full', 'w-5/6', 'w-4/5', 'w-11/12', 'w-3/4'];
          lineWidth = index === 0 ? 'w-full' : widthVariations[index % widthVariations.length];
        }
        
        return (
          <div
            key={index}
            className={`${height} ${lineWidth || 'w-full'} ${colorClass} ${roundedClass}`}
          />
        );
      })}
    </div>
  );
};

export default SkeletonText;
