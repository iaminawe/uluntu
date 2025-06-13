import { CompanyEmployee } from '../../types';
import { Member } from '../../types';

describe('CompanyEmployee Type Tests', () => {
  describe('Type Structure', () => {
    it('should have all required fields', () => {
      const employee: CompanyEmployee = {
        id: 'emp-123',
        company_id: 'comp-456',
        member_id: 'mem-789',
        created_at: '2024-01-01T00:00:00Z'
      };

      expect(employee.id).toBeDefined();
      expect(employee.company_id).toBeDefined();
      expect(employee.member_id).toBeDefined();
      expect(employee.created_at).toBeDefined();
    });

    it('should accept optional fields', () => {
      const employee: CompanyEmployee = {
        id: 'emp-123',
        company_id: 'comp-456',
        member_id: 'mem-789',
        role: 'Software Engineer',
        department: 'Engineering',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        is_current: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z'
      };

      expect(employee.role).toBe('Software Engineer');
      expect(employee.department).toBe('Engineering');
      expect(employee.start_date).toBe('2024-01-01');
      expect(employee.end_date).toBe('2024-12-31');
      expect(employee.is_current).toBe(false);
      expect(employee.updated_at).toBe('2024-01-02T00:00:00Z');
    });

    it('should include optional member relation', () => {
      const mockMember: Member = {
        id: 'mem-789',
        name: 'John Doe',
        title: 'Software Engineer',
        image: 'https://example.com/john.jpg',
        joinDate: '2023-01-01',
        status: 'published',
        created_at: '2023-01-01T00:00:00Z',
        featured: false
      };

      const employee: CompanyEmployee = {
        id: 'emp-123',
        company_id: 'comp-456',
        member_id: 'mem-789',
        created_at: '2024-01-01T00:00:00Z',
        member: mockMember
      };

      expect(employee.member).toBeDefined();
      expect(employee.member?.id).toBe('mem-789');
      expect(employee.member?.name).toBe('John Doe');
    });
  });

  describe('Type Guards', () => {
    it('should validate CompanyEmployee type guard', () => {
      const isCompanyEmployee = (obj: any): obj is CompanyEmployee => {
        return !!(obj &&
          typeof obj.id === 'string' &&
          typeof obj.company_id === 'string' &&
          typeof obj.member_id === 'string' &&
          typeof obj.created_at === 'string' &&
          (obj.role === undefined || typeof obj.role === 'string') &&
          (obj.department === undefined || typeof obj.department === 'string') &&
          (obj.start_date === undefined || typeof obj.start_date === 'string') &&
          (obj.end_date === undefined || typeof obj.end_date === 'string') &&
          (obj.is_current === undefined || typeof obj.is_current === 'boolean') &&
          (obj.updated_at === undefined || typeof obj.updated_at === 'string') &&
          (obj.member === undefined || (obj.member && typeof obj.member.id === 'string')));
      };

      const validEmployee = {
        id: 'emp-123',
        company_id: 'comp-456',
        member_id: 'mem-789',
        created_at: '2024-01-01T00:00:00Z'
      };

      const invalidEmployee = {
        id: 123, // Should be string
        company_id: 'comp-456',
        member_id: 'mem-789',
        created_at: '2024-01-01T00:00:00Z'
      };

      expect(isCompanyEmployee(validEmployee)).toBe(true);
      expect(isCompanyEmployee(invalidEmployee)).toBe(false);
      expect(isCompanyEmployee(null)).toBe(false);
      expect(isCompanyEmployee(undefined)).toBe(false);
    });
  });
});