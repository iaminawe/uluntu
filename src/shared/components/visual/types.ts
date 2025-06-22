// Visual Component Types

export interface ImageConfig {
  src: string;
  alt: string;
  fallback?: string;
  blur?: string; // Data URL for blur-up effect
  aspectRatio?: '16:9' | '4:3' | '1:1' | '3:2' | '2:3';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

export interface AnimationConfig {
  duration?: number;
  delay?: number;
  easing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  type?: 'fade' | 'slide' | 'scale' | 'rotate' | 'blur';
}

export interface GradientConfig {
  colors: string[];
  direction?: 'to-right' | 'to-left' | 'to-top' | 'to-bottom' | 'to-tr' | 'to-tl' | 'to-br' | 'to-bl';
  opacity?: number;
}

export interface OverlayConfig {
  gradient?: GradientConfig;
  blur?: number;
  color?: string;
  opacity?: number;
}

export interface ParallaxConfig {
  speed?: number;
  offset?: number;
  direction?: 'up' | 'down';
}

export interface CardVariant {
  variant?: 'default' | 'glass' | 'gradient' | 'dark' | 'light';
  hoverable?: boolean;
  animated?: boolean;
}

export interface SectionConfig {
  background?: ImageConfig | GradientConfig;
  overlay?: OverlayConfig;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
}

// Component-specific types

export interface DynamicHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  images: ImageConfig[];
  interval?: number;
  overlay?: OverlayConfig;
  height?: 'full' | 'large' | 'medium' | 'small';
  actions?: Array<{
    label: string;
    href: string;
    variant?: 'primary' | 'secondary' | 'ghost';
  }>;
}

export interface ImageCardProps extends CardVariant {
  image: ImageConfig;
  title: string;
  description?: string;
  badge?: string;
  badgeColor?: string;
  meta?: Array<{
    icon?: React.ComponentType;
    text: string;
  }>;
  link?: string;
  onClick?: () => void;
}

export interface GalleryItem {
  id: string;
  image: ImageConfig;
  title?: string;
  description?: string;
  category?: string;
  link?: string;
}

export interface ImageGalleryProps {
  items: GalleryItem[];
  columns?: 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg';
  variant?: 'grid' | 'masonry' | 'carousel';
  animated?: boolean;
}