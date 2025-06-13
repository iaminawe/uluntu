import React from 'react';
import { ContentContainerProps } from '@/shared/components/ui/PageLayout/types';

/**
 * Reusable content container component
 * Provides consistent width constraints and padding across pages
 */
const ContentContainer: React.FC<ContentContainerProps> = ({
  children,
  maxWidth = '7xl',
  padding = true,
  className = '',
}) => {
  // Map the maxWidth prop to corresponding Tailwind classes
  const maxWidthClass = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '7xl': 'max-w-7xl',
    'full': 'max-w-full'
  }[maxWidth];

  // Determine padding classes
  const paddingClass = padding ? 'px-4 py-8' : '';

  return (
    <div className={`container mx-auto ${paddingClass} ${className}`}>
      <div className={`${maxWidthClass} mx-auto`}>
        {children}
      </div>
    </div>
  );
};

export default ContentContainer;
