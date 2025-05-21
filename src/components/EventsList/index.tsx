import { useState, useEffect } from 'react';
import { EventType, DateRangeFilter } from './types';
import { useEventsWithFilters } from '../../hooks/useQueries';
import EventsFilters from './EventsFilters';
import EventCard from './EventCard';

interface EventsListProps {
  initialSearch?: string;
}

const EventsList = ({ initialSearch = '' }: EventsListProps) => {
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [selectedTypes, setSelectedTypes] = useState<EventType[]>([]);
  const [dateRange, setDateRange] = useState<DateRangeFilter>('upcoming');
  
  const { data: events = [], isLoading, error } = useEventsWithFilters({
    search: debouncedSearch,
    types: selectedTypes.length > 0 ? selectedTypes : undefined,
    dateRange: dateRange
  });
  
  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    
    return () => {
      clearTimeout(handler);
    };
  }, [search]);
  
  const handleTypeToggle = (type: EventType) => {
    setSelectedTypes(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };
  
  const clearFilters = () => {
    setSelectedTypes([]);
    setSearch('');
    setDebouncedSearch('');
    setDateRange('upcoming');
  };

  const hasActiveFilters = selectedTypes.length > 0 || dateRange !== 'upcoming' || debouncedSearch !== '';
  
  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <EventsFilters 
        search={search}
        setSearch={setSearch}
        selectedTypes={selectedTypes}
        handleTypeToggle={handleTypeToggle}
        dateRange={dateRange}
        setDateRange={setDateRange}
        clearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />
      
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
      
      {/* Event list */}
      {!isLoading && !error && events.length > 0 && (
        <div className="space-y-6">
          {events.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
      
      {/* Results summary */}
      {!isLoading && !error && events.length > 0 && (
        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
          Showing {events.length} {events.length === 1 ? 'event' : 'events'}
          {hasActiveFilters && ' matching your filters'}
        </div>
      )}
    </div>
  );
};

export default EventsList;
