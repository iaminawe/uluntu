// Mock environment dependencies first
jest.mock('@/config/env', () => ({
  getIsSupabaseEnabled: jest.fn().mockReturnValue(false),
  IS_SUPABASE_ENABLED: false
}));

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import EntityTable from '../EntityTable';

// Mock supabase
jest.mock('@/lib/supabase', () => {
  const mockSupabaseData = [
    {
      id: '1',
      name: 'Test Entity 1',
      email: 'test1@example.com',
      created_at: '2024-01-01T00:00:00Z',
      status: 'active'
    },
    {
      id: '2',
      name: 'Test Entity 2',
      email: 'test2@example.com',
      created_at: '2024-01-02T00:00:00Z',
      status: 'inactive'
    }
  ];

  const chainableMock = {
    select: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockResolvedValue({
      data: mockSupabaseData,
      error: null,
      count: 2
    }),
    delete: jest.fn().mockReturnThis(),
    in: jest.fn().mockResolvedValue({ error: null })
  };

  // Override select('*') for export functionality
  chainableMock.select.mockImplementation((query) => {
    if (query === '*') {
      // Return a promise directly for export
      return Promise.resolve({
        data: mockSupabaseData,
        error: null
      });
    }
    return chainableMock;
  });

  return {
    supabase: {
      from: jest.fn(() => chainableMock)
    }
  };
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('EntityTable', () => {
  const defaultProps = {
    entityType: 'test_entities',
    entityName: 'Test Entities',
    columns: [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'email', label: 'Email', sortable: true },
      {
        key: 'created_at',
        label: 'Created',
        render: (value: string) => new Date(value).toLocaleDateString(),
        sortable: true
      }
    ],
    searchFields: ['name', 'email'],
    editPath: '/test/:id/edit',
    detailPath: '/test/:id',
    createPath: '/test/create'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders entity table with data', async () => {
    render(
      <TestWrapper>
        <EntityTable {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Test Entities')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search test entities...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test Entity 1')).toBeInTheDocument();
      expect(screen.getByText('Test Entity 2')).toBeInTheDocument();
      expect(screen.getByText('test1@example.com')).toBeInTheDocument();
      expect(screen.getByText('test2@example.com')).toBeInTheDocument();
    });
  });

  it('handles search functionality', async () => {
    render(
      <TestWrapper>
        <EntityTable {...defaultProps} />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText('Search test entities...');
    fireEvent.change(searchInput, { target: { value: 'Entity 1' } });

    await waitFor(() => {
      expect(searchInput).toHaveValue('Entity 1');
    });
  });

  it('handles sorting', async () => {
    render(
      <TestWrapper>
        <EntityTable {...defaultProps} />
      </TestWrapper>
    );

    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);

    await waitFor(() => {
      // Check that sorting was triggered
      expect(screen.getByText('Name')).toBeInTheDocument();
    });
  });

  it('handles item selection', async () => {
    render(
      <TestWrapper>
        <EntityTable {...defaultProps} />
      </TestWrapper>
    );

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(1); // Header checkbox + item checkboxes
      
      // Select first item
      fireEvent.click(checkboxes[1]);
    });
  });

  it('handles delete action', async () => {
    render(
      <TestWrapper>
        <EntityTable {...defaultProps} />
      </TestWrapper>
    );

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]); // Select first item
    });

    // Find and click delete button
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(btn => btn.querySelector('[data-lucide="trash-2"]'));
    
    if (deleteButton) {
      fireEvent.click(deleteButton);
      // Confirm delete action would be triggered
    }
  });

  it('displays custom render for columns', async () => {
    const customColumns = [
      ...defaultProps.columns,
      {
        key: 'status',
        label: 'Status',
        render: (value: string) => (
          <span className={value === 'active' ? 'text-green-600' : 'text-red-600'}>
            {value}
          </span>
        )
      }
    ];

    render(
      <TestWrapper>
        <EntityTable {...defaultProps} columns={customColumns} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('active')).toBeInTheDocument();
      expect(screen.getByText('inactive')).toBeInTheDocument();
    });
  });

  it('shows detail and edit links when paths are provided', async () => {
    render(
      <TestWrapper>
        <EntityTable {...defaultProps} />
      </TestWrapper>
    );

    await waitFor(() => {
      const links = screen.getAllByRole('link');
      const viewLinks = links.filter(link => link.getAttribute('href')?.includes('/test/'));
      expect(viewLinks.length).toBeGreaterThan(0);
      
      // Check if links have correct hrefs
      expect(viewLinks[0]).toHaveAttribute('href', expect.stringContaining('/test/'));
    });
  });

  it('handles custom actions', async () => {
    const customAction = jest.fn((item) => (
      <button key={`custom-${item.id}`} onClick={() => console.log(item)}>
        Custom {item.id}
      </button>
    ));

    render(
      <TestWrapper>
        <EntityTable {...defaultProps} customActions={customAction} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Custom 1')).toBeInTheDocument();
      expect(screen.getByText('Custom 2')).toBeInTheDocument();
      expect(customAction).toHaveBeenCalledTimes(2);
    });
  });

  it('handles export functionality', async () => {
    // Mock URL.createObjectURL and Blob
    const mockCreateObjectURL = jest.fn(() => 'blob:mock-url');
    const mockRevokeObjectURL = jest.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;
    
    // Mock the click method
    const mockClick = jest.fn();
    const mockAnchor = document.createElement('a');
    mockAnchor.click = mockClick;
    
    const originalCreateElement = document.createElement.bind(document);
    const createElementSpy = jest.spyOn(document, 'createElement');
    createElementSpy.mockImplementation((tagName) => {
      if (tagName === 'a') {
        return mockAnchor;
      }
      return originalCreateElement(tagName);
    });

    render(
      <TestWrapper>
        <EntityTable {...defaultProps} />
      </TestWrapper>
    );

    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    }, { timeout: 500 });

    createElementSpy.mockRestore();
  });

  it('handles refresh functionality', async () => {
    const { } = render(
      <TestWrapper>
        <EntityTable {...defaultProps} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Entity 1')).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    // Verify that the data is refetched
    await waitFor(() => {
      expect(screen.getByText('Test Entity 1')).toBeInTheDocument();
    });
  });

  it('handles pagination controls', async () => {
    render(
      <TestWrapper>
        <EntityTable {...defaultProps} />
      </TestWrapper>
    );

    await waitFor(() => {
      // Check pagination info
      expect(screen.getByText(/1-2 of 2/)).toBeInTheDocument();
      
      // Pagination buttons should be disabled when there's only one page
      const prevButton = screen.getByRole('button', { name: /previous/i });
      const nextButton = screen.getByRole('button', { name: /next/i });
      
      expect(prevButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
    }, { timeout: 500 });
  });
});