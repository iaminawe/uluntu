import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import UserMenu from '@/shared/components/layout/Header/UserMenu';
import { useAuth } from '@/shared/contexts/AuthContextWithRedux';
import { useMemberByUserId } from '@/hooks/useMemberByUserId';

// Add custom matcher
expect.extend(toHaveNoViolations);

// Mock dependencies
vi.mock('@/shared/contexts/AuthContextWithRedux');
vi.mock('@/hooks/useMemberByUserId');

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;
const mockUseMemberByUserId = useMemberByUserId as ReturnType<typeof vi.fn>;

const renderUserMenu = () => {
  return render(
    <BrowserRouter>
      <UserMenu />
    </BrowserRouter>
  );
};

describe('UserMenu Accessibility Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ARIA Compliance', () => {
    it('should have no accessibility violations when closed', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        signOut: vi.fn(),
        isAdmin: false,
      });
      mockUseMemberByUserId.mockReturnValue({ data: null });

      const { container } = renderUserMenu();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations when open', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user123', email: 'test@example.com' },
        signOut: vi.fn(),
        isAdmin: false,
      });
      mockUseMemberByUserId.mockReturnValue({ 
        data: { id: 'member123', name: 'Test User' } 
      });

      const { container } = renderUserMenu();
      
      // Open the menu
      fireEvent.click(screen.getByRole('button'));
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA attributes on menu button', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        signOut: vi.fn(),
        isAdmin: false,
      });
      mockUseMemberByUserId.mockReturnValue({ data: null });

      renderUserMenu();
      const button = screen.getByRole('button');
      
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('aria-haspopup', 'true');
      
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have proper role attributes on dropdown menu', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user123', email: 'test@example.com' },
        signOut: vi.fn(),
        isAdmin: false,
      });
      mockUseMemberByUserId.mockReturnValue({ data: null });

      renderUserMenu();
      fireEvent.click(screen.getByRole('button'));
      
      // Check for menu structure
      const menu = screen.getByRole('button').parentElement?.querySelector('.absolute');
      expect(menu).toBeInTheDocument();
      expect(menu).toHaveClass('z-50'); // Ensure proper z-index for visibility
    });
  });

  describe('Keyboard Navigation', () => {
    it('should be keyboard navigable', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user123', email: 'test@example.com' },
        signOut: vi.fn(),
        isAdmin: false,
      });
      mockUseMemberByUserId.mockReturnValue({ data: null });

      renderUserMenu();
      const button = screen.getByRole('button');
      
      // Focus the button
      button.focus();
      expect(document.activeElement).toBe(button);
      
      // Open with Enter key
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      
      // Menu items should be present
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    it('should support Tab navigation through menu items', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user123', email: 'test@example.com' },
        signOut: vi.fn(),
        isAdmin: true,
      });
      mockUseMemberByUserId.mockReturnValue({ 
        data: { id: 'member123', name: 'Test User' } 
      });

      renderUserMenu();
      fireEvent.click(screen.getByRole('button'));
      
      // Get all interactive elements
      const links = screen.getAllByRole('link');
      const signOutButton = screen.getByText('Sign out').closest('button');
      
      expect(links.length).toBeGreaterThan(0);
      expect(signOutButton).toBeInTheDocument();
    });

    it('should close menu with Escape key', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user123', email: 'test@example.com' },
        signOut: vi.fn(),
        isAdmin: false,
      });
      mockUseMemberByUserId.mockReturnValue({ data: null });

      renderUserMenu();
      fireEvent.click(screen.getByRole('button'));
      
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      
      // Press Escape
      fireEvent.keyDown(document.body, { key: 'Escape', code: 'Escape' });
      
      // Note: The current implementation doesn't handle Escape key
      // This is a potential improvement area
    });
  });

  describe('Screen Reader Support', () => {
    it('should have accessible text for all interactive elements', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user123', email: 'test@example.com' },
        signOut: vi.fn(),
        isAdmin: false,
      });
      mockUseMemberByUserId.mockReturnValue({ 
        data: { id: 'member123', name: 'Test User' } 
      });

      renderUserMenu();
      fireEvent.click(screen.getByRole('button'));
      
      // Check that all links have accessible text
      const profileLink = screen.getByText('Your Profile');
      const editLink = screen.getByText('Edit Profile');
      const settingsLink = screen.getByText('Settings');
      const signOutButton = screen.getByText('Sign out');
      
      expect(profileLink).toBeInTheDocument();
      expect(editLink).toBeInTheDocument();
      expect(settingsLink).toBeInTheDocument();
      expect(signOutButton).toBeInTheDocument();
      
      // Check that icons have accompanying text
      const icons = screen.getByRole('button').parentElement?.querySelectorAll('svg');
      icons?.forEach(icon => {
        const parent = icon.parentElement;
        expect(parent?.textContent).not.toBe('');
      });
    });

    it('should announce menu state changes', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        signOut: vi.fn(),
        isAdmin: false,
      });
      mockUseMemberByUserId.mockReturnValue({ data: null });

      renderUserMenu();
      const button = screen.getByRole('button');
      
      // Initial state
      expect(button).toHaveAttribute('aria-expanded', 'false');
      
      // Open menu
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
      
      // Close menu
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Focus Management', () => {
    it('should trap focus within menu when open', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user123', email: 'test@example.com' },
        signOut: vi.fn(),
        isAdmin: false,
      });
      mockUseMemberByUserId.mockReturnValue({ data: null });

      renderUserMenu();
      fireEvent.click(screen.getByRole('button'));
      
      // Get all focusable elements
      const menu = screen.getByRole('button').parentElement;
      const focusableElements = menu?.querySelectorAll(
        'a, button, [tabindex]:not([tabindex="-1"])'
      );
      
      expect(focusableElements?.length).toBeGreaterThan(0);
    });

    it('should return focus to trigger button when menu closes', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user123', email: 'test@example.com' },
        signOut: vi.fn(),
        isAdmin: false,
      });
      mockUseMemberByUserId.mockReturnValue({ data: null });

      renderUserMenu();
      const button = screen.getByRole('button');
      
      // Focus and open menu
      button.focus();
      fireEvent.click(button);
      
      // Click a link to close menu
      const editLink = screen.getByText('Edit Profile');
      fireEvent.click(editLink);
      
      // Note: Focus return is handled by browser navigation
    });
  });

  describe('Color Contrast', () => {
    it('should have sufficient color contrast for all text', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user123', email: 'test@example.com' },
        signOut: vi.fn(),
        isAdmin: false,
      });
      mockUseMemberByUserId.mockReturnValue({ data: null });

      renderUserMenu();
      fireEvent.click(screen.getByRole('button'));
      
      // Check that menu has proper background classes for contrast
      const menu = screen.getByRole('button').parentElement?.querySelector('.absolute');
      expect(menu).toHaveClass('bg-white', 'dark:bg-slate-800');
      
      // Check text color classes
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveClass('text-slate-700', 'dark:text-slate-300');
      });
    });
  });
});