import React from 'react';
import { CardGridProps } from './types';

/**
 * Card grid component
 * Used for displaying multiple cards in a responsive grid layout
 */
const CardGrid: React.FC<CardGridProps> = ({
  children,
  columns = { sm: 1, md: 2, lg: 3 },
  gap = 'md',
  className = '',
}) => {
  // Convert column configuration to CSS grid classes
  const gridCols = [
    columns.sm ? `grid-cols-${columns.sm}` : 'grid-cols-1',
    columns.md ? `md:grid-cols-${columns.md}` : 'md:grid-cols-2',
    columns.lg ? `lg:grid-cols-${columns.lg}` : 'lg:grid-cols-3',
    columns.xl ? `xl:grid-cols-${columns.xl}` : '',
  ].filter(Boolean).join(' ');

  // Convert gap to CSS grid gap classes
  const gapClass = {
    'none': 'gap-0',
    'sm': 'gap-3',
    'md': 'gap-6',
    'lg': 'gap-8',
  }[gap];

  return (
    <div className={`grid ${gridCols} ${gapClass} ${className}`}>
      {children}
    </div>
  );
};

export default CardGrid;
