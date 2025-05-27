'use client';

import { Calendar, MapPin } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  image: string;
}

const MOCK_UPCOMING_EVENTS: Event[] = [
  {
    id: 1,
    title: 'AI in Healthcare Workshop',
    date: '2025-06-15T18:00:00',
    location: 'Nelson Innovation Centre',
    image: 'https://images.pexels.com/photos/7089629/pexels-photo-7089629.jpeg'
  },
  {
    id: 2,
    title: 'Machine Learning Study Group',
    date: '2025-06-20T19:00:00',
    location: 'Virtual',
    image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg'
  }
];

export default function UpcomingEvents() {
  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
      <div className="grid gap-4">
        {MOCK_UPCOMING_EVENTS.map(event => (
          <div key={event.id} className="flex bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden">
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
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric'
                  })}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {event.location}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}