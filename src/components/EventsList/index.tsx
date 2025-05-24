import { useState, useEffect } from 'react';
import { EventType, DateRangeFilter } from './types';
import { useEventsWithFilters } from '../../hooks/useSupabaseQueries';
import EventCard from './EventCard';
import PastEventCard from './PastEventCard';
import Pagination from '../Pagination'; // Import Pagination

const UPCOMING_EVENTS_PER_PAGE = 5;
const PAST_EVENTS_PER_PAGE = 9;

// Helper function to determine if an event is in the past
const isPastEvent = (date: string): boolean => {
  const eventDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Compare against start of today
  return eventDate < today;
};

interface EventsListProps {
  initialSearch?: string;
}

const EventsList = ({ initialSearch = '' }: EventsListProps) => {
  const [selectedTypes, setSelectedTypes] = useState<EventType[]>([]);
  const [dateRange, setDateRange] = useState<DateRangeFilter>('all');
  const [currentPageUpcoming, setCurrentPageUpcoming] = useState(1);
  const [currentPagePast, setCurrentPagePast] = useState(1);
  
  const { data: allEvents = [], isLoading, error } = useEventsWithFilters({
    search: initialSearch,
    types: selectedTypes.length > 0 ? selectedTypes : undefined,
    dateRange: dateRange
  });

  useEffect(() => {
    // Reset pages when filters change
    setCurrentPageUpcoming(1);
    setCurrentPagePast(1);
  }, [initialSearch, selectedTypes, dateRange]);
  
  const clearFilters = () => {
    setSelectedTypes([]);
    setDateRange('all');
    // Page reset will be handled by the useEffect above
  };

  const hasActiveFilters = selectedTypes.length > 0 || dateRange !== 'all' || initialSearch !== '';
  
  const upcomingEventsRaw = allEvents.filter(event => !isPastEvent(event.date));
  const pastEventsRaw = allEvents.filter(event => isPastEvent(event.date));
  
  upcomingEventsRaw.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  pastEventsRaw.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Pagination for Upcoming Events
  const totalUpcomingEvents = upcomingEventsRaw.length;
  const totalPagesUpcoming = Math.ceil(totalUpcomingEvents / UPCOMING_EVENTS_PER_PAGE);
  const startIndexUpcoming = (currentPageUpcoming - 1) * UPCOMING_EVENTS_PER_PAGE;
  const endIndexUpcoming = startIndexUpcoming + UPCOMING_EVENTS_PER_PAGE;
  const currentUpcomingEventsToDisplay = upcomingEventsRaw.slice(startIndexUpcoming, endIndexUpcoming);

  // Pagination for Past Events
  const totalPastEvents = pastEventsRaw.length;
  const totalPagesPast = Math.ceil(totalPastEvents / PAST_EVENTS_PER_PAGE);
  const startIndexPast = (currentPagePast - 1) * PAST_EVENTS_PER_PAGE;
  const endIndexPast = startIndexPast + PAST_EVENTS_PER_PAGE;
  const currentPastEventsToDisplay = pastEventsRaw.slice(startIndexPast, endIndexPast);

  const handlePageChangeUpcoming = (page: number) => {
    setCurrentPageUpcoming(page);
    // Consider scrolling to the top of the upcoming events section
  };

  const handlePageChangePast = (page: number) => {
    setCurrentPagePast(page);
    // Consider scrolling to the top of the past events section
  };
  
  return (
    <div className="space-y-8">
      
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Loading events...</p>
        </div>
      )}
      
      {error && (
        <div className="text-center py-8">
          <p className="text-red-500 dark:text-red-400 mb-2">Failed to load events</p>
          <p className="text-slate-600 dark:text-slate-400">Please try again later</p>
        </div>
      )}
      
      {!isLoading && !error && allEvents.length === 0 && (
        <div className="text-center py-8 bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <p className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No events found</p>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {hasActiveFilters ? "No events found matching your criteria." : "There are no events scheduled at this time."}
          </p>
          {hasActiveFilters && (
            <button 
              onClick={clearFilters}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
      
      {!isLoading && !error && currentUpcomingEventsToDisplay.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Upcoming Events</h2>
          <div className="space-y-6">
            {currentUpcomingEventsToDisplay.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          {totalPagesUpcoming > 1 && (
            <Pagination
              currentPage={currentPageUpcoming}
              totalPages={totalPagesUpcoming}
              onPageChange={handlePageChangeUpcoming}
            />
          )}
        </div>
      )}
      
      {!isLoading && !error && currentPastEventsToDisplay.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Recent Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentPastEventsToDisplay.map(event => (
              <div key={event.id} className="h-full">
                <PastEventCard event={event} />
              </div>
            ))}
          </div>
          {totalPagesPast > 1 && (
            <Pagination
              currentPage={currentPagePast}
              totalPages={totalPagesPast}
              onPageChange={handlePageChangePast}
            />
          )}
        </div>
      )}
      
      {!isLoading && !error && allEvents.length > 0 && (
        <div className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
          {/* Simplified summary, or could be more detailed if needed */}
          Showing {currentUpcomingEventsToDisplay.length > 0 ? currentUpcomingEventsToDisplay.length : 0} upcoming and {currentPastEventsToDisplay.length > 0 ? currentPastEventsToDisplay.length : 0} past events on this page.
          Total {allEvents.length} events {hasActiveFilters && ' matching your filters'}.
        </div>
      )}
    </div>
  );
};

export default EventsList;
