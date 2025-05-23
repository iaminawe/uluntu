import { EventInfoProps } from './types';
import EventSessions from './EventSessions';

const EventInfo: React.FC<EventInfoProps> = ({ event }) => {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line mb-6">
        {event.description}
      </p>
      
      {/* Event Sessions */}
      <EventSessions event={event} />
      
      {/* Event organizer info */}
      <div className="flex items-start mt-8 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
        <img 
          src={event.organizer.image} 
          alt={event.organizer.name} 
          className="w-12 h-12 rounded-full mr-4"
        />
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            About the Organizer
          </h3>
          <p className="text-slate-600 dark:text-slate-300">
            {event.organizer.name}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EventInfo;
