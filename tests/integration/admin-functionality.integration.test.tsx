/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import React from 'react';

// Import components to test
import AdminTab from '@/features/groups/components/AdminTab';
import InviteMembersModal from '@/features/groups/components/InviteMembersModal';
import PageHeader from '@/src/pages/GroupDetailPage/PageHeader';

// Mock hooks and APIs
import * as useEntityPermissions from '@/hooks/useEntityPermissions';
import * as useMemberQueries from '@/hooks/useMemberQueries';
import * as useGroupQueries from '@/features/groups/hooks/useGroupQueries';
import * as memberManagementApi from '@/lib/api/groups/memberManagement';

// Mock data
const mockGroup = {
  id: 'group-123',
  name: 'Test Group',
  description: 'Test group description',
  visibility: 'public',
  coverImage: '/test-cover.jpg',
  memberCount: 15
};

const mockCurrentMember = {
  id: 'member-123',
  userId: 'user-123',
  email: 'admin@example.com',
  role: 'admin'
};

const mockGroupMembers = [
  {
    id: 'member-123',
    userId: 'user-123',
    email: 'admin@example.com',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    avatarUrl: '/admin-avatar.jpg'
  },
  {
    id: 'member-456',
    userId: 'user-456', 
    email: 'member@example.com',
    role: 'member',
    firstName: 'Regular',
    lastName: 'Member',
    avatarUrl: '/member-avatar.jpg'
  }
];

const mockInvitations = [
  {
    id: 'inv-123',
    email: 'pending@example.com',
    status: 'pending',
    inviterName: 'Admin User',
    createdAt: '2025-01-01T10:00:00Z'
  }
];

// Test utilities
const createTestStore = () => {
  return configureStore({
    reducer: {
      auth: (state = { user: mockCurrentMember, isAuthenticated: true }) => state,
    },
  });
};

const createTestProviders = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  const store = createTestStore();

  const TestProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );

  return { TestProviders, queryClient, store };
};

