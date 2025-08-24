import React from 'react';
import { SkeletonProps } from '@/shared/components/ui/Skeleton/types';

/**
 * Base skeleton component for loading states
 */
const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  rounded = 'rounded',
  colorMode,
  style: inlineStyle,
}) => {
  // Determine rounded class
  const roundedClass = rounded === true 
    ? 'rounded' 
    : rounded === false 
      ? '' 
      : rounded;
  
  // Determine background color class based on color mode
  const bgColorClass = colorMode === 'light' 
    ? 'bg-slate-200' 
    : colorMode === 'dark' 
      ? 'bg-slate-700'
      : 'bg-slate-200 dark:bg-slate-700';
  
  // Construct style props for width and height if provided
  const style: React.CSSProperties = { ...inlineStyle };
  if (width && !width.includes('w-')) style.width = width;
  if (height && !height.includes('h-')) style.height = height;
  
  // Construct className
  const widthClass = width?.includes('w-') ? width : '';
  const heightClass = height?.includes('h-') ? height : '';
  
  return (
    <div 
      className={`${bgColorClass} ${roundedClass} ${widthClass} ${heightClass} animate-pulse ${className}`} 
      style={style}
    />
  );
};

export default Skeleton;
