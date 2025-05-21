import { Calendar } from 'lucide-react';
import { EventHeroProps } from './types';

const EventHero: React.FC<EventHeroProps> = ({ event, dateRangeDisplay }) => {
  return (
    <div className="h-96 w-full relative">
      <img 
        src={event.image} 
        alt={event.title} 
        className="w-full h-full object-cover"
      />
      <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm">
        {event.type === 'in-person' ? 'In-Person' : event.type === 'online' ? 'Online' : 'Hybrid'}
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 flex items-end">
        <div className="p-8 text-white w-full">
          <div className="flex items-center mb-2">
            <Calendar className="h-5 w-5 mr-2 text-orange-300" />
            <span>{dateRangeDisplay}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
          <div className="flex items-center">
            <img 
              src={event.organizer.image} 
              alt={event.organizer.name} 
              className="h-6 w-6 rounded-full mr-2"
            />
            <span>Organized by {event.organizer.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventHero;
