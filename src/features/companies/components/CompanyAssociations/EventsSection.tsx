import React from 'react';
import { Link } from 'react-router-dom';
import { Event } from '@/types';
import { SkeletonCard } from '@/shared/components/ui/Skeleton';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { getEventUrl } from '@/utils/contentUrlUtils';

interface EventsSectionProps {
  events: Event[];
  isLoading: boolean;
  error?: Error | null;
}

export function EventsSection({ events, isLoading, error }: EventsSectionProps) {
  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Events
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <SkeletonCard key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Events
        </h2>
        <div className="text-center py-8 text-slate-600 dark:text-slate-400">
          Failed to load events
        </div>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return null;
  }

  // Sort events by date (upcoming first)
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Separate upcoming and past events
  const now = new Date();
  const upcomingEvents = sortedEvents.filter(event => new Date(event.date) >= now);
  const pastEvents = sortedEvents.filter(event => new Date(event.date) < now).slice(0, 3);

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <Calendar className="w-6 h-6" />
        Events ({events.length})
      </h2>
      
      {upcomingEvents.length > 0 && (
        <>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-3">Upcoming Events</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {upcomingEvents.map((event) => (
              <Link
                key={event.id}
                to={getEventUrl(event)}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {event.image && (
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-32 object-cover"
                  />
                )}
                <div className="p-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                    {event.title}
                  </h4>
                  <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                    <p className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {new Date(event.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </p>
                    {event.max_attendees && (
                      <p className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {event.current_attendees || 0} / {event.max_attendees} attendees
                      </p>
                    )}
                  </div>
                  <div className="mt-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${event.type === 'online' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        event.type === 'hybrid' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                      {event.type}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {pastEvents.length > 0 && (
        <>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-3">Past Events</h3>
          <div className="space-y-2">
            {pastEvents.map((event) => (
              <Link
                key={event.id}
                to={getEventUrl(event)}
                className="block bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">
                      {event.title}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {new Date(event.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })} • {event.location}
                    </p>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-500">
                    View Recording →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}