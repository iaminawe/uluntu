import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import EventCard from '../EventCard';
import { Event } from '../types';

// Mock event data
const mockEvent: Event = {
  id: '1',
  title: 'Tech Conference 2025',
  description: 'Join us for the biggest tech conference in the Kootenays featuring workshops, keynotes, and networking opportunities.',
  date: '2025-06-15T09:00:00Z',
  endDate: '2025-06-17T17:00:00Z',
  location: 'Nelson Innovation Center',
  image: 'https://example.com/event-image.jpg',
  type: 'in-person',
  organizer: {
    id: 'org1',
    name: 'Nelson Tech Association',
    image: 'https://example.com/organizer-image.jpg'
  },
  attendees: 120
  // Removed 'category' as it's not in the Event type
};

describe('EventCard Component', () => {
  const renderWithRouter = (ui: React.ReactElement) => {
    return render(ui, { wrapper: BrowserRouter });
  };

  it('EC-001: should render event information correctly', () => {
    renderWithRouter(<EventCard event={mockEvent} />);
    
    // Check if event title is displayed
    expect(screen.getByText('Tech Conference 2025')).toBeInTheDocument();
    
    // Check if event description is displayed
    expect(screen.getByText(/Join us for the biggest tech conference/)).toBeInTheDocument();
    
    // Check if event date is formatted and displayed correctly
    const formattedStartDate = format(parseISO(mockEvent.date), 'EEE, MMM d, yyyy');
    const formattedEndDate = format(parseISO(mockEvent.endDate!), 'EEE, MMM d, yyyy');
    expect(screen.getByText(`${formattedStartDate} - ${formattedEndDate}`)).toBeInTheDocument();
    
    // Check if event time is displayed
    const formattedTime = format(parseISO(mockEvent.date), 'h:mm a');
    expect(screen.getByText(formattedTime)).toBeInTheDocument();
    
    // Check if event location is displayed
    expect(screen.getByText('Nelson Innovation Center')).toBeInTheDocument();
    
    // Check if event type badge is displayed
    expect(screen.getByText('In-Person')).toBeInTheDocument();
    
    // Check if organizer info is displayed
    expect(screen.getByText('Nelson Tech Association')).toBeInTheDocument();
    expect(screen.getByText(/Organized by/)).toBeInTheDocument();
    
    // Check if attendee count is displayed
    expect(screen.getByText('120 attending')).toBeInTheDocument();
  });

  it('EC-002: should render event images correctly', () => {
    renderWithRouter(<EventCard event={mockEvent} />);
    
    // Check if event image is rendered
    const eventImage = screen.getByAltText('Tech Conference 2025');
    expect(eventImage).toBeInTheDocument();
    expect(eventImage).toHaveAttribute('src', 'https://example.com/event-image.jpg');
    
    // Check if organizer image is rendered
    const organizerImage = screen.getByAltText('Nelson Tech Association');
    expect(organizerImage).toBeInTheDocument();
    expect(organizerImage).toHaveAttribute('src', 'https://example.com/organizer-image.jpg');
  });

  it('EC-003: should link to the event detail page', () => {
    renderWithRouter(<EventCard event={mockEvent} />);
    
    // Check if the card links to the correct event detail page
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/events/1');
  });

  it('EC-004: should handle single-day events correctly', () => {
    const singleDayEvent = {
      ...mockEvent,
      endDate: undefined
    };
    
    renderWithRouter(<EventCard event={singleDayEvent} />);
    
    // Check if only the start date is displayed without a range
    const formattedDate = format(parseISO(singleDayEvent.date), 'EEE, MMM d, yyyy');
    expect(screen.getByText(formattedDate)).toBeInTheDocument();
    // Make sure there's no date range with a hyphen between dates
    expect(screen.queryByText(new RegExp(`${formattedDate} - `))).not.toBeInTheDocument();
  });

  it('EC-005: should handle online events correctly', () => {
    const onlineEvent = {
      ...mockEvent,
      type: 'online' as const,
      location: '' // Empty string instead of undefined to match the Event type
    };
    
    renderWithRouter(<EventCard event={onlineEvent} />);
    
    // Check if the event type badge shows "Online"
    expect(screen.getByText('Online')).toBeInTheDocument();
    
    // Location should not be displayed for online events
    expect(screen.queryByText('Nelson Innovation Center')).not.toBeInTheDocument();
  });

  it('EC-006: should handle hybrid events correctly', () => {
    const hybridEvent = {
      ...mockEvent,
      type: 'hybrid' as const
    };
    
    renderWithRouter(<EventCard event={hybridEvent} />);
    
    // Check if the event type badge shows "Hybrid"
    expect(screen.getByText('Hybrid')).toBeInTheDocument();
    
    // Location should still be displayed for hybrid events
    expect(screen.getByText('Nelson Innovation Center')).toBeInTheDocument();
  });

  it('EC-007: should handle events without attendee count', () => {
    const eventWithoutAttendees = {
      ...mockEvent,
      attendees: undefined
    };
    
    renderWithRouter(<EventCard event={eventWithoutAttendees} />);
    
    // Attendee count should not be displayed
    expect(screen.queryByText(/attending/)).not.toBeInTheDocument();
  });
});
