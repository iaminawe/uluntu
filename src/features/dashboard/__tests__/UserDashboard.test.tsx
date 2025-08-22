/**
 * UserDashboard Component Tests
 * Comprehensive test suite for user dashboard functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, beforeEach, jest, afterEach } from '@jest/globals';
import userEvent from '@testing-library/user-event';

import { UserDashboard } from '../components/UserDashboard';
import { DashboardTabs } from '../components/DashboardTabs';
import { ActivityStream } from '../components/ActivityStream';
import { ContentManager } from '../components/ContentManager';
import { AnalyticsPanel } from '../components/AnalyticsPanel';
import { userDashboardApi } from '../api/userDashboardApi';
import authReducer from '@/shared/contexts/authSlice';
import { User } from '@/types/auth';

// Mock dependencies
jest.mock('../api/userDashboardApi', () => ({
  userDashboardApi: {
    getUserContent: jest.fn(),
    getUserAnalytics: jest.fn(),
    getUserActivity: jest.fn(),
    updateUserContent: jest.fn(),
    deleteUserContent: jest.fn(),
  }
}));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    storage: {
      from: jest.fn()
    }
  }
}));

// Mock user data
const mockUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  username: 'testuser',
  full_name: 'Test User',
  avatar_url: null,
  role: 'member',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Mock dashboard data
const mockUserContent = {
  posts: [
    {
      id: 'post-1',
      title: 'My First Post',
      content: 'This is my first post content',
      status: 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      views: 42,
      likes: 8,
      comments: 3
    },
    {
      id: 'post-2',
      title: 'Draft Post',
      content: 'This is a draft post',
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      views: 0,
      likes: 0,
      comments: 0
    }
  ],
  photos: [
    {
      id: 'photo-1',
      title: 'Beautiful Sunset',
      url: '/photos/sunset.jpg',
      thumbnail: '/photos/sunset-thumb.jpg',
      created_at: new Date().toISOString(),
      views: 156,
      likes: 24
    }
  ],
  events: [
    {
      id: 'event-1',
      title: 'Tech Meetup',
      description: 'Monthly tech meetup',
      date: new Date(Date.now() + 86400000).toISOString(),
      attendees: 15
    }
  ]
};

const mockAnalytics = {
  overview: {
    totalViews: 198,
    totalLikes: 32,
    totalComments: 3,
    totalFollowers: 45,
    growthRate: 12.5
  },
  chartData: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    views: [20, 35, 42, 38, 50, 28, 33],
    engagement: [5, 8, 12, 9, 15, 7, 10]
  },
  topContent: [
    { id: 'post-1', title: 'My First Post', views: 42, engagement: 18.5 },
    { id: 'photo-1', title: 'Beautiful Sunset', views: 156, engagement: 15.4 }
  ]
};

const mockActivity = {
  recent: [
    {
      id: 'activity-1',
      type: 'like',
      user: 'john_doe',
      target: 'My First Post',
      timestamp: new Date().toISOString()
    },
    {
      id: 'activity-2',
      type: 'comment',
      user: 'jane_smith',
      target: 'Beautiful Sunset',
      content: 'Amazing photo!',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'activity-3',
      type: 'follow',
      user: 'bob_wilson',
      timestamp: new Date(Date.now() - 7200000).toISOString()
    }
  ],
  notifications: [
    {
      id: 'notif-1',
      type: 'milestone',
      message: 'Your post reached 100 views!',
      read: false,
      timestamp: new Date(Date.now() - 1800000).toISOString()
    }
  ]
};

// Test setup helpers
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer
    },
    preloadedState: {
      auth: {
        user: mockUser,
        isAuthenticated: true,
        loading: false,
        error: null,
        ...initialState.auth
      }
    }
  });
};

const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });
};

const renderWithProviders = (
  component: React.ReactElement,
  options: {
    store?: ReturnType<typeof createMockStore>;
    queryClient?: QueryClient;
    initialEntries?: string[];
  } = {}
) => {
  const store = options.store || createMockStore();
  const queryClient = options.queryClient || createQueryClient();
  const initialEntries = options.initialEntries || ['/dashboard'];

  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          {component}
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>
  );
};

describe('UserDashboard Component Tests', () => {
  const mockApi = userDashboardApi as jest.Mocked<typeof userDashboardApi>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup API mock responses
    mockApi.getUserContent.mockResolvedValue(mockUserContent);
    mockApi.getUserAnalytics.mockResolvedValue(mockAnalytics);
    mockApi.getUserActivity.mockResolvedValue(mockActivity);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Dashboard Rendering', () => {
    test('renders dashboard with all main sections', async () => {
      renderWithProviders(<UserDashboard />);

      // Check for main dashboard elements
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Welcome back, Test User!')).toBeInTheDocument();
      
      // Wait for data to load and check for tab navigation
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /content/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /analytics/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /activity/i })).toBeInTheDocument();
      });
    });

    test('displays loading state initially', () => {
      renderWithProviders(<UserDashboard />);
      
      expect(screen.getByTestId('dashboard-loading')).toBeInTheDocument();
    });

    test('displays error state when API fails', async () => {
      mockApi.getUserContent.mockRejectedValue(new Error('API Error'));
      
      renderWithProviders(<UserDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load dashboard data/i)).toBeInTheDocument();
      });
    });
  });

  describe('Tab Navigation', () => {
    test('switches between tabs correctly', async () => {
      renderWithProviders(<DashboardTabs />);

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument();
      });

      // Overview tab should be active by default
      const overviewTab = screen.getByRole('tab', { name: /overview/i });
      expect(overviewTab).toHaveAttribute('aria-selected', 'true');

      // Click on content tab
      const contentTab = screen.getByRole('tab', { name: /content/i });
      await userEvent.click(contentTab);

      await waitFor(() => {
        expect(contentTab).toHaveAttribute('aria-selected', 'true');
        expect(overviewTab).toHaveAttribute('aria-selected', 'false');
      });
    });

    test('displays correct content for each tab', async () => {
      renderWithProviders(<UserDashboard />);

      await waitFor(() => {
        // Default overview tab content
        expect(screen.getByText('Content Overview')).toBeInTheDocument();
      });

      // Switch to analytics tab
      const analyticsTab = screen.getByRole('tab', { name: /analytics/i });
      await userEvent.click(analyticsTab);

      await waitFor(() => {
        expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
      });

      // Switch to activity tab
      const activityTab = screen.getByRole('tab', { name: /activity/i });
      await userEvent.click(activityTab);

      await waitFor(() => {
        expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      });
    });

    test('maintains tab state during navigation', async () => {
      renderWithProviders(<DashboardTabs />, {
        initialEntries: ['/dashboard?tab=analytics']
      });

      await waitFor(() => {
        const analyticsTab = screen.getByRole('tab', { name: /analytics/i });
        expect(analyticsTab).toHaveAttribute('aria-selected', 'true');
      });
    });
  });

  describe('Content Management', () => {
    test('displays user content correctly', async () => {
      renderWithProviders(<ContentManager />);

      await waitFor(() => {
        // Check for posts
        expect(screen.getByText('My First Post')).toBeInTheDocument();
        expect(screen.getByText('Draft Post')).toBeInTheDocument();
        
        // Check for photos
        expect(screen.getByText('Beautiful Sunset')).toBeInTheDocument();
        
        // Check for events
        expect(screen.getByText('Tech Meetup')).toBeInTheDocument();
      });
    });

    test('filters content by status', async () => {
      renderWithProviders(<ContentManager />);

      await waitFor(() => {
        expect(screen.getByText('My First Post')).toBeInTheDocument();
        expect(screen.getByText('Draft Post')).toBeInTheDocument();
      });

      // Filter to published only
      const publishedFilter = screen.getByRole('button', { name: /published/i });
      await userEvent.click(publishedFilter);

      await waitFor(() => {
        expect(screen.getByText('My First Post')).toBeInTheDocument();
        expect(screen.queryByText('Draft Post')).not.toBeInTheDocument();
      });
    });

    test('sorts content by date and popularity', async () => {
      renderWithProviders(<ContentManager />);

      await waitFor(() => {
        const sortSelect = screen.getByRole('combobox', { name: /sort by/i });
        expect(sortSelect).toBeInTheDocument();
      });

      // Change sort to views
      const sortSelect = screen.getByRole('combobox', { name: /sort by/i });
      await userEvent.selectOptions(sortSelect, 'views');

      await waitFor(() => {
        const contentItems = screen.getAllByTestId('content-item');
        // Photo should be first (156 views) then post (42 views)
        expect(within(contentItems[0]).getByText('Beautiful Sunset')).toBeInTheDocument();
        expect(within(contentItems[1]).getByText('My First Post')).toBeInTheDocument();
      });
    });

    test('handles content editing', async () => {
      mockApi.updateUserContent.mockResolvedValue({ success: true });
      
      renderWithProviders(<ContentManager />);

      await waitFor(() => {
        expect(screen.getByText('My First Post')).toBeInTheDocument();
      });

      // Click edit button
      const editButton = screen.getByRole('button', { name: /edit.*my first post/i });
      await userEvent.click(editButton);

      // Edit form should appear
      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /title/i })).toBeInTheDocument();
      });

      // Make changes and save
      const titleInput = screen.getByRole('textbox', { name: /title/i });
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, 'Updated Post Title');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(mockApi.updateUserContent).toHaveBeenCalledWith('post-1', {
          title: 'Updated Post Title'
        });
      });
    });

    test('handles content deletion with confirmation', async () => {
      mockApi.deleteUserContent.mockResolvedValue({ success: true });
      
      renderWithProviders(<ContentManager />);

      await waitFor(() => {
        expect(screen.getByText('My First Post')).toBeInTheDocument();
      });

      // Click delete button
      const deleteButton = screen.getByRole('button', { name: /delete.*my first post/i });
      await userEvent.click(deleteButton);

      // Confirmation dialog should appear
      await waitFor(() => {
        expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
      });

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /delete/i });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockApi.deleteUserContent).toHaveBeenCalledWith('post-1');
      });
    });
  });

  describe('Analytics Display', () => {
    test('displays analytics overview metrics', async () => {
      renderWithProviders(<AnalyticsPanel />);

      await waitFor(() => {
        expect(screen.getByText('198')).toBeInTheDocument(); // Total views
        expect(screen.getByText('32')).toBeInTheDocument();  // Total likes
        expect(screen.getByText('45')).toBeInTheDocument();  // Total followers
        expect(screen.getByText('12.5%')).toBeInTheDocument(); // Growth rate
      });
    });

    test('renders analytics charts', async () => {
      renderWithProviders(<AnalyticsPanel />);

      await waitFor(() => {
        expect(screen.getByTestId('views-chart')).toBeInTheDocument();
        expect(screen.getByTestId('engagement-chart')).toBeInTheDocument();
      });
    });

    test('displays top performing content', async () => {
      renderWithProviders(<AnalyticsPanel />);

      await waitFor(() => {
        expect(screen.getByText('Top Performing Content')).toBeInTheDocument();
        expect(screen.getByText('My First Post')).toBeInTheDocument();
        expect(screen.getByText('Beautiful Sunset')).toBeInTheDocument();
      });
    });

    test('handles time range selection', async () => {
      renderWithProviders(<AnalyticsPanel />);

      await waitFor(() => {
        const timeRangeSelect = screen.getByRole('combobox', { name: /time range/i });
        expect(timeRangeSelect).toBeInTheDocument();
      });

      // Change to weekly view
      const timeRangeSelect = screen.getByRole('combobox', { name: /time range/i });
      await userEvent.selectOptions(timeRangeSelect, '7d');

      await waitFor(() => {
        expect(mockApi.getUserAnalytics).toHaveBeenCalledWith('7d');
      });
    });
  });

  describe('Activity Stream', () => {
    test('displays recent activity items', async () => {
      renderWithProviders(<ActivityStream />);

      await waitFor(() => {
        expect(screen.getByText('john_doe liked your post "My First Post"')).toBeInTheDocument();
        expect(screen.getByText('jane_smith commented on your photo "Beautiful Sunset"')).toBeInTheDocument();
        expect(screen.getByText('bob_wilson started following you')).toBeInTheDocument();
      });
    });

    test('displays notifications with unread indicators', async () => {
      renderWithProviders(<ActivityStream />);

      await waitFor(() => {
        expect(screen.getByText('Your post reached 100 views!')).toBeInTheDocument();
        expect(screen.getByTestId('unread-notification')).toBeInTheDocument();
      });
    });

    test('marks notifications as read when clicked', async () => {
      renderWithProviders(<ActivityStream />);

      await waitFor(() => {
        const notification = screen.getByTestId('unread-notification');
        expect(notification).toBeInTheDocument();
      });

      const notification = screen.getByTestId('unread-notification');
      await userEvent.click(notification);

      await waitFor(() => {
        expect(screen.queryByTestId('unread-notification')).not.toBeInTheDocument();
      });
    });

    test('filters activity by type', async () => {
      renderWithProviders(<ActivityStream />);

      await waitFor(() => {
        expect(screen.getByText('john_doe liked your post')).toBeInTheDocument();
        expect(screen.getByText('jane_smith commented')).toBeInTheDocument();
        expect(screen.getByText('bob_wilson started following')).toBeInTheDocument();
      });

      // Filter to only likes
      const likesFilter = screen.getByRole('button', { name: /likes/i });
      await userEvent.click(likesFilter);

      await waitFor(() => {
        expect(screen.getByText('john_doe liked your post')).toBeInTheDocument();
        expect(screen.queryByText('jane_smith commented')).not.toBeInTheDocument();
        expect(screen.queryByText('bob_wilson started following')).not.toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    test('adapts layout for mobile screens', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      renderWithProviders(<UserDashboard />);

      await waitFor(() => {
        const dashboard = screen.getByTestId('user-dashboard');
        expect(dashboard).toHaveClass('mobile-layout');
      });
    });

    test('shows/hides sidebar on mobile', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      renderWithProviders(<UserDashboard />);

      // Sidebar should be hidden on mobile by default
      await waitFor(() => {
        const sidebar = screen.getByTestId('dashboard-sidebar');
        expect(sidebar).toHaveClass('hidden');
      });

      // Click menu button to show sidebar
      const menuButton = screen.getByRole('button', { name: /menu/i });
      await userEvent.click(menuButton);

      await waitFor(() => {
        const sidebar = screen.getByTestId('dashboard-sidebar');
        expect(sidebar).not.toHaveClass('hidden');
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels and roles', async () => {
      renderWithProviders(<UserDashboard />);

      await waitFor(() => {
        const tabList = screen.getByRole('tablist');
        expect(tabList).toHaveAttribute('aria-label', 'Dashboard sections');
        
        const tabs = screen.getAllByRole('tab');
        tabs.forEach(tab => {
          expect(tab).toHaveAttribute('aria-controls');
          expect(tab).toHaveAttribute('aria-selected');
        });
      });
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithProviders(<DashboardTabs />);

      await waitFor(() => {
        const overviewTab = screen.getByRole('tab', { name: /overview/i });
        expect(overviewTab).toBeInTheDocument();
      });

      const overviewTab = screen.getByRole('tab', { name: /overview/i });
      overviewTab.focus();
      
      // Use arrow keys to navigate
      await user.keyboard('{ArrowRight}');
      
      const contentTab = screen.getByRole('tab', { name: /content/i });
      expect(contentTab).toHaveFocus();
    });

    test('announces content changes to screen readers', async () => {
      renderWithProviders(<UserDashboard />);

      await waitFor(() => {
        const contentTab = screen.getByRole('tab', { name: /content/i });
        expect(contentTab).toBeInTheDocument();
      });

      const contentTab = screen.getByRole('tab', { name: /content/i });
      await userEvent.click(contentTab);

      await waitFor(() => {
        const tabPanel = screen.getByRole('tabpanel');
        expect(tabPanel).toHaveAttribute('aria-live', 'polite');
      });
    });
  });

  describe('Error Handling', () => {
    test('handles API errors gracefully', async () => {
      mockApi.getUserContent.mockRejectedValue(new Error('Network error'));
      
      renderWithProviders(<UserDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      });
    });

    test('retries failed requests', async () => {
      mockApi.getUserContent
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockUserContent);
      
      renderWithProviders(<UserDashboard />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /try again/i });
      await userEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('My First Post')).toBeInTheDocument();
        expect(mockApi.getUserContent).toHaveBeenCalledTimes(2);
      });
    });

    test('shows fallback content when data is unavailable', async () => {
      mockApi.getUserContent.mockResolvedValue({
        posts: [],
        photos: [],
        events: []
      });
      
      renderWithProviders(<ContentManager />);

      await waitFor(() => {
        expect(screen.getByText(/no content found/i)).toBeInTheDocument();
        expect(screen.getByText(/create your first post/i)).toBeInTheDocument();
      });
    });
  });
});