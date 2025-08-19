import React, { useRef } from 'react';
import { GripVertical } from 'lucide-react';

interface AccessibleDragHandleProps {
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onMoveInto?: () => void;
  itemTitle: string;
  position: number;
  totalItems: number;
  level: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canNest: boolean;
  isDragDisabled?: boolean;
  className?: string;
  dragHandleProps?: any;
}

/**
 * Accessible drag handle with keyboard support
 * Provides keyboard navigation alternatives to drag and drop
 */
export const AccessibleDragHandle: React.FC<AccessibleDragHandleProps> = ({
  onMoveUp,
  onMoveDown,
  onMoveInto,
  itemTitle,
  position,
  totalItems,
  level,
  canMoveUp,
  canMoveDown,
  canNest,
  isDragDisabled = false,
  className = '',
  dragHandleProps
}) => {
  const handleRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isDragDisabled) return;

    // Handle keyboard shortcuts for moving items
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (canMoveUp && onMoveUp) {
            onMoveUp();
            announceMove('moved up');
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (canMoveDown && onMoveDown) {
            onMoveDown();
            announceMove('moved down');
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (canNest && onMoveInto) {
            onMoveInto();
            announceMove('nested into parent item');
          }
          break;
      }
    }

    // Handle space/enter for focus announcement
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      announceInstructions();
    }
  };

  const announceMove = (action: string) => {
    const announcement = `${itemTitle} ${action}. Current position ${position} of ${totalItems}.`;
    announceToScreenReader(announcement);
  };

  const announceInstructions = () => {
    const instructions = [
      `Drag handle for ${itemTitle}.`,
      `Current position ${position} of ${totalItems}, level ${level + 1}.`,
      'Use Ctrl+Arrow keys to move:',
      canMoveUp ? 'Ctrl+Up to move up,' : '',
      canMoveDown ? 'Ctrl+Down to move down,' : '',
      canNest ? 'Ctrl+Right to nest into parent.' : ''
    ].filter(Boolean).join(' ');
    
    announceToScreenReader(instructions);
  };

  const announceToScreenReader = (message: string) => {
    // Create a temporary live region for screen reader announcements
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  const getAriaLabel = () => {
    const positionText = `Position ${position} of ${totalItems}`;
    const levelText = `Level ${level + 1}`;
    const instructions = [
      'Drag to reorder,',
      'or use Ctrl+Arrow keys:',
      canMoveUp ? 'Ctrl+Up to move up,' : '',
      canMoveDown ? 'Ctrl+Down to move down,' : '',
      canNest ? 'Ctrl+Right to nest.' : ''
    ].filter(Boolean).join(' ');
    
    return `${itemTitle} drag handle. ${positionText}, ${levelText}. ${instructions}`;
  };

  if (isDragDisabled) {
    return (
      <div 
        className={`p-1 text-gray-300 cursor-not-allowed ${className}`}
        aria-label={`${itemTitle} - dragging disabled`}
      >
        <GripVertical className="h-5 w-5" />
      </div>
    );
  }

  return (
    <button
      {...dragHandleProps}
      ref={handleRef}
      type="button"
      className={`
        p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing 
        transition-colors duration-150 rounded focus:outline-none focus:ring-2 
        focus:ring-blue-500 focus:ring-offset-1 ${className}
      `}
      onKeyDown={handleKeyDown}
      onFocus={announceInstructions}
      aria-label={getAriaLabel()}
      aria-describedby={`drag-instructions-${itemTitle.replace(/\s+/g, '-').toLowerCase()}`}
      tabIndex={0}
    >
      <GripVertical className="h-5 w-5" />
      
      {/* Hidden instructions for screen readers */}
      <div
        id={`drag-instructions-${itemTitle.replace(/\s+/g, '-').toLowerCase()}`}
        className="sr-only"
      >
        Use keyboard shortcuts: Ctrl+Up/Down to move, Ctrl+Right to nest. Current position {position} of {totalItems}, level {level + 1}.
      </div>
    </button>
  );
};

export default AccessibleDragHandle;