import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Event } from './types';

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  return (
    <Link
      to={`/events/${event.id}`}
      className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col md:flex-row"
    >
      <div className="md:w-1/3 h-48 md:h-auto relative">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 bg-orange-500 text-white px-3 py-1 text-sm">
          {event.type === 'in-person' ? 'In-Person' : event.type === 'online' ? 'Online' : 'Hybrid'}
        </div>
      </div>
      <div className="p-6 md:w-2/3">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          {event.title}
        </h3>
        
        <div className="flex flex-wrap gap-4 mb-3 text-sm">
          <div className="flex items-center text-orange-500">
            <Calendar className="h-4 w-4 mr-1" />
            <span>
              {format(parseISO(event.date), 'EEE, MMM d, yyyy')}
              {event.endDate && event.endDate !== event.date && 
                ` - ${format(parseISO(event.endDate), 'EEE, MMM d, yyyy')}`
              }
            </span>
          </div>
          
          {event.type !== 'online' && (
            <div className="flex items-center text-slate-600 dark:text-slate-400">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{event.location}</span>
            </div>
          )}
          
          <div className="flex items-center text-slate-600 dark:text-slate-400">
            <Clock className="h-4 w-4 mr-1" />
            <span>{format(parseISO(event.date), 'h:mm a')}</span>
          </div>
        </div>
        
        <p className="text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
          {event.description}
        </p>
        
        <div className="flex items-center mt-auto">
          <img 
            src={event.organizer.image} 
            alt={event.organizer.name}
            className="w-8 h-8 rounded-full mr-2"
          />
          <div className="text-sm">
            <span className="text-slate-600 dark:text-slate-400">Organized by </span>
            <span className="text-slate-800 dark:text-slate-200">{event.organizer.name}</span>
          </div>
          
          {event.attendees !== undefined && (
            <div className="ml-auto flex items-center text-sm text-slate-600 dark:text-slate-400">
              <Users className="h-4 w-4 mr-1" />
              <span>{event.attendees} attending</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
