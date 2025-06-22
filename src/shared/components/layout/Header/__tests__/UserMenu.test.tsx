import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UserMenu from '../UserMenu';
import { useAuth } from '@/shared/contexts/AuthContextWithRedux';
import { useMemberByUserId } from '@/hooks/useMemberByUserId';

// Mock dependencies
vi.mock('@/shared/contexts/AuthContextWithRedux');
vi.mock('@/hooks/useMemberByUserId');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;
const mockUseMemberByUserId = useMemberByUserId as ReturnType<typeof vi.fn>;

const renderUserMenu = () => {
  return render(
    <BrowserRouter>
      <UserMenu />
    </BrowserRouter>
  );
};

describe('UserMenu Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Unauthenticated State', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        signOut: vi.fn(),
        isAdmin: false,
      });
      mockUseMemberByUserId.mockReturnValue({ data: null });
    });

    it('should render Account text for unauthenticated users', () => {
      renderUserMenu();
      expect(screen.getByText('Account')).toBeInTheDocument();
    });

    it('should show sign in and sign up options when clicked', () => {
      renderUserMenu();
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(screen.getByText('Sign in')).toBeInTheDocument();
      expect(screen.getByText('Sign up')).toBeInTheDocument();
    });

    it('should have correct ARIA attributes', () => {
      renderUserMenu();
      const button = screen.getByRole('button');
      
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('aria-haspopup', 'true');
      
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Authenticated State', () => {
    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
    };

    const mockMember = {
      id: 'member123',
      name: 'Test User',
      slug: 'test-user',
    };

    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        signOut: vi.fn().mockResolvedValue(undefined),
        isAdmin: false,
      });
      mockUseMemberByUserId.mockReturnValue({ data: mockMember });
    });

    it('should render user avatar for authenticated users', () => {
      renderUserMenu();
      const avatar = screen.getByRole('button').querySelector('.rounded-full');
      expect(avatar).toBeInTheDocument();
    });

    it('should display user email in dropdown', () => {
      renderUserMenu();
      fireEvent.click(screen.getByRole('button'));
      
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('should show profile link when member data is available', () => {
      renderUserMenu();
      fireEvent.click(screen.getByRole('button'));
      
      const profileLink = screen.getByText('Your Profile');
      expect(profileLink).toBeInTheDocument();
      expect(profileLink.closest('a')).toHaveAttribute('href', '/directory/member123');
    });

    it('should show edit profile and settings links', () => {
      renderUserMenu();
      fireEvent.click(screen.getByRole('button'));
      
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should handle sign out', async () => {
      const mockSignOut = vi.fn().mockResolvedValue(undefined);
      mockUseAuth.mockReturnValue({
        user: mockUser,
        signOut: mockSignOut,
        isAdmin: false,
      });

      renderUserMenu();
      fireEvent.click(screen.getByRole('button'));
      
      const signOutButton = screen.getByText('Sign out');
      fireEvent.click(signOutButton);
      
      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
      });
    });

    it('should close menu when clicking outside', () => {
      renderUserMenu();
      fireEvent.click(screen.getByRole('button'));
      
      expect(screen.getByText('Your Profile')).toBeInTheDocument();
      
      // Click outside
      fireEvent.mouseDown(document.body);
      
      waitFor(() => {
        expect(screen.queryByText('Your Profile')).not.toBeInTheDocument();
      });
    });
  });

  describe('Admin User State', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: 'admin123', email: 'admin@example.com' },
        signOut: vi.fn(),
        isAdmin: true,
      });
      mockUseMemberByUserId.mockReturnValue({ data: null });
    });

    it('should show admin dashboard link for admin users', () => {
      renderUserMenu();
      fireEvent.click(screen.getByRole('button'));
      
      const adminLink = screen.getByText('Admin Dashboard');
      expect(adminLink).toBeInTheDocument();
      expect(adminLink.closest('a')).toHaveAttribute('href', '/admin');
    });
  });

  describe('Loading States', () => {
    it('should handle member data loading state', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user123', email: 'test@example.com' },
        signOut: vi.fn(),
        isAdmin: false,
      });
      mockUseMemberByUserId.mockReturnValue({ 
        data: null,
        isLoading: true,
      });

      renderUserMenu();
      fireEvent.click(screen.getByRole('button'));
      
      // Profile link should not be shown while loading
      expect(screen.queryByText('Your Profile')).not.toBeInTheDocument();
      // But other links should still be available
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle sign out errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockSignOut = vi.fn().mockRejectedValue(new Error('Sign out failed'));
      
      mockUseAuth.mockReturnValue({
        user: { id: 'user123', email: 'test@example.com' },
        signOut: mockSignOut,
        isAdmin: false,
      });
      mockUseMemberByUserId.mockReturnValue({ data: null });

      renderUserMenu();
      fireEvent.click(screen.getByRole('button'));
      
      const signOutButton = screen.getByText('Sign out');
      fireEvent.click(signOutButton);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error signing out:', expect.any(Error));
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user123', email: 'test@example.com' },
        signOut: vi.fn(),
        isAdmin: false,
      });
      mockUseMemberByUserId.mockReturnValue({ data: null });

      renderUserMenu();
      const button = screen.getByRole('button');
      
      // Open with Enter key
      fireEvent.keyDown(button, { key: 'Enter' });
      
      waitFor(() => {
        expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('should clean up event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      
      mockUseAuth.mockReturnValue({
        user: null,
        signOut: vi.fn(),
        isAdmin: false,
      });
      mockUseMemberByUserId.mockReturnValue({ data: null });

      const { unmount } = renderUserMenu();
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
    });
  });
});