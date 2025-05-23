import { useState, useEffect } from 'react';
import { EventType, DateRangeFilter } from './types';
import { useEventsWithFilters } from '../../hooks/useQueries';
import EventCard from './EventCard';
import PastEventCard from './PastEventCard';

// Helper function to determine if an event is in the past
const isPastEvent = (date: string): boolean => {
  const eventDate = new Date(date);
  const today = new Date();
  return eventDate < today;
};

interface EventsListProps {
  initialSearch?: string;
}

const EventsList = ({ initialSearch = '' }: EventsListProps) => {
  // Use initialSearch directly without internal state management
  // This will be controlled by the ActionBar component instead
  const [selectedTypes, setSelectedTypes] = useState<EventType[]>([]);
  const [dateRange, setDateRange] = useState<DateRangeFilter>('all'); // Changed from 'upcoming' to 'all'
  
  const { data: events = [], isLoading, error } = useEventsWithFilters({
    search: initialSearch,
    types: selectedTypes.length > 0 ? selectedTypes : undefined,
    dateRange: dateRange
  });

  // Debug logging
  useEffect(() => {
    console.log('EventsList - Filters:', { search: initialSearch, types: selectedTypes, dateRange });
    console.log('EventsList - Events data:', events);
    console.log('EventsList - Loading state:', isLoading);
  }, [events, isLoading, initialSearch, selectedTypes, dateRange]);
  
  // No need for debounce since search is handled by ActionBar
  
  // Type filters now handled by ActionBar
  
  const clearFilters = () => {
    setSelectedTypes([]);
    setDateRange('all');
  };

  const hasActiveFilters = selectedTypes.length > 0 || dateRange !== 'all' || initialSearch !== '';
  
  // Separate events into upcoming and past
  const upcomingEvents = events.filter(event => !isPastEvent(event.date));
  const pastEvents = events.filter(event => isPastEvent(event.date));
  
  // Sort upcoming events by date (soonest first)
  upcomingEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Sort past events by date (most recent first)
  pastEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  return (
    <div className="space-y-8">
      
      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Loading events...</p>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="text-center py-8">
          <p className="text-red-500 dark:text-red-400 mb-2">Failed to load events</p>
          <p className="text-slate-600 dark:text-slate-400">Please try again later</p>
        </div>
      )}
      
      {/* Empty state */}
      {!isLoading && !error && events.length === 0 && (
        <div className="text-center py-8 bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <p className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No events found</p>
          <p className="text-slate-600 dark:text-slate-400 mb-4">No events found matching your criteria.</p>
          <button 
            onClick={clearFilters}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
      
      {/* Upcoming Events */}
      {!isLoading && !error && upcomingEvents.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Upcoming Events</h2>
          <div className="space-y-6">
            {upcomingEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}
      
      {/* Past Events */}
      {!isLoading && !error && pastEvents.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Recent Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pastEvents.map(event => (
              <div key={event.id} className="h-full">
                <PastEventCard event={event} />
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Results summary */}
      {!isLoading && !error && events.length > 0 && (
        <div className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
          Showing {events.length} {events.length === 1 ? 'event' : 'events'}
          {hasActiveFilters && ' matching your filters'}
        </div>
      )}
    </div>
  );
};

export default EventsList;
