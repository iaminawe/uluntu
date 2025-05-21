import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { UpcomingEventsProps } from './types';
import EventCard from './EventCard';
import { filterUpcomingEvents, sortEventsByDate } from './utils';
import { Event } from '../../data/mock/mockData';

// Sample events data for local development
const SAMPLE_EVENTS: Event[] = [
  {
    id: 1,
    title: 'AI in Healthcare Workshop',
    date: '2025-06-15T18:00:00',
    location: 'Nelson Innovation Centre',
    image: 'https://images.pexels.com/photos/7089629/pexels-photo-7089629.jpeg',
    description: 'Join us for an interactive workshop exploring AI applications in healthcare.',
    organizer: {
      id: 1,
      name: 'Nelson Tech Collective',
      image: 'https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg'
    },
    type: 'in-person'
  },
  {
    id: 2,
    title: 'Machine Learning Study Group',
    date: '2025-06-20T19:00:00',
    location: 'Virtual',
    image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg',
    description: 'Weekly study group for machine learning enthusiasts.',
    organizer: {
      id: 2,
      name: 'Kootenay Data Science Network',
      image: 'https://images.pexels.com/photos/3184603/pexels-photo-3184603.jpeg'
    },
    type: 'online'
  }
];

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({
  title = "Upcoming Events",
  events = SAMPLE_EVENTS,
  maxEvents = 3,
  showViewAll = true,
  className = "bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-6"
}) => {
  // Filter and sort events
  const upcomingEvents = filterUpcomingEvents(events);
  const sortedEvents = sortEventsByDate(upcomingEvents);
  
  // Limit the number of events to display
  const displayedEvents = sortedEvents.slice(0, maxEvents);
  
  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        {showViewAll && (
          <Link 
            to="/events" 
            className="flex items-center text-white/90 hover:text-white transition-colors text-sm font-medium"
          >
            View all
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        )}
      </div>
      
      <div className="grid gap-4">
        {displayedEvents.length > 0 ? (
          displayedEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))
        ) : (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <p>No upcoming events at the moment.</p>
            <p className="text-sm mt-1">Check back soon for new events!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingEvents;
