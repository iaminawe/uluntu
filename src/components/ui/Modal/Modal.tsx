import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { ModalProps } from './types';

/**
 * Base modal component
 * Provides a foundation for all modal dialogs in the application
 */
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  headerActions,
  footer,
  className = '',
  overlayClassName = '',
  closeOnOutsideClick = true,
  centered = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle ESC key press to close the modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    
    // Lock body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      
      // Restore body scroll when modal is closed
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Handle outside click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOutsideClick && modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // If the modal is not open, don't render anything
  if (!isOpen) return null;

  // Determine modal width based on size prop
  const sizeClass = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    'full': 'max-w-full mx-4',
  }[size];

  // Determine vertical alignment
  const alignmentClass = centered ? 'items-center' : 'items-start pt-16';

  return (
    <div 
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex ${alignmentClass} justify-center overflow-y-auto ${overlayClassName}`}
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
    >
      <div 
        ref={modalRef}
        className={`bg-white dark:bg-slate-800 rounded-lg shadow-xl ${sizeClass} w-full mx-auto my-8 relative ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        {(title || showCloseButton || headerActions) && (
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            {title && (
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                {title}
              </h3>
            )}
            
            <div className="flex items-center ml-auto space-x-2">
              {headerActions}
              
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-400 focus:outline-none"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Modal body */}
        <div className="px-6 py-4">
          {children}
        </div>
        
        {/* Modal footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
