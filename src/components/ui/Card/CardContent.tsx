import React from 'react';
import { CardContentProps } from './types';

/**
 * Card content component
 * Used for displaying the main content in cards
 */
const CardContent: React.FC<CardContentProps> = ({
  children,
  padding = true,
  className = '',
}) => {
  const paddingClass = padding ? 'py-3' : '';
  
  return (
    <div className={`${paddingClass} ${className}`}>
      {children}
    </div>
  );
};

export default CardContent;
