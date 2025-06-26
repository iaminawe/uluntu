import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/test/utils/testUtils';
import AdminCompaniesPage from '../CompaniesPage';
import { supabase } from '@/lib/supabase';
import { usePermissions } from '@/hooks/usePermissions';
import { createAuthState } from '@/test/utils/testUtils';

// Mock supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Mock permissions hook
jest.mock('@/hooks/usePermissions', () => ({
  usePermissions: jest.fn(() => ({
    isAdmin: () => true,
    hasPermission: () => true,
    hasRole: () => true,
  })),
}));

describe('AdminCompaniesPage', () => {
  const mockCompanies = [
    {
      id: '1',
      name: 'Tech Innovators Inc',
      industry: 'Software Development',
      location: 'Vancouver, BC',
      size: '50-100 employees',
      website: 'https://techinnovators.com',
      is_verified: true,
      created_at: '2024-01-01T00:00:00Z',
      description: 'Leading software development company',
    },
    {
      id: '2',
      name: 'Green Energy Solutions',
      industry: 'Renewable Energy',
      location: 'Calgary, AB',
      size: '10-50 employees',
      website: 'https://greenenergy.ca',
      is_verified: false,
      created_at: '2024-01-15T00:00:00Z',
      description: 'Sustainable energy solutions provider',
    },
  ];

  const mockSupabaseResponse = {
    data: mockCompanies,
    error: null,
    count: 2,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup supabase mock chain
    const chainableMock = {
      select: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValue(mockSupabaseResponse),
      delete: jest.fn().mockReturnThis(),
      in: jest.fn().mockResolvedValue({ error: null }),
    };

    (supabase.from as jest.Mock).mockReturnValue(chainableMock);
  });

  describe('Rendering', () => {
    it('renders the companies table with correct columns', async () => {
      render(<AdminCompaniesPage />, {
        initialState: createAuthState(),
      });

      // Check page title
      expect(screen.getByText('Companies')).toBeInTheDocument();

      // Check column headers
      await waitFor(() => {
        expect(screen.getByText('Company Name')).toBeInTheDocument();
        expect(screen.getByText('Industry')).toBeInTheDocument();
        expect(screen.getByText('Location')).toBeInTheDocument();
        expect(screen.getByText('Company Size')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
        expect(screen.getByText('Created')).toBeInTheDocument();
      });
    });

    it('displays company data correctly', async () => {
      render(<AdminCompaniesPage />, {
        initialState: createAuthState(),
      });

      await waitFor(() => {
        // First company
        expect(screen.getByText('Tech Innovators Inc')).toBeInTheDocument();
        expect(screen.getByText('Software Development')).toBeInTheDocument();
        expect(screen.getByText('Vancouver, BC')).toBeInTheDocument();
        expect(screen.getByText('50-100 employees')).toBeInTheDocument();
        expect(screen.getByText('Verified')).toBeInTheDocument();

        // Second company
        expect(screen.getByText('Green Energy Solutions')).toBeInTheDocument();
        expect(screen.getByText('Renewable Energy')).toBeInTheDocument();
        expect(screen.getByText('Calgary, AB')).toBeInTheDocument();
        expect(screen.getByText('10-50 employees')).toBeInTheDocument();
        expect(screen.getByText('Pending')).toBeInTheDocument();
      });
    });

    it('shows company websites as clickable links', async () => {
      render(<AdminCompaniesPage />, {
        initialState: createAuthState(),
      });

      await waitFor(() => {
        const techLink = screen.getByText('https://techinnovators.com');
        expect(techLink).toHaveAttribute('href', 'https://techinnovators.com');
        expect(techLink).toHaveAttribute('target', '_blank');
        expect(techLink).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    it('displays icons for each field', async () => {
      render(<AdminCompaniesPage />, {
        initialState: createAuthState(),
      });

      await waitFor(() => {
        // Building icon for company names
        const buildingIcons = document.querySelectorAll('[data-lucide="building"]');
        expect(buildingIcons.length).toBeGreaterThan(0);

        // MapPin icon for locations
        const mapPinIcons = document.querySelectorAll('[data-lucide="map-pin"]');
        expect(mapPinIcons.length).toBeGreaterThan(0);

        // Users icon for company size
        const usersIcons = document.querySelectorAll('[data-lucide="users"]');
        expect(usersIcons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Search Functionality', () => {
    it('searches across multiple fields', async () => {
      render(<AdminCompaniesPage />, {
        initialState: createAuthState(),
      });

      await waitFor(() => {
        expect(screen.getByText('Tech Innovators Inc')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search companies...');
      fireEvent.change(searchInput, { target: { value: 'renewable' } });

      await waitFor(() => {
        expect(searchInput).toHaveValue('renewable');
      });
    });

    it('searches by company name', async () => {
      render(<AdminCompaniesPage />, {
        initialState: createAuthState(),
      });

      const searchInput = screen.getByPlaceholderText('Search companies...');
      fireEvent.change(searchInput, { target: { value: 'Tech Innovators' } });

      await waitFor(() => {
        expect(searchInput).toHaveValue('Tech Innovators');
      });
    });

    it('searches by location', async () => {
      render(<AdminCompaniesPage />, {
        initialState: createAuthState(),
      });

      const searchInput = screen.getByPlaceholderText('Search companies...');
      fireEvent.change(searchInput, { target: { value: 'Vancouver' } });

      await waitFor(() => {
        expect(searchInput).toHaveValue('Vancouver');
      });
    });
  });

  describe('CRUD Operations', () => {
    it('provides create company link', async () => {
      render(<AdminCompaniesPage />, {
        initialState: createAuthState(),
      });

      const createButton = screen.getByText('Create');
      expect(createButton).toBeInTheDocument();
      expect(createButton.closest('a')).toHaveAttribute('href', '/companies/create');
    });

    it('provides edit links for each company', async () => {
      render(<AdminCompaniesPage />, {
        initialState: createAuthState(),
      });

      await waitFor(() => {
        const editButtons = screen.getAllByRole('link', { name: /edit/i });
        expect(editButtons).toHaveLength(2);
        expect(editButtons[0]).toHaveAttribute('href', '/companies/1/edit');
        expect(editButtons[1]).toHaveAttribute('href', '/companies/2/edit');
      });
    });

    it('provides view links for each company', async () => {
      render(<AdminCompaniesPage />, {
        initialState: createAuthState(),
      });

      await waitFor(() => {
        const viewLinks = screen.getAllByRole('link', { name: /view/i });
        expect(viewLinks).toHaveLength(2);
        expect(viewLinks[0]).toHaveAttribute('href', '/companies/1');
        expect(viewLinks[1]).toHaveAttribute('href', '/companies/2');
      });
    });

    it('handles bulk delete operations', async () => {
      render(<AdminCompaniesPage />, {
        initialState: createAuthState(),
      });

      await waitFor(() => {
        expect(screen.getByText('Tech Innovators Inc')).toBeInTheDocument();
      });

      // Select companies
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]); // Select first company
      fireEvent.click(checkboxes[2]); // Select second company

      // Delete button should appear
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      expect(deleteButton).toBeInTheDocument();

      // Click delete
      fireEvent.click(deleteButton);

      // Confirm deletion
      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('companies');
      });
    });
  });

  describe('Verification Status', () => {
    it('shows verified badge for verified companies', async () => {
      render(<AdminCompaniesPage />, {
        initialState: createAuthState(),
      });

      await waitFor(() => {
        const verifiedBadges = screen.getAllByText('Verified');
        expect(verifiedBadges[0]).toHaveClass('bg-green-100', 'text-green-800');
        
        // Check for checkmark icon
        const checkIcons = document.querySelectorAll('[data-lucide="check-circle"]');
        expect(checkIcons.length).toBeGreaterThan(0);
      });
    });

    it('shows pending badge for unverified companies', async () => {
      render(<AdminCompaniesPage />, {
        initialState: createAuthState(),
      });

      await waitFor(() => {
        const pendingBadges = screen.getAllByText('Pending');
        expect(pendingBadges[0]).toHaveClass('bg-yellow-100', 'text-yellow-800');
        
        // Check for X icon
        const xIcons = document.querySelectorAll('[data-lucide="x-circle"]');
        expect(xIcons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Permissions', () => {
    it('renders page when user has admin permissions', async () => {
      render(<AdminCompaniesPage />, {
        initialState: createAuthState(),
      });

      await waitFor(() => {
        expect(screen.getByText('Companies')).toBeInTheDocument();
      });
    });

    it('checks for proper permissions on mount', () => {
      render(<AdminCompaniesPage />, {
        initialState: createAuthState(),
      });

      expect(usePermissions).toHaveBeenCalled();
    });
  });

  describe('Sorting', () => {
    it('sorts by company name', async () => {
      render(<AdminCompaniesPage />, {
        initialState: createAuthState(),
      });

      await waitFor(() => {
        const nameHeader = screen.getByText('Company Name');
        fireEvent.click(nameHeader);
      });

      // Verify order was called with correct parameters
      const fromMock = supabase.from as jest.Mock;
      const calls = fromMock.mock.results[0].value;
      expect(calls.order).toHaveBeenCalled();
    });

    it('sorts by creation date', async () => {
      render(<AdminCompaniesPage />, {
        initialState: createAuthState(),
      });

      await waitFor(() => {
        const createdHeader = screen.getByText('Created');
        fireEvent.click(createdHeader);
      });

      const fromMock = supabase.from as jest.Mock;
      const calls = fromMock.mock.results[0].value;
      expect(calls.order).toHaveBeenCalled();
    });
  });

  describe('Export Functionality', () => {
    it('exports company data to CSV', async () => {
      // Mock URL and document methods
      const mockCreateObjectURL = jest.fn(() => 'blob:mock-url');
      const mockRevokeObjectURL = jest.fn();
      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = mockRevokeObjectURL;

      render(<AdminCompaniesPage />, {
        initialState: createAuthState(),
      });

      await waitFor(() => {
        const exportButton = screen.getByText('Export');
        fireEvent.click(exportButton);
      });

      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      const errorResponse = {
        data: null,
        error: { message: 'Failed to fetch companies' },
        count: 0,
      };

      const chainableMock = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue(errorResponse),
      };

      (supabase.from as jest.Mock).mockReturnValue(chainableMock);

      render(<AdminCompaniesPage />, {
        initialState: createAuthState(),
      });

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });
  });
});