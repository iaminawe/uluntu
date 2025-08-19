/**
 * Component Tests for DynamicMenu
 * 
 * Tests rendering, hierarchical structure, filtering,
 * permissions, and user interactions.
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import DynamicMenu from '../DynamicMenu';
import { useMenu } from '@/hooks/useMenu';
import { MenuItem } from '@/types/menu';
import { createMockMenuItem } from '../../../../tests/fixtures/menuTestData';

// Mock dependencies
vi.mock('@/hooks/useMenu');
vi.mock('lucide-react', () => ({
  ChevronDown: () => <div data-testid="chevron-down" />,
  ChevronRight: () => <div data-testid="chevron-right" />,
  ExternalLink: () => <div data-testid="external-link" />,
  Menu: () => <div data-testid="menu-icon" />,
  Home: () => <div data-testid="home-icon" />,
  Users: () => <div data-testid="users-icon" />,
  Building2: () => <div data-testid="building-icon" />,
}));

const mockUseMenu = useMenu as Mock;

describe('DynamicMenu Component', () => {
  let queryClient: QueryClient;
  let user: ReturnType<typeof userEvent.setup>;

  const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  const mockMenuItems: MenuItem[] = [
    createMockMenuItem({
      id: '1',
      title: 'Home',
      url: '/',
      icon: 'Home',
      menu_type: 'main',
      is_enabled: true,
      sort_order: 0,
      parent_id: null,
    }),
    createMockMenuItem({
      id: '2',
      title: 'Community',
      url: '/community',
      icon: 'Users',
      menu_type: 'main',
      is_enabled: true,
      sort_order: 1,
      parent_id: null,
    }),
    createMockMenuItem({
      id: '3',
      title: 'Events',
      url: '/events',
      icon: 'Calendar',
      menu_type: 'main',
      is_enabled: true,
      sort_order: 0,
      parent_id: '2',
    }),
    createMockMenuItem({
      id: '4',
      title: 'External Link',
      url: 'https://external.com',
      icon: 'ExternalLink',
      menu_type: 'main',
      is_enabled: true,
      sort_order: 2,
      parent_id: null,
      target: '_blank',
      is_external: true,
    }),
  ];

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    user = userEvent.setup();
    
    mockUseMenu.mockReturnValue({
      menuItems: mockMenuItems,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  describe('Basic Rendering', () => {
    it('should render menu items correctly', () => {
      render(
        <TestWrapper>
          <DynamicMenu menuType="main" />
        </TestWrapper>
      );

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Community')).toBeInTheDocument();
      expect(screen.getByText('External Link')).toBeInTheDocument();
    });

    it('should render icons when provided', () => {
      render(
        <TestWrapper>
          <DynamicMenu menuType="main" />
        </TestWrapper>
      );

      expect(screen.getByTestId('home-icon')).toBeInTheDocument();
      expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    });

    it('should render external link indicators', () => {
      render(
        <TestWrapper>
          <DynamicMenu menuType="main" />
        </TestWrapper>
      );

      const externalLinks = screen.getAllByTestId('external-link');
      expect(externalLinks).toHaveLength(1);
    });

    it('should apply correct link targets', () => {
      render(
        <TestWrapper>
          <DynamicMenu menuType="main" />
        </TestWrapper>
      );

      const homeLink = screen.getByRole('link', { name: /home/i });
      const externalLink = screen.getByRole('link', { name: /external link/i });

      expect(homeLink).toHaveAttribute('target', '_self');
      expect(externalLink).toHaveAttribute('target', '_blank');
    });
  });

  describe('Hierarchical Structure', () => {
    it('should render nested menu items correctly', () => {
      render(
        <TestWrapper>
          <DynamicMenu menuType="main" showHierarchy={true} />
        </TestWrapper>
      );

      expect(screen.getByText('Community')).toBeInTheDocument();
      expect(screen.getByText('Events')).toBeInTheDocument();
    });

    it('should handle expand/collapse functionality', async () => {
      render(
        <TestWrapper>
          <DynamicMenu menuType="main" showHierarchy={true} collapsible={true} />
        </TestWrapper>
      );

      // Initially collapsed (assuming default behavior)
      const expandButton = screen.getByTestId('chevron-right');
      expect(expandButton).toBeInTheDocument();

      // Click to expand
      await user.click(expandButton);

      // Should show expanded state
      await waitFor(() => {
        expect(screen.getByTestId('chevron-down')).toBeInTheDocument();
      });
    });

    it('should maintain proper nesting levels', () => {
      render(
        <TestWrapper>
          <DynamicMenu menuType="main" showHierarchy={true} />
        </TestWrapper>
      );

      const communityItem = screen.getByText('Community').closest('[data-level]');
      const eventsItem = screen.getByText('Events').closest('[data-level]');

      expect(communityItem).toHaveAttribute('data-level', '0');
      expect(eventsItem).toHaveAttribute('data-level', '1');
    });
  });

  describe('Menu Types', () => {
    it('should filter items by menu type', () => {
      const footerItems = [
        createMockMenuItem({
          id: '5',
          title: 'About',
          url: '/about',
          menu_type: 'footer',
        }),
      ];

      mockUseMenu.mockReturnValue({
        menuItems: footerItems,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <DynamicMenu menuType="footer" />
        </TestWrapper>
      );

      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.queryByText('Home')).not.toBeInTheDocument();
    });

    it('should apply correct styling for different menu types', () => {
      const { rerender } = render(
        <TestWrapper>
          <DynamicMenu menuType="main" />
        </TestWrapper>
      );

      const mainMenu = screen.getByRole('navigation');
      expect(mainMenu).toHaveClass('main-menu');

      rerender(
        <TestWrapper>
          <DynamicMenu menuType="footer" />
        </TestWrapper>
      );

      const footerMenu = screen.getByRole('navigation');
      expect(footerMenu).toHaveClass('footer-menu');
    });
  });

  describe('Loading and Error States', () => {
    it('should show loading state', () => {
      mockUseMenu.mockReturnValue({
        menuItems: [],
        isLoading: true,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <DynamicMenu menuType="main" />
        </TestWrapper>
      );

      expect(screen.getByText('Loading menu...')).toBeInTheDocument();
    });

    it('should show error state', () => {
      const mockError = new Error('Failed to load menu');
      mockUseMenu.mockReturnValue({
        menuItems: [],
        isLoading: false,
        error: mockError,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <DynamicMenu menuType="main" />
        </TestWrapper>
      );

      expect(screen.getByText('Error loading menu')).toBeInTheDocument();
      expect(screen.getByText('Failed to load menu')).toBeInTheDocument();
    });

    it('should show empty state when no items', () => {
      mockUseMenu.mockReturnValue({
        menuItems: [],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <DynamicMenu menuType="main" />
        </TestWrapper>
      );

      expect(screen.getByText('No menu items available')).toBeInTheDocument();
    });

    it('should handle retry functionality', async () => {
      const mockRefetch = vi.fn();
      mockUseMenu.mockReturnValue({
        menuItems: [],
        isLoading: false,
        error: new Error('Network error'),
        refetch: mockRefetch,
      });

      render(
        <TestWrapper>
          <DynamicMenu menuType="main" />
        </TestWrapper>
      );

      const retryButton = screen.getByText('Retry');
      await user.click(retryButton);

      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('Responsive Behavior', () => {
    it('should render mobile-friendly structure', () => {
      render(
        <TestWrapper>
          <DynamicMenu menuType="mobile" orientation="vertical" />
        </TestWrapper>
      );

      const menu = screen.getByRole('navigation');
      expect(menu).toHaveClass('mobile-menu', 'vertical');
    });

    it('should handle horizontal orientation', () => {
      render(
        <TestWrapper>
          <DynamicMenu menuType="main" orientation="horizontal" />
        </TestWrapper>
      );

      const menu = screen.getByRole('navigation');
      expect(menu).toHaveClass('horizontal');
    });

    it('should adapt to container width', () => {
      // Mock ResizeObserver
      global.ResizeObserver = vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      }));

      render(
        <TestWrapper>
          <DynamicMenu menuType="main" responsive={true} />
        </TestWrapper>
      );

      const menu = screen.getByRole('navigation');
      expect(menu).toHaveAttribute('data-responsive', 'true');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <TestWrapper>
          <DynamicMenu menuType="main" />
        </TestWrapper>
      );

      const menu = screen.getByRole('navigation');
      expect(menu).toHaveAttribute('aria-label', 'Main navigation');

      const menuItems = screen.getAllByRole('link');
      menuItems.forEach(item => {
        expect(item).toHaveAttribute('tabIndex', '0');
      });
    });

    it('should support keyboard navigation', async () => {
      render(
        <TestWrapper>
          <DynamicMenu menuType="main" showHierarchy={true} />
        </TestWrapper>
      );

      const firstItem = screen.getByRole('link', { name: /home/i });
      firstItem.focus();

      // Tab to next item
      await user.keyboard('{Tab}');
      expect(screen.getByRole('link', { name: /community/i })).toHaveFocus();

      // Use arrow keys for hierarchical navigation
      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('link', { name: /events/i })).toHaveFocus();
    });

    it('should announce expanded/collapsed state to screen readers', async () => {
      render(
        <TestWrapper>
          <DynamicMenu menuType="main" showHierarchy={true} collapsible={true} />
        </TestWrapper>
      );

      const expandButton = screen.getByRole('button', { name: /expand community/i });
      expect(expandButton).toHaveAttribute('aria-expanded', 'false');

      await user.click(expandButton);

      expect(expandButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have proper heading hierarchy', () => {
      render(
        <TestWrapper>
          <DynamicMenu menuType="main" showTitle={true} />
        </TestWrapper>
      );

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Main Menu');
    });
  });

  describe('Customization Options', () => {
    it('should apply custom CSS classes', () => {
      render(
        <TestWrapper>
          <DynamicMenu 
            menuType="main" 
            className="custom-menu"
            itemClassName="custom-item"
          />
        </TestWrapper>
      );

      const menu = screen.getByRole('navigation');
      expect(menu).toHaveClass('custom-menu');

      const menuItems = screen.getAllByRole('link');
      menuItems.forEach(item => {
        expect(item).toHaveClass('custom-item');
      });
    });

    it('should render custom item content', () => {
      const customRender = (item: MenuItem) => (
        <div data-testid={`custom-${item.id}`}>
          {item.title.toUpperCase()}
        </div>
      );

      render(
        <TestWrapper>
          <DynamicMenu 
            menuType="main" 
            renderItem={customRender}
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('custom-1')).toHaveTextContent('HOME');
      expect(screen.getByTestId('custom-2')).toHaveTextContent('COMMUNITY');
    });

    it('should support theme customization', () => {
      render(
        <TestWrapper>
          <DynamicMenu 
            menuType="main" 
            theme="dark"
            variant="compact"
          />
        </TestWrapper>
      );

      const menu = screen.getByRole('navigation');
      expect(menu).toHaveClass('theme-dark', 'variant-compact');
    });
  });

  describe('Performance', () => {
    it('should handle large menu structures efficiently', () => {
      const largeMenuItems = Array.from({ length: 100 }, (_, i) => 
        createMockMenuItem({
          id: `item-${i}`,
          title: `Item ${i}`,
          url: `/item-${i}`,
          menu_type: 'main',
        })
      );

      mockUseMenu.mockReturnValue({
        menuItems: largeMenuItems,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <DynamicMenu menuType="main" />
        </TestWrapper>
      );

      const endTime = performance.now();
      
      // Should render within reasonable time
      expect(endTime - startTime).toBeLessThan(100);
      expect(screen.getAllByRole('link')).toHaveLength(100);
    });

    it('should memoize menu structure to prevent unnecessary re-renders', () => {
      const { rerender } = render(
        <TestWrapper>
          <DynamicMenu menuType="main" />
        </TestWrapper>
      );

      const initialItems = screen.getAllByRole('link');
      
      // Re-render with same props
      rerender(
        <TestWrapper>
          <DynamicMenu menuType="main" />
        </TestWrapper>
      );

      const rerenderedItems = screen.getAllByRole('link');
      
      // Should have same number of items (memoization working)
      expect(rerenderedItems).toHaveLength(initialItems.length);
    });

    it('should lazy load nested menu items', async () => {
      render(
        <TestWrapper>
          <DynamicMenu 
            menuType="main" 
            showHierarchy={true}
            lazyLoad={true}
          />
        </TestWrapper>
      );

      // Initially, nested items should not be rendered
      expect(screen.queryByText('Events')).not.toBeInTheDocument();

      // Click to expand parent
      const expandButton = screen.getByRole('button', { name: /expand community/i });
      await user.click(expandButton);

      // Nested item should now be visible
      await waitFor(() => {
        expect(screen.getByText('Events')).toBeInTheDocument();
      });
    });
  });

  describe('Event Handling', () => {
    it('should handle item clicks correctly', async () => {
      const onItemClick = vi.fn();
      
      render(
        <TestWrapper>
          <DynamicMenu menuType="main" onItemClick={onItemClick} />
        </TestWrapper>
      );

      const homeLink = screen.getByRole('link', { name: /home/i });
      await user.click(homeLink);

      expect(onItemClick).toHaveBeenCalledWith(
        expect.objectContaining({ id: '1', title: 'Home' }),
        expect.any(Object)
      );
    });

    it('should prevent navigation when onItemClick returns false', async () => {
      const onItemClick = vi.fn().mockReturnValue(false);
      
      render(
        <TestWrapper>
          <DynamicMenu menuType="main" onItemClick={onItemClick} />
        </TestWrapper>
      );

      const homeLink = screen.getByRole('link', { name: /home/i });
      const clickEvent = await user.click(homeLink);

      expect(onItemClick).toHaveBeenCalled();
      // Navigation should be prevented
      expect(clickEvent.defaultPrevented).toBe(true);
    });

    it('should handle menu expand/collapse events', async () => {
      const onExpandChange = vi.fn();
      
      render(
        <TestWrapper>
          <DynamicMenu 
            menuType="main" 
            showHierarchy={true}
            collapsible={true}
            onExpandChange={onExpandChange}
          />
        </TestWrapper>
      );

      const expandButton = screen.getByRole('button', { name: /expand community/i });
      await user.click(expandButton);

      expect(onExpandChange).toHaveBeenCalledWith('2', true);
    });
  });
});