import React from 'react';
import { render, screen, fireEvent, waitFor, createLegacySettingFormat } from '@/test/utils/testUtils';
import { ImprovedSecuritySection } from '../ImprovedSecuritySection';
import { toast } from 'react-hot-toast';
import type { ApplicationSetting, FeatureToggle } from '@/types/settings';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  },
}));

describe('ImprovedSecuritySection', () => {
  const mockSettings: ApplicationSetting[] = [
    {
      id: '1',
      category: 'security',
      setting_key: 'require_email_verification',
      setting_value: 'true',
      data_type: 'boolean',
      is_public: true,
      is_system: false,
      validation_rules: null,
      description: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      category: 'security',
      setting_key: 'enable_two_factor',
      setting_value: 'false',
      data_type: 'boolean',
      is_public: true,
      is_system: false,
      validation_rules: null,
      description: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '3',
      category: 'security',
      setting_key: 'session_timeout',
      setting_value: '3600',
      data_type: 'number',
      is_public: true,
      is_system: false,
      validation_rules: null,
      description: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '4',
      category: 'security',
      setting_key: 'max_login_attempts',
      setting_value: '5',
      data_type: 'number',
      is_public: true,
      is_system: false,
      validation_rules: null,
      description: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '5',
      category: 'security',
      setting_key: 'password_min_length',
      setting_value: '8',
      data_type: 'number',
      is_public: true,
      is_system: false,
      validation_rules: null,
      description: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '6',
      category: 'security',
      setting_key: 'require_strong_password',
      setting_value: 'true',
      data_type: 'boolean',
      is_public: true,
      is_system: false,
      validation_rules: null,
      description: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '7',
      category: 'security',
      setting_key: 'enable_rate_limiting',
      setting_value: 'true',
      data_type: 'boolean',
      is_public: true,
      is_system: false,
      validation_rules: null,
      description: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '8',
      category: 'security',
      setting_key: 'allowed_origins',
      setting_value: 'https://example.com,https://app.example.com',
      data_type: 'string',
      is_public: true,
      is_system: false,
      validation_rules: null,
      description: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ];

  const mockFeatures: FeatureToggle[] = [
    {
      id: '1',
      feature_key: 'security_monitoring',
      enabled: true,
      config: null,
      rollout_percentage: null,
      enabled_for_users: null,
      enabled_for_roles: null,
      description: 'Security monitoring features',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ];

  const defaultProps = {
    settings: mockSettings,
    features: mockFeatures,
    onUpdateSetting: jest.fn().mockResolvedValue(undefined),
    onRefresh: jest.fn().mockResolvedValue(undefined),
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders all security sections', () => {
      render(<ImprovedSecuritySection {...defaultProps} />);

      expect(screen.getByText('Authentication Settings')).toBeInTheDocument();
      expect(screen.getByText('Password Requirements')).toBeInTheDocument();
      expect(screen.getByText('Advanced Security')).toBeInTheDocument();
      expect(screen.getByText('Security Score')).toBeInTheDocument();
    });

    it('displays security score dashboard', () => {
      render(<ImprovedSecuritySection {...defaultProps} />);

      const scoreElement = screen.getByText(/Security Score:/);
      expect(scoreElement).toBeInTheDocument();
      expect(screen.getByText(/Good/)).toBeInTheDocument(); // With default settings
    });

    it('shows all toggle switches with correct states', () => {
      render(<ImprovedSecuritySection {...defaultProps} />);

      const emailVerification = screen.getByRole('switch', { name: /require email verification/i });
      const twoFactor = screen.getByRole('switch', { name: /enable two-factor authentication/i });
      const strongPassword = screen.getByRole('switch', { name: /require strong password/i });
      const rateLimiting = screen.getByRole('switch', { name: /enable rate limiting/i });

      expect(emailVerification).toBeChecked();
      expect(twoFactor).not.toBeChecked();
      expect(strongPassword).toBeChecked();
      expect(rateLimiting).toBeChecked();
    });
  });

  describe('Security Score Calculation', () => {
    it('calculates security score based on settings', () => {
      render(<ImprovedSecuritySection {...defaultProps} />);

      // With current settings: email verification (20) + strong password (15) + rate limiting (10) = 45
      expect(screen.getByText(/45%/)).toBeInTheDocument();
    });

    it('updates score when settings change', async () => {
      render(<ImprovedSecuritySection {...defaultProps} />);

      // Enable two-factor authentication
      const twoFactorSwitch = screen.getByRole('switch', { name: /enable two-factor authentication/i });
      fireEvent.click(twoFactorSwitch);

      await waitFor(() => {
        // Score should increase by 25 points
        expect(screen.getByText(/70%/)).toBeInTheDocument();
      });
    });

    it('shows appropriate status based on score', () => {
      const lowScoreSettings = mockSettings.map(s => ({
        ...s,
        setting_value: s.data_type === 'boolean' ? 'false' : s.setting_value,
      }));

      render(<ImprovedSecuritySection {...defaultProps} settings={lowScoreSettings} />);

      expect(screen.getByText(/Poor/)).toBeInTheDocument();
      expect(screen.getByText(/0%/)).toBeInTheDocument();
    });
  });

  describe('Authentication Settings', () => {
    it('handles email verification toggle', async () => {
      render(<ImprovedSecuritySection {...defaultProps} />);

      const toggle = screen.getByRole('switch', { name: /require email verification/i });
      fireEvent.click(toggle);

      await waitFor(() => {
        expect(toggle).not.toBeChecked();
      });

      // Should show warning when disabling
      expect(toast.warning).toHaveBeenCalledWith(
        'Disabling email verification may increase spam accounts'
      );
    });

    it('handles two-factor authentication toggle', async () => {
      render(<ImprovedSecuritySection {...defaultProps} />);

      const toggle = screen.getByRole('switch', { name: /enable two-factor authentication/i });
      fireEvent.click(toggle);

      await waitFor(() => {
        expect(toggle).toBeChecked();
      });
    });

    it('validates session timeout input', async () => {
      render(<ImprovedSecuritySection {...defaultProps} />);

      const timeoutInput = screen.getByLabelText('Session Timeout (seconds)');
      
      // Try to set invalid value
      fireEvent.change(timeoutInput, { target: { value: '0' } });

      await waitFor(() => {
        expect(screen.getByText(/Must be at least 300 seconds/)).toBeInTheDocument();
      });
    });

    it('validates max login attempts', async () => {
      render(<ImprovedSecuritySection {...defaultProps} />);

      const attemptsInput = screen.getByLabelText('Max Login Attempts');
      
      // Set valid value
      fireEvent.change(attemptsInput, { target: { value: '10' } });

      await waitFor(() => {
        expect(attemptsInput).toHaveValue(10);
      });
    });
  });

  describe('Password Requirements', () => {
    it('handles password length changes', async () => {
      render(<ImprovedSecuritySection {...defaultProps} />);

      const lengthInput = screen.getByLabelText('Minimum Password Length');
      fireEvent.change(lengthInput, { target: { value: '12' } });

      await waitFor(() => {
        expect(lengthInput).toHaveValue(12);
      });
    });

    it('shows password policy preview', async () => {
      render(<ImprovedSecuritySection {...defaultProps} />);

      // Check if password requirements are displayed
      expect(screen.getByText(/At least 8 characters/)).toBeInTheDocument();
      
      // When strong password is enabled
      expect(screen.getByText(/uppercase letter/i)).toBeInTheDocument();
      expect(screen.getByText(/lowercase letter/i)).toBeInTheDocument();
      expect(screen.getByText(/number/i)).toBeInTheDocument();
      expect(screen.getByText(/special character/i)).toBeInTheDocument();
    });

    it('updates preview when requirements change', async () => {
      render(<ImprovedSecuritySection {...defaultProps} />);

      // Disable strong password requirement
      const strongPasswordToggle = screen.getByRole('switch', { name: /require strong password/i });
      fireEvent.click(strongPasswordToggle);

      await waitFor(() => {
        // Complex requirements should disappear
        expect(screen.queryByText(/uppercase letter/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Advanced Security', () => {
    it('handles rate limiting toggle', async () => {
      render(<ImprovedSecuritySection {...defaultProps} />);

      const toggle = screen.getByRole('switch', { name: /enable rate limiting/i });
      fireEvent.click(toggle);

      await waitFor(() => {
        expect(toggle).not.toBeChecked();
      });

      expect(toast.warning).toHaveBeenCalledWith(
        'Disabling rate limiting may expose your site to brute force attacks'
      );
    });

    it('handles CORS origins input', async () => {
      render(<ImprovedSecuritySection {...defaultProps} />);

      const originsInput = screen.getByLabelText('Allowed Origins (CORS)');
      const newOrigins = 'https://new.example.com,https://another.example.com';
      
      fireEvent.change(originsInput, { target: { value: newOrigins } });

      await waitFor(() => {
        expect(originsInput).toHaveValue(newOrigins);
      });
    });

    it('validates CORS origins format', async () => {
      render(<ImprovedSecuritySection {...defaultProps} />);

      const originsInput = screen.getByLabelText('Allowed Origins (CORS)');
      
      // Invalid URL
      fireEvent.change(originsInput, { target: { value: 'not-a-url' } });

      // Try to save
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Invalid URL format in allowed origins');
      });
    });
  });

  describe('Batch Save Operations', () => {
    it('saves multiple changes at once', async () => {
      render(<ImprovedSecuritySection {...defaultProps} />);

      // Make multiple changes
      const twoFactorToggle = screen.getByRole('switch', { name: /enable two-factor authentication/i });
      fireEvent.click(twoFactorToggle);

      const passwordLength = screen.getByLabelText('Minimum Password Length');
      fireEvent.change(passwordLength, { target: { value: '10' } });

      const sessionTimeout = screen.getByLabelText('Session Timeout (seconds)');
      fireEvent.change(sessionTimeout, { target: { value: '7200' } });

      // Save all changes
      const saveButton = screen.getByRole('button', { name: /save changes \(3\)/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(defaultProps.onUpdateSetting).toHaveBeenCalledTimes(3);
        expect(toast.success).toHaveBeenCalledWith('Security settings saved successfully');
      });
    });

    it('handles partial save failures', async () => {
      const errorProps = {
        ...defaultProps,
        onUpdateSetting: jest.fn()
          .mockResolvedValueOnce(undefined) // First succeeds
          .mockRejectedValueOnce(new Error('Failed')), // Second fails
      };

      render(<ImprovedSecuritySection {...errorProps} />);

      // Make changes
      const twoFactorToggle = screen.getByRole('switch', { name: /enable two-factor authentication/i });
      fireEvent.click(twoFactorToggle);

      const passwordLength = screen.getByLabelText('Minimum Password Length');
      fireEvent.change(passwordLength, { target: { value: '10' } });

      // Try to save
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to save some settings');
      });
    });
  });

  describe('Security Recommendations', () => {
    it('shows recommendations based on current settings', () => {
      render(<ImprovedSecuritySection {...defaultProps} />);

      // With two-factor disabled, should show recommendation
      expect(screen.getByText(/Enable two-factor authentication/)).toBeInTheDocument();
    });

    it('hides recommendations when all security features are enabled', () => {
      const secureSettings = mockSettings.map(s => ({
        ...s,
        setting_value: s.setting_key === 'enable_two_factor' ? 'true' : s.setting_value,
      }));

      render(<ImprovedSecuritySection {...defaultProps} settings={secureSettings} />);

      // Should show excellent security message
      expect(screen.getByText(/Excellent/)).toBeInTheDocument();
    });
  });

  describe('Reset Functionality', () => {
    it('resets all changes to original values', async () => {
      render(<ImprovedSecuritySection {...defaultProps} />);

      // Make changes
      const twoFactorToggle = screen.getByRole('switch', { name: /enable two-factor authentication/i });
      fireEvent.click(twoFactorToggle);

      const passwordLength = screen.getByLabelText('Minimum Password Length');
      fireEvent.change(passwordLength, { target: { value: '12' } });

      // Reset
      const resetButton = screen.getByRole('button', { name: /reset/i });
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(twoFactorToggle).not.toBeChecked();
        expect(passwordLength).toHaveValue(8);
      });
    });
  });
});