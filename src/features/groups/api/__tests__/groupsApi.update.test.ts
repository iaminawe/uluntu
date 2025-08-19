import { describe, it, expect, beforeEach, vi } from 'vitest';
import { groupsApi } from '../groupsApi';
import { supabase } from '../../../../shared/api/client';

// Mock the supabase client
vi.mock('../../../../shared/api/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn()
        })),
        single: vi.fn()
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn()
        }))
      }))
    }))
  }
}));

describe('groupsApi.update', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle RLS blocking SELECT after successful update', async () => {
    const mockId = 'test-group-id';
    const mockGroupData = {
      name: 'Test Group',
      description: 'Test Description'
    };

    let callCount = 0;
    // Mock the verification query to succeed, update to succeed, but SELECT to return no data
    const mockFrom = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // First call - verification
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { id: mockId },
                error: null
              })
            })
          })
        };
      } else if (callCount === 2) {
        // Second call - update
        return {
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              error: null
            })
          })
        };
      } else {
        // Third call - select after update
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: null, // RLS blocks this
                error: null
              })
            })
          })
        };
      }
    });

    (supabase.from as any).mockImplementation(mockFrom);

    const result = await groupsApi.update(mockId, mockGroupData);
    
    // Should successfully return a fallback response when RLS blocks SELECT
    expect(result).toBeTruthy();
    expect(result?.name).toBe('Test Group');
    expect(result?.description).toBe('Test Description');
  });

  it('should handle group not found error', async () => {
    const mockId = 'non-existent-group-id';
    const mockGroupData = {
      name: 'Test Group',
      description: 'Test Description'
    };

    // Mock the verification query to return no data
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: null
          })
        })
      })
    });

    (supabase.from as any).mockReturnValue(mockFrom());

    await expect(groupsApi.update(mockId, mockGroupData)).rejects.toThrow(
      `Group with id ${mockId} not found or you don't have access to it`
    );
  });
});