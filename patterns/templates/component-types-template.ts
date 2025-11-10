import { [Feature]Item } from '../../types';

/**
 * Props for the [Component] component
 */
export interface [Component]Props {
  /**
   * The [feature] item to display
   */
  item: [Feature]Item | null;
  
  /**
   * Callback when an action is performed on the item
   */
  onAction?: (item: [Feature]Item) => void;
  
  /**
   * Visual variant of the component
   * @default 'default'
   */
  variant?: 'default' | 'compact' | 'detailed';
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Whether the component is in a loading state
   */
  isLoading?: boolean;
  
  /**
   * Error message to display
   */
  error?: string | null;
}

/**
 * Internal state for the component
 */
export interface [Component]State {
  isExpanded: boolean;
  showModal: boolean;
}