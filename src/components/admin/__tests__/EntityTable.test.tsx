import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import EntityTable from '../EntityTable';

// Mock supabase
const supabase = require('@/lib/supabase').supabase;
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        or: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => Promise.resolve({
              data: [
                {
                  id: '1',
                  name: 'Test Entity 1',
                  email: 'test1@example.com',
                  created_at: '2024-01-01T00:00:00Z'
                },
                {
                  id: '2',
                  name: 'Test Entity 2',
                  email: 'test2@example.com',
                  created_at: '2024-01-02T00:00:00Z'
                }
              ],
              error: null,
              count: 2
            }))
          }))
        })),
        order: jest.fn(() => ({
          range: jest.fn(() => Promise.resolve({
            data: [],
            error: null,
            count: 0
          }))
        }))
      })),
      delete: jest.fn(() => ({
        in: jest.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  }
}));

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
    });
  });

  it('handles search functionality', async () => {
    render(
      <TestWrapper>
        <EntityTable {...defaultProps} />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText('Search test entities...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });

    expect(searchInput).toHaveValue('test search');
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
      expect(nameHeader.parentElement).toContainHTML('↑');
    });

    fireEvent.click(nameHeader);
    await waitFor(() => {
      expect(nameHeader.parentElement).toContainHTML('↓');
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
      expect(checkboxes.length).toBeGreaterThan(1);
      
      // Select first item
      fireEvent.click(checkboxes[1]);
    });

    expect(screen.getByText('1 items selected')).toBeInTheDocument();
    expect(screen.getByText('Delete Selected')).toBeInTheDocument();
  });

  it('handles bulk delete', async () => {
    const mockDelete = jest.fn(() => Promise.resolve({ error: null }));
    (supabase.from as jest.Mock).mockReturnValue({
      delete: jest.fn(() => ({
        in: mockDelete
      }))
    } as any);

    render(
      <TestWrapper>
        <EntityTable {...defaultProps} />
      </TestWrapper>
    );

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);
    });

    const deleteButton = screen.getByText('Delete Selected');
    
    // Mock window.confirm
    window.confirm = jest.fn(() => true);
    
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalledWith('Delete 1 items?');
  });

  it('renders action buttons for each row', async () => {
    render(
      <TestWrapper>
        <EntityTable {...defaultProps} />
      </TestWrapper>
    );

    await waitFor(() => {
      const viewButtons = screen.getAllByRole('link', { name: '' });
      expect(viewButtons.length).toBeGreaterThan(0);
      
      // Check if links have correct hrefs
      expect(viewButtons[0]).toHaveAttribute('href', '/test/1');
    });
  });

  it('handles custom actions', async () => {
    const customAction = jest.fn((item) => (
      <button onClick={() => console.log(item)}>Custom</button>
    ));

    render(
      <TestWrapper>
        <EntityTable {...defaultProps} customActions={customAction} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Custom')).toHaveLength(2);
    });
  });

  it('handles export functionality', async () => {
    // Mock URL.createObjectURL
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    
    // Mock document.createElement
    const mockClick = jest.fn();
    const mockAnchor = { click: mockClick, href: '', download: '' };
    document.createElement = jest.fn(() => mockAnchor as any);

    render(
      <TestWrapper>
        <EntityTable {...defaultProps} />
      </TestWrapper>
    );

    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(mockAnchor.download).toContain('test_entities-export-');
      expect(mockClick).toHaveBeenCalled();
    });
  });
});