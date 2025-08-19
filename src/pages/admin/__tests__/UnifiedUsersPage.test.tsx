import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import UnifiedUsersPage from '../UnifiedUsersPage';
import { supabase } from '@/lib/supabase';
import { adminRolesApi } from '@/features/admin/api/roles';
import { adminActivityLogger } from '@/services/adminActivityLogger';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn()
    }
  }
}));

vi.mock('@/features/admin/api/roles', () => ({
  adminRolesApi: {
    getRoles: vi.fn()
  }
}));

vi.mock('@/services/adminActivityLogger', () => ({
  adminActivityLogger: {
    logUserAction: vi.fn(),
    logBulkAction: vi.fn(),
    logImport: vi.fn(),
    logExport: vi.fn()
  }
}));

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    location: 'New York',
    title: 'Developer',
    company: 'Tech Corp',
    status: 'published',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    user: {
      id: '1',
      email: 'john@example.com',
      created_at: '2024-01-01T00:00:00Z',
      last_sign_in_at: '2024-01-02T00:00:00Z'
    }
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    location: 'San Francisco',
    title: 'Designer',
    company: 'Design Studio',
    status: 'published',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    user: {
      id: '2',
      email: 'jane@example.com',
      created_at: '2024-01-02T00:00:00Z',
      last_sign_in_at: '2024-01-03T00:00:00Z'
    }
  }
];

const mockRoles = [
  { id: 'admin', name: 'Administrator', description: 'Full admin access' },
  { id: 'moderator', name: 'Moderator', description: 'Content moderation' },
  { id: 'member', name: 'Member', description: 'Regular member' }
];

