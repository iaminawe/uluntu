import React, { useState } from 'react';
import { PlusCircle, Calendar, Clock, MapPin, Video, List } from 'lucide-react';
import { ActionBar as SharedActionBar } from '@/shared/components/ui/PageLayout';
import { EventType, DateRangeFilter } from '@/features/events/components/EventsList/types';

interface ActionBarProps {
  onSearch?: (value: string) => void;
  viewMode: 'list' | 'calendar';
  onViewModeChange: (mode: 'list' | 'calendar') => void;
}

const ActionBar: React.FC<ActionBarProps> = ({ onSearch, viewMode, onViewModeChange }) => {
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<EventType | 'all'>('all');
  const [dateRange, setDateRange] = useState<DateRangeFilter>('upcoming');
  
  const handleSearch = (value: string) => {
    console.log('Searching for events:', value);
    setSearchTerm(value);
    // Pass the search term to the parent component if onSearch prop is provided
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <SharedActionBar
      searchTerm={searchTerm}
      onSearch={handleSearch}
      searchPlaceholder="Search events..."
      createUrl="/events/create"
      createText="Create New Event"
      createIcon={<PlusCircle className="h-5 w-5" />}
      showSearch={true}
      filters={
        <div className="flex flex-wrap gap-3 items-center">
          {/* Event Type Filter */}
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as EventType | 'all')}
              className="appearance-none pl-9 pr-8 py-2 bg-slate-100 dark:bg-slate-700 rounded-md text-sm"
            >
              <option value="all">All Event Types</option>
              <option value="in-person">In-Person</option>
              <option value="online">Online</option>
              <option value="hybrid">Hybrid</option>
            </select>
            {selectedType === 'online' ? (
              <Video className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
            ) : (
              <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
            )}
          </div>
          
          {/* Date Range Filter */}
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRangeFilter)}
              className="appearance-none pl-9 pr-8 py-2 bg-slate-100 dark:bg-slate-700 rounded-md text-sm"
            >
              <option value="upcoming">Upcoming</option>
              <option value="month">This Month</option>
              <option value="three-months">Next 3 Months</option>
              <option value="all">All Events</option>
            </select>
            <Clock className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-700 rounded-md">
            <button
              onClick={() => onViewModeChange('list')}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${viewMode === 'list' 
                ? 'bg-orange-500 text-white' 
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
            >
              <span className="flex items-center">
                <List className="h-4 w-4 mr-1" />
                List
              </span>
            </button>
            <button
              onClick={() => onViewModeChange('calendar')}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${viewMode === 'calendar' 
                ? 'bg-orange-500 text-white' 
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
            >
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Calendar
              </span>
            </button>
          </div>
        </div>
      }
    />
  );
};

export default ActionBar;
