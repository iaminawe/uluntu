'use client';

import { useState } from 'react';
import { Search, Calendar, MapPin, Users, X, Map } from 'lucide-react';

interface Presenter {
  id: number;
  name: string;
  title: string;
  presentation: string;
  bio: string;
  image: string;
}

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  address: string;
  latitude: number;
  longitude: number;
  group: string;
  maxAttendees: number;
  currentAttendees: number;
  image: string;
  presenters: Presenter[];
}

const MOCK_EVENTS: Event[] = [
  {
    id: 1,
    title: 'AI in Healthcare Workshop',
    description: 'Join us for an interactive workshop exploring the applications of AI in healthcare.',
    date: '2025-06-15T18:00:00',
    location: 'Nelson Innovation Centre',
    address: 'Box 752 - 560 Baker Street, Nelson, BC V1L 4E5',
    latitude: 49.4938073,
    longitude: -117.2931246,
    group: 'Kootenay AI Collective',
    maxAttendees: 30,
    currentAttendees: 18,
    image: 'https://images.pexels.com/photos/7089629/pexels-photo-7089629.jpeg',
    presenters: [
      {
        id: 1,
        name: 'Dr. Sarah Johnson',
        title: 'AI Research Lead',
        presentation: 'Ethics in Healthcare AI',
        bio: 'Dr. Johnson has over 10 years of experience in AI research with a focus on healthcare applications.',
        image: 'https://images.pexels.com/photos/5952651/pexels-photo-5952651.jpeg'
      }
    ]
  },
  {
    id: 2,
    title: 'Machine Learning Study Group',
    description: 'Monthly meetup to discuss and practice machine learning concepts.',
    date: '2025-06-20T19:00:00',
    location: 'Virtual',
    address: 'Online Event',
    latitude: 0,
    longitude: 0,
    group: 'ML Study Group',
    maxAttendees: 50,
    currentAttendees: 25,
    image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg',
    presenters: []
  }
];

interface RSVPModalProps {
  event: Event;
  onClose: () => void;
}

function RSVPModal({ event, onClose }: RSVPModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('RSVP submitted:', { email, name, eventId: event.id });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">RSVP for {event.title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                       bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                       bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              Confirm RSVP
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface EventDetailsModalProps {
  event: Event;
  onClose: () => void;
  onRSVP: () => void;
}

function EventDetailsModal({ event, onClose, onRSVP }: EventDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="relative h-64">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
                {event.title}
              </h3>
              <p className="text-orange-600 dark:text-orange-400">{event.group}</p>
            </div>
            <button
              onClick={onRSVP}
              className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              RSVP
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">About this Event</h4>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                {event.description}
              </p>

              <div className="space-y-4">
                <div className="flex items-center text-slate-600 dark:text-slate-300">
                  <Calendar className="h-5 w-5 mr-3" />
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric'
                  })}
                </div>
                <div className="flex items-center text-slate-600 dark:text-slate-300">
                  <MapPin className="h-5 w-5 mr-3" />
                  {event.location}
                  {event.location !== 'Virtual' && (
                    <span className="ml-2 text-sm">({event.address})</span>
                  )}
                </div>
                <div className="flex items-center text-slate-600 dark:text-slate-300">
                  <Users className="h-5 w-5 mr-3" />
                  {event.currentAttendees} / {event.maxAttendees} attendees
                </div>
              </div>
            </div>

            {event.location !== 'Virtual' && (
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Location</h4>
                <div className="h-64 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2599.3982126901476!2d${event.longitude}!3d${event.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x537cb6a0878e85b7%3A0xb2217c37b07c8c3a!2s${encodeURIComponent(event.location)}!5e0!3m2!1sen!2sca!4v1696376047294!5m2!1sen!2sca`}
                    className="w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            )}
          </div>

          {event.presenters.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Presenters</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {event.presenters.map(presenter => (
                  <div key={presenter.id} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <div className="flex items-center mb-4">
                      <img
                        src={presenter.image}
                        alt={presenter.name}
                        className="w-12 h-12 rounded-full mr-4"
                      />
                      <div>
                        <h5 className="font-medium text-slate-900 dark:text-white">
                          {presenter.name}
                        </h5>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {presenter.title}
                        </p>
                      </div>
                    </div>
                    <h6 className="font-medium text-orange-600 dark:text-orange-400 mb-2">
                      {presenter.presentation}
                    </h6>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {presenter.bio}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EventsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRSVPModal, setShowRSVPModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const groups = ['all', ...new Set(MOCK_EVENTS.map(event => event.group))];

  const filteredEvents = MOCK_EVENTS.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroup === 'all' || event.group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };

  const handleRSVPClick = () => {
    setShowDetailsModal(false);
    setShowRSVPModal(true);
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-slate-300 dark:border-slate-600 rounded-lg 
                       bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {groups.map(group => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                ${selectedGroup === group
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
            >
              {group === 'all' ? 'All Groups' : group}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEvents.map(event => (
          <div 
            key={event.id} 
            className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleEventClick(event)}
          >
            <div className="h-48 overflow-hidden">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    {event.title}
                  </h3>
                  <p className="text-orange-600 dark:text-orange-400">{event.group}</p>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-300 mb-4">
                {event.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center text-slate-600 dark:text-slate-300">
                  <Calendar className="h-5 w-5 mr-2" />
                  {new Date(event.date).toLocaleDateString()}
                </div>
                <div className="flex items-center text-slate-600 dark:text-slate-300">
                  <MapPin className="h-5 w-5 mr-2" />
                  {event.location}
                </div>
                <div className="flex items-center text-slate-600 dark:text-slate-300">
                  <Users className="h-5 w-5 mr-2" />
                  {event.currentAttendees} / {event.maxAttendees}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedEvent && showRSVPModal && (
        <RSVPModal
          event={selectedEvent}
          onClose={() => setShowRSVPModal(false)}
        />
      )}

      {selectedEvent && showDetailsModal && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setShowDetailsModal(false)}
          onRSVP={handleRSVPClick}
        />
      )}
    </div>
  );
}