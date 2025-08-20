import React, { useRef, useEffect } from 'react';
import { Event } from '../../types';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { getEventUrl } from '@/utils/contentUrlUtils';

interface EventPopoverProps {
  event: Event;
  position: { top: number; left: number };
  onClose: () => void;
}

export const EventPopover: React.FC<EventPopoverProps> = ({ event, position, onClose }) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Format date and time
  const eventDate = new Date(event.date);
  const formattedDate = format(eventDate, 'EEEE, MMMM d, yyyy');
  const formattedTime = format(eventDate, 'h:mm a');
  
  // Format end time if available
  let formattedEndTime = '';
  if (event.endDate) {
    const endDate = new Date(event.endDate);
    formattedEndTime = format(endDate, 'h:mm a');
  }

  // Calculate popover position to ensure it stays within viewport
  const adjustedPosition = { ...position };
  
  // Adjust if needed based on viewport size
  if (typeof window !== 'undefined' && popoverRef.current) {
    const rect = popoverRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (position.left + rect.width > viewportWidth) {
      adjustedPosition.left = viewportWidth - rect.width - 20;
    }
    
    if (position.top + rect.height > viewportHeight) {
      adjustedPosition.top = viewportHeight - rect.height - 20;
    }
  }

  return (
    <div 
      ref={popoverRef}
      className="fixed z-50 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 w-80"
      style={{
        top: `${adjustedPosition.top}px`,
        left: `${adjustedPosition.left}px`,
      }}
    >
      <button 
        onClick={onClose}
        className="absolute top-2 right-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 pr-6">{event.title}</h3>
      
      <div className="text-sm text-slate-600 dark:text-slate-300 mb-3">
        <div className="flex items-start mb-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          <span>{formattedDate}</span>
        </div>
        
        <div className="flex items-start mb-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          <span>
            {formattedTime}
            {formattedEndTime && ` - ${formattedEndTime}`}
          </span>
        </div>
        
        {event.location && (
          <div className="flex items-start mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span>{event.location}</span>
          </div>
        )}
        
        {event.type && (
          <div className="flex items-start mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            <span className="capitalize">{event.type} Event</span>
          </div>
        )}
      </div>
      
      {event.description && (
        <div className="mb-4">
          <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3">{event.description}</p>
        </div>
      )}
      
      <div className="mt-4 flex justify-end">
        <Link
          to={getEventUrl(event)}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-sm"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};
