// Mock environment dependencies first
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: { getUser: jest.fn() }
  },
  sessionCache: new WeakMap()
}));

jest.mock('@/config/env', () => ({
  getIsSupabaseEnabled: jest.fn().mockReturnValue(false),
  IS_SUPABASE_ENABLED: false
}));

import { configureStore } from '@reduxjs/toolkit';
import eventsReducer, {
  fetchEvents,
  fetchEventById,
  fetchFilteredEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  setFilters,
  clearFilters,
  clearEvents
} from '@/features/events/store/eventsSlice';
import { Event } from '../../types';

// Mock the API calls
jest.mock('../../api/eventsApi', () => ({
  eventsApi: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock the environment variable
const originalEnv = process.env;
beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv, VITE_USE_SUPABASE: 'true' }; // Set to true to use the API path
  
  // Reset all mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  process.env = originalEnv;
});

// Get the mocked API module
const eventsApiMock = require('../../api/eventsApi').eventsApi;

// Create a mock store for testing
const createTestStore = () => {
  return configureStore({
    reducer: {
      events: eventsReducer,
    },
  });
};

// Sample event data
const mockEvent: Event = {
  id: '1',
  title: 'Test Event',
  description: 'Test Description',
  date: '2023-12-01T18:00:00Z',
  endDate: '2023-12-01T20:00:00Z',
  location: 'Test Location',
  address: '123 Main St, Test City',
  type: 'in-person',
  image: 'test-image.jpg',
  organizer: {
    id: '101',
    name: 'Test Organizer',
    image: 'organizer-image.jpg'
  },
  status: 'published',
  featured: false,
  url: 'https://test-event.com',
  max_attendees: 100,
  current_attendees: 50
};

const mockEvents = [
  mockEvent,
  {
    ...mockEvent,
    id: '2',
    title: 'Second Event',
    date: '2023-12-15T19:00:00Z'
  }
];

describe('Events Slice', () => {
  describe('Reducers', () => {
    test('should handle initial state', () => {
      const store = createTestStore();
      expect(store.getState().events).toEqual({
        events: [],
        currentEvent: null,
        filteredEvents: [],
        filters: {},
        status: 'idle',
        error: null
      });
    });

    test('should handle setFilters', () => {
      const store = createTestStore();
      const filters = { search: 'test', types: ['in-person' as const], dateRange: 'upcoming' as const };
      store.dispatch(setFilters(filters));
      expect(store.getState().events.filters).toEqual(filters);
    });

    test('should handle clearFilters', () => {
      const store = createTestStore();
      const filters = { search: 'test', types: ['in-person' as const], dateRange: 'upcoming' as const };
      store.dispatch(setFilters(filters));
      store.dispatch(clearFilters());
      expect(store.getState().events.filters).toEqual({});
    });

    test('should handle clearEvents', () => {
      const store = createTestStore();
      // Setup initial state with events
      store.dispatch({ 
        type: fetchEvents.fulfilled.type, 
        payload: mockEvents 
      });
      expect(store.getState().events.events).toHaveLength(2);
      
      // Clear events
      store.dispatch(clearEvents());
      expect(store.getState().events.events).toEqual([]);
      expect(store.getState().events.filteredEvents).toEqual([]);
      expect(store.getState().events.currentEvent).toBeNull();
    });
  });

  describe('Async thunks', () => {
    test('fetchEvents should update state correctly on success', async () => {
      const store = createTestStore();
      
      // Mock implementation for fetchEvents
      eventsApiMock.getAll.mockResolvedValueOnce(mockEvents);
      
      await store.dispatch(fetchEvents());
      
      expect(store.getState().events.status).toEqual('succeeded');
      expect(store.getState().events.events).toEqual(mockEvents);
      expect(store.getState().events.error).toBeNull();
    });

    test('fetchEventById should update state correctly on success', async () => {
      const store = createTestStore();
      
      // Mock implementation for fetchEventById
      eventsApiMock.getById.mockResolvedValueOnce(mockEvent);
      
      await store.dispatch(fetchEventById('1'));
      
      expect(store.getState().events.status).toEqual('succeeded');
      expect(store.getState().events.currentEvent).toEqual(mockEvent);
      expect(store.getState().events.error).toBeNull();
    });

    test('fetchFilteredEvents should update state correctly on success', async () => {
      const store = createTestStore();
      const filters = { search: 'Test', types: ['in-person' as const] };
      
      // Mock implementation for fetchFilteredEvents
      eventsApiMock.getAll.mockResolvedValueOnce([mockEvent]);
      
      await store.dispatch(fetchFilteredEvents(filters));
      
      expect(store.getState().events.status).toEqual('succeeded');
      expect(store.getState().events.filteredEvents).toEqual([mockEvent]);
      expect(store.getState().events.error).toBeNull();
    });

    test('createEvent should add an event to the state on success', async () => {
      const store = createTestStore();
      const newEventData = {
        title: 'New Event',
        description: 'New Description',
        date: '2023-12-20T18:00:00Z',
        location: 'New Location',
        type: 'online',
        organizer_id: '101'
      };
      
      const createdEvent = {
        id: '3',
        ...newEventData,
        organizer: {
          id: '101',
          name: 'Test Organizer',
          image: 'organizer-image.jpg'
        }
      };
      
      // Mock implementation for createEvent
      eventsApiMock.create.mockResolvedValueOnce(createdEvent);
      
      await store.dispatch(createEvent(newEventData as any));
      
      expect(store.getState().events.status).toEqual('succeeded');
      expect(store.getState().events.events).toHaveLength(1);
      expect(store.getState().events.events[0].title).toEqual('New Event');
    });

    test('updateEvent should update an event in the state on success', async () => {
      const store = createTestStore();
      
      // Setup initial state with an event
      store.dispatch({ 
        type: fetchEvents.fulfilled.type, 
        payload: [mockEvent] 
      });
      
      const updateData = {
        title: 'Updated Event',
        description: 'Updated Description'
      };
      
      const updatedEvent = {
        ...mockEvent,
        ...updateData
      };
      
      // Mock implementation for updateEvent
      eventsApiMock.update.mockResolvedValueOnce(updatedEvent);
      
      await store.dispatch(updateEvent({ id: '1', data: updateData }));
      
      expect(store.getState().events.status).toEqual('succeeded');
      expect(store.getState().events.events[0].title).toEqual('Updated Event');
      expect(store.getState().events.events[0].description).toEqual('Updated Description');
    });

    test('deleteEvent should remove an event from the state on success', async () => {
      const store = createTestStore();
      
      // Setup initial state with events
      store.dispatch({ 
        type: fetchEvents.fulfilled.type, 
        payload: mockEvents 
      });
      expect(store.getState().events.events).toHaveLength(2);
      
      // Mock implementation for deleteEvent
      eventsApiMock.delete.mockResolvedValueOnce(true);
      
      await store.dispatch(deleteEvent('1'));
      
      expect(store.getState().events.status).toEqual('succeeded');
      expect(store.getState().events.events).toHaveLength(1);
      expect(store.getState().events.events[0].id).toEqual('2');
    });
  });
});
