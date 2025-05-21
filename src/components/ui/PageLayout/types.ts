/**
 * Type definitions for Page Layout components
 */
import { ReactNode } from 'react';

export interface PageHeaderProps {
  /**
   * Page title
   */
  title: string;
  /**
   * Optional subtitle or description
   */
  subtitle?: string;
  /**
   * Optional icon to display next to the title
   */
  icon?: ReactNode;
  /**
   * Optional actions to display in the header
   */
  actions?: ReactNode;
  /**
   * Background image URL for hero-style headers
   */
  backgroundImage?: string;
  /**
   * Whether to use the full-width hero style
   */
  isHero?: boolean;
  /**
   * CSS class name(s) to apply to the component
   */
  className?: string;
}

export interface ActionBarProps {
  /**
   * Handler for search input changes
   */
  onSearch?: (value: string) => void;
  /**
   * Current search term
   */
  searchTerm?: string;
  /**
   * Placeholder for the search input
   */
  searchPlaceholder?: string;
  /**
   * URL to create a new item
   */
  createUrl?: string;
  /**
   * Text for the create button
   */
  createText?: string;
  /**
   * Icon for the create button
   */
  createIcon?: ReactNode;
  /**
   * Whether to show the search input
   */
  showSearch?: boolean;
  /**
   * Optional filter components
   */
  filters?: ReactNode;
  /**
   * Additional actions to display
   */
  actions?: ReactNode;
  /**
   * CSS class name(s) to apply to the component
   */
  className?: string;
}

export interface ContentContainerProps {
  /**
   * Content to display
   */
  children: ReactNode;
  /**
   * Maximum width of the container
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  /**
   * Whether to add padding to the container
   */
  padding?: boolean;
  /**
   * CSS class name(s) to apply to the component
   */
  className?: string;
}

export interface EmptyStateProps {
  /**
   * Title of the empty state
   */
  title: string;
  /**
   * Description of the empty state
   */
  description?: string;
  /**
   * Icon to display
   */
  icon?: ReactNode;
  /**
   * Primary action to display
   */
  primaryAction?: {
    text: string;
    onClick: () => void;
  };
  /**
   * URL for the primary action (alternative to onClick)
   */
  primaryActionUrl?: string;
  /**
   * Secondary action to display
   */
  secondaryAction?: {
    text: string;
    onClick: () => void;
  };
  /**
   * URL for the secondary action (alternative to onClick)
   */
  secondaryActionUrl?: string;
  /**
   * CSS class name(s) to apply to the component
   */
  className?: string;
}
