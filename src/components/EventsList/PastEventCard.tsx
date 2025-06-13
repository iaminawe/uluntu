import { Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Event } from '@/features/events/components/EventsList/types';

interface PastEventCardProps {
  event: Event;
}

const PastEventCard = ({ event }: PastEventCardProps) => {
  return (
    <Link
      to={`/events/${event.id}`}
      className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full"
    >
      <div className="relative">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-0 right-0 bg-slate-700 text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
          Completed
        </div>
        <div className="absolute bottom-0 left-0 bg-orange-500 text-white px-3 py-1 text-sm">
          {event.type === 'in-person' ? 'In-Person' : event.type === 'online' ? 'Online' : 'Hybrid'}
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          {event.title}
        </h3>
        
        <div className="flex flex-wrap gap-3 mb-3 text-sm">
          <div className="flex items-center text-orange-500">
            <Calendar className="h-4 w-4 mr-1" />
            <span>
              {format(parseISO(event.date), 'MMMM d, yyyy')}
            </span>
          </div>
          
          {event.type !== 'online' && (
            <div className="flex items-center text-slate-600 dark:text-slate-400">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{event.location.split(',')[0]}</span>
            </div>
          )}
        </div>
        
        <p className="text-slate-600 dark:text-slate-300 mb-4 flex-1 line-clamp-3">
          {event.description}
        </p>
      </div>
    </Link>
  );
};

export default PastEventCard;
