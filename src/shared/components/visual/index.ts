// Visual Component Library for Nelson Tech Community
// This library provides stunning, image-heavy components for the home page

// Hero Components
export { default as DynamicHero } from './DynamicHero';
export { default as ParallaxHero } from './ParallaxHero';
// TODO(visual-components-phase2): Implement additional visual components
// VideoHero - Video background hero section component
// Estimated effort: 4 hours (includes video optimization)
// Priority: Medium - Nice to have for home page

// Card Components
export { default as ImageCard } from './ImageCard';
export { default as GlassCard } from './GlassCard';
export { default as HoverCard } from './HoverCard';
export { default as FeatureCard } from './FeatureCard';
export { DetailedCard } from './DetailedCard';

// Gallery Components
export { default as ImageGallery } from './ImageGallery';
// TODO(visual-components-phase2): Implement advanced gallery components
// MasonryGallery - Grid layout with dynamic sizing
// CarouselGallery - Slide-based image gallery
// Estimated effort: 6 hours total (includes carousel library integration)
// Priority: Medium - Needed for media-heavy sections

// Background Components (TODO: Implement these)
// TODO(visual-components-phase2): Implement background effect components
// AnimatedBackground - Animated gradient or particle background
// GradientBackground - Multi-color gradient backgrounds
// ParticleBackground - Canvas-based particle effect
// Estimated effort: 8 hours total
// Priority: Low - Enhancement feature
// Note: Consider using react-three-fiber or similar for performance

// Effect Components (TODO: Implement these)
// TODO(visual-components-phase2): Implement visual effect components
// ImageOverlay - Overlay effects for images
// ScrollReveal - Reveal animations on scroll
// ImageParallax - Parallax scrolling effect
// Estimated effort: 6 hours total
// Priority: Low - Enhancement feature
// Note: Use Intersection Observer API for performance

// Section Components
export { default as ImageSection } from './ImageSection';
// TODO(visual-components-phase2): Implement advanced section components
// SplitSection - Two-column section with image and text
// FullWidthSection - Full viewport width section with image
// Estimated effort: 4 hours total
// Priority: Medium - Useful for landing pages

// Types
export * from './types';