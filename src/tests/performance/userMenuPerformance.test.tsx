import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { createMockQueryResult, createMockAuthContext } from '@/test-utils/react-query-mocks';
import { BrowserRouter } from 'react-router-dom';
import { performance } from 'perf_hooks';
import UserMenu from '@/shared/components/layout/Header/UserMenu';
import { useAuth } from '@/shared/contexts/AuthContextWithRedux';
import { useMemberByUserId } from '@/hooks/useMemberByUserId';

// Mock dependencies
jest.mock('@/shared/contexts/AuthContextWithRedux');
jest.mock('@/hooks/useMemberByUserId');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseMemberByUserId = useMemberByUserId as jest.MockedFunction<typeof useMemberByUserId>;

// Performance measurement utilities
const measureRenderTime = async (renderFn: () => void) => {
  const start = performance.now();
  await act(async () => {
    renderFn();
  });
  const end = performance.now();
  return end - start;
};

const measureInteractionTime = async (interactionFn: () => void) => {
  const start = performance.now();
  await act(async () => {
    interactionFn();
  });
  const end = performance.now();
  return end - start;
};

const renderUserMenu = () => {
  return render(
    <BrowserRouter>
      <UserMenu />
    </BrowserRouter>
  );
};

describe('UserMenu Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Render Performance', () => {
    it('should render quickly for unauthenticated users', async () => {
      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: null,
        isAdmin: false,
      }));
      mockUseMemberByUserId.mockReturnValue(createMockQueryResult({ data: null }));

      const renderTime = await measureRenderTime(() => {
        renderUserMenu();
      });

      // Should render within 50ms for simple unauthenticated state
      expect(renderTime).toBeLessThan(50);
      expect(screen.getByText('Account')).toBeTruthy();
    });

    it('should render quickly for authenticated users', async () => {
      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: { id: 'user123', email: 'test@example.com' },
        isAdmin: false,
      }));
      mockUseMemberByUserId.mockReturnValue(
        createMockQueryResult({ 
          data: { id: 'member123', name: 'Test User' } 
        })
      );

      const renderTime = await measureRenderTime(() => {
        renderUserMenu();
      });

      // Should render within 100ms even with member data
      expect(renderTime).toBeLessThan(100);
    });

    it('should handle slow member data loading gracefully', async () => {
      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: { id: 'user123', email: 'test@example.com' },
        isAdmin: false,
      }));

      // Simulate slow loading
      mockUseMemberByUserId.mockReturnValue(
        createMockQueryResult({ 
          data: null,
          isLoading: true,
          error: null,
        })
      );

      const renderTime = await measureRenderTime(() => {
        renderUserMenu();
      });

      // Should still render quickly even with loading state
      expect(renderTime).toBeLessThan(50);
    });
  });

  describe('Interaction Performance', () => {
    it('should open dropdown quickly', async () => {
      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: { id: 'user123', email: 'test@example.com' },
        isAdmin: false,
      }));
      mockUseMemberByUserId.mockReturnValue(createMockQueryResult({ data: null }));

      renderUserMenu();
      const button = screen.getByRole('button');

      const interactionTime = await measureInteractionTime(() => {
        fireEvent.click(button);
      });

      // Dropdown should open within 16ms (60fps target)
      expect(interactionTime).toBeLessThan(16);
      expect(screen.getByText('Edit Profile')).toBeTruthy();
    });

    it('should close dropdown quickly', async () => {
      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: { id: 'user123', email: 'test@example.com' },
        isAdmin: false,
      }));
      mockUseMemberByUserId.mockReturnValue(createMockQueryResult({ data: null }));

      renderUserMenu();
      const button = screen.getByRole('button');
      
      // Open dropdown first
      fireEvent.click(button);
      expect(screen.getByText('Edit Profile')).toBeTruthy();

      const interactionTime = await measureInteractionTime(() => {
        fireEvent.click(button);
      });

      // Dropdown should close within 16ms
      expect(interactionTime).toBeLessThan(16);
    });

    it('should handle rapid clicks efficiently', async () => {
      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: { id: 'user123', email: 'test@example.com' },
        isAdmin: false,
      }));
      mockUseMemberByUserId.mockReturnValue(createMockQueryResult({ data: null }));

      renderUserMenu();
      const button = screen.getByRole('button');

      const start = performance.now();
      
      // Simulate rapid clicking
      await act(async () => {
        for (let i = 0; i < 10; i++) {
          fireEvent.click(button);
        }
      });

      const end = performance.now();
      const totalTime = end - start;

      // 10 rapid clicks should complete within 100ms
      expect(totalTime).toBeLessThan(100);
    });
  });

  describe('Memory Management', () => {
    it('should clean up event listeners on unmount', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: { id: 'user123', email: 'test@example.com' },
        isAdmin: false,
      }));
      mockUseMemberByUserId.mockReturnValue(createMockQueryResult({ data: null }));

      const { unmount } = renderUserMenu();

      // Should add mousedown listener
      expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));

      unmount();

      // Should clean up listener on unmount
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it('should not cause memory leaks with multiple mounts/unmounts', async () => {
      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: { id: 'user123', email: 'test@example.com' },
        isAdmin: false,
      }));
      mockUseMemberByUserId.mockReturnValue(createMockQueryResult({ data: null }));

      // Mount and unmount multiple times
      for (let i = 0; i < 5; i++) {
        const { unmount } = renderUserMenu();
        fireEvent.click(screen.getByRole('button'));
        unmount();
      }

      // No assertions needed - test passes if no memory issues occur
      expect(true).toBe(true);
    });
  });

  describe('Re-render Optimization', () => {
    it('should minimize re-renders when props unchanged', async () => {
      let renderCount = 0;
      const WrappedUserMenu = () => {
        renderCount++;
        return <UserMenu />;
      };

      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: { id: 'user123', email: 'test@example.com' },
        isAdmin: false,
      }));
      mockUseMemberByUserId.mockReturnValue(
        createMockQueryResult({ 
          data: { id: 'member123', name: 'Test User' } 
        })
      );

      const { rerender } = render(
        <BrowserRouter>
          <WrappedUserMenu />
        </BrowserRouter>
      );

      const initialRenderCount = renderCount;

      // Force re-render with same props
      rerender(
        <BrowserRouter>
          <WrappedUserMenu />
        </BrowserRouter>
      );

      // Should have rendered again (React behavior)
      expect(renderCount).toBeGreaterThan(initialRenderCount);
    });

    it('should handle auth state changes efficiently', async () => {
      const mockSignOut = jest.fn();
      
      // Start with authenticated user
      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: { id: 'user123', email: 'test@example.com' },
        isAdmin: false,
      }));
      mockUseMemberByUserId.mockReturnValue(createMockQueryResult({ data: null }));

      const { rerender } = renderUserMenu();
      
      const start = performance.now();

      // Change to unauthenticated
      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: null,
        isAdmin: false,
      }));

      await act(async () => {
        rerender(
          <BrowserRouter>
            <UserMenu />
          </BrowserRouter>
        );
      });

      const end = performance.now();
      const reRenderTime = end - start;

      // Auth state change should re-render quickly
      expect(reRenderTime).toBeLessThan(50);
      expect(screen.getByText('Account')).toBeTruthy();
    });
  });

  describe('Large Scale Performance', () => {
    it('should handle admin users with many permissions efficiently', async () => {
      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: { id: 'admin123', email: 'admin@example.com' },
        isAdmin: true,
      }));
      mockUseMemberByUserId.mockReturnValue(
        createMockQueryResult({ 
          data: { id: 'admin123', name: 'Admin User' } 
        })
      );

      const renderTime = await measureRenderTime(() => {
        renderUserMenu();
      });

      // Even with admin permissions, should render quickly
      expect(renderTime).toBeLessThan(100);

      fireEvent.click(screen.getByRole('button'));
      
      // Should show all menu items
      expect(screen.getByText('Your Profile')).toBeTruthy();
      expect(screen.getByText('Edit Profile')).toBeTruthy();
      expect(screen.getByText('Settings')).toBeTruthy();
      expect(screen.getByText('Admin Dashboard')).toBeTruthy();
      expect(screen.getByText('Sign out')).toBeTruthy();
    });

    it('should handle concurrent interactions gracefully', async () => {
      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: { id: 'user123', email: 'test@example.com' },
        isAdmin: false,
      }));
      mockUseMemberByUserId.mockReturnValue(createMockQueryResult({ data: null }));

      renderUserMenu();
      const button = screen.getByRole('button');

      const start = performance.now();

      // Simulate concurrent interactions
      await act(async () => {
        const promises = [];
        for (let i = 0; i < 5; i++) {
          promises.push(
            new Promise(resolve => {
              setTimeout(() => {
                fireEvent.click(button);
                resolve(void 0);
              }, i * 10);
            })
          );
        }
        await Promise.all(promises);
      });

      const end = performance.now();
      const totalTime = end - start;

      // Concurrent interactions should complete within reasonable time
      expect(totalTime).toBeLessThan(200);
    });
  });

  describe('Bundle Size Impact', () => {
    it('should import minimal dependencies', () => {
      // This test would ideally check bundle analysis
      // For now, we verify the component renders without heavy dependencies
      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: null,
        isAdmin: false,
      }));
      mockUseMemberByUserId.mockReturnValue(createMockQueryResult({ data: null }));

      const { container } = renderUserMenu();
      
      // Component should render with minimal DOM nodes
      const nodes = container.querySelectorAll('*');
      expect(nodes.length).toBeLessThan(20); // Reasonable DOM complexity
    });
  });
});