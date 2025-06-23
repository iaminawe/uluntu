import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import UserMenu from '@/shared/components/layout/Header/UserMenu';
import { useAuth } from '@/shared/contexts/AuthContextWithRedux';
import { useMemberByUserId } from '@/hooks/useMemberByUserId';
import { createMockQueryResult, createMockAuthContext } from '@/test-utils/react-query-mocks';

// Mock dependencies
jest.mock('@/shared/contexts/AuthContextWithRedux');
jest.mock('@/hooks/useMemberByUserId');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseMemberByUserId = useMemberByUserId as jest.MockedFunction<typeof useMemberByUserId>;

// Mock window.matchMedia for responsive tests
const mockMatchMedia = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(), // deprecated
  removeListener: jest.fn(), // deprecated
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
});

const renderUserMenu = () => {
  return render(
    <BrowserRouter>
      <UserMenu />
    </BrowserRouter>
  );
};

describe('UserMenu Responsive Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(mockMatchMedia),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Mobile Layout (< 768px)', () => {
    beforeEach(() => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      // Mock matchMedia for mobile
      window.matchMedia = jest.fn().mockImplementation((query) => ({
        ...mockMatchMedia(query),
        matches: query.includes('max-width: 767px'),
      }));
    });

    it('should render properly on mobile screens', () => {
      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: { id: 'user123', email: 'test@example.com', user_metadata: { name: 'Test User' } },
        isAdmin: false,
      }));
      mockUseMemberByUserId.mockReturnValue(createMockQueryResult({ data: null }));

      const { container } = renderUserMenu();
      
      // Check that component renders without layout issues
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      
      // Check for responsive classes (though this might be handled by Tailwind)
      const userIcon = container.querySelector('.w-8.h-8');
      expect(userIcon).toBeInTheDocument();
    });

    it('should have proper touch targets on mobile', () => {
      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: { id: 'user123', email: 'test@example.com', user_metadata: { name: 'Test User' } },
        isAdmin: false,
      }));
      mockUseMemberByUserId.mockReturnValue(createMockQueryResult({ data: null }));

      renderUserMenu();
      fireEvent.click(screen.getByRole('button'));
      
      // Check that dropdown items have adequate touch targets
      const menuItems = screen.getAllByRole('link');
      menuItems.forEach(item => {
        const styles = getComputedStyle(item);
        // Menu items should have padding for touch targets
        expect(item.className).toContain('px-4');
      });
    });

    it('should handle tap events on mobile', () => {
      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: { id: 'user123', email: 'test@example.com', user_metadata: { name: 'Test User' } },
        isAdmin: false,
      }));
      mockUseMemberByUserId.mockReturnValue(createMockQueryResult({ data: null }));

      renderUserMenu();
      const button = screen.getByRole('button');
      
      // Test touch events
      fireEvent.touchStart(button);
      fireEvent.touchEnd(button);
      fireEvent.click(button);
      
      expect(screen.getByText('Edit Profile')).toBeTruthy();
    });

    it('should position dropdown correctly on mobile', () => {
      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: { id: 'user123', email: 'test@example.com', user_metadata: { name: 'Test User' } },
        isAdmin: false,
      }));
      mockUseMemberByUserId.mockReturnValue(createMockQueryResult({ data: null }));

      renderUserMenu();
      fireEvent.click(screen.getByRole('button'));
      
      // Dropdown should be positioned correctly
      const dropdown = screen.getByRole('button').parentElement?.querySelector('.absolute');
      expect(dropdown).toHaveClass('right-0', 'mt-2');
    });

    it('should not cause horizontal scrolling on mobile', () => {
      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: { id: 'user123', email: 'test@example.com', user_metadata: { name: 'Test User' } },
        isAdmin: false,
      }));
      mockUseMemberByUserId.mockReturnValue(createMockQueryResult({ data: null }));

      const { container } = renderUserMenu();
      fireEvent.click(screen.getByRole('button'));
      
      // Check that dropdown doesn't exceed viewport width
      const dropdown = container.querySelector('.w-48');
      expect(dropdown).toBeInTheDocument();
      
      // On mobile, dropdown should be positioned to stay within viewport
      expect(dropdown).toHaveClass('right-0');
    });
  });

  describe('Desktop Layout (>= 768px)', () => {
    beforeEach(() => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      
      // Mock matchMedia for desktop
      window.matchMedia = jest.fn().mockImplementation((query) => ({
        ...mockMatchMedia(query),
        matches: query.includes('min-width: 768px'),
      }));
    });

    it('should render properly on desktop screens', () => {
      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: { id: 'user123', email: 'test@example.com', user_metadata: { name: 'Test User' } },
        isAdmin: false,
      }));
      mockUseMemberByUserId.mockReturnValue(createMockQueryResult({ data: null }));

      renderUserMenu();
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should support hover interactions on desktop', () => {
      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: { id: 'user123', email: 'test@example.com', user_metadata: { name: 'Test User' } },
        isAdmin: false,
      }));
      mockUseMemberByUserId.mockReturnValue(createMockQueryResult({ data: null }));

      renderUserMenu();
      const button = screen.getByRole('button');
      
      // Test hover behavior
      fireEvent.mouseEnter(button);
      fireEvent.mouseLeave(button);
      
      // Component should handle hover states
      expect(button).toHaveClass('hover:text-orange-100');
    });

    it('should have proper spacing on desktop', () => {
      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: { id: 'user123', email: 'test@example.com', user_metadata: { name: 'Test User' } },
        isAdmin: false,
      }));
      mockUseMemberByUserId.mockReturnValue(createMockQueryResult({ data: null }));

      renderUserMenu();
      fireEvent.click(screen.getByRole('button'));
      
      // Check dropdown positioning
      const dropdown = screen.getByRole('button').parentElement?.querySelector('.absolute');
      expect(dropdown).toHaveClass('w-48');
    });
  });

  describe('Tablet Layout (768px - 1024px)', () => {
    beforeEach(() => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
    });

    it('should render properly on tablet screens', () => {
      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: { id: 'user123', email: 'test@example.com', user_metadata: { name: 'Test User' } },
        isAdmin: false,
      }));
      mockUseMemberByUserId.mockReturnValue(createMockQueryResult({ data: null }));

      renderUserMenu();
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      
      fireEvent.click(button);
      expect(screen.getByText('Edit Profile')).toBeTruthy();
    });

    it('should handle both touch and mouse events on tablet', () => {
      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: { id: 'user123', email: 'test@example.com', user_metadata: { name: 'Test User' } },
        isAdmin: false,
      }));
      mockUseMemberByUserId.mockReturnValue(createMockQueryResult({ data: null }));

      renderUserMenu();
      const button = screen.getByRole('button');
      
      // Test touch events
      fireEvent.touchStart(button);
      fireEvent.touchEnd(button);
      
      // Test mouse events
      fireEvent.mouseDown(button);
      fireEvent.mouseUp(button);
      fireEvent.click(button);
      
      expect(screen.getByText('Edit Profile')).toBeTruthy();
    });
  });

  describe('Viewport Orientation Changes', () => {
    it('should handle orientation changes', () => {
      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: { id: 'user123', email: 'test@example.com', user_metadata: { name: 'Test User' } },
        isAdmin: false,
      }));
      mockUseMemberByUserId.mockReturnValue(createMockQueryResult({ data: null }));

      renderUserMenu();
      
      // Simulate orientation change
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 812, // iPhone landscape
      });
      
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      fireEvent(window, new Event('orientationchange'));
      fireEvent(window, new Event('resize'));
      
      // Component should still work after orientation change
      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByText('Edit Profile')).toBeTruthy();
    });
  });

  describe('High DPI Displays', () => {
    it('should render crisp icons on high DPI displays', () => {
      // Mock high DPI display
      Object.defineProperty(window, 'devicePixelRatio', {
        writable: true,
        configurable: true,
        value: 2,
      });

      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: { id: 'user123', email: 'test@example.com', user_metadata: { name: 'Test User' } },
        isAdmin: false,
      }));
      mockUseMemberByUserId.mockReturnValue(createMockQueryResult({ data: null }));

      const { container } = renderUserMenu();
      
      // Check that icons have proper sizing
      const userIcon = container.querySelector('svg');
      expect(userIcon).toHaveClass('h-5', 'w-5');
    });
  });

  describe('Dynamic Content Sizing', () => {
    it('should handle long email addresses', () => {
      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: { 
          id: 'user123', 
          email: 'very.long.email.address.that.might.overflow@example.com',
          user_metadata: { name: 'Long Email User' }
        },
        isAdmin: false,
      }));
      mockUseMemberByUserId.mockReturnValue(createMockQueryResult({ data: null }));

      renderUserMenu();
      fireEvent.click(screen.getByRole('button'));
      
      // Email should be truncated
      const emailElement = screen.getByText(
        'very.long.email.address.that.might.overflow@example.com'
      );
      expect(emailElement.parentElement).toHaveClass('truncate');
    });

    it('should handle varying number of menu items', () => {
      // Test with admin user (more menu items)
      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: { id: 'user123', email: 'admin@example.com', user_metadata: { name: 'Admin User' } },
        isAdmin: true,
      }));
      mockUseMemberByUserId.mockReturnValue(
        createMockQueryResult({ data: { id: 'member123', name: 'Admin User' } })
      );

      renderUserMenu();
      fireEvent.click(screen.getByRole('button'));
      
      // Should have all menu items including admin
      expect(screen.getByText('Your Profile')).toBeInTheDocument();
      expect(screen.getByText('Edit Profile')).toBeTruthy();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Sign out')).toBeInTheDocument();
      
      // Dropdown should accommodate all items
      const dropdown = screen.getByRole('button').parentElement?.querySelector('.absolute');
      expect(dropdown).toHaveClass('py-1');
    });
  });
});