import { Event } from '../../types';
import { getEventUrl } from '../../utils/contentUrlUtils';

/**
 * Generates an iCalendar (.ics) format string for the given events
 */
export const generateICalendar = (events: Event[]): string => {
  const now = new Date();
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  let icalContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kootenay Tech Community//Events Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  events.forEach(event => {
    const startDate = new Date(event.date);
    const endDate = event.endDate 
      ? new Date(event.endDate) 
      : new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default to 2 hours if no end date
    
    const description = event.description ? event.description.replace(/\\n/g, '\\n') : '';
    const location = event.location ? event.location.replace(/,/g, '\\,') : '';
    
    icalContent = icalContent.concat([
      'BEGIN:VEVENT',
      `UID:${event.id}@kootenaytechcommunity.com`,
      `DTSTAMP:${formatDate(now)}`,
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${event.title.replace(/,/g, '\\,')}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      `URL:https://kootenaytechcommunity.com${getEventUrl(event)}`,
      'END:VEVENT'
    ]);
  });

  icalContent.push('END:VCALENDAR');
  return icalContent.join('\r\n');
};

/**
 * Generates a Google Calendar URL for the given event
 */
export const generateGoogleCalendarUrl = (event: Event): string => {
  const startDate = new Date(event.date);
  const endDate = event.endDate 
    ? new Date(event.endDate) 
    : new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default to 2 hours if no end date
  
  const formatDateForGoogle = (date: Date): string => {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDateForGoogle(startDate)}/${formatDateForGoogle(endDate)}`,
    details: event.description || '',
    location: event.location || '',
  });
  
  return `https://www.google.com/calendar/render?${params.toString()}`;
};

/**
 * Generates an Outlook Calendar URL for the given event
 */
export const generateOutlookCalendarUrl = (event: Event): string => {
  const startDate = new Date(event.date);
  const endDate = event.endDate 
    ? new Date(event.endDate) 
    : new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default to 2 hours if no end date
  
  const formatDateForOutlook = (date: Date): string => {
    return date.toISOString();
  };
  
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    startdt: formatDateForOutlook(startDate),
    enddt: formatDateForOutlook(endDate),
    subject: event.title,
    body: event.description || '',
    location: event.location || '',
  });
  
  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;
};
