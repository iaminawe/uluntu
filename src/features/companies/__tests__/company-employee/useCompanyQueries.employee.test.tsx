import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useCompanyEmployees,
  useAddCompanyEmployee,
  useUpdateCompanyEmployee,
  useRemoveCompanyEmployee
} from '../../hooks/useCompanyQueries';
import { companiesApi } from '../../api/companiesApi';
import { CompanyEmployee } from '../../types';

// Mock the API
jest.mock('../../api/companiesApi');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useCompanyEmployees', () => {
  const mockEmployees: CompanyEmployee[] = [
    {
      id: 'emp-123',
      company_id: 'comp-456',
      member_id: 'mem-789',
      role: 'Developer',
      department: 'Engineering',
      start_date: '2023-01-01',
      is_current: true,
      created_at: '2023-01-01T00:00:00Z',
      member: {
        id: 'mem-789',
        name: 'John Doe',
        title: 'Software Engineer',
        image: 'https://example.com/john.jpg',
        joinDate: '2022-01-01',
        status: 'published',
        created_at: '2022-01-01T00:00:00Z',
        featured: false
      }
    },
    {
      id: 'emp-124',
      company_id: 'comp-456',
      member_id: 'mem-790',
      role: 'Designer',
      department: 'Design',
      start_date: '2023-02-01',
      is_current: true,
      created_at: '2023-02-01T00:00:00Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch company employees', async () => {
    (companiesApi.getCompanyEmployees as jest.Mock).mockResolvedValue(mockEmployees);

    const { result } = renderHook(
      () => useCompanyEmployees('comp-456'),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockEmployees);
    expect(companiesApi.getCompanyEmployees).toHaveBeenCalledWith('comp-456', undefined);
  });

  it('should fetch employees with filters', async () => {
    (companiesApi.getCompanyEmployees as jest.Mock).mockResolvedValue([mockEmployees[0]]);

    const { result } = renderHook(
      () => useCompanyEmployees('comp-456', { department: 'Engineering', currentOnly: true }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(companiesApi.getCompanyEmployees).toHaveBeenCalledWith('comp-456', {
      department: 'Engineering',
      currentOnly: true
    });
  });

  it('should handle error when fetching employees', async () => {
    const error = new Error('Failed to fetch');
    (companiesApi.getCompanyEmployees as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(
      () => useCompanyEmployees('comp-456'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(error);
  });
});

describe('useAddCompanyEmployee', () => {
  const newEmployee: CompanyEmployee = {
    id: 'emp-125',
    company_id: 'comp-456',
    member_id: 'mem-791',
    role: 'Manager',
    department: 'Product',
    start_date: '2024-01-01',
    is_current: true,
    created_at: '2024-01-01T00:00:00Z'
  };

  it('should add a new company employee', async () => {
    (companiesApi.addCompanyEmployee as jest.Mock).mockResolvedValue(newEmployee);

    const { result } = renderHook(
      () => useAddCompanyEmployee(),
      { wrapper: createWrapper() }
    );

    expect(result.current.isPending).toBe(false);

    result.current.mutate({
      companyId: 'comp-456',
      memberId: 'mem-791',
      employeeData: {
        role: 'Manager',
        department: 'Product',
        start_date: '2024-01-01'
      }
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(newEmployee);
    expect(companiesApi.addCompanyEmployee).toHaveBeenCalledWith(
      'comp-456',
      'mem-791',
      {
        role: 'Manager',
        department: 'Product',
        start_date: '2024-01-01'
      }
    );
  });

  it('should handle error when adding employee', async () => {
    const error = new Error('Failed to add employee');
    (companiesApi.addCompanyEmployee as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(
      () => useAddCompanyEmployee(),
      { wrapper: createWrapper() }
    );

    result.current.mutate({
      companyId: 'comp-456',
      memberId: 'mem-791'
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(error);
  });
});

describe('useUpdateCompanyEmployee', () => {
  const updatedEmployee: CompanyEmployee = {
    id: 'emp-123',
    company_id: 'comp-456',
    member_id: 'mem-789',
    role: 'Senior Developer',
    department: 'Engineering',
    start_date: '2023-01-01',
    is_current: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  };

  it('should update an existing employee', async () => {
    (companiesApi.updateCompanyEmployee as jest.Mock).mockResolvedValue(updatedEmployee);

    const { result } = renderHook(
      () => useUpdateCompanyEmployee(),
      { wrapper: createWrapper() }
    );

    result.current.mutate({
      employeeId: 'emp-123',
      updates: {
        role: 'Senior Developer'
      }
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(updatedEmployee);
    expect(companiesApi.updateCompanyEmployee).toHaveBeenCalledWith(
      'emp-123',
      { role: 'Senior Developer' }
    );
  });

  it('should handle marking employee as not current', async () => {
    const inactiveEmployee = {
      ...updatedEmployee,
      is_current: false,
      end_date: '2024-12-31'
    };

    (companiesApi.updateCompanyEmployee as jest.Mock).mockResolvedValue(inactiveEmployee);

    const { result } = renderHook(
      () => useUpdateCompanyEmployee(),
      { wrapper: createWrapper() }
    );

    result.current.mutate({
      employeeId: 'emp-123',
      updates: {
        is_current: false,
        end_date: '2024-12-31'
      }
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.is_current).toBe(false);
    expect(result.current.data?.end_date).toBe('2024-12-31');
  });
});

describe('useRemoveCompanyEmployee', () => {
  it('should remove a company employee', async () => {
    (companiesApi.removeCompanyEmployee as jest.Mock).mockResolvedValue(true);

    const { result } = renderHook(
      () => useRemoveCompanyEmployee(),
      { wrapper: createWrapper() }
    );

    result.current.mutate('emp-123');

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBe(true);
    expect(companiesApi.removeCompanyEmployee).toHaveBeenCalledWith('emp-123');
  });

  it('should handle error when removing employee', async () => {
    (companiesApi.removeCompanyEmployee as jest.Mock).mockResolvedValue(false);

    const { result } = renderHook(
      () => useRemoveCompanyEmployee(),
      { wrapper: createWrapper() }
    );

    result.current.mutate('emp-123');

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBe(false);
  });
});