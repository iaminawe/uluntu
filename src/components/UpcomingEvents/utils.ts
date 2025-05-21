// Utility functions for UpcomingEvents component

/**
 * Format a date string to a readable format
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  });
};

/**
 * Sort events by date (most recent first)
 * @param events Array of events to sort
 * @returns Sorted events array
 */
export const sortEventsByDate = (events: any[]): any[] => {
  return [...events].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });
};

/**
 * Filter upcoming events (events that haven't happened yet)
 * @param events Array of events to filter
 * @returns Filtered events array
 */
export const filterUpcomingEvents = (events: any[]): any[] => {
  const now = new Date();
  
  return events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= now;
  });
};
