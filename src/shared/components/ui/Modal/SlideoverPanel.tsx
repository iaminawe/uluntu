import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { SlideoverPanelProps } from '@/shared/components/ui/Modal/types';

/**
 * Slideover panel component
 * Used for displaying content in a slide-in panel from the side of the screen
 */
const SlideoverPanel: React.FC<SlideoverPanelProps> = ({
  isOpen,
  onClose,
  title,
  children,
  side = 'right',
  width = 'default',
  headerActions,
  footer,
  className = '',
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle ESC key press to close the panel
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    
    // Lock body scroll when panel is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      
      // Restore body scroll when panel is closed
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // If the panel is not open, don't render anything
  if (!isOpen) return null;

  // Determine panel width based on width prop
  const widthClass = {
    'narrow': 'w-72',
    'default': 'w-96',
    'wide': 'w-[32rem]',
  }[width];

  // Determine panel side (left or right)
  const sideClass = {
    'left': 'left-0',
    'right': 'right-0',
  }[side];

  // Determine transform direction based on side
  const transformClass = {
    'left': 'translate-x-[-100%]',
    'right': 'translate-x-[100%]',
  }[side];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={`absolute inset-y-0 ${sideClass} flex max-w-full ${className}`}>
        <div 
          ref={panelRef}
          className={`${widthClass} transform transition ease-in-out duration-300 ${isOpen ? 'translate-x-0' : transformClass} bg-white dark:bg-slate-800 h-full flex flex-col shadow-xl`}
        >
          {/* Panel header */}
          {(title || headerActions) && (
            <div className="px-4 py-6 sm:px-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              {title && (
                <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                  {title}
                </h2>
              )}
              
              <div className="flex items-center ml-auto space-x-2">
                {headerActions}
                
                <button
                  type="button"
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-400 focus:outline-none"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
          
          {/* Panel content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {children}
          </div>
          
          {/* Panel footer */}
          {footer && (
            <div className="border-t border-slate-200 dark:border-slate-700 p-4 sm:p-6">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SlideoverPanel;
