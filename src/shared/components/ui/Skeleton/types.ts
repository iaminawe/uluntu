/**
 * Type definitions for Skeleton loading components
 */

export interface SkeletonProps {
  /**
   * CSS class name(s) to apply to the component
   */
  className?: string;
  /**
   * Width of the skeleton element (can be a pixel value or Tailwind class)
   */
  width?: string;
  /**
   * Height of the skeleton element (can be a pixel value or Tailwind class)
   */
  height?: string;
  /**
   * Whether to round the corners of the skeleton
   */
  rounded?: boolean | string;
  /**
   * Force light/dark mode for testing
   */
  colorMode?: 'light' | 'dark';
  /**
   * Inline styles to apply to the component
   */
  style?: React.CSSProperties;
}

export interface SkeletonContainerProps {
  /**
   * Child elements to animate
   */
  children: React.ReactNode;
  /**
   * CSS class name(s) to apply to the container
   */
  className?: string;
}

export interface SkeletonTextProps extends SkeletonProps {
  /**
   * Number of lines to render
   */
  lines?: number;
  /**
   * Whether to vary the width of each line randomly
   */
  varyWidth?: boolean;
}

export interface SkeletonImageProps extends SkeletonProps {
  /**
   * Aspect ratio of the image placeholder
   */
  aspectRatio?: '1:1' | '4:3' | '16:9' | '21:9' | string;
}

export interface SkeletonCardProps extends SkeletonProps {
  /**
   * Whether to include an image in the card
   */
  hasImage?: boolean;
  /**
   * Whether to include content lines in the card
   */
  hasContent?: boolean;
  /**
   * Whether to include footer content in the card
   */
  hasFooter?: boolean;
  /**
   * Number of text lines in the card content
   */
  lines?: number;
}
