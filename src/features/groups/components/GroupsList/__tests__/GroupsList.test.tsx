import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import GroupsList from '../index';
import { Group } from '../../../types';
import { GroupVisibility } from '../types';

// Mock the JoinModal component
jest.mock('../../JoinModal', () => ({
  __esModule: true,
  default: ({ onClose, group }: any) => (
    <div data-testid="join-modal">
      <h2>Join {group?.name}</h2>
      <button onClick={() => { onClose(); }}>Confirm Join</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  )
}));

// Mock the Pagination component
jest.mock('../../Pagination', () => ({
  __esModule: true,
  default: ({ currentPage, totalPages, onPageChange }: any) => (
    <div data-testid="pagination">
      <button 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 1}
      >
        Previous
      </button>
      <span>Page {currentPage} of {totalPages}</span>
      <button 
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  )
}));

// Mock Redux hooks
const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Kootenay Coders Collective',
    description: 'A community of software developers in the Kootenay region',
    longDescription: 'Full description of the group',
    heroImage: 'https://example.com/image1.jpg',
    visibility: 'open' as GroupVisibility,
    memberCount: 42,
    lastActive: '2025-05-25T14:30:00.000Z',
    members: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2025-05-25T14:30:00.000Z'
  },
  {
    id: '2',
    name: 'Nelson UX/UI Designers',
    description: 'Design professionals sharing knowledge and resources',
    longDescription: 'Full description of the design group',
    heroImage: 'https://example.com/image2.jpg',
    visibility: 'closed' as GroupVisibility,
    memberCount: 25,
    lastActive: '2025-05-24T10:00:00.000Z',
    members: [],
    createdAt: '2024-02-01T00:00:00.000Z',
    updatedAt: '2025-05-24T10:00:00.000Z'
  },
  {
    id: '3',
    name: 'Secret Tech Innovators',
    description: 'Invitation-only tech innovation group',
    longDescription: 'Full description of the secret group',
    heroImage: 'https://example.com/image3.jpg',
    visibility: 'secret' as GroupVisibility,
    memberCount: 15,
    lastActive: '2025-05-23T08:00:00.000Z',
    members: [],
    createdAt: '2024-03-01T00:00:00.000Z',
    updatedAt: '2025-05-23T08:00:00.000Z'
  }
];

// Setup mock store
const createMockStore = (groups: Group[] = mockGroups) => {
  return configureStore({
    reducer: {
      groups: () => ({
        filteredGroups: groups,
        status: 'succeeded',
        error: null
      })
    }
  });
};

// Create a function to filter groups based on criteria
const filterGroups = (groups: Group[], searchTerm: string, visibilityFilter: string[]) => {
  return groups.filter(group => {
    const matchesSearch = !searchTerm || 
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesVisibility = visibilityFilter.length === 0 || 
      visibilityFilter.includes(group.visibility);
    
    return matchesSearch && matchesVisibility;
  });
};

jest.mock('../../../hooks/useGroupsRedux', () => ({
  useFilteredGroupsRedux: jest.fn((filters) => {
    const groups = filterGroups(
      mockGroups, 
      filters?.search || '', 
      filters?.visibility || []
    );
    return {
      groups: groups,
      isLoading: false,
      error: null
    };
  })
}));

jest.mock('../../../hooks/useQueries');

// Import the module to get access to the mocked functions
import * as useQueriesModule from '../../../hooks/useQueries';

const mockUseGroupsWithFilters = useQueriesModule.useGroupsWithFilters as jest.MockedFunction<typeof useQueriesModule.useGroupsWithFilters>;

