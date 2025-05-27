import React, { useState, useEffect } from 'react';
import { Calendar, Views, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { Event } from '../../types';
import { useEventsRedux } from '../../hooks/useEventsRedux';
import { CalendarToolbar } from './CalendarToolbar';
import { EventPopover } from './EventPopover';
import { SubscribeModal } from './SubscribeModal';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar-styles.css';

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

interface EventsCalendarProps {
  // These props are optional since we can also get events from Redux
  events?: Event[];
  isLoading?: boolean;
  error?: any;
}

const EventsCalendar: React.FC<EventsCalendarProps> = ({ events: propEvents, isLoading: propIsLoading, error: propError }) => {
  // Use Redux for events data if not provided via props
  const { events: reduxEvents, isLoading: reduxIsLoading, error: reduxError, getAllEvents } = useEventsRedux();
  
  // Use props if provided, otherwise use Redux state
  const events = propEvents || reduxEvents;
  const isLoading = propIsLoading !== undefined ? propIsLoading : reduxIsLoading;
  const error = propError || reduxError;

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showPopover, setShowPopover] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  // Fetch events when component mounts if using Redux
  useEffect(() => {
    if (!propEvents) {
      getAllEvents();
    }
  }, [propEvents, getAllEvents]);

  // Convert our events to the format expected by react-big-calendar
  const calendarEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: new Date(event.date),
    end: event.endDate ? new Date(event.endDate) : new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000), // Default to 2 hours if no end date
    allDay: false,
    resource: event, // Store the original event object for reference
  }));

  const handleEventClick = (event: any, e: React.SyntheticEvent) => {
    setSelectedEvent(event.resource);
    
    // Calculate position for popover
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setPopoverPosition({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
    });
    
    setShowPopover(true);
  };

  const handleClosePopover = () => {
    setShowPopover(false);
    setSelectedEvent(null);
  };

  const handleSubscribeClick = () => {
    setShowSubscribeModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-3 text-slate-600 dark:text-slate-400">Loading calendar...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 dark:text-red-400 mb-2">Failed to load events</p>
        <p className="text-slate-600 dark:text-slate-400">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 md:p-6">
      <div className="mb-4 flex justify-end">
        <button
          onClick={handleSubscribeClick}
          className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          Subscribe to Calendar
        </button>
      </div>

      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 700 }}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        defaultView={Views.MONTH}
        onSelectEvent={handleEventClick}
        components={{
          toolbar: CalendarToolbar as any,
        }}
        className="calendar-container"
      />

      {showPopover && selectedEvent && (
        <EventPopover
          event={selectedEvent}
          position={popoverPosition}
          onClose={handleClosePopover}
        />
      )}

      {showSubscribeModal && (
        <SubscribeModal
          events={events}
          onClose={() => setShowSubscribeModal(false)}
        />
      )}
    </div>
  );
};

export default EventsCalendar;
