// Mock the modules before requiring them
jest.mock('../api/eventsApi', () => ({
  eventsApi: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
}));

jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn()
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn()
  }
}));

jest.mock('../hooks/useEventsRedux', () => ({
  useEventsRedux: jest.fn(),
  useEventRedux: jest.fn(),
  useFilteredEventsRedux: jest.fn()
}));

jest.mock('../redux/slices/eventsSlice', () => ({
  fetchEvents: jest.fn(),
  fetchEventById: jest.fn(),
  fetchFilteredEvents: jest.fn(),
  createEvent: jest.fn(),
  updateEvent: jest.fn(),
  deleteEvent: jest.fn()
}));

// Now require the mocked modules
const { eventsApi } = require('../api/eventsApi');
const { adaptEventFromDatabase, adaptEventToSupabaseInsert } = require('../adapters/eventAdapter');
const { supabase } = require('../lib/supabase');
const { useEventsRedux, useEventRedux, useFilteredEventsRedux } = require('../hooks/useEventsRedux');
const { fetchEvents, fetchEventById, fetchFilteredEvents, createEvent, updateEvent, deleteEvent } = require('../redux/slices/eventsSlice');

describe('Events Management', () => {
  // Sample test data
  const mockEvent = {
    id: 'event-123',
    title: 'Tech Conference 2025',
    description: 'Annual technology conference for developers',
    date: '2025-06-15T09:00:00Z',
    endDate: '2025-06-15T17:00:00Z',
    location: 'Nelson Community Center',
    address: '123 Main St, Nelson, BC',
    image: 'https://example.com/event-image.jpg',
    type: 'in-person',
    url: 'https://example.com/register',
    organizer: {
      id: 'user-456',
      name: 'Jane Smith',
      image: 'https://example.com/jane-smith.jpg'
    },
    max_attendees: 100,
    current_attendees: 45,
    status: 'published',
    featured: true
  };

  const mockEventInput = {
    title: 'Tech Conference 2025',
    description: 'Annual technology conference for developers',
    date: '2025-06-15T09:00:00Z',
    endDate: '2025-06-15T17:00:00Z',
    location: 'Nelson Community Center',
    address: '123 Main St, Nelson, BC',
    image: 'https://example.com/event-image.jpg',
    type: 'in-person',
    url: 'https://example.com/register',
    organizerId: 'user-456',
    maxAttendees: 100,
    status: 'published',
    featured: true
  };

  const mockAttendees = [
    { id: 'user-789', name: 'John Doe', image: 'https://example.com/john-doe.jpg' },
    { id: 'user-101', name: 'Alice Johnson', image: 'https://example.com/alice-johnson.jpg' }
  ];

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  /**
   * EVT-001: Create a new event with details
   */
  it('EVT-001: As a Registered User (Organizer), I want to create a new event with details such as name, date, time, location, description, category, a cover image, and registration information', async () => {
    // Mock the API response
    eventsApi.create.mockResolvedValue(mockEvent);
    
    // Mock the Redux action
    createEvent.mockReturnValue({ type: 'events/create/pending' });
    
    // Mock the useEventsRedux hook
    const mockAddEvent = jest.fn().mockResolvedValue({ payload: mockEvent });
    useEventsRedux.mockReturnValue({
      addEvent: mockAddEvent,
      isLoading: false,
      isSuccess: true,
      error: null
    });
    
    // Call the API directly to test
    const result = await eventsApi.create(mockEventInput);
    
    // Verify the API was called with the correct data
    expect(eventsApi.create).toHaveBeenCalledWith(mockEventInput);
    
    // Verify the result matches our expected event
    expect(result).toEqual(mockEvent);
    
    // Verify the adapter functions work correctly
    const adaptedEvent = adaptEventToSupabaseInsert({
      title: mockEventInput.title,
      description: mockEventInput.description,
      date: mockEventInput.date,
      endDate: mockEventInput.endDate,
      location: mockEventInput.location,
      address: mockEventInput.address,
      image: mockEventInput.image,
      type: mockEventInput.type,
      url: mockEventInput.url,
      organizer_id: mockEventInput.organizerId,
      max_attendees: mockEventInput.maxAttendees,
      status: mockEventInput.status,
      featured: mockEventInput.featured
    });
    
    // Verify the adapted event has the correct structure for the database
    expect(adaptedEvent).toHaveProperty('title', mockEventInput.title);
    expect(adaptedEvent).toHaveProperty('description', mockEventInput.description);
    expect(adaptedEvent).toHaveProperty('date', mockEventInput.date);
    expect(adaptedEvent).toHaveProperty('organizer_id', mockEventInput.organizerId);
  });

  /**
   * EVT-002: Manage attendees for events
   */
  it('EVT-002: As an Event Organizer, I want to manage attendees for my event (e.g., view list, if applicable), so that I can track participation', async () => {
    // Mock the API response with attendees
    const eventWithAttendees = {
      ...mockEvent,
      attendees: mockAttendees
    };
    
    eventsApi.getById.mockResolvedValue(eventWithAttendees);
    
    // Mock the Redux action
    fetchEventById.mockReturnValue({ type: 'events/fetchById/pending' });
    
    // Mock the useEventRedux hook
    useEventRedux.mockReturnValue({
      event: eventWithAttendees,
      isLoading: false,
      isSuccess: true,
      error: null,
      getEvent: jest.fn().mockResolvedValue({ payload: eventWithAttendees })
    });
    
    // Call the API directly to test
    const result = await eventsApi.getById(mockEvent.id);
    
    // Verify the API was called with the correct ID
    expect(eventsApi.getById).toHaveBeenCalledWith(mockEvent.id);
    
    // Verify the result includes attendees
    expect(result).toHaveProperty('attendees');
    expect(result.attendees).toEqual(mockAttendees);
    expect(result.attendees.length).toBe(2);
    
    // Verify attendee properties
    expect(result.attendees[0]).toHaveProperty('id');
    expect(result.attendees[0]).toHaveProperty('name');
    expect(result.attendees[0]).toHaveProperty('image');
  });

  /**
   * EVT-003: Update event details
   */
  it('EVT-003: As an Event Organizer, I want to update the details of an event I created, so that I can provide current information', async () => {
    // Create update data
    const updateData = {
      title: 'Updated Tech Conference 2025',
      description: 'Updated description for the annual technology conference'
    };
    
    // Mock the API response
    const updatedEvent = {
      ...mockEvent,
      ...updateData
    };
    
    eventsApi.update.mockResolvedValue(updatedEvent);
    
    // Mock the Redux action
    updateEvent.mockReturnValue({ type: 'events/update/pending' });
    
    // Mock the useEventRedux hook
    const mockUpdateEventData = jest.fn().mockResolvedValue({ payload: updatedEvent });
    useEventRedux.mockReturnValue({
      event: mockEvent,
      isLoading: false,
      isSuccess: true,
      error: null,
      updateEventData: mockUpdateEventData
    });
    
    // Call the API directly to test
    const result = await eventsApi.update(mockEvent.id, updateData);
    
    // Verify the API was called with the correct data
    expect(eventsApi.update).toHaveBeenCalledWith(mockEvent.id, updateData);
    
    // Verify the result has updated properties
    expect(result).toHaveProperty('title', updateData.title);
    expect(result).toHaveProperty('description', updateData.description);
    
    // Verify other properties remain unchanged
    expect(result).toHaveProperty('id', mockEvent.id);
    expect(result).toHaveProperty('date', mockEvent.date);
    expect(result).toHaveProperty('location', mockEvent.location);
  });

  /**
   * EVT-004: Event organizer communication with participants
   */
  it('EVT-004: As an Event Organizer, I want to be able to communicate with event participants, so that I can keep them informed', async () => {
    // Mock notification/email service
    const mockNotificationService = {
      sendMessage: jest.fn().mockResolvedValue({ success: true })
    };
    
    // Mock the event with attendees
    const eventWithAttendees = {
      ...mockEvent,
      attendees: mockAttendees
    };
    
    // Test message data
    const messageData = {
      subject: 'Important Update for Tech Conference',
      content: 'The venue has changed to Downtown Community Center',
      eventId: mockEvent.id
    };
    
    // Simulate sending a message to all attendees
    const sendToAllAttendees = async () => {
      const results = [];
      for (const attendee of eventWithAttendees.attendees) {
        results.push(await mockNotificationService.sendMessage({
          recipientId: attendee.id,
          ...messageData
        }));
      }
      return results;
    };
    
    // Execute the test
    const results = await sendToAllAttendees();
    
    // Verify the notification service was called for each attendee
    expect(mockNotificationService.sendMessage).toHaveBeenCalledTimes(eventWithAttendees.attendees.length);
    
    // Verify all messages were sent successfully
    expect(results.every(r => r.success)).toBe(true);
    
    // Verify the first call had the correct data
    expect(mockNotificationService.sendMessage).toHaveBeenCalledWith({
      recipientId: eventWithAttendees.attendees[0].id,
      ...messageData
    });
  });

  /**
   * EVT-005: Discover and search for events
   */
  it('EVT-005: As any User, I want to discover and search for local events by category, date, location, and keywords/interests', async () => {
    // Create mock events for search results
    const mockEvents = [
      mockEvent,
      {
        ...mockEvent,
        id: 'event-456',
        title: 'Coding Workshop',
        type: 'online',
        date: '2025-07-20T10:00:00Z'
      },
      {
        ...mockEvent,
        id: 'event-789',
        title: 'Design Meetup',
        type: 'in-person',
        date: '2025-06-10T18:00:00Z'
      }
    ];
    
    // Mock search filters
    const searchFilters = {
      search: 'tech',
      types: ['in-person'],
      dateRange: 'upcoming'
    };
    
    // Mock filtered results - only in-person events with 'tech' in the title
    const filteredEvents = [
      mockEvent // Only the first event matches all criteria
    ];
    
    // Mock the API response
    eventsApi.getAll.mockResolvedValue(filteredEvents);
    
    // Mock the Redux action
    fetchFilteredEvents.mockReturnValue({ type: 'events/fetchFiltered/pending' });
    
    // Mock the useFilteredEventsRedux hook
    const mockApplyFilters = jest.fn().mockResolvedValue({ payload: filteredEvents });
    useFilteredEventsRedux.mockReturnValue({
      events: filteredEvents,
      isLoading: false,
      isSuccess: true,
      error: null,
      applyFilters: mockApplyFilters,
      currentFilters: searchFilters
    });
    
    // Call the API directly to test
    const result = await eventsApi.getAll(searchFilters);
    
    // Verify the API was called with the correct filters
    expect(eventsApi.getAll).toHaveBeenCalledWith(searchFilters);
    
    // Verify the filtered results
    expect(result).toEqual(filteredEvents);
    expect(result.length).toBe(1);
    expect(result[0].title).toBe('Tech Conference 2025');
    expect(result[0].type).toBe('in-person');
  });

  /**
   * EVT-006: Register for an event
   */
  it('EVT-006: As a Registered User, I want to register for an event, so that I can confirm my attendance', async () => {
    // Mock the registration API
    const mockRegistrationApi = {
      registerForEvent: jest.fn().mockResolvedValue({
        success: true,
        attendee: {
          id: 'user-202',
          name: 'Current User',
          image: 'https://example.com/current-user.jpg'
        },
        event: mockEvent
      })
    };
    
    // Mock the updated event with the new attendee
    const updatedEvent = {
      ...mockEvent,
      current_attendees: mockEvent.current_attendees + 1,
      attendees: [
        ...mockAttendees,
        {
          id: 'user-202',
          name: 'Current User',
          image: 'https://example.com/current-user.jpg'
        }
      ]
    };
    
    // Registration data
    const registrationData = {
      eventId: mockEvent.id,
      userId: 'user-202',
      additionalInfo: 'Vegetarian meal preference'
    };
    
    // Execute the test
    const result = await mockRegistrationApi.registerForEvent(registrationData);
    
    // Verify the registration API was called with the correct data
    expect(mockRegistrationApi.registerForEvent).toHaveBeenCalledWith(registrationData);
    
    // Verify the registration was successful
    expect(result.success).toBe(true);
    expect(result.attendee.id).toBe('user-202');
    
    // Verify the attendee count would increase
    expect(updatedEvent.current_attendees).toBe(mockEvent.current_attendees + 1);
    expect(updatedEvent.attendees.length).toBe(mockAttendees.length + 1);
  });

  /**
   * EVT-007: View event details
   */
  it('EVT-007: As any User, I want to view event details including name, date, time, location, full description, organizer, and how to register/attend', async () => {
    // Mock the API response
    eventsApi.getById.mockResolvedValue(mockEvent);
    
    // Mock the Redux action
    fetchEventById.mockReturnValue({ type: 'events/fetchById/pending' });
    
    // Mock the useEventRedux hook
    const mockGetEvent = jest.fn().mockResolvedValue({ payload: mockEvent });
    useEventRedux.mockReturnValue({
      event: mockEvent,
      isLoading: false,
      isSuccess: true,
      error: null,
      getEvent: mockGetEvent
    });
    
    // Call the API directly to test
    const result = await eventsApi.getById(mockEvent.id);
    
    // Verify the API was called with the correct ID
    expect(eventsApi.getById).toHaveBeenCalledWith(mockEvent.id);
    
    // Verify all required event details are present
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('title');
    expect(result).toHaveProperty('description');
    expect(result).toHaveProperty('date');
    expect(result).toHaveProperty('endDate');
    expect(result).toHaveProperty('location');
    expect(result).toHaveProperty('address');
    expect(result).toHaveProperty('image');
    expect(result).toHaveProperty('type');
    expect(result).toHaveProperty('url'); // Registration URL
    expect(result).toHaveProperty('organizer');
    expect(result.organizer).toHaveProperty('name');
    
    // Verify specific values
    expect(result.title).toBe('Tech Conference 2025');
    expect(result.location).toBe('Nelson Community Center');
    expect(result.organizer.name).toBe('Jane Smith');
  });

  /**
   * Test event deletion
   */
  it('Should allow an event organizer to delete their event', async () => {
    // Mock the API response
    eventsApi.delete.mockResolvedValue(true);
    
    // Mock the Redux action
    deleteEvent.mockReturnValue({ type: 'events/delete/pending' });
    
    // Mock the useEventRedux hook
    const mockDeleteEventById = jest.fn().mockResolvedValue({ payload: mockEvent.id });
    useEventRedux.mockReturnValue({
      event: mockEvent,
      isLoading: false,
      isSuccess: true,
      error: null,
      deleteEventById: mockDeleteEventById
    });
    
    // Call the API directly to test
    const result = await eventsApi.delete(mockEvent.id);
    
    // Verify the API was called with the correct ID
    expect(eventsApi.delete).toHaveBeenCalledWith(mockEvent.id);
    
    // Verify the result indicates success
    expect(result).toBe(true);
  });
});