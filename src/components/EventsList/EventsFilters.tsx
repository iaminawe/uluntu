import { Search, X } from 'lucide-react';
import { EventType, DateRangeFilter } from '@/features/events/components/EventsList/types';

interface EventsFiltersProps {
  search: string;
  setSearch: (search: string) => void;
  selectedTypes: EventType[];
  handleTypeToggle: (type: EventType) => void;
  dateRange: DateRangeFilter;
  setDateRange: (range: DateRangeFilter) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

const EventsFilters = ({
  search,
  setSearch,
  selectedTypes,
  handleTypeToggle,
  dateRange,
  setDateRange,
  clearFilters,
  hasActiveFilters
}: EventsFiltersProps) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search events by title, description, or location..."
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 md:w-auto">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm"
            >
              Clear All <X className="h-4 w-4 ml-1" />
            </button>
          )}
        </div>
      </div>
      
      {/* Date Range Filter */}
      <div className="mt-4">
        <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Date Range:</div>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'upcoming', label: 'Upcoming' },
            { value: 'month', label: 'This Month' },
            { value: 'three-months', label: 'Next 3 Months' },
            { value: 'all', label: 'All Events' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setDateRange(option.value as DateRangeFilter)}
              className={`px-3 py-1 rounded-full text-sm ${
                dateRange === option.value
                  ? 'bg-orange-500 text-white' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Event Type Filter */}
      <div className="mt-4">
        <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Event Type:</div>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'in-person', label: 'In-Person' },
            { value: 'online', label: 'Online' },
            { value: 'hybrid', label: 'Hybrid' }
          ].map(type => (
            <button
              key={type.value}
              onClick={() => handleTypeToggle(type.value as EventType)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedTypes.includes(type.value as EventType)
                  ? 'bg-orange-500 text-white' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventsFilters;
