import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/test/utils/testUtils';
import { ImprovedUserManagementSection } from '../ImprovedUserManagementSection';
import { toast } from 'react-hot-toast';
import type { ApplicationSetting } from '@/types/settings';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  },
}));

describe('ImprovedUserManagementSection', () => {
  const mockSettings: ApplicationSetting[] = [
    {
      key: 'allow_registration',
      value: 'true',
      category: 'users',
      data_type: 'boolean' as const,
    },
    {
      key: 'require_admin_approval',
      value: 'false',
      category: 'users',
      data_type: 'boolean' as const,
    },
    {
      key: 'auto_assign_role',
      value: 'authenticated',
      category: 'users',
      data_type: 'string' as const,
    },
    {
      key: 'enable_profile_visibility',
      value: 'true',
      category: 'users',
      data_type: 'boolean' as const,
    },
    {
      key: 'default_profile_privacy',
      value: 'public',
      category: 'users',
      data_type: 'string' as const,
    },
    {
      key: 'allow_username_change',
      value: 'true',
      category: 'users',
      data_type: 'boolean' as const,
    },
    {
      key: 'username_change_cooldown',
      value: '30',
      category: 'users',
      data_type: 'number' as const,
    },
    {
      key: 'max_profile_image_size',
      value: '5242880',
      category: 'users',
      data_type: 'number' as const,
    },
  ];

  const defaultProps = {
    settings: mockSettings,
    onUpdateSetting: jest.fn().mockResolvedValue(undefined),
    onRefresh: jest.fn().mockResolvedValue(undefined),
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders all user management sections', () => {
      render(<ImprovedUserManagementSection {...defaultProps} />);

      expect(screen.getByText('Registration Settings')).toBeInTheDocument();
      expect(screen.getByText('User Roles & Permissions')).toBeInTheDocument();
      expect(screen.getByText('Profile Settings')).toBeInTheDocument();
      expect(screen.getByText('Account Policies')).toBeInTheDocument();
    });

    it('displays current settings correctly', () => {
      render(<ImprovedUserManagementSection {...defaultProps} />);

      // Check toggles
      const registrationToggle = screen.getByRole('switch', { name: /allow new user registration/i });
      expect(registrationToggle).toBeChecked();

      const approvalToggle = screen.getByRole('switch', { name: /require admin approval/i });
      expect(approvalToggle).not.toBeChecked();

      // Check select fields
      const defaultRole = screen.getByLabelText('Default Role for New Users');
      expect(defaultRole).toHaveValue('authenticated');
    });
  });

  describe('Registration Settings', () => {
    it('handles registration toggle', async () => {
      render(<ImprovedUserManagementSection {...defaultProps} />);

      const toggle = screen.getByRole('switch', { name: /allow new user registration/i });
      fireEvent.click(toggle);

      await waitFor(() => {
        expect(toggle).not.toBeChecked();
      });

      // Should show warning when disabling
      expect(toast.warning).toHaveBeenCalledWith(
        'Disabling registration will prevent new users from signing up'
      );
    });

    it('handles admin approval toggle', async () => {
      render(<ImprovedUserManagementSection {...defaultProps} />);

      const toggle = screen.getByRole('switch', { name: /require admin approval/i });
      fireEvent.click(toggle);

      await waitFor(() => {
        expect(toggle).toBeChecked();
      });

      // Should show info message
      expect(screen.getByText(/New users will need admin approval/)).toBeInTheDocument();
    });

    it('disables approval toggle when registration is disabled', async () => {
      const disabledRegSettings = mockSettings.map(s => ({
        ...s,
        value: s.key === 'allow_registration' ? 'false' : s.value,
      }));

      render(<ImprovedUserManagementSection {...defaultProps} settings={disabledRegSettings} />);

      const approvalToggle = screen.getByRole('switch', { name: /require admin approval/i });
      expect(approvalToggle).toBeDisabled();
    });
  });

  describe('User Roles & Permissions', () => {
    it('handles default role selection', async () => {
      render(<ImprovedUserManagementSection {...defaultProps} />);

      const roleSelect = screen.getByLabelText('Default Role for New Users');
      fireEvent.change(roleSelect, { target: { value: 'group_member' } });

      await waitFor(() => {
        expect(roleSelect).toHaveValue('group_member');
      });
    });

    it('shows role permissions preview', () => {
      render(<ImprovedUserManagementSection {...defaultProps} />);

      // Should show permissions for selected role
      expect(screen.getByText(/Authenticated User Permissions:/)).toBeInTheDocument();
      expect(screen.getByText(/Basic access to public content/)).toBeInTheDocument();
    });

    it('updates permissions preview when role changes', async () => {
      render(<ImprovedUserManagementSection {...defaultProps} />);

      const roleSelect = screen.getByLabelText('Default Role for New Users');
      fireEvent.change(roleSelect, { target: { value: 'group_member' } });

      await waitFor(() => {
        expect(screen.getByText(/Group Member Permissions:/)).toBeInTheDocument();
        expect(screen.getByText(/Create and manage content/)).toBeInTheDocument();
      });
    });
  });

  describe('Profile Settings', () => {
    it('handles profile visibility toggle', async () => {
      render(<ImprovedUserManagementSection {...defaultProps} />);

      const toggle = screen.getByRole('switch', { name: /enable profile visibility controls/i });
      fireEvent.click(toggle);

      await waitFor(() => {
        expect(toggle).not.toBeChecked();
      });
    });

    it('handles default privacy settings', async () => {
      render(<ImprovedUserManagementSection {...defaultProps} />);

      const privacySelect = screen.getByLabelText('Default Profile Privacy');
      fireEvent.change(privacySelect, { target: { value: 'private' } });

      await waitFor(() => {
        expect(privacySelect).toHaveValue('private');
      });
    });

    it('validates profile image size', async () => {
      render(<ImprovedUserManagementSection {...defaultProps} />);

      const sizeInput = screen.getByLabelText('Max Profile Image Size (MB)');
      
      // Try to set invalid value
      fireEvent.change(sizeInput, { target: { value: '0' } });

      await waitFor(() => {
        expect(screen.getByText(/Must be at least 1 MB/)).toBeInTheDocument();
      });

      // Set valid value
      fireEvent.change(sizeInput, { target: { value: '10' } });

      await waitFor(() => {
        expect(sizeInput).toHaveValue(10);
      });
    });

    it('converts MB to bytes correctly', async () => {
      render(<ImprovedUserManagementSection {...defaultProps} />);

      const sizeInput = screen.getByLabelText('Max Profile Image Size (MB)');
      expect(sizeInput).toHaveValue(5); // 5242880 bytes = 5 MB

      fireEvent.change(sizeInput, { target: { value: '10' } });

      // When saving, should convert to bytes
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(defaultProps.onUpdateSetting).toHaveBeenCalledWith(
          expect.objectContaining({
            key: 'max_profile_image_size',
            value: '10485760', // 10 MB in bytes
          })
        );
      });
    });
  });

  describe('Account Policies', () => {
    it('handles username change toggle', async () => {
      render(<ImprovedUserManagementSection {...defaultProps} />);

      const toggle = screen.getByRole('switch', { name: /allow username changes/i });
      fireEvent.click(toggle);

      await waitFor(() => {
        expect(toggle).not.toBeChecked();
      });

      // Cooldown field should be disabled
      const cooldownInput = screen.getByLabelText('Username Change Cooldown (days)');
      expect(cooldownInput).toBeDisabled();
    });

    it('validates username change cooldown', async () => {
      render(<ImprovedUserManagementSection {...defaultProps} />);

      const cooldownInput = screen.getByLabelText('Username Change Cooldown (days)');
      
      // Set valid value
      fireEvent.change(cooldownInput, { target: { value: '60' } });

      await waitFor(() => {
        expect(cooldownInput).toHaveValue(60);
      });

      // Try invalid value
      fireEvent.change(cooldownInput, { target: { value: '-1' } });

      await waitFor(() => {
        expect(screen.getByText(/Must be at least 0 days/)).toBeInTheDocument();
      });
    });

    it('shows policy summary', () => {
      render(<ImprovedUserManagementSection {...defaultProps} />);

      // Should show current policies
      expect(screen.getByText(/Current Policies Summary/)).toBeInTheDocument();
      expect(screen.getByText(/Registration: Open/)).toBeInTheDocument();
      expect(screen.getByText(/Username changes: Allowed/)).toBeInTheDocument();
    });
  });

  describe('Batch Save Operations', () => {
    it('saves multiple changes together', async () => {
      render(<ImprovedUserManagementSection {...defaultProps} />);

      // Make multiple changes
      const approvalToggle = screen.getByRole('switch', { name: /require admin approval/i });
      fireEvent.click(approvalToggle);

      const roleSelect = screen.getByLabelText('Default Role for New Users');
      fireEvent.change(roleSelect, { target: { value: 'group_member' } });

      const privacySelect = screen.getByLabelText('Default Profile Privacy');
      fireEvent.change(privacySelect, { target: { value: 'members_only' } });

      // Save all changes
      const saveButton = screen.getByRole('button', { name: /save changes \(3\)/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(defaultProps.onUpdateSetting).toHaveBeenCalledTimes(3);
        expect(toast.success).toHaveBeenCalledWith('User management settings saved successfully');
      });
    });

    it('shows unsaved changes count', async () => {
      render(<ImprovedUserManagementSection {...defaultProps} />);

      // Make one change
      const approvalToggle = screen.getByRole('switch', { name: /require admin approval/i });
      fireEvent.click(approvalToggle);

      await waitFor(() => {
        const saveButton = screen.getByRole('button', { name: /save changes/i });
        expect(saveButton).toHaveTextContent('Save Changes (1)');
      });

      // Make another change
      const roleSelect = screen.getByLabelText('Default Role for New Users');
      fireEvent.change(roleSelect, { target: { value: 'group_member' } });

      await waitFor(() => {
        const saveButton = screen.getByRole('button', { name: /save changes/i });
        expect(saveButton).toHaveTextContent('Save Changes (2)');
      });
    });
  });

  describe('Reset Functionality', () => {
    it('resets all changes', async () => {
      render(<ImprovedUserManagementSection {...defaultProps} />);

      // Make changes
      const approvalToggle = screen.getByRole('switch', { name: /require admin approval/i });
      fireEvent.click(approvalToggle);

      const roleSelect = screen.getByLabelText('Default Role for New Users');
      fireEvent.change(roleSelect, { target: { value: 'group_member' } });

      // Reset
      const resetButton = screen.getByRole('button', { name: /reset/i });
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(approvalToggle).not.toBeChecked();
        expect(roleSelect).toHaveValue('authenticated');
        
        // Save button should show no changes
        const saveButton = screen.getByRole('button', { name: /save changes/i });
        expect(saveButton).toHaveTextContent('Save Changes');
      });
    });
  });

  describe('Loading State', () => {
    it('disables form during loading', () => {
      render(<ImprovedUserManagementSection {...defaultProps} isLoading={true} />);

      // All inputs should be disabled
      const toggles = screen.getAllByRole('switch');
      toggles.forEach(toggle => {
        expect(toggle).toBeDisabled();
      });

      const selects = screen.getAllByRole('combobox');
      selects.forEach(select => {
        expect(select).toBeDisabled();
      });

      // Save button shows loading state
      const saveButton = screen.getByRole('button', { name: /processing/i });
      expect(saveButton).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('handles save errors gracefully', async () => {
      const errorProps = {
        ...defaultProps,
        onUpdateSetting: jest.fn().mockRejectedValue(new Error('Network error')),
      };

      render(<ImprovedUserManagementSection {...errorProps} />);

      // Make a change
      const approvalToggle = screen.getByRole('switch', { name: /require admin approval/i });
      fireEvent.click(approvalToggle);

      // Try to save
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to save user management settings');
      });
    });
  });
});