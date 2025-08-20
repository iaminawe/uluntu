import { Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { EventsTabProps } from './types';
import { getEventUrl } from '@/utils/contentUrlUtils';

const EventsTab: React.FC<EventsTabProps> = ({ events, isLoading }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Group Events</h2>
      
      {isLoading ? (
        <div className="animate-pulse space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-slate-200 dark:bg-slate-700 h-40 rounded-lg"></div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 text-center">
          <p className="text-slate-600 dark:text-slate-400">No upcoming events scheduled for this group.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {events.map(event => (
            <Link
              key={event.id}
              to={getEventUrl(event)}
              className="block bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 h-48">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 md:w-2/3">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    {event.title}
                  </h3>
                  <div className="flex items-center text-orange-500 mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {format(parseISO(event.date), 'EEEE, MMMM d, yyyy')} at {format(parseISO(event.date), 'h:mm a')}
                    </span>
                  </div>
                  {event.location && (
                    <div className="flex items-center text-slate-600 dark:text-slate-300 mb-4">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  <p className="text-slate-600 dark:text-slate-300 line-clamp-2">
                    {event.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsTab;