describe('GroupsList Component', () => {
  beforeEach(() => {
    // Reset mock to default state before each test
    mockUseGroupsWithFilters.mockImplementation((filters) => {
      const filteredGroups = filterGroups(
        mockGroups,
        filters?.search || '',
        filters?.visibility || []
      );
      return {
        data: filteredGroups,
        isLoading: false,
        error: null
      };
    });
  });

  const renderWithProviders = (ui: React.ReactElement, store = createMockStore()) => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          {ui}
        </BrowserRouter>
      </Provider>
    );
  };


  describe('Rendering States', () => {
    it('GL-001: should render groups list with all groups when no filters applied', () => {
      renderWithProviders(
        <GroupsList searchTerm="" visibilityFilter={[]} />
      );

      expect(screen.getByText('Kootenay Coders Collective')).toBeInTheDocument();
      expect(screen.getByText('Nelson UX/UI Designers')).toBeInTheDocument();
      expect(screen.getByText('Secret Tech Innovators')).toBeInTheDocument();
    });

    it('GL-002: should show loading state when data is loading', () => {
      mockUseGroupsWithFilters.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null
      });

      renderWithProviders(
        <GroupsList searchTerm="" visibilityFilter={[]} />
      );

      expect(screen.getByTestId('groups-loading')).toBeInTheDocument();
    });

    it('GL-003: should show error state when there is an error', () => {
      mockUseGroupsWithFilters.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: { message: 'Failed to fetch groups' }
      });

      renderWithProviders(
        <GroupsList searchTerm="" visibilityFilter={[]} />
      );

      expect(screen.getByText(/Error loading groups/i)).toBeInTheDocument();
      expect(screen.getByText(/Failed to fetch groups/i)).toBeInTheDocument();
    });

    it('GL-004: should show empty state when no groups exist', () => {
      mockUseGroupsWithFilters.mockReturnValue({
        data: [],
        isLoading: false,
        error: null
      });

      renderWithProviders(
        <GroupsList searchTerm="" visibilityFilter={[]} />
      );

      expect(screen.getByText(/No groups found/i)).toBeInTheDocument();
    });

    it('GL-005: should show filtered empty state when filters yield no results', () => {
      renderWithProviders(
        <GroupsList searchTerm="nonexistent" visibilityFilter={[]} />
      );

      expect(screen.getByText(/No groups match your search criteria/i)).toBeInTheDocument();
    });
  });

  describe('Data Source Selection', () => {
    it('GL-006: should use provided groups when passed as prop', () => {
      const customGroups = [mockGroups[0]];
      renderWithProviders(
        <GroupsList searchTerm="" visibilityFilter={[]} groups={customGroups} />
      );

      expect(screen.getByText('Kootenay Coders Collective')).toBeInTheDocument();
      expect(screen.queryByText('Nelson UX/UI Designers')).not.toBeInTheDocument();
    });

    it('GL-007: should use Redux when useRedux prop is true', () => {
      const { useFilteredGroupsRedux } = require('../../../hooks/useGroupsRedux');
      useFilteredGroupsRedux.mockReturnValue({
        groups: [mockGroups[1]],
        isLoading: false,
        error: null
      });

      renderWithProviders(
        <GroupsList searchTerm="" visibilityFilter={[]} useRedux={true} />
      );

      expect(screen.getByText('Nelson UX/UI Designers')).toBeInTheDocument();
      expect(useFilteredGroupsRedux).toHaveBeenCalled();
    });

    it('GL-008: should use React Query by default', () => {
      const { useGroupsWithFilters } = require('../../../hooks/useQueries');
      
      renderWithProviders(
        <GroupsList searchTerm="" visibilityFilter={[]} />
      );

      expect(useGroupsWithFilters).toHaveBeenCalled();
    });
  });

  describe('Filtering', () => {
    it('GL-009: should filter groups by search term (name)', () => {
      renderWithProviders(
        <GroupsList searchTerm="Coders" visibilityFilter={[]} />
      );

      expect(screen.getByText('Kootenay Coders Collective')).toBeInTheDocument();
      expect(screen.queryByText('Nelson UX/UI Designers')).not.toBeInTheDocument();
    });

    it('GL-010: should filter groups by search term (description)', () => {
      renderWithProviders(
        <GroupsList searchTerm="Design professionals" visibilityFilter={[]} />
      );

      expect(screen.queryByText('Kootenay Coders Collective')).not.toBeInTheDocument();
      expect(screen.getByText('Nelson UX/UI Designers')).toBeInTheDocument();
    });

    it('GL-011: should filter groups by visibility - open only', () => {
      renderWithProviders(
        <GroupsList searchTerm="" visibilityFilter={['open']} />
      );

      expect(screen.getByText('Kootenay Coders Collective')).toBeInTheDocument();
      expect(screen.queryByText('Nelson UX/UI Designers')).not.toBeInTheDocument();
      expect(screen.queryByText('Secret Tech Innovators')).not.toBeInTheDocument();
    });

    it('GL-012: should filter groups by multiple visibility types', () => {
      renderWithProviders(
        <GroupsList searchTerm="" visibilityFilter={['open', 'closed']} />
      );

      expect(screen.getByText('Kootenay Coders Collective')).toBeInTheDocument();
      expect(screen.getByText('Nelson UX/UI Designers')).toBeInTheDocument();
      expect(screen.queryByText('Secret Tech Innovators')).not.toBeInTheDocument();
    });

    it('GL-013: should combine search and visibility filters', () => {
      renderWithProviders(
        <GroupsList searchTerm="tech" visibilityFilter={['secret']} />
      );

      expect(screen.queryByText('Kootenay Coders Collective')).not.toBeInTheDocument();
      expect(screen.queryByText('Nelson UX/UI Designers')).not.toBeInTheDocument();
      expect(screen.getByText('Secret Tech Innovators')).toBeInTheDocument();
    });

    it('GL-014: should be case-insensitive when filtering', () => {
      renderWithProviders(
        <GroupsList searchTerm="CODERS" visibilityFilter={[]} />
      );

      expect(screen.getByText('Kootenay Coders Collective')).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('GL-015: should paginate groups with 8 per page', () => {
      // Create 10 groups to test pagination
      const manyGroups = Array.from({ length: 10 }, (_, i) => ({
        ...mockGroups[0],
        id: `${i + 1}`,
        name: `Group ${i + 1}`
      }));

      mockUseGroupsWithFilters.mockReturnValue({
        data: manyGroups,
        isLoading: false,
        error: null
      });

      renderWithProviders(
        <GroupsList searchTerm="" visibilityFilter={[]} />
      );

      // Should show first 8 groups
      for (let i = 1; i <= 8; i++) {
        expect(screen.getByText(`Group ${i}`)).toBeInTheDocument();
      }
      
      // Should not show groups 9 and 10
      expect(screen.queryByText('Group 9')).not.toBeInTheDocument();
      expect(screen.queryByText('Group 10')).not.toBeInTheDocument();

      // Check pagination controls
      expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    });

    it('GL-016: should navigate to next page', () => {
      const manyGroups = Array.from({ length: 10 }, (_, i) => ({
        ...mockGroups[0],
        id: `${i + 1}`,
        name: `Group ${i + 1}`
      }));

      mockUseGroupsWithFilters.mockReturnValue({
        data: manyGroups,
        isLoading: false,
        error: null
      });

      renderWithProviders(
        <GroupsList searchTerm="" visibilityFilter={[]} />
      );

      // Click next button
      fireEvent.click(screen.getByText('Next'));

      // Should now show groups 9 and 10
      expect(screen.getByText('Group 9')).toBeInTheDocument();
      expect(screen.getByText('Group 10')).toBeInTheDocument();
      
      // Should not show group 1
      expect(screen.queryByText('Group 1')).not.toBeInTheDocument();
    });

    it('GL-017: should reset to page 1 when filters change', () => {
      const manyGroups = Array.from({ length: 10 }, (_, i) => ({
        ...mockGroups[0],
        id: `${i + 1}`,
        name: `Group ${i + 1}`
      }));

      mockUseGroupsWithFilters.mockReturnValue({
        data: manyGroups,
        isLoading: false,
        error: null
      });

      const { rerender } = renderWithProviders(
        <GroupsList searchTerm="" visibilityFilter={[]} />
      );

      // Navigate to page 2
      fireEvent.click(screen.getByText('Next'));
      expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();

      // Change search term - this should filter to only show 1 group
      mockUseGroupsWithFilters.mockImplementation((filters) => {
        const filteredGroups = filterGroups(
          manyGroups,
          'Group 5',
          []
        );
        return {
          data: filteredGroups,
          isLoading: false,
          error: null
        };
      });
      
      rerender(
        <Provider store={createMockStore()}>
          <BrowserRouter>
            <GroupsList searchTerm="Group 5" visibilityFilter={[]} />
          </BrowserRouter>
        </Provider>
      );

      // Should be back on page 1 with only 1 result
      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument(); // No pagination for single result
    });
  });

  describe('User Interactions', () => {
    it('GL-018: should show join modal when join button is clicked for open group', async () => {
      // Mock to return only one open group for cleaner testing
      mockUseGroupsWithFilters.mockImplementation((filters) => {
        return {
          data: [mockGroups[0]], // Only Kootenay Coders Collective
          isLoading: false,
          error: null
        };
      });
      
      renderWithProviders(
        <GroupsList searchTerm="" visibilityFilter={['open']} />
      );

      const joinButton = screen.getByRole('button', { name: /join/i });
      fireEvent.click(joinButton);

      await waitFor(() => {
        expect(screen.getByTestId('join-modal')).toBeInTheDocument();
        expect(screen.getByText('Join Kootenay Coders Collective')).toBeInTheDocument();
      });
    });

    it('GL-019: should show request to join for closed groups', () => {
      renderWithProviders(
        <GroupsList searchTerm="" visibilityFilter={['closed']} />
      );

      expect(screen.getByRole('button', { name: /request to join/i })).toBeInTheDocument();
    });

    it('GL-020: should not show join button for secret groups', () => {
      renderWithProviders(
        <GroupsList searchTerm="" visibilityFilter={['secret']} />
      );

      expect(screen.queryByRole('button', { name: /join/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /request to join/i })).not.toBeInTheDocument();
    });

    it('GL-021: should close join modal when cancelled', async () => {
      renderWithProviders(
        <GroupsList searchTerm="" visibilityFilter={['open']} />
      );

      const joinButtons = screen.getAllByRole('button', { name: /join/i });
      fireEvent.click(joinButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('join-modal')).toBeInTheDocument();
      });

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByTestId('join-modal')).not.toBeInTheDocument();
      });
    });

    it('GL-022: should handle join confirmation', async () => {
      const mockOnJoin = jest.fn();
      renderWithProviders(
        <GroupsList searchTerm="" visibilityFilter={['open']} />
      );

      const joinButtons = screen.getAllByRole('button', { name: /join/i });
      fireEvent.click(joinButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('join-modal')).toBeInTheDocument();
      });

      const confirmButton = screen.getByText('Confirm Join');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.queryByTestId('join-modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('GL-023: should handle groups with missing optional properties', () => {
      const incompleteGroup: Group = {
        id: '4',
        name: 'Minimal Group',
        description: 'A group with minimal data',
        heroImage: '',
        visibility: 'open' as GroupVisibility,
        memberCount: 0,
        lastActive: '',
        members: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      };

      mockUseGroupsWithFilters.mockReturnValue({
        data: [incompleteGroup],
        isLoading: false,
        error: null
      });

      renderWithProviders(
        <GroupsList searchTerm="" visibilityFilter={[]} />
      );

      expect(screen.getByText('Minimal Group')).toBeInTheDocument();
      expect(screen.getByText('0 members')).toBeInTheDocument();
    });

    it('GL-024: should handle very long group names and descriptions', () => {
      const longGroup: Group = {
        ...mockGroups[0],
        name: 'A'.repeat(100),
        description: 'B'.repeat(200)
      };

      mockUseGroupsWithFilters.mockReturnValue({
        data: [longGroup],
        isLoading: false,
        error: null
      });

      renderWithProviders(
        <GroupsList searchTerm="" visibilityFilter={[]} />
      );

      // Should truncate or handle long text appropriately
      const nameElements = screen.getAllByText((_content, element) => {
        return element?.textContent?.includes('A'.repeat(50)) || false;
      });
      expect(nameElements[0]).toBeInTheDocument();
    });

    it('GL-025: should handle empty search results gracefully', () => {
      mockUseGroupsWithFilters.mockImplementation((filters) => {
        const filteredGroups = filterGroups(
          mockGroups,
          'xyz123nonexistent',
          []
        );
        return {
          data: filteredGroups,
          isLoading: false,
          error: null
        };
      });
      
      renderWithProviders(
        <GroupsList searchTerm="xyz123nonexistent" visibilityFilter={[]} />
      );

      expect(screen.getByText(/No groups match your search criteria/i)).toBeInTheDocument();
      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });
  });
});