describe('UnifiedUsersPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          range: vi.fn().mockResolvedValue({
            data: mockUsers,
            error: null
          })
        })
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: null
        })
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: null
        })
      }),
      insert: vi.fn().mockResolvedValue({
        error: null
      })
    } as any);

    vi.mocked(adminRolesApi.getRoles).mockResolvedValue(mockRoles);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <UnifiedUsersPage />
      </QueryClientProvider>
    );
  };

  describe('Rendering', () => {
    it('should render the page title and description', () => {
      renderPage();
      expect(screen.getByText('Unified User Management')).toBeInTheDocument();
      expect(screen.getByText('Manage all users and member profiles in one place')).toBeInTheDocument();
    });

    it('should render the search bar', () => {
      renderPage();
      expect(screen.getByPlaceholderText('Search by name, email, company, or location...')).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      renderPage();
      expect(screen.getByText('Filters')).toBeInTheDocument();
      expect(screen.getByText('Export')).toBeInTheDocument();
      expect(screen.getByText('Import CSV')).toBeInTheDocument();
    });

    it('should display users in the table', async () => {
      renderPage();
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('should filter users based on search term', async () => {
      renderPage();
      
      const searchInput = screen.getByPlaceholderText('Search by name, email, company, or location...');
      fireEvent.change(searchInput, { target: { value: 'John' } });

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('members');
      });
    });
  });

  describe('User Actions', () => {
    it('should handle edit action', async () => {
      renderPage();
      
      await waitFor(() => {
        const actionSelects = screen.getAllByText('Actions');
        expect(actionSelects.length).toBeGreaterThan(0);
      });

      const firstActionSelect = screen.getAllByDisplayValue('')[0];
      fireEvent.change(firstActionSelect, { target: { value: 'edit' } });

      await waitFor(() => {
        expect(screen.getByText('Edit User Profile')).toBeInTheDocument();
      });
    });

    it('should handle block action', async () => {
      renderPage();
      
      await waitFor(() => {
        const actionSelects = screen.getAllByText('Actions');
        expect(actionSelects.length).toBeGreaterThan(0);
      });

      const firstActionSelect = screen.getAllByDisplayValue('')[0];
      fireEvent.change(firstActionSelect, { target: { value: 'block' } });

      await waitFor(() => {
        expect(adminActivityLogger.logUserAction).toHaveBeenCalledWith(
          'block',
          expect.any(String),
          expect.any(Object)
        );
      });
    });

    it('should handle delete action with confirmation', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      
      renderPage();
      
      await waitFor(() => {
        const actionSelects = screen.getAllByText('Actions');
        expect(actionSelects.length).toBeGreaterThan(0);
      });

      const firstActionSelect = screen.getAllByDisplayValue('')[0];
      fireEvent.change(firstActionSelect, { target: { value: 'delete' } });

      await waitFor(() => {
        expect(confirmSpy).toHaveBeenCalled();
        expect(adminActivityLogger.logUserAction).toHaveBeenCalledWith(
          'delete',
          expect.any(String)
        );
      });

      confirmSpy.mockRestore();
    });
  });

  describe('Bulk Operations', () => {
    it('should select all users when checkbox is clicked', async () => {
      renderPage();
      
      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes.length).toBeGreaterThan(0);
      });

      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(selectAllCheckbox);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        checkboxes.forEach((checkbox, index) => {
          if (index > 0) {
            expect(checkbox).toBeChecked();
          }
        });
      });
    });

    it('should show bulk actions when users are selected', async () => {
      renderPage();
      
      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes.length).toBeGreaterThan(1);
      });

      const firstUserCheckbox = screen.getAllByRole('checkbox')[1];
      fireEvent.click(firstUserCheckbox);

      await waitFor(() => {
        expect(screen.getByText(/1 user selected/)).toBeInTheDocument();
      });
    });

    it('should handle bulk block action', async () => {
      renderPage();
      
      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes.length).toBeGreaterThan(1);
      });

      const firstUserCheckbox = screen.getAllByRole('checkbox')[1];
      fireEvent.click(firstUserCheckbox);

      const bulkActionSelect = await screen.findByDisplayValue('');
      fireEvent.change(bulkActionSelect, { target: { value: 'block' } });

      const applyButton = screen.getByText('Apply');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(adminActivityLogger.logBulkAction).toHaveBeenCalledWith(
          'block',
          'user',
          expect.any(Array)
        );
      });
    });
  });

  describe('CSV Import', () => {
    it('should handle CSV file upload', async () => {
      renderPage();
      
      const file = new File(['Name,Email\nTest User,test@example.com'], 'users.csv', { type: 'text/csv' });
      
      const input = document.createElement('input');
      input.type = 'file';
      input.files = [file] as any;
      
      const event = new Event('change', { bubbles: true });
      Object.defineProperty(event, 'target', { value: input, enumerable: true });
      
      await waitFor(() => {
        const importButton = screen.getByText('Import CSV');
        fireEvent.click(importButton);
      });
    });
  });

  describe('Export Functionality', () => {
    it('should export all users when export button is clicked', async () => {
      const createElementSpy = vi.spyOn(document, 'createElement');
      const clickSpy = vi.fn();
      
      createElementSpy.mockReturnValue({
        click: clickSpy,
        href: '',
        download: ''
      } as any);
      
      renderPage();
      
      await waitFor(() => {
        const exportButton = screen.getByText('Export');
        fireEvent.click(exportButton);
      });

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(clickSpy).toHaveBeenCalled();
      
      createElementSpy.mockRestore();
    });

    it('should export selected users', async () => {
      renderPage();
      
      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes.length).toBeGreaterThan(1);
      });

      const firstUserCheckbox = screen.getAllByRole('checkbox')[1];
      fireEvent.click(firstUserCheckbox);

      const bulkActionSelect = await screen.findByDisplayValue('');
      fireEvent.change(bulkActionSelect, { target: { value: 'export' } });

      const applyButton = screen.getByText('Apply');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(adminActivityLogger.logExport).toHaveBeenCalledWith(
          'user',
          1,
          'csv',
          expect.any(Object)
        );
      });
    });
  });

  describe('Filters', () => {
    it('should toggle filters panel', async () => {
      renderPage();
      
      const filtersButton = screen.getByText('Filters');
      fireEvent.click(filtersButton);

      await waitFor(() => {
        expect(screen.getByText('All Roles')).toBeInTheDocument();
        expect(screen.getByText('All Status')).toBeInTheDocument();
        expect(screen.getByText('25 per page')).toBeInTheDocument();
      });
    });

    it('should filter by status', async () => {
      renderPage();
      
      const filtersButton = screen.getByText('Filters');
      fireEvent.click(filtersButton);

      const statusSelect = await screen.findByDisplayValue('all');
      fireEvent.change(statusSelect, { target: { value: 'active' } });

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('members');
      });
    });
  });

  describe('Pagination', () => {
    it('should display pagination controls', async () => {
      renderPage();
      
      await waitFor(() => {
        expect(screen.getByText('Showing page')).toBeInTheDocument();
        expect(screen.getAllByText('Previous').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Next').length).toBeGreaterThan(0);
      });
    });

    it('should handle page navigation', async () => {
      renderPage();
      
      await waitFor(() => {
        const nextButtons = screen.getAllByText('Next');
        expect(nextButtons.length).toBeGreaterThan(0);
      });

      const nextButton = screen.getAllByText('Next')[0];
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('members');
      });
    });
  });

  describe('Edit Modal', () => {
    it('should save user edits', async () => {
      renderPage();
      
      await waitFor(() => {
        const actionSelects = screen.getAllByText('Actions');
        expect(actionSelects.length).toBeGreaterThan(0);
      });

      const firstActionSelect = screen.getAllByDisplayValue('')[0];
      fireEvent.change(firstActionSelect, { target: { value: 'edit' } });

      await waitFor(() => {
        expect(screen.getByText('Edit User Profile')).toBeInTheDocument();
      });

      const nameInput = screen.getByDisplayValue('John Doe');
      fireEvent.change(nameInput, { target: { value: 'John Updated' } });

      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(adminActivityLogger.logUserAction).toHaveBeenCalledWith(
          'update',
          expect.any(String),
          expect.any(Object)
        );
      });
    });

    it('should cancel edit without saving', async () => {
      renderPage();
      
      await waitFor(() => {
        const actionSelects = screen.getAllByText('Actions');
        expect(actionSelects.length).toBeGreaterThan(0);
      });

      const firstActionSelect = screen.getAllByDisplayValue('')[0];
      fireEvent.change(firstActionSelect, { target: { value: 'edit' } });

      await waitFor(() => {
        expect(screen.getByText('Edit User Profile')).toBeInTheDocument();
      });

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Edit User Profile')).not.toBeInTheDocument();
      });
    });
  });
});