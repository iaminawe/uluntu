import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { PrivacySettingsStep } from '../../../../components/steps/PrivacySettingsStep';

describe('PrivacySettingsStep', () => {
  const mockOnNext = jest.fn();
  
  const defaultProps = {
    settings: {
      profileVisibility: 'members_only',
      showEmail: false,
      showPhone: false,
      allowMessages: true,
      allowNetworkingRequests: true,
      emailNotifications: {
        newsletters: true,
        eventInvites: true,
        messageAlerts: true,
        groupUpdates: true,
      },
    },
    onNext: mockOnNext,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(<PrivacySettingsStep {...defaultProps} {...props} />);
  };

  describe('Profile Visibility', () => {
    it('should display visibility options', () => {
      renderComponent();

      expect(screen.getByLabelText('Public')).toBeInTheDocument();
      expect(screen.getByLabelText('Members Only')).toBeInTheDocument();
      expect(screen.getByLabelText('Private')).toBeInTheDocument();
    });

    it('should select the current visibility setting', () => {
      renderComponent();

      const membersOnlyRadio = screen.getByLabelText('Members Only');
      expect(membersOnlyRadio).toBeChecked();
    });

    it('should update visibility selection', async () => {
      renderComponent();

      const publicRadio = screen.getByLabelText('Public');
      fireEvent.click(publicRadio);

      expect(publicRadio).toBeChecked();
    });

    it('should show visibility implications', () => {
      renderComponent();

      // Check for description of each option
      expect(screen.getByText(/Anyone can view your profile/)).toBeInTheDocument();
      expect(screen.getByText(/Only logged-in members can view/)).toBeInTheDocument();
      expect(screen.getByText(/Only you can view your profile/)).toBeInTheDocument();
    });

    it('should disable contact options when profile is private', async () => {
      renderComponent();

      // Select private visibility
      const privateRadio = screen.getByLabelText('Private');
      fireEvent.click(privateRadio);

      // Contact options should be disabled
      await waitFor(() => {
        expect(screen.getByLabelText('Show Email Address')).toBeDisabled();
        expect(screen.getByLabelText('Show Phone Number')).toBeDisabled();
        expect(screen.getByLabelText('Allow Messages')).toBeDisabled();
        expect(screen.getByLabelText('Allow Networking Requests')).toBeDisabled();
      });
    });
  });

  describe('Contact Information Display', () => {
    it('should toggle email visibility', async () => {
      renderComponent();

      const showEmailCheckbox = screen.getByLabelText('Show Email Address');
      expect(showEmailCheckbox).not.toBeChecked();

      fireEvent.click(showEmailCheckbox);
      expect(showEmailCheckbox).toBeChecked();
    });

    it('should toggle phone visibility', async () => {
      renderComponent();

      const showPhoneCheckbox = screen.getByLabelText('Show Phone Number');
      expect(showPhoneCheckbox).not.toBeChecked();

      fireEvent.click(showPhoneCheckbox);
      expect(showPhoneCheckbox).toBeChecked();
    });

    it('should warn when making contact info public', async () => {
      renderComponent();

      // Select public visibility
      fireEvent.click(screen.getByLabelText('Public'));
      
      // Enable email visibility
      fireEvent.click(screen.getByLabelText('Show Email Address'));

      // Should show warning
      await waitFor(() => {
        expect(screen.getByTestId('contact-warning')).toHaveTextContent(
          'Your email will be visible to anyone on the internet'
        );
      });
    });
  });

  describe('Communication Preferences', () => {
    it('should toggle message allowance', async () => {
      renderComponent();

      const allowMessagesCheckbox = screen.getByLabelText('Allow Messages');
      expect(allowMessagesCheckbox).toBeChecked();

      fireEvent.click(allowMessagesCheckbox);
      expect(allowMessagesCheckbox).not.toBeChecked();
    });

    it('should toggle networking requests', async () => {
      renderComponent();

      const networkingCheckbox = screen.getByLabelText('Allow Networking Requests');
      expect(networkingCheckbox).toBeChecked();

      fireEvent.click(networkingCheckbox);
      expect(networkingCheckbox).not.toBeChecked();
    });
  });

  describe('Email Notifications', () => {
    it('should display all notification options', () => {
      renderComponent();

      expect(screen.getByLabelText('Newsletter & Updates')).toBeInTheDocument();
      expect(screen.getByLabelText('Event Invitations')).toBeInTheDocument();
      expect(screen.getByLabelText('Message Alerts')).toBeInTheDocument();
      expect(screen.getByLabelText('Group Activity Updates')).toBeInTheDocument();
    });

    it('should toggle individual notification preferences', async () => {
      renderComponent();

      const newsletterCheckbox = screen.getByLabelText('Newsletter & Updates');
      expect(newsletterCheckbox).toBeChecked();

      fireEvent.click(newsletterCheckbox);
      expect(newsletterCheckbox).not.toBeChecked();
    });

    it('should have select/deselect all functionality', async () => {
      renderComponent();

      const selectAllButton = screen.getByTestId('select-all-notifications');
      fireEvent.click(selectAllButton);

      // All should be checked
      expect(screen.getByLabelText('Newsletter & Updates')).toBeChecked();
      expect(screen.getByLabelText('Event Invitations')).toBeChecked();
      expect(screen.getByLabelText('Message Alerts')).toBeChecked();
      expect(screen.getByLabelText('Group Activity Updates')).toBeChecked();

      // Deselect all
      const deselectAllButton = screen.getByTestId('deselect-all-notifications');
      fireEvent.click(deselectAllButton);

      // All should be unchecked
      expect(screen.getByLabelText('Newsletter & Updates')).not.toBeChecked();
      expect(screen.getByLabelText('Event Invitations')).not.toBeChecked();
      expect(screen.getByLabelText('Message Alerts')).not.toBeChecked();
      expect(screen.getByLabelText('Group Activity Updates')).not.toBeChecked();
    });

    it('should disable message alerts when messages are not allowed', async () => {
      renderComponent();

      // Disable messages
      fireEvent.click(screen.getByLabelText('Allow Messages'));

      // Message alerts should be disabled
      await waitFor(() => {
        const messageAlertsCheckbox = screen.getByLabelText('Message Alerts');
        expect(messageAlertsCheckbox).toBeDisabled();
        expect(messageAlertsCheckbox).not.toBeChecked();
      });
    });
  });

  describe('Data Sharing Consent', () => {
    it('should require data processing consent', async () => {
      renderComponent({ settings: { ...defaultProps.settings } });

      // Try to submit without consent
      fireEvent.click(screen.getByTestId('next-button'));

      await waitFor(() => {
        expect(screen.getByTestId('consent-error')).toHaveTextContent(
          'You must agree to data processing to continue'
        );
      });
    });

    it('should show privacy policy link', () => {
      renderComponent();

      const privacyLink = screen.getByText('Privacy Policy');
      expect(privacyLink).toHaveAttribute('href', '/privacy-policy');
      expect(privacyLink).toHaveAttribute('target', '_blank');
    });

    it('should show terms of service link', () => {
      renderComponent();

      const termsLink = screen.getByText('Terms of Service');
      expect(termsLink).toHaveAttribute('href', '/terms-of-service');
      expect(termsLink).toHaveAttribute('target', '_blank');
    });
  });

  describe('Form Submission', () => {
    it('should submit valid privacy settings', async () => {
      renderComponent();

      // Modify some settings
      fireEvent.click(screen.getByLabelText('Public'));
      fireEvent.click(screen.getByLabelText('Show Email Address'));
      fireEvent.click(screen.getByLabelText('Newsletter & Updates')); // Uncheck
      
      // Accept consent
      fireEvent.click(screen.getByLabelText(/I agree to the processing/));

      // Submit
      fireEvent.click(screen.getByTestId('next-button'));

      await waitFor(() => {
        expect(mockOnNext).toHaveBeenCalledWith({
          profileVisibility: 'public',
          showEmail: true,
          showPhone: false,
          allowMessages: true,
          allowNetworkingRequests: true,
          emailNotifications: {
            newsletters: false,
            eventInvites: true,
            messageAlerts: true,
            groupUpdates: true,
          },
          dataProcessingConsent: true,
        });
      });
    });

    it('should validate consistency of settings', async () => {
      renderComponent();

      // Set to private
      fireEvent.click(screen.getByLabelText('Private'));
      
      // Accept consent
      fireEvent.click(screen.getByLabelText(/I agree to the processing/));

      // Submit
      fireEvent.click(screen.getByTestId('next-button'));

      // Should auto-disable contact options
      await waitFor(() => {
        expect(mockOnNext).toHaveBeenCalledWith(
          expect.objectContaining({
            profileVisibility: 'private',
            showEmail: false,
            showPhone: false,
            allowMessages: false,
            allowNetworkingRequests: false,
          })
        );
      });
    });
  });

  describe('Privacy Tips', () => {
    it('should show privacy recommendations', () => {
      renderComponent();

      expect(screen.getByTestId('privacy-tip')).toHaveTextContent(
        /We recommend keeping your profile visible to members/
      );
    });

    it('should update tips based on selections', async () => {
      renderComponent();

      // Select public with email visible
      fireEvent.click(screen.getByLabelText('Public'));
      fireEvent.click(screen.getByLabelText('Show Email Address'));

      await waitFor(() => {
        expect(screen.getByTestId('privacy-tip')).toHaveTextContent(
          /Consider using a professional email address/
        );
      });
    });
  });

  describe('Mandatory Step', () => {
    it('should not show skip button', () => {
      renderComponent();

      expect(screen.queryByTestId('skip-button')).not.toBeInTheDocument();
    });

    it('should indicate this is a required step', () => {
      renderComponent();

      expect(screen.getByTestId('step-indicator')).toHaveTextContent('Required Step');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderComponent();

      const visibilityFieldset = screen.getByRole('group', { name: /Profile Visibility/i });
      expect(visibilityFieldset).toBeInTheDocument();

      expect(screen.getByLabelText('Public')).toHaveAttribute('aria-describedby', 'visibility-public-desc');
    });

    it('should announce changes to screen readers', async () => {
      renderComponent();

      fireEvent.click(screen.getByLabelText('Private'));

      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent(
          'Contact options have been disabled due to private profile setting'
        );
      });
    });

    it('should be keyboard navigable', async () => {
      renderComponent();

      // Tab through options
      await userEvent.tab();
      expect(screen.getByLabelText('Public')).toHaveFocus();

      await userEvent.tab();
      expect(screen.getByLabelText('Members Only')).toHaveFocus();

      await userEvent.tab();
      expect(screen.getByLabelText('Private')).toHaveFocus();
    });

    it('should group related settings', () => {
      renderComponent();

      expect(screen.getByRole('group', { name: /Profile Visibility/i })).toBeInTheDocument();
      expect(screen.getByRole('group', { name: /Contact Information/i })).toBeInTheDocument();
      expect(screen.getByRole('group', { name: /Communication Preferences/i })).toBeInTheDocument();
      expect(screen.getByRole('group', { name: /Email Notifications/i })).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading state during submission', async () => {
      mockOnNext.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
      
      renderComponent();

      // Fill required fields
      fireEvent.click(screen.getByLabelText(/I agree to the processing/));
      fireEvent.click(screen.getByTestId('next-button'));

      expect(screen.getByTestId('next-button')).toBeDisabled();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });
});