import React from 'react';
import { SkeletonContainerProps } from './types';

/**
 * Container component that applies pulse animation to skeleton elements
 */
const SkeletonContainer: React.FC<SkeletonContainerProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {children}
    </div>
  );
};

export default SkeletonContainer;
