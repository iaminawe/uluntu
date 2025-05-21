import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import { EventCardProps } from './types';
import { formatDate } from './utils';

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  return (
    <Link
      to={`/events/${event.id}`}
      className="flex bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden hover:bg-white/15 transition-colors"
    >
      <div className="w-24 h-24 flex-shrink-0">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold mb-2">{event.title}</h3>
        <div className="space-y-1 text-sm">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            {formatDate(event.date)}
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            {event.location}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
