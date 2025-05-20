import React, { useState } from 'react';
import { pastEvents } from '../data/sampleData';

const EventsSection: React.FC = () => {
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterTopic, setFilterTopic] = useState<string>('all');
  
  // Get unique years and topics for filter chips
  const years = [...new Set(pastEvents.map(event => new Date(event.date).getFullYear().toString()))];
  const topics = [...new Set(pastEvents.map(event => event.topic))];
  
  // Filter events based on selected filters
  const filteredEvents = pastEvents.filter(event => {
    const eventYear = new Date(event.date).getFullYear().toString();
    return (filterYear === 'all' || eventYear === filterYear) &&
           (filterTopic === 'all' || event.topic === filterTopic);
  });

  return (
    <section id="events" className="py-16 bg-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Past Events Archive</h2>
          <div className="w-20 h-1 bg-indigo-600 mx-auto mb-6"></div>
          <p className="text-lg text-slate-600">
            Explore our previous meetups and catch up on what you missed.
          </p>
        </div>
        
        {/* Filter chips */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-2">Filter by Year:</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1 text-sm rounded-full ${
                    filterYear === 'all' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  onClick={() => setFilterYear('all')}
                >
                  All Years
                </button>
                {years.map(year => (
                  <button
                    key={year}
                    className={`px-3 py-1 text-sm rounded-full ${
                      filterYear === year 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    onClick={() => setFilterYear(year)}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-2">Filter by Topic:</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1 text-sm rounded-full ${
                    filterTopic === 'all' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  onClick={() => setFilterTopic('all')}
                >
                  All Topics
                </button>
                {topics.map(topic => (
                  <button
                    key={topic}
                    className={`px-3 py-1 text-sm rounded-full ${
                      filterTopic === topic
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    onClick={() => setFilterTopic(topic)}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Events Timeline */}
        <div className="space-y-8">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-lg">
              <p className="text-slate-600">No events found matching your filters.</p>
            </div>
          ) : (
            filteredEvents.map((event, index) => (
              <div 
                key={index} 
                className="bg-slate-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="md:flex">
                  <div className="md:w-1/3 h-48 md:h-auto">
                    <img 
                      src={event.image} 
                      alt={event.title} 
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <div className="p-6 md:w-2/3">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3">
                      <div>
                        <h3 className="font-bold text-xl text-slate-900">{event.title}</h3>
                        <p className="text-indigo-600 mt-1">
                          {new Date(event.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <span className="inline-block px-3 py-1 mt-2 md:mt-0 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                        {event.topic}
                      </span>
                    </div>
                    <p className="text-slate-600 mb-4">
                      {event.summary}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {event.videoUrl && (
                        <a 
                          href={event.videoUrl} 
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-md hover:bg-indigo-100"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Watch Video
                        </a>
                      )}
                      {event.slidesUrl && (
                        <a 
                          href={event.slidesUrl} 
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-teal-700 bg-teal-50 rounded-md hover:bg-teal-100"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Slides
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;