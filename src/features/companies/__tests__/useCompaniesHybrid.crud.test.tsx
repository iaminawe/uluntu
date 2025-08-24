import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useCompaniesHybrid } from '../hooks/useCompaniesHybrid';
import { companiesApi } from '../api/companiesApi';
import { rootReducer } from '@/store';
import { toast } from 'react-hot-toast';

// Mock the companies API
jest.mock('../api/companiesApi', () => ({
  companiesApi: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getWithFilters: jest.fn(),
  },
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('useCompaniesHybrid CRUD Operations', () => {
  let queryClient: QueryClient;
  let store: any;

  const mockCompanies = [
    {
      id: '1',
      name: 'Tech Corp',
      industry: 'Technology',
      location: 'Vancouver',
      size: '50-100 employees',
      website: 'https://techcorp.com',
      is_verified: true,
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'Green Solutions',
      industry: 'Environmental',
      location: 'Toronto',
      size: '10-50 employees',
      website: 'https://greensolutions.ca',
      is_verified: false,
      created_at: '2024-01-15T00:00:00Z',
    },
  ];

  const mockCompanyInput = {
    name: 'New Company',
    industry: 'Software',
    location: 'Calgary',
    size: '1-10 employees',
    website: 'https://newcompany.com',
    description: 'A new software company',
  };

  const createTestStore = () => {
    return configureStore({
      reducer: rootReducer,
      preloadedState: {
        auth: {
          user: { id: 'user-123', email: 'test@example.com' },
          isAuthenticated: true,
          sessionChecked: true,
          publicProfile: null,
          error: null,
          loading: false,
          roles: {
            list: ['admin'],
            loading: false,
            error: null,
          },
        },
      },
    });
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>{children}</Provider>
    </QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    store = createTestStore();
    jest.clearAllMocks();
  });

  describe('Read Operations', () => {
    it('fetches all companies successfully', async () => {
      (companiesApi.getAll as jest.Mock).mockResolvedValue(mockCompanies);

      const { result } = renderHook(() => useCompaniesHybrid(), { wrapper });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.companies).toEqual(mockCompanies);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('handles fetch errors gracefully', async () => {
      const error = new Error('Failed to fetch companies');
      (companiesApi.getAll as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useCompaniesHybrid(), { wrapper });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(error);
      expect(result.current.companies).toEqual([]);
    });
  });

  describe('Create Operations', () => {
    it('creates a new company successfully', async () => {
      const newCompany = { ...mockCompanyInput, id: '3', created_at: new Date().toISOString() };
      (companiesApi.create as jest.Mock).mockResolvedValue(newCompany);
      (companiesApi.getAll as jest.Mock).mockResolvedValue([...mockCompanies, newCompany]);

      const { result } = renderHook(() => useCompaniesHybrid(), { wrapper });

      await act(async () => {
        const createdCompany = await result.current.createCompany(mockCompanyInput);
        expect(createdCompany).toEqual(newCompany);
      });

      expect(companiesApi.create).toHaveBeenCalledWith(mockCompanyInput);
      expect(toast.success).toHaveBeenCalledWith('Company created successfully');
    });
  });
});