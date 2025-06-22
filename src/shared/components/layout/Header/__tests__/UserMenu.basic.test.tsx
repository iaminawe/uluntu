import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock all external dependencies
jest.mock('@/shared/contexts/AuthContextWithRedux');
jest.mock('@/hooks/useMemberByUserId');
jest.mock('@/shared/hooks/useUserContent');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Import after mocking
import { useAuth } from '@/shared/contexts/AuthContextWithRedux';
import { useMemberByUserId } from '@/hooks/useMemberByUserId';
import { useUserGroups, useUserResources, useUserMarketplaceItems } from '@/shared/hooks/useUserContent';

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseMemberByUserId = useMemberByUserId as jest.MockedFunction<typeof useMemberByUserId>;
const mockUseUserGroups = useUserGroups as jest.MockedFunction<typeof useUserGroups>;  
const mockUseUserResources = useUserResources as jest.MockedFunction<typeof useUserResources>;
const mockUseUserMarketplaceItems = useUserMarketplaceItems as jest.MockedFunction<typeof useUserMarketplaceItems>;

// Dynamic import of the component to avoid import.meta issues
let UserMenu: React.ComponentType;

beforeAll(async () => {
  UserMenu = (await import('../UserMenu')).default;
});

const renderUserMenu = () => {
  return render(
    <BrowserRouter>
      <UserMenu />
    </BrowserRouter>
  );
};

describe('UserMenu Basic Functionality Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockUseUserGroups.mockReturnValue({ groups: [], isLoading: false });
    mockUseUserResources.mockReturnValue({ resources: [], isLoading: false });
    mockUseUserMarketplaceItems.mockReturnValue({ items: [], isLoading: false });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Unauthenticated State', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        signOut: jest.fn(),
        isAdmin: false,
      });
      mockUseMemberByUserId.mockReturnValue({ data: null });
    });

    it('should render Account button for unauthenticated users', () => {
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
        signOut: jest.fn().mockResolvedValue(undefined),
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

    it('should show enhanced menu items', () => {
      renderUserMenu();
      fireEvent.click(screen.getByRole('button'));
      
      expect(screen.getByText('Your Profile')).toBeInTheDocument();
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Your Groups')).toBeInTheDocument();
      expect(screen.getByText('Your Resources')).toBeInTheDocument();
      expect(screen.getByText('Your Listings')).toBeInTheDocument();
    });

    it('should handle sign out', async () => {
      const mockSignOut = jest.fn().mockResolvedValue(undefined);
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
  });

  describe('Admin User State', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: 'admin123', email: 'admin@example.com' },
        signOut: jest.fn(),
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

  describe('Enhanced Features', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user123', email: 'test@example.com' },
        signOut: jest.fn(),
        isAdmin: false,
      });
      mockUseMemberByUserId.mockReturnValue({ 
        data: { id: 'member123', name: 'Test User' } 
      });
    });

    it('should show user content counts', () => {
      mockUseUserGroups.mockReturnValue({ 
        groups: [{ id: '1' }, { id: '2' }], 
        isLoading: false 
      });
      mockUseUserResources.mockReturnValue({ 
        resources: [{ id: '1' }], 
        isLoading: false 
      });
      mockUseUserMarketplaceItems.mockReturnValue({ 
        items: [{ id: '1' }, { id: '2' }, { id: '3' }], 
        isLoading: false 
      });

      renderUserMenu();
      fireEvent.click(screen.getByRole('button'));
      
      // Check for content indicators
      expect(screen.getByText('Your Groups')).toBeInTheDocument();
      expect(screen.getByText('Your Resources')).toBeInTheDocument();
      expect(screen.getByText('Your Listings')).toBeInTheDocument();
    });

    it('should handle loading states for user content', () => {
      mockUseUserGroups.mockReturnValue({ groups: [], isLoading: true });
      mockUseUserResources.mockReturnValue({ resources: [], isLoading: true });
      mockUseUserMarketplaceItems.mockReturnValue({ items: [], isLoading: true });

      renderUserMenu();
      fireEvent.click(screen.getByRole('button'));
      
      // Content links should still be present even during loading
      expect(screen.getByText('Your Groups')).toBeInTheDocument();
      expect(screen.getByText('Your Resources')).toBeInTheDocument();
      expect(screen.getByText('Your Listings')).toBeInTheDocument();
    });
  });

  describe('Event Handling', () => {
    it('should close menu when clicking outside', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user123', email: 'test@example.com' },
        signOut: jest.fn(),
        isAdmin: false,
      });
      mockUseMemberByUserId.mockReturnValue({ data: null });

      renderUserMenu();
      fireEvent.click(screen.getByRole('button'));
      
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      
      // Click outside - simulate clicking on document body
      fireEvent.mouseDown(document.body);
      
      await waitFor(() => {
        expect(screen.queryByText('Edit Profile')).not.toBeInTheDocument();
      });
    });

    it('should only add event listener when menu is open', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      
      mockUseAuth.mockReturnValue({
        user: { id: 'user123', email: 'test@example.com' },
        signOut: jest.fn(),
        isAdmin: false,
      });
      mockUseMemberByUserId.mockReturnValue({ data: null });

      renderUserMenu();
      
      // Event listener should not be added when menu is closed
      expect(addEventListenerSpy).not.toHaveBeenCalled();
      
      // Open menu
      fireEvent.click(screen.getByRole('button'));
      
      // Event listener should be added when menu is open
      expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
      
      addEventListenerSpy.mockRestore();
    });
  });
});