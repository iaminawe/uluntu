import React from 'react';
import SkeletonCard from '@/shared/components/ui/Skeleton/SkeletonCard';

interface SkeletonGridProps {
  /**
   * Number of items to render in the grid
   */
  count?: number;
  /**
   * CSS class name(s) to apply to the grid container
   */
  className?: string;
  /**
   * Number of columns at different breakpoints
   */
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  /**
   * Optional props to pass to each SkeletonCard
   */
  cardProps?: React.ComponentProps<typeof SkeletonCard>;
}

/**
 * Skeleton component for grid layouts
 * Renders a configurable grid of skeleton cards
 */
const SkeletonGrid: React.FC<SkeletonGridProps> = ({
  count = 6,
  className = '',
  columns = { sm: 1, md: 2, lg: 3 },
  cardProps,
}) => {
  // Convert column configuration to CSS grid classes
  const gridCols = [
    columns.sm ? `grid-cols-${columns.sm}` : 'grid-cols-1',
    columns.md ? `md:grid-cols-${columns.md}` : 'md:grid-cols-2',
    columns.lg ? `lg:grid-cols-${columns.lg}` : 'lg:grid-cols-3',
    columns.xl ? `xl:grid-cols-${columns.xl}` : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={`grid ${gridCols} gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} {...cardProps} />
      ))}
    </div>
  );
};

export default SkeletonGrid;
