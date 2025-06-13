import { companiesApi } from '@/features/companies/api/companiesApi';
import { CompanyEmployee } from '../../types';
import { supabase } from '../../api/supabaseUtils';

// Mock the supabaseUtils to properly mock supabase
jest.mock('../../api/supabaseUtils', () => ({
  supabase: {
    from: jest.fn()
  },
  handleSupabaseError: jest.fn()
}));

describe('CompaniesApi - Employee Management', () => {
  const mockSupabaseFrom = supabase.from as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addCompanyEmployee', () => {
    it('should add a new company employee with minimal data', async () => {
      const mockData = {
        id: 'emp-123',
        company_id: 'comp-456',
        member_id: 'mem-789',
        role: null,
        department: null,
        start_date: '2024-01-01',
        end_date: null,
        is_current: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: null,
        member: null
      };

      mockSupabaseFrom.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockData, error: null })
          })
        })
      });

      const result = await companiesApi.addCompanyEmployee('comp-456', 'mem-789');

      expect(result).toBeTruthy();
      expect(result?.company_id).toBe('comp-456');
      expect(result?.member_id).toBe('mem-789');
      expect(result?.is_current).toBe(true);
      expect(mockSupabaseFrom).toHaveBeenCalledWith('company_employees');
    });

    it('should add a company employee with full data', async () => {
      const employeeData = {
        role: 'Senior Developer',
        department: 'Engineering',
        start_date: '2023-06-01',
        is_current: true
      };

      const mockData = {
        id: 'emp-123',
        company_id: 'comp-456',
        member_id: 'mem-789',
        ...employeeData,
        end_date: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: null,
        member: {
          id: 'mem-789',
          name: 'John Doe',
          title: 'Software Engineer',
          image: 'https://example.com/john.jpg',
          created_at: '2023-01-01T00:00:00Z',
          status: 'published',
          featured: false
        }
      };

      mockSupabaseFrom.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockData, error: null })
          })
        })
      });

      const result = await companiesApi.addCompanyEmployee('comp-456', 'mem-789', employeeData);

      expect(result).toBeTruthy();
      expect(result?.role).toBe('Senior Developer');
      expect(result?.department).toBe('Engineering');
      expect(result?.start_date).toBe('2023-06-01');
      expect(result?.member).toBeDefined();
      expect(result?.member?.name).toBe('John Doe');
    });

    it('should handle errors when adding company employee', async () => {
      mockSupabaseFrom.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' }
            })
          })
        })
      });

      const result = await companiesApi.addCompanyEmployee('comp-456', 'mem-789');

      expect(result).toBeNull();
    });
  });

  describe('updateCompanyEmployee', () => {
    it('should update employee role and department', async () => {
      const updates = {
        role: 'Lead Developer',
        department: 'Engineering'
      };

      const mockData = {
        id: 'emp-123',
        company_id: 'comp-456',
        member_id: 'mem-789',
        role: 'Lead Developer',
        department: 'Engineering',
        start_date: '2023-06-01',
        is_current: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
        member: null
      };

      mockSupabaseFrom.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockData, error: null })
            })
          })
        })
      });

      const result = await companiesApi.updateCompanyEmployee('emp-123', updates);

      expect(result).toBeTruthy();
      expect(result?.role).toBe('Lead Developer');
      expect(result?.department).toBe('Engineering');
      expect(mockSupabaseFrom).toHaveBeenCalledWith('company_employees');
    });

    it('should update employee end date when marked as not current', async () => {
      const updates = {
        is_current: false,
        end_date: '2024-12-31'
      };

      const mockData = {
        id: 'emp-123',
        company_id: 'comp-456',
        member_id: 'mem-789',
        role: 'Developer',
        is_current: false,
        end_date: '2024-12-31',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z'
      };

      mockSupabaseFrom.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockData, error: null })
            })
          })
        })
      });

      const result = await companiesApi.updateCompanyEmployee('emp-123', updates);

      expect(result).toBeTruthy();
      expect(result?.is_current).toBe(false);
      expect(result?.end_date).toBe('2024-12-31');
    });

    it('should handle errors when updating company employee', async () => {
      mockSupabaseFrom.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Update failed' }
              })
            })
          })
        })
      });

      const result = await companiesApi.updateCompanyEmployee('emp-123', { role: 'New Role' });

      expect(result).toBeNull();
    });
  });

  describe('removeCompanyEmployee', () => {
    it('should remove a company employee', async () => {
      mockSupabaseFrom.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null })
        })
      });

      const result = await companiesApi.removeCompanyEmployee('emp-123');

      expect(result).toBe(true);
      expect(mockSupabaseFrom).toHaveBeenCalledWith('company_employees');
    });

    it('should return false on error when removing employee', async () => {
      mockSupabaseFrom.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: { message: 'Delete failed' } })
        })
      });

      const result = await companiesApi.removeCompanyEmployee('emp-123');

      expect(result).toBe(false);
    });
  });

  describe('getCompanyEmployees', () => {
    it('should get all employees for a company', async () => {
      const mockData = [
        {
          id: 'emp-123',
          company_id: 'comp-456',
          member_id: 'mem-789',
          role: 'Developer',
          department: 'Engineering',
          is_current: true,
          created_at: '2024-01-01T00:00:00Z',
          member: {
            id: 'mem-789',
            name: 'John Doe',
            title: 'Software Engineer',
            image: 'https://example.com/john.jpg',
            status: 'published'
          }
        },
        {
          id: 'emp-124',
          company_id: 'comp-456',
          member_id: 'mem-790',
          role: 'Designer',
          department: 'Design',
          is_current: true,
          created_at: '2024-01-02T00:00:00Z',
          member: {
            id: 'mem-790',
            name: 'Jane Smith',
            title: 'UI Designer',
            image: 'https://example.com/jane.jpg',
            status: 'published'
          }
        }
      ];

      mockSupabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: mockData, error: null })
          })
        })
      });

      const result = await companiesApi.getCompanyEmployees('comp-456');

      expect(result).toHaveLength(2);
      expect(result[0].member?.name).toBe('John Doe');
      expect(result[1].member?.name).toBe('Jane Smith');
    });

    it('should filter by current employees only', async () => {
      const mockData = [
        {
          id: 'emp-123',
          company_id: 'comp-456',
          member_id: 'mem-789',
          role: 'Developer',
          is_current: true,
          created_at: '2024-01-01T00:00:00Z'
        }
      ];

      mockSupabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockImplementation(function() {
            return {
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({ data: mockData, error: null })
              })
            };
          })
        })
      });

      const result = await companiesApi.getCompanyEmployees('comp-456', { currentOnly: true });

      expect(result).toHaveLength(1);
      expect(result[0].is_current).toBe(true);
    });

    it('should filter by department', async () => {
      const mockData = [
        {
          id: 'emp-123',
          company_id: 'comp-456',
          member_id: 'mem-789',
          role: 'Developer',
          department: 'Engineering',
          is_current: true,
          created_at: '2024-01-01T00:00:00Z'
        }
      ];

      mockSupabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockImplementation(function() {
            return {
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({ data: mockData, error: null })
              })
            };
          })
        })
      });

      const result = await companiesApi.getCompanyEmployees('comp-456', { department: 'Engineering' });

      expect(result).toHaveLength(1);
      expect(result[0].department).toBe('Engineering');
    });

    it('should return empty array on error', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Query failed' }
            })
          })
        })
      });

      const result = await companiesApi.getCompanyEmployees('comp-456');

      expect(result).toEqual([]);
    });
  });
});