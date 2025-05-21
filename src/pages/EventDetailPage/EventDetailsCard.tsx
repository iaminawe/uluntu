import { Globe, Users } from 'lucide-react';
import { EventDetailsCardProps } from './types';

const EventDetailsCard: React.FC<EventDetailsCardProps> = ({ 
  event, 
  formattedDate, 
  formattedTime 
}) => {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
        Event Details
      </h3>
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date and Time</h4>
          <p className="text-slate-600 dark:text-slate-400">
            {formattedDate} at {formattedTime}
          </p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Event Type</h4>
          <p className="text-slate-600 dark:text-slate-400">
            {event.type === 'in-person' ? 'In-Person' : event.type === 'online' ? 'Online' : 'Hybrid (In-Person & Online)'}
          </p>
        </div>
        
        {event.type !== 'online' && (
          <div>
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location</h4>
            <p className="text-slate-600 dark:text-slate-400">
              {event.location}
            </p>
          </div>
        )}
        
        {event.type === 'online' && event.url && (
          <div>
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Online Platform</h4>
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-orange-500 hover:text-orange-600"
            >
              <Globe className="h-4 w-4 mr-1" />
              Join Online
            </a>
          </div>
        )}
        
        {event.attendees !== undefined && (
          <div>
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Attendees</h4>
            <div className="flex items-center text-slate-600 dark:text-slate-400">
              <Users className="h-4 w-4 mr-2" />
              <span>{event.attendees} {event.attendees === 1 ? 'person' : 'people'} attending</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetailsCard;
