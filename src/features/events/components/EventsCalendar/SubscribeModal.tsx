import React, { useState } from 'react';
import { Event } from '../../types';
import { generateICalendar, generateGoogleCalendarUrl, generateOutlookCalendarUrl } from './calendarUtils';

interface SubscribeModalProps {
  events: Event[];
  onClose: () => void;
}

export const SubscribeModal: React.FC<SubscribeModalProps> = ({ events, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>('all');
  
  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  const handleDownloadICalendar = () => {
    const filteredEvents = selectedOption === 'all' 
      ? events 
      : selectedOption === 'upcoming' 
        ? events.filter(event => new Date(event.date) >= new Date())
        : events.filter(event => new Date(event.date) < new Date());
    
    const icalContent = generateICalendar(filteredEvents);
    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'uluntu-events.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const getGoogleCalendarUrl = () => {
    const filteredEvents = selectedOption === 'all' 
      ? events 
      : selectedOption === 'upcoming' 
        ? events.filter(event => new Date(event.date) >= new Date())
        : events.filter(event => new Date(event.date) < new Date());
    
    return generateGoogleCalendarUrl(filteredEvents[0]); // For multiple events, we'd need to create multiple links
  };
  
  const getOutlookCalendarUrl = () => {
    const filteredEvents = selectedOption === 'all' 
      ? events 
      : selectedOption === 'upcoming' 
        ? events.filter(event => new Date(event.date) >= new Date())
        : events.filter(event => new Date(event.date) < new Date());
    
    return generateOutlookCalendarUrl(filteredEvents[0]); // For multiple events, we'd need to create multiple links
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Subscribe to Calendar</h2>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Select events to include:
          </label>
          <select
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
          >
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming Events Only</option>
            <option value="past">Past Events Only</option>
          </select>
        </div>
        
        <div className="space-y-4">
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <h3 className="font-medium text-slate-900 dark:text-white mb-2">iCalendar (Apple Calendar, Outlook, etc.)</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Download an .ics file to import into your calendar application.
            </p>
            <button
              onClick={handleDownloadICalendar}
              className="w-full px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              Download .ics File
            </button>
          </div>
          
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <h3 className="font-medium text-slate-900 dark:text-white mb-2">Google Calendar</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Add events directly to your Google Calendar.
            </p>
            <div className="flex space-x-2">
              <a
                href={getGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-center"
              >
                Add to Google Calendar
              </a>
              <button
                onClick={() => handleCopyLink(getGoogleCalendarUrl())}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                  <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <h3 className="font-medium text-slate-900 dark:text-white mb-2">Outlook Calendar</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Add events directly to your Outlook Calendar.
            </p>
            <div className="flex space-x-2">
              <a
                href={getOutlookCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-center"
              >
                Add to Outlook Calendar
              </a>
              <button
                onClick={() => handleCopyLink(getOutlookCalendarUrl())}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                  <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {copied && (
          <div className="mt-4 p-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-sm rounded-md">
            Link copied to clipboard!
          </div>
        )}
      </div>
    </div>
  );
};