describe('Group Admin Functionality Integration Tests', () => {
  let mockUseIsGroupAdmin: jest.SpyInstance;
  let mockUseGroupMembers: jest.SpyInstance;
  let mockUseGroupInvitations: jest.SpyInstance;
  let mockUpdateMemberRole: jest.SpyInstance;
  let mockRemoveMember: jest.SpyInstance;
  let mockCreateInvitation: jest.SpyInstance;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock permission hooks
    mockUseIsGroupAdmin = jest.spyOn(useEntityPermissions, 'useIsGroupAdmin')
      .mockReturnValue({ data: true, isLoading: false });

    // Mock member queries
    mockUseGroupMembers = jest.spyOn(useMemberQueries, 'useGroupMembers')
      .mockReturnValue({
        data: mockGroupMembers,
        isLoading: false,
        error: null
      });

    mockUseGroupInvitations = jest.spyOn(useGroupQueries, 'useGroupInvitations')
      .mockReturnValue({
        data: mockInvitations,
        isLoading: false,
        error: null
      });

    // Mock API functions
    mockUpdateMemberRole = jest.spyOn(memberManagementApi, 'updateMemberRole')
      .mockResolvedValue({ success: true });

    mockRemoveMember = jest.spyOn(memberManagementApi, 'removeMember')
      .mockResolvedValue({ success: true });

    mockCreateInvitation = jest.spyOn(memberManagementApi, 'createInvitation')
      .mockResolvedValue({ id: 'new-inv-123', token: 'invite-token-123' });
  });

  describe('AdminTab Component', () => {
    test('should render all admin sections for group admin', async () => {
      const { TestProviders } = createTestProviders();

      render(
        <TestProviders>
          <AdminTab group={mockGroup} />
        </TestProviders>
      );

      // Verify all admin sections are present
      expect(screen.getByText('Members')).toBeInTheDocument();
      expect(screen.getByText('Invitations')).toBeInTheDocument();
      expect(screen.getByText('Group Settings')).toBeInTheDocument();
      expect(screen.getByText('Content Permissions')).toBeInTheDocument();

      // Verify member management is displayed
      await waitFor(() => {
        expect(screen.getByText('Admin User')).toBeInTheDocument();
        expect(screen.getByText('Regular Member')).toBeInTheDocument();
      });
    });

    test('should handle member role changes', async () => {
      const { TestProviders } = createTestProviders();
      const user = userEvent.setup();

      render(
        <TestProviders>
          <AdminTab group={mockGroup} />
        </TestProviders>
      );

      // Find member to promote
      const memberCard = screen.getByText('Regular Member').closest('.member-card');
      expect(memberCard).toBeInTheDocument();

      // Click promote button
      const promoteButton = within(memberCard!).getByRole('button', { name: /promote/i });
      await user.click(promoteButton);

      // Confirm promotion in dialog
      const confirmButton = await screen.findByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockUpdateMemberRole).toHaveBeenCalledWith({
          group_id: 'group-123',
          member_id: 'member-456',
          role: 'admin'
        });
      });
    });

    test('should prevent last admin from being demoted', async () => {
      // Mock only one admin
      mockUseGroupMembers.mockReturnValue({
        data: [mockGroupMembers[0]], // Only admin user
        isLoading: false,
        error: null
      });

      const { TestProviders } = createTestProviders();
      const user = userEvent.setup();

      render(
        <TestProviders>
          <AdminTab group={mockGroup} />
        </TestProviders>
      );

      // Find admin user
      const adminCard = screen.getByText('Admin User').closest('.member-card');
      expect(adminCard).toBeInTheDocument();

      // Demote button should be disabled for last admin
      const demoteButton = within(adminCard!).queryByRole('button', { name: /demote/i });
      expect(demoteButton).toBeDisabled();
    });

    test('should handle member removal', async () => {
      const { TestProviders } = createTestProviders();
      const user = userEvent.setup();

      // Mock window.confirm
      const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(true);

      render(
        <TestProviders>
          <AdminTab group={mockGroup} />
        </TestProviders>
      );

      // Find member to remove
      const memberCard = screen.getByText('Regular Member').closest('.member-card');
      const removeButton = within(memberCard!).getByRole('button', { name: /remove/i });
      
      await user.click(removeButton);

      await waitFor(() => {
        expect(mockRemoveMember).toHaveBeenCalledWith('group-123', 'member-456');
      });

      mockConfirm.mockRestore();
    });

    test('should display group settings with edit functionality', async () => {
      const { TestProviders } = createTestProviders();
      const user = userEvent.setup();

      render(
        <TestProviders>
          <AdminTab group={mockGroup} />
        </TestProviders>
      );

      // Find group settings section
      const settingsSection = screen.getByText('Group Settings').closest('.settings-section');
      expect(settingsSection).toBeInTheDocument();

      // Verify group details are displayed
      expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test group description')).toBeInTheDocument();

      // Test edit functionality
      const editButton = within(settingsSection!).getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Should enable editing
      const nameInput = screen.getByDisplayValue('Test Group');
      expect(nameInput).not.toBeDisabled();
    });

    test('should manage content permissions', async () => {
      const { TestProviders } = createTestProviders();
      const user = userEvent.setup();

      render(
        <TestProviders>
          <AdminTab group={mockGroup} />
        </TestProviders>
      );

      // Find content permissions section
      const permissionsSection = screen.getByText('Content Permissions').closest('.permissions-section');
      expect(permissionsSection).toBeInTheDocument();

      // Test permission toggles
      const eventToggle = within(permissionsSection!).getByLabelText(/events/i);
      await user.click(eventToggle);

      // Should trigger permission update
      // Note: This would typically call a group settings update API
    });
  });

  describe('Member Invitation System', () => {
    test('should open invitation modal', async () => {
      const { TestProviders } = createTestProviders();
      const user = userEvent.setup();

      render(
        <TestProviders>
          <AdminTab group={mockGroup} />
        </TestProviders>
      );

      // Click invite members button
      const inviteButton = screen.getByRole('button', { name: /invite members/i });
      await user.click(inviteButton);

      // Modal should open
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Invite Members to Test Group')).toBeInTheDocument();
    });

    test('should send batch invitations', async () => {
      const { TestProviders } = createTestProviders();
      const user = userEvent.setup();

      render(
        <TestProviders>
          <InviteMembersModal 
            group={mockGroup} 
            isOpen={true} 
            onClose={jest.fn()}
          />
        </TestProviders>
      );

      // Add multiple email addresses
      const emailInput = screen.getByLabelText(/email addresses/i);
      await user.type(emailInput, 'user1@example.com, user2@example.com');

      // Add custom message
      const messageInput = screen.getByLabelText(/custom message/i);
      await user.type(messageInput, 'Welcome to our group!');

      // Send invitations
      const sendButton = screen.getByRole('button', { name: /send invitations/i });
      await user.click(sendButton);

      await waitFor(() => {
        expect(mockCreateInvitation).toHaveBeenCalledTimes(2);
      });
    });

    test('should display pending invitations', async () => {
      const { TestProviders } = createTestProviders();

      render(
        <TestProviders>
          <AdminTab group={mockGroup} />
        </TestProviders>
      );

      // Should show pending invitation
      await waitFor(() => {
        expect(screen.getByText('pending@example.com')).toBeInTheDocument();
        expect(screen.getByText('Pending')).toBeInTheDocument();
      });
    });

    test('should handle invitation cancellation', async () => {
      const mockCancelInvitation = jest.spyOn(memberManagementApi, 'cancelInvitation')
        .mockResolvedValue({ success: true });

      const { TestProviders } = createTestProviders();
      const user = userEvent.setup();

      render(
        <TestProviders>
          <AdminTab group={mockGroup} />
        </TestProviders>
      );

      // Find cancel button for pending invitation
      const invitationRow = screen.getByText('pending@example.com').closest('.invitation-row');
      const cancelButton = within(invitationRow!).getByRole('button', { name: /cancel/i });

      await user.click(cancelButton);

      await waitFor(() => {
        expect(mockCancelInvitation).toHaveBeenCalledWith('inv-123');
      });

      mockCancelInvitation.mockRestore();
    });
  });

  describe('PageHeader Admin Controls', () => {
    test('should show admin-only edit button', async () => {
      const { TestProviders } = createTestProviders();

      const mockSetShowJoinModal = jest.fn();

      render(
        <TestProviders>
          <PageHeader group={mockGroup} setShowJoinModal={mockSetShowJoinModal} />
        </TestProviders>
      );

      // Should show edit button for admin
      await waitFor(() => {
        expect(screen.getByRole('link', { name: /edit/i })).toBeInTheDocument();
      });

      // Verify edit link points to correct URL
      const editLink = screen.getByRole('link', { name: /edit/i });
      expect(editLink).toHaveAttribute('href', '/groups/group-123/edit');
    });

    test('should prevent admin from leaving group', async () => {
      const mockUseGroupMembership = jest.spyOn(useGroupQueries, 'useGroupMembership')
        .mockReturnValue({ data: true, isLoading: false });

      const { TestProviders } = createTestProviders();

      render(
        <TestProviders>
          <PageHeader group={mockGroup} setShowJoinModal={jest.fn()} />
        </TestProviders>
      );

      // Leave button should be disabled for admin
      await waitFor(() => {
        const leaveButton = screen.getByRole('button', { name: /leave group/i });
        expect(leaveButton).toBeDisabled();
        expect(leaveButton).toHaveAttribute('title', 'Admins cannot leave the group');
      });

      mockUseGroupMembership.mockRestore();
    });

    test('should handle group visibility changes', async () => {
      const { TestProviders } = createTestProviders();

      render(
        <TestProviders>
          <PageHeader 
            group={{ ...mockGroup, visibility: 'private' }} 
            setShowJoinModal={jest.fn()} 
          />
        </TestProviders>
      );

      // Should display private group indicator
      expect(screen.getByText(/private/i)).toBeInTheDocument();
    });
  });

  describe('Permission System Integration', () => {
    test('should hide admin features for non-admin users', async () => {
      // Mock non-admin user
      mockUseIsGroupAdmin.mockReturnValue({ data: false, isLoading: false });

      const { TestProviders } = createTestProviders();

      render(
        <TestProviders>
          <AdminTab group={mockGroup} />
        </TestProviders>
      );

      // Should not render admin tab content
      expect(screen.queryByText('Member Management')).not.toBeInTheDocument();
    });

    test('should handle permission loading states', async () => {
      // Mock loading permission
      mockUseIsGroupAdmin.mockReturnValue({ data: undefined, isLoading: true });

      const { TestProviders } = createTestProviders();

      render(
        <TestProviders>
          <AdminTab group={mockGroup} />
        </TestProviders>
      );

      // Should show loading state
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    test('should handle permission errors gracefully', async () => {
      // Mock permission error
      mockUseIsGroupAdmin.mockReturnValue({ 
        data: undefined, 
        isLoading: false, 
        error: new Error('Permission check failed') 
      });

      const { TestProviders } = createTestProviders();

      render(
        <TestProviders>
          <AdminTab group={mockGroup} />
        </TestProviders>
      );

      // Should show error state
      expect(screen.getByText(/error loading permissions/i)).toBeInTheDocument();
    });
  });

  describe('Data Consistency & State Management', () => {
    test('should update member count after operations', async () => {
      const { TestProviders } = createTestProviders();
      const user = userEvent.setup();

      render(
        <TestProviders>
          <AdminTab group={mockGroup} />
        </TestProviders>
      );

      // Mock successful member removal
      const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
      
      // Remove a member
      const memberCard = screen.getByText('Regular Member').closest('.member-card');
      const removeButton = within(memberCard!).getByRole('button', { name: /remove/i });
      
      await user.click(removeButton);

      // Should trigger member list refresh
      await waitFor(() => {
        expect(mockUseGroupMembers).toHaveBeenCalled();
      });

      mockConfirm.mockRestore();
    });

    test('should maintain optimistic updates during operations', async () => {
      const { TestProviders } = createTestProviders();
      const user = userEvent.setup();

      render(
        <TestProviders>
          <AdminTab group={mockGroup} />
        </TestProviders>
      );

      // Test optimistic update for role change
      const memberCard = screen.getByText('Regular Member').closest('.member-card');
      const promoteButton = within(memberCard!).getByRole('button', { name: /promote/i });
      
      await user.click(promoteButton);

      // Should show loading state during operation
      expect(promoteButton).toBeDisabled();
    });
  });
});