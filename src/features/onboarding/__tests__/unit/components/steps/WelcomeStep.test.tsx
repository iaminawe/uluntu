import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { WelcomeStep } from '../../../../components/steps/WelcomeStep';
import { uploadProfilePhoto } from '@/features/directory/api/membersApi';

// Mock API
jest.mock('../../../../../../api/membersApi');
const mockUploadProfilePhoto = uploadProfilePhoto as jest.MockedFunction<typeof uploadProfilePhoto>;

describe('WelcomeStep', () => {
  const mockOnNext = jest.fn();
  const defaultProps = {
    userData: {},
    onNext: mockOnNext,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(<WelcomeStep {...defaultProps} {...props} />);
  };

  describe('Form Validation', () => {
    it('should require all mandatory fields', async () => {
      // Given: An empty form
      renderComponent();

      // When: User tries to submit without filling fields
      fireEvent.click(screen.getByTestId('next-button'));

      // Then: Should show validation errors
      await waitFor(() => {
        expect(screen.getByTestId('name-error')).toHaveTextContent('Name is required');
        expect(screen.getByTestId('title-error')).toHaveTextContent('Title is required');
        expect(screen.getByTestId('location-error')).toHaveTextContent('Location is required');
        expect(mockOnNext).not.toHaveBeenCalled();
      });
    });

    it('should validate name length', async () => {
      // Given: A form with very short name
      renderComponent();

      // When: User enters single character name
      await userEvent.type(screen.getByLabelText('Name'), 'A');
      fireEvent.click(screen.getByTestId('next-button'));

      // Then: Should show length error
      await waitFor(() => {
        expect(screen.getByTestId('name-error')).toHaveTextContent(
          'Name must be at least 2 characters'
        );
      });
    });

    it('should validate name with maximum length', async () => {
      // Given: A form
      renderComponent();

      // When: User enters very long name
      const longName = 'A'.repeat(101);
      await userEvent.type(screen.getByLabelText('Name'), longName);
      fireEvent.click(screen.getByTestId('next-button'));

      // Then: Should show length error
      await waitFor(() => {
        expect(screen.getByTestId('name-error')).toHaveTextContent(
          'Name must be less than 100 characters'
        );
      });
    });

    it('should validate title length', async () => {
      // Given: A form
      renderComponent();

      // When: User enters very short title
      await userEvent.type(screen.getByLabelText('Title'), 'A');
      fireEvent.click(screen.getByTestId('next-button'));

      // Then: Should show length error
      await waitFor(() => {
        expect(screen.getByTestId('title-error')).toHaveTextContent(
          'Title must be at least 2 characters'
        );
      });
    });

    it('should validate location format', async () => {
      // Given: A form
      renderComponent();

      // When: User enters invalid location
      await userEvent.type(screen.getByLabelText('Location'), '123');
      fireEvent.click(screen.getByTestId('next-button'));

      // Then: Should show format error
      await waitFor(() => {
        expect(screen.getByTestId('location-error')).toHaveTextContent(
          'Please enter a valid location'
        );
      });
    });

    it('should accept valid form data', async () => {
      // Given: A form
      renderComponent();

      // When: User fills all fields correctly
      await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
      await userEvent.type(screen.getByLabelText('Title'), 'Software Developer');
      await userEvent.type(screen.getByLabelText('Location'), 'Vancouver, BC');

      fireEvent.click(screen.getByTestId('next-button'));

      // Then: Should call onNext with data
      await waitFor(() => {
        expect(mockOnNext).toHaveBeenCalledWith({
          name: 'John Doe',
          title: 'Software Developer',
          location: 'Vancouver, BC',
        });
      });
    });
  });

  describe('Photo Upload', () => {
    it('should accept valid image files', async () => {
      // Given: A valid image file
      const file = new File(['image content'], 'photo.jpg', { 
        type: 'image/jpeg' 
      });
      
      mockUploadProfilePhoto.mockResolvedValue({
        url: 'https://example.com/photo.jpg',
      });
      
      renderComponent();

      // When: User uploads the file
      const input = screen.getByLabelText('Profile Photo (optional)');
      await userEvent.upload(input, file);

      // Then: Should show preview
      await waitFor(() => {
        expect(screen.getByTestId('photo-preview')).toBeInTheDocument();
        expect(screen.getByAltText('Profile preview')).toHaveAttribute(
          'src',
          expect.stringContaining('blob:')
        );
      });
    });

    it('should reject files over 5MB', async () => {
      // Given: A large file (6MB)
      const largeContent = new Uint8Array(6 * 1024 * 1024);
      const largeFile = new File([largeContent], 'large.jpg', {
        type: 'image/jpeg'
      });
      
      renderComponent();

      // When: User uploads the large file
      const input = screen.getByLabelText('Profile Photo (optional)');
      await userEvent.upload(input, largeFile);

      // Then: Should show error
      await waitFor(() => {
        expect(screen.getByTestId('photo-error')).toHaveTextContent(
          'File size must be less than 5MB'
        );
        expect(screen.queryByTestId('photo-preview')).not.toBeInTheDocument();
      });
    });

    it('should reject non-image files', async () => {
      // Given: A PDF file
      const pdfFile = new File(['pdf content'], 'document.pdf', {
        type: 'application/pdf'
      });
      
      renderComponent();

      // When: User uploads the PDF
      const input = screen.getByLabelText('Profile Photo (optional)');
      await userEvent.upload(input, pdfFile);

      // Then: Should show error
      await waitFor(() => {
        expect(screen.getByTestId('photo-error')).toHaveTextContent(
          'Please upload an image file (JPEG, PNG, or WebP)'
        );
      });
    });

    it('should allow removing uploaded photo', async () => {
      // Given: User has uploaded a photo
      const file = new File(['image'], 'photo.jpg', { type: 'image/jpeg' });
      renderComponent();
      
      const input = screen.getByLabelText('Profile Photo (optional)');
      await userEvent.upload(input, file);
      
      await waitFor(() => {
        expect(screen.getByTestId('photo-preview')).toBeInTheDocument();
      });

      // When: User clicks remove
      fireEvent.click(screen.getByTestId('remove-photo-button'));

      // Then: Preview should be removed
      expect(screen.queryByTestId('photo-preview')).not.toBeInTheDocument();
    });

    it('should handle upload errors gracefully', async () => {
      // Given: Upload will fail
      mockUploadProfilePhoto.mockRejectedValue(new Error('Upload failed'));
      
      const file = new File(['image'], 'photo.jpg', { type: 'image/jpeg' });
      renderComponent();

      // Fill required fields
      await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
      await userEvent.type(screen.getByLabelText('Title'), 'Developer');
      await userEvent.type(screen.getByLabelText('Location'), 'Vancouver');

      // When: User uploads file and submits
      const input = screen.getByLabelText('Profile Photo (optional)');
      await userEvent.upload(input, file);
      
      fireEvent.click(screen.getByTestId('next-button'));

      // Then: Should show error but allow proceeding without photo
      await waitFor(() => {
        expect(screen.getByTestId('photo-error')).toHaveTextContent(
          'Failed to upload photo. You can continue without it.'
        );
        // Should still call onNext without photo
        expect(mockOnNext).toHaveBeenCalledWith({
          name: 'John Doe',
          title: 'Developer',
          location: 'Vancouver',
          profilePhoto: undefined,
        });
      });
    });
  });

  describe('Welcome Message', () => {
    it('should display personalized welcome for returning users', () => {
      // Given: User with existing data
      renderComponent({
        userData: { name: 'Jane Smith' },
      });

      // Then: Should show personalized message
      expect(screen.getByTestId('welcome-message')).toHaveTextContent(
        'Welcome back, Jane! Let\'s complete your profile.'
      );
    });

    it('should display generic welcome for new users', () => {
      // Given: New user
      renderComponent();

      // Then: Should show generic message
      expect(screen.getByTestId('welcome-message')).toHaveTextContent(
        'Welcome to Nelson Tech Community! Let\'s get you started.'
      );
    });
  });

  describe('Form State', () => {
    it('should populate form with existing user data', () => {
      // Given: User with existing data
      const existingData = {
        name: 'John Doe',
        title: 'Senior Developer',
        location: 'Toronto, ON',
      };
      
      renderComponent({ userData: existingData });

      // Then: Form should be pre-filled
      expect(screen.getByLabelText('Name')).toHaveValue('John Doe');
      expect(screen.getByLabelText('Title')).toHaveValue('Senior Developer');
      expect(screen.getByLabelText('Location')).toHaveValue('Toronto, ON');
    });

    it('should clear validation errors when user types', async () => {
      // Given: Form with validation errors
      renderComponent();
      fireEvent.click(screen.getByTestId('next-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('name-error')).toBeInTheDocument();
      });

      // When: User starts typing
      await userEvent.type(screen.getByLabelText('Name'), 'J');

      // Then: Error should clear
      expect(screen.queryByTestId('name-error')).not.toBeInTheDocument();
    });

    it('should show loading state during submission', async () => {
      // Given: Slow upload
      mockUploadProfilePhoto.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );
      
      const file = new File(['image'], 'photo.jpg', { type: 'image/jpeg' });
      renderComponent();
      
      // Fill form
      await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
      await userEvent.type(screen.getByLabelText('Title'), 'Developer');
      await userEvent.type(screen.getByLabelText('Location'), 'Vancouver');
      await userEvent.upload(screen.getByLabelText('Profile Photo (optional)'), file);

      // When: Submit form
      fireEvent.click(screen.getByTestId('next-button'));

      // Then: Should show loading state
      expect(screen.getByTestId('next-button')).toBeDisabled();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderComponent();

      expect(screen.getByLabelText('Name')).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText('Title')).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText('Location')).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText('Profile Photo (optional)')).toHaveAttribute('aria-required', 'false');
    });

    it('should announce errors to screen readers', async () => {
      renderComponent();
      
      fireEvent.click(screen.getByTestId('next-button'));

      await waitFor(() => {
        expect(screen.getByTestId('name-error')).toHaveAttribute('role', 'alert');
        expect(screen.getByTestId('name-error')).toHaveAttribute('aria-live', 'polite');
      });
    });

    it('should be keyboard navigable', async () => {
      renderComponent();

      // Tab through fields
      await userEvent.tab();
      expect(screen.getByLabelText('Name')).toHaveFocus();

      await userEvent.tab();
      expect(screen.getByLabelText('Title')).toHaveFocus();

      await userEvent.tab();
      expect(screen.getByLabelText('Location')).toHaveFocus();

      await userEvent.tab();
      expect(screen.getByLabelText('Profile Photo (optional)')).toHaveFocus();

      await userEvent.tab();
      expect(screen.getByTestId('next-button')).toHaveFocus();
    });
  });
});