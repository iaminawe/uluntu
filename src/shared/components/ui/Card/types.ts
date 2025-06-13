/**
 * Type definitions for Card components
 */
import { ReactNode } from 'react';

export interface CardProps {
  /**
   * Card content
   */
  children: ReactNode;
  /**
   * Whether to apply hover effects
   */
  hoverable?: boolean;
  /**
   * Whether to add padding to the card
   */
  padding?: boolean;
  /**
   * Whether to add a shadow to the card
   */
  shadow?: boolean;
  /**
   * Whether to add a border to the card
   */
  border?: boolean;
  /**
   * CSS class name(s) to apply to the component
   */
  className?: string;
  /**
   * onClick handler for the card
   */
  onClick?: () => void;
  /**
   * HTML id attribute for the card
   */
  id?: string;
}

export interface CardHeaderProps {
  /**
   * Header content
   */
  children?: ReactNode;
  /**
   * Card title
   */
  title?: string;
  /**
   * Card subtitle
   */
  subtitle?: string;
  /**
   * Optional image URL for the header
   */
  image?: string;
  /**
   * Alt text for the image
   */
  imageAlt?: string;
  /**
   * Optional icon to display
   */
  icon?: ReactNode;
  /**
   * Actions to display in the header
   */
  actions?: ReactNode;
  /**
   * CSS class name(s) to apply to the component
   */
  className?: string;
}

export interface CardContentProps {
  /**
   * Content to display
   */
  children: ReactNode;
  /**
   * Whether to apply additional padding
   */
  padding?: boolean;
  /**
   * CSS class name(s) to apply to the component
   */
  className?: string;
}

export interface CardFooterProps {
  /**
   * Footer content
   */
  children?: ReactNode;
  /**
   * Actions to display in the footer
   */
  actions?: ReactNode;
  /**
   * Metadata to display in the footer
   */
  meta?: {
    icon?: ReactNode;
    text: string;
  }[];
  /**
   * CSS class name(s) to apply to the component
   */
  className?: string;
}

export interface CardGridProps {
  /**
   * Cards to display
   */
  children: ReactNode;
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
   * Gap between cards
   */
  gap?: 'none' | 'sm' | 'md' | 'lg';
  /**
   * CSS class name(s) to apply to the component
   */
  className?: string;
}
