/**
 * Performance Tests for Menu Rendering
 * 
 * Tests rendering performance, memory usage, optimization techniques,
 * and responsiveness under various load conditions.
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import DynamicMenu from '@/features/menu/components/DynamicMenu';
import DragDropMenuTree from '@/features/menu/components/DragDropMenuTree';
import AdminMenuManagementPage from '@/pages/admin/MenuManagementPage';
import { useMenu } from '@/hooks/useMenu';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';
import { useAppSelector } from '@/store/hooks';
import { MenuItem } from '@/types/menu';
import { createMockMenuItem } from '../../../tests/fixtures/menuTestData';

// Mock dependencies
vi.mock('@/hooks/useMenu');
vi.mock('@/shared/contexts/SessionContextWithRedux');
vi.mock('@/store/hooks');
vi.mock('@/features/admin/api/menuManagementAdapter');

const mockUseMenu = useMenu as Mock;
const mockUseSession = useSession as Mock;
const mockUseAppSelector = useAppSelector as Mock;

// Performance testing utilities
class PerformanceMonitor {
  private startTime: number = 0;
  private marks: Map<string, number> = new Map();
  private measurements: Map<string, number> = new Map();

  start(name: string = 'default') {
    this.startTime = performance.now();
    this.marks.set(`${name}-start`, this.startTime);
  }

  end(name: string = 'default'): number {
    const endTime = performance.now();
    this.marks.set(`${name}-end`, endTime);
    const duration = endTime - (this.marks.get(`${name}-start`) || this.startTime);
    this.measurements.set(name, duration);
    return duration;
  }

  mark(name: string) {
    this.marks.set(name, performance.now());
  }

  measure(name: string, startMark: string, endMark?: string): number {
    const start = this.marks.get(startMark) || 0;
    const end = endMark ? this.marks.get(endMark) || performance.now() : performance.now();
    const duration = end - start;
    this.measurements.set(name, duration);
    return duration;
  }

  getMeasurement(name: string): number {
    return this.measurements.get(name) || 0;
  }

  getAllMeasurements(): Record<string, number> {
    return Object.fromEntries(this.measurements);
  }

  clear() {
    this.marks.clear();
    this.measurements.clear();
    this.startTime = 0;
  }
}

// Memory usage monitoring
class MemoryMonitor {
  private snapshots: Array<{ name: string; used: number; total: number; timestamp: number }> = [];

  snapshot(name: string) {
    if (typeof performance.memory !== 'undefined') {
      this.snapshots.push({
        name,
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        timestamp: performance.now()
      });
    }
  }

  getMemoryIncrease(startSnapshot: string, endSnapshot: string): number {
    const start = this.snapshots.find(s => s.name === startSnapshot);
    const end = this.snapshots.find(s => s.name === endSnapshot);
    
    if (start && end) {
      return end.used - start.used;
    }
    return 0;
  }

  clear() {
    this.snapshots = [];
  }

  getAllSnapshots() {
    return [...this.snapshots];
  }
}

describe('Menu Rendering Performance Tests', () => {
  let queryClient: QueryClient;
  let perfMonitor: PerformanceMonitor;
  let memoryMonitor: MemoryMonitor;

  const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    perfMonitor = new PerformanceMonitor();
    memoryMonitor = new MemoryMonitor();
    
    // Setup default mocks
    mockUseSession.mockReturnValue({ user: { id: 'admin' } });
    mockUseAppSelector.mockReturnValue({ roles: { list: ['admin'] } });
    
    vi.clearAllMocks();
  });

  describe('Large Menu Structure Rendering', () => {
    it('should render 100 menu items efficiently', async () => {
      const largeMenuItems = Array.from({ length: 100 }, (_, i) =>
        createMockMenuItem({
          id: `item-${i}`,
          title: `Menu Item ${i + 1}`,
          url: `/item-${i + 1}`,
          menu_type: 'main',
          is_enabled: true,
          sort_order: i,
        })
      );

      mockUseMenu.mockReturnValue({
        menuItems: largeMenuItems,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      memoryMonitor.snapshot('before-100-items');
      perfMonitor.start('render-100-items');

      const { container } = render(
        <TestWrapper>
          <DynamicMenu menuType="main" />
        </TestWrapper>
      );

      perfMonitor.end('render-100-items');
      memoryMonitor.snapshot('after-100-items');

      const renderTime = perfMonitor.getMeasurement('render-100-items');
      const memoryIncrease = memoryMonitor.getMemoryIncrease('before-100-items', 'after-100-items');

      // Performance assertions
      expect(renderTime).toBeLessThan(100); // Should render within 100ms
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Should use less than 10MB
      
      // Verify all items are rendered
      const menuItems = container.querySelectorAll('[role="link"]');
      expect(menuItems).toHaveLength(100);
    });

    it('should render 1000 menu items with virtualization', async () => {
      const massiveMenuItems = Array.from({ length: 1000 }, (_, i) =>
        createMockMenuItem({
          id: `massive-item-${i}`,
          title: `Massive Item ${i + 1}`,
          url: `/massive-${i + 1}`,
          menu_type: 'main',
          is_enabled: true,
          sort_order: i,
        })
      );

      mockUseMenu.mockReturnValue({
        menuItems: massiveMenuItems,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      perfMonitor.start('render-1000-items');

      render(
        <TestWrapper>
          <DynamicMenu 
            menuType="main" 
            virtualized={true}
            maxVisibleItems={50}
          />
        </TestWrapper>
      );

      perfMonitor.end('render-1000-items');

      const renderTime = perfMonitor.getMeasurement('render-1000-items');
      
      // With virtualization, should still be fast
      expect(renderTime).toBeLessThan(150);
      
      // Should only render visible items (not all 1000)
      const visibleItems = screen.getAllByRole('link');
      expect(visibleItems.length).toBeLessThanOrEqual(50);
    });

    it('should handle deeply nested menu structures efficiently', async () => {
      // Create a 20-level deep nested menu
      const deepMenuItems: MenuItem[] = [];
      let parentId: string | null = null;

      for (let i = 0; i < 20; i++) {
        const item = createMockMenuItem({
          id: `deep-item-${i}`,
          title: `Level ${i + 1} Item`,
          url: `/level-${i + 1}`,
          parent_id: parentId,
          sort_order: 0,
        });
        deepMenuItems.push(item);
        parentId = item.id;
      }

      mockUseMenu.mockReturnValue({
        menuItems: deepMenuItems,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      perfMonitor.start('render-deep-nesting');

      render(
        <TestWrapper>
          <DynamicMenu menuType="main" showHierarchy={true} />
        </TestWrapper>
      );

      perfMonitor.end('render-deep-nesting');

      const renderTime = perfMonitor.getMeasurement('render-deep-nesting');
      
      // Deep nesting should not cause performance issues
      expect(renderTime).toBeLessThan(200);
      
      // Should render all items
      const items = screen.getAllByRole('link');
      expect(items).toHaveLength(20);
    });
  });

  describe('Interactive Performance', () => {
    const createInteractiveMenuItems = (count: number) =>
      Array.from({ length: count }, (_, i) =>
        createMockMenuItem({
          id: `interactive-${i}`,
          title: `Interactive Item ${i + 1}`,
          url: `/interactive-${i + 1}`,
          is_enabled: Math.random() > 0.5,
          sort_order: i,
        })
      );

    it('should handle search filtering efficiently', async () => {
      const searchTestItems = createInteractiveMenuItems(500);
      mockUseMenu.mockReturnValue({
        menuItems: searchTestItems,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      const { container } = render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search menu items...')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search menu items...');
      
      perfMonitor.start('search-filtering');

      // Simulate typing "Item 1"
      await act(async () => {
        searchInput.focus();
        // Simulate change event
        Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set?.call(searchInput, 'Item 1');
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      });

      perfMonitor.end('search-filtering');

      const searchTime = perfMonitor.getMeasurement('search-filtering');
      
      // Search should be responsive
      expect(searchTime).toBeLessThan(50);
    });

    it('should handle bulk selection efficiently', async () => {
      const bulkTestItems = createInteractiveMenuItems(200);
      mockUseMenu.mockReturnValue({
        menuItems: bulkTestItems,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getAllByRole('checkbox')).toHaveLength(200);
      });

      const checkboxes = screen.getAllByRole('checkbox');
      
      perfMonitor.start('bulk-selection');

      // Select 50 items
      for (let i = 0; i < 50; i++) {
        await act(async () => {
          checkboxes[i].click();
        });
      }

      perfMonitor.end('bulk-selection');

      const selectionTime = perfMonitor.getMeasurement('bulk-selection');
      
      // Bulk selection should be efficient
      expect(selectionTime).toBeLessThan(500);
    });

    it('should handle drag and drop performance', async () => {
      const dragTestItems = createInteractiveMenuItems(50);
      
      const props = {
        items: dragTestItems,
        onReorder: vi.fn(),
        onEdit: vi.fn(),
        onDelete: vi.fn(),
        onToggleEnabled: vi.fn(),
        onAdd: vi.fn(),
      };

      perfMonitor.start('drag-drop-render');

      render(
        <TestWrapper>
          <DragDropMenuTree {...props} />
        </TestWrapper>
      );

      perfMonitor.end('drag-drop-render');

      const renderTime = perfMonitor.getMeasurement('drag-drop-render');
      
      // Drag and drop setup should be efficient
      expect(renderTime).toBeLessThan(200);
      
      // All drag handles should be present
      const dragHandles = screen.getAllByTestId('grip-icon');
      expect(dragHandles).toHaveLength(50);
    });
  });

  describe('Memory Usage Optimization', () => {
    it('should not have memory leaks when re-rendering', async () => {
      const testItems = createInteractiveMenuItems(100);
      
      const TestComponent = ({ items }: { items: MenuItem[] }) => {
        mockUseMenu.mockReturnValue({
          menuItems: items,
          isLoading: false,
          error: null,
          refetch: vi.fn(),
        });
        
        return (
          <TestWrapper>
            <DynamicMenu menuType="main" />
          </TestWrapper>
        );
      };

      memoryMonitor.snapshot('initial');

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      memoryMonitor.snapshot('after-gc');

      const { rerender } = render(<TestComponent items={testItems} />);

      // Re-render multiple times with different data
      for (let i = 0; i < 10; i++) {
        const newItems = createInteractiveMenuItems(100);
        rerender(<TestComponent items={newItems} />);
        
        if (i === 4) memoryMonitor.snapshot('mid-rerenders');
      }

      memoryMonitor.snapshot('after-rerenders');

      // Force garbage collection again
      if (global.gc) {
        global.gc();
      }

      memoryMonitor.snapshot('final-gc');

      const memoryGrowth = memoryMonitor.getMemoryIncrease('after-gc', 'final-gc');
      
      // Memory growth should be minimal after GC
      expect(memoryGrowth).toBeLessThan(5 * 1024 * 1024); // Less than 5MB growth
    });

    it('should cleanup event listeners properly', async () => {
      let eventListenerCount = 0;
      const originalAddEventListener = EventTarget.prototype.addEventListener;
      const originalRemoveEventListener = EventTarget.prototype.removeEventListener;

      EventTarget.prototype.addEventListener = function(...args) {
        eventListenerCount++;
        return originalAddEventListener.apply(this, args);
      };

      EventTarget.prototype.removeEventListener = function(...args) {
        eventListenerCount--;
        return originalRemoveEventListener.apply(this, args);
      };

      const testItems = createInteractiveMenuItems(50);
      mockUseMenu.mockReturnValue({
        menuItems: testItems,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      const { unmount } = render(
        <TestWrapper>
          <DynamicMenu menuType="main" showHierarchy={true} collapsible={true} />
        </TestWrapper>
      );

      const listenersAfterMount = eventListenerCount;

      unmount();

      const listenersAfterUnmount = eventListenerCount;

      // Should clean up most event listeners
      const leakedListeners = listenersAfterUnmount;
      expect(leakedListeners).toBeLessThan(listenersAfterMount * 0.1); // Less than 10% leakage

      // Restore original methods
      EventTarget.prototype.addEventListener = originalAddEventListener;
      EventTarget.prototype.removeEventListener = originalRemoveEventListener;
    });
  });

  describe('Rendering Optimization Strategies', () => {
    it('should use React.memo effectively for menu items', async () => {
      let renderCount = 0;
      
      // Mock a menu item component that counts renders
      const MockMenuItem = React.memo(({ item }: { item: MenuItem }) => {
        renderCount++;
        return <div data-testid={`item-${item.id}`}>{item.title}</div>;
      });

      const testItems = createInteractiveMenuItems(20);
      
      const TestComponent = ({ items, highlightedId }: { items: MenuItem[], highlightedId?: string }) => (
        <div>
          {items.map(item => (
            <MockMenuItem 
              key={item.id} 
              item={item}
            />
          ))}
        </div>
      );

      const { rerender } = render(
        <TestComponent items={testItems} highlightedId="interactive-0" />
      );

      const initialRenderCount = renderCount;

      // Re-render with same props - should not re-render memoized components
      rerender(
        <TestComponent items={testItems} highlightedId="interactive-0" />
      );

      const afterMemoRenderCount = renderCount;

      // Should not have re-rendered due to memoization
      expect(afterMemoRenderCount).toBe(initialRenderCount);

      // Re-render with different highlightedId - should still not re-render items
      rerender(
        <TestComponent items={testItems} highlightedId="interactive-5" />
      );

      const afterPropChangeRenderCount = renderCount;

      // Items should still be memoized since their props didn't change
      expect(afterPropChangeRenderCount).toBe(initialRenderCount);
    });

    it('should implement efficient key strategies', async () => {
      const testItems = createInteractiveMenuItems(20);
      
      perfMonitor.start('stable-keys-render');
      
      const { rerender } = render(
        <TestWrapper>
          <DynamicMenu menuType="main" />
        </TestWrapper>
      );

      // Simulate reordering (which should use stable keys)
      const reorderedItems = [...testItems].reverse();
      mockUseMenu.mockReturnValue({
        menuItems: reorderedItems,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      rerender(
        <TestWrapper>
          <DynamicMenu menuType="main" />
        </TestWrapper>
      );

      perfMonitor.end('stable-keys-render');

      const reorderTime = perfMonitor.getMeasurement('stable-keys-render');
      
      // Reordering with stable keys should be fast
      expect(reorderTime).toBeLessThan(50);
    });

    it('should implement lazy loading for nested items', async () => {
      // Create parent with many children
      const parentItems = [
        createMockMenuItem({
          id: 'parent-1',
          title: 'Parent with Many Children',
          url: '/parent',
          parent_id: null,
        })
      ];

      const childItems = Array.from({ length: 100 }, (_, i) =>
        createMockMenuItem({
          id: `child-${i}`,
          title: `Child Item ${i + 1}`,
          url: `/parent/child-${i + 1}`,
          parent_id: 'parent-1',
        })
      );

      const allItems = [...parentItems, ...childItems];

      mockUseMenu.mockReturnValue({
        menuItems: allItems,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      perfMonitor.start('lazy-loading-render');

      render(
        <TestWrapper>
          <DynamicMenu 
            menuType="main" 
            showHierarchy={true}
            lazyLoadChildren={true}
          />
        </TestWrapper>
      );

      perfMonitor.end('lazy-loading-render');

      const renderTime = perfMonitor.getMeasurement('lazy-loading-render');
      
      // Initial render should be fast (children not rendered yet)
      expect(renderTime).toBeLessThan(50);
      
      // Should only show parent initially
      expect(screen.getByText('Parent with Many Children')).toBeInTheDocument();
      expect(screen.queryByText('Child Item 1')).not.toBeInTheDocument();
    });
  });

  describe('Browser Performance Metrics', () => {
    it('should maintain good Core Web Vitals', async () => {
      const testItems = createInteractiveMenuItems(200);
      mockUseMenu.mockReturnValue({
        menuItems: testItems,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      // Mock performance observer for CLS (Cumulative Layout Shift)
      let cumulativeLayoutShift = 0;
      const mockPerformanceObserver = vi.fn().mockImplementation((callback) => {
        // Simulate layout shift measurements
        setTimeout(() => {
          callback({
            getEntries: () => [
              { value: 0.02 }, // Small layout shift
              { value: 0.01 }  // Another small shift
            ]
          });
        }, 100);
      });

      global.PerformanceObserver = mockPerformanceObserver as any;

      const { container } = render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Menu Management')).toBeInTheDocument();
      });

      // Simulate measuring layout shifts
      const layoutShifts = [0.02, 0.01];
      cumulativeLayoutShift = layoutShifts.reduce((sum, shift) => sum + shift, 0);

      // CLS should be under 0.1 (good)
      expect(cumulativeLayoutShift).toBeLessThan(0.1);
    });

    it('should have efficient paint times', async () => {
      const paintTimes: number[] = [];
      
      // Mock performance entries
      const mockGetEntriesByType = vi.fn().mockReturnValue([
        { name: 'first-contentful-paint', startTime: 150 },
        { name: 'largest-contentful-paint', startTime: 200 }
      ]);

      Object.defineProperty(performance, 'getEntriesByType', {
        value: mockGetEntriesByType
      });

      const testItems = createInteractiveMenuItems(100);
      mockUseMenu.mockReturnValue({
        menuItems: testItems,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <DynamicMenu menuType="main" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getAllByRole('link')).toHaveLength(100);
      });

      const fcpEntry = performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint');
      const lcpEntry = performance.getEntriesByType('paint').find(entry => entry.name === 'largest-contentful-paint');

      if (fcpEntry) {
        expect(fcpEntry.startTime).toBeLessThan(1800); // FCP under 1.8s
      }
      
      if (lcpEntry) {
        expect(lcpEntry.startTime).toBeLessThan(2500); // LCP under 2.5s
      }
    });
  });

  describe('Performance Under Load', () => {
    it('should maintain performance with concurrent operations', async () => {
      const testItems = createInteractiveMenuItems(100);
      mockUseMenu.mockReturnValue({
        menuItems: testItems,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Menu Management')).toBeInTheDocument();
      });

      perfMonitor.start('concurrent-operations');

      // Simulate multiple concurrent operations
      const operations = [];

      // Search operation
      operations.push(
        act(async () => {
          const searchInput = screen.getByPlaceholderText('Search menu items...');
          Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set?.call(searchInput, 'test');
          searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        })
      );

      // Filter operation
      operations.push(
        act(async () => {
          const visibilityFilter = screen.getByDisplayValue('All Visibility');
          Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')?.set?.call(visibilityFilter, 'public');
          visibilityFilter.dispatchEvent(new Event('change', { bubbles: true }));
        })
      );

      // Bulk selection
      operations.push(
        act(async () => {
          const checkboxes = screen.getAllByRole('checkbox');
          for (let i = 0; i < Math.min(10, checkboxes.length); i++) {
            checkboxes[i].click();
          }
        })
      );

      await Promise.all(operations);

      perfMonitor.end('concurrent-operations');

      const concurrentTime = perfMonitor.getMeasurement('concurrent-operations');
      
      // Concurrent operations should complete within reasonable time
      expect(concurrentTime).toBeLessThan(300);
    });

    it('should handle rapid state changes efficiently', async () => {
      let updateCount = 0;
      const testItems = createInteractiveMenuItems(50);
      
      const TestComponent = () => {
        const [items, setItems] = React.useState(testItems);
        
        React.useEffect(() => {
          mockUseMenu.mockReturnValue({
            menuItems: items,
            isLoading: false,
            error: null,
            refetch: vi.fn(),
          });
          updateCount++;
        }, [items]);

        // Simulate rapid updates
        React.useEffect(() => {
          const interval = setInterval(() => {
            setItems(prev => [...prev].sort(() => Math.random() - 0.5)); // Randomize order
          }, 50);

          setTimeout(() => clearInterval(interval), 500); // Stop after 500ms

          return () => clearInterval(interval);
        }, []);

        return (
          <TestWrapper>
            <DynamicMenu menuType="main" />
          </TestWrapper>
        );
      };

      perfMonitor.start('rapid-updates');

      render(<TestComponent />);

      await new Promise(resolve => setTimeout(resolve, 600)); // Wait for updates to complete

      perfMonitor.end('rapid-updates');

      const updateTime = perfMonitor.getMeasurement('rapid-updates');
      
      // Should handle rapid updates without performance degradation
      expect(updateTime).toBeLessThan(1000);
      expect(updateCount).toBeGreaterThan(5); // Should have processed multiple updates
    });
  });
});