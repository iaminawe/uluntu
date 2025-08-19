import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-hot-toast';
import { MenuManagementForm } from '../MenuManagementForm';
import { menuManagementApi } from '@/features/admin/api/menuManagement';
import { mockMenuItems, createMockMenuItem } from '../../../../../tests/fixtures/menuTestData';

// Mock dependencies
jest.mock('react-hot-toast');
jest.mock('@/features/admin/api/menuManagement');

const mockToast = {
  success: jest.fn(),
  error: jest.fn(),
};

(toast as any).success = mockToast.success;
(toast as any).error = mockToast.error;

const mockApi = menuManagementApi as jest.Mocked<typeof menuManagementApi>;

describe('MenuManagementForm', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();
  const mockParentOptions = mockMenuItems.filter(item => !item.parent_id);

  const defaultProps = {
    parentOptions: mockParentOptions,
    onSave: mockOnSave,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Create Mode', () => {
    it('should render create form with empty fields', () => {
      render(<MenuManagementForm {...defaultProps} />);

      expect(screen.getByText('Create Menu Item')).toBeInTheDocument();
      expect(screen.getByTestId('label-input')).toHaveValue('');
      expect(screen.getByTestId('href-input')).toHaveValue('');
      expect(screen.getByTestId('description-input')).toHaveValue('');
      expect(screen.getByTestId('parent-select')).toHaveValue('');
      expect(screen.getByTestId('enabled-checkbox')).toBeChecked(); // Default enabled
      expect(screen.getByTestId('save-button')).toHaveTextContent('Create');
    });

    it('should validate required fields', async () => {
      render(<MenuManagementForm {...defaultProps} />);

      // Try to submit without filling required fields
      fireEvent.click(screen.getByTestId('save-button'));

      await waitFor(() => {
        expect(screen.getByTestId('label-error')).toHaveTextContent('Label is required');
        expect(screen.getByTestId('href-error')).toHaveTextContent('URL/Path is required');
      });

      // API should not be called
      expect(mockApi.createMenuItem).not.toHaveBeenCalled();
    });

    it('should validate URL format', async () => {
      render(<MenuManagementForm {...defaultProps} />);

      await userEvent.type(screen.getByTestId('label-input'), 'Test Label');
      await userEvent.type(screen.getByTestId('href-input'), 'invalid-url');
      
      fireEvent.click(screen.getByTestId('save-button'));

      await waitFor(() => {
        expect(screen.getByTestId('href-error')).toHaveTextContent(
          'URL must start with / or http(s)://'
        );
      });
    });

    it('should validate field lengths', async () => {
      render(<MenuManagementForm {...defaultProps} />);

      // Test label max length
      await userEvent.type(screen.getByTestId('label-input'), 'a'.repeat(101));
      
      fireEvent.blur(screen.getByTestId('label-input'));

      await waitFor(() => {
        expect(screen.getByTestId('label-error')).toHaveTextContent(
          'Label must be 100 characters or less'
        );
      });

      // Test description max length
      await userEvent.clear(screen.getByTestId('description-input'));
      await userEvent.type(screen.getByTestId('description-input'), 'a'.repeat(256));
      
      fireEvent.blur(screen.getByTestId('description-input'));

      await waitFor(() => {
        expect(screen.getByTestId('description-error')).toHaveTextContent(
          'Description must be 255 characters or less'
        );
      });
    });

    it('should create menu item successfully', async () => {
      const mockCreatedItem = createMockMenuItem({
        id: 'new-id',
        label: 'New Menu Item',
        href: '/new-item',
        description: 'Test description',
      });

      mockApi.createMenuItem.mockResolvedValue(mockCreatedItem);

      render(<MenuManagementForm {...defaultProps} />);

      // Fill out the form
      await userEvent.type(screen.getByTestId('label-input'), 'New Menu Item');
      await userEvent.type(screen.getByTestId('href-input'), '/new-item');
      await userEvent.type(screen.getByTestId('description-input'), 'Test description');
      await userEvent.selectOptions(screen.getByTestId('icon-select'), 'users');
      await userEvent.selectOptions(screen.getByTestId('feature-flag-select'), 'events_system');

      // Submit the form
      fireEvent.click(screen.getByTestId('save-button'));

      await waitFor(() => {
        expect(mockApi.createMenuItem).toHaveBeenCalledWith({
          label: 'New Menu Item',
          href: '/new-item',
          description: 'Test description',
          parent_id: null,
          icon: 'users',
          feature_flag: 'events_system',
          is_enabled: true,
          order_index: 0,
        });
      });

      expect(mockToast.success).toHaveBeenCalledWith('Menu item created successfully');
      expect(mockOnSave).toHaveBeenCalledWith(mockCreatedItem);
    });

    it('should handle creation errors', async () => {
      const errorMessage = 'Database constraint violation';
      mockApi.createMenuItem.mockRejectedValue(new Error(errorMessage));

      render(<MenuManagementForm {...defaultProps} />);

      await userEvent.type(screen.getByTestId('label-input'), 'Test Item');
      await userEvent.type(screen.getByTestId('href-input'), '/test');
      
      fireEvent.click(screen.getByTestId('save-button'));

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(errorMessage);
      });

      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  describe('Edit Mode', () => {
    const mockExistingItem = mockMenuItems[0];

    it('should render edit form with populated fields', () => {
      render(
        <MenuManagementForm 
          {...defaultProps} 
          menuItem={mockExistingItem}
        />
      );

      expect(screen.getByText('Edit Menu Item')).toBeInTheDocument();
      expect(screen.getByTestId('label-input')).toHaveValue(mockExistingItem.label);
      expect(screen.getByTestId('href-input')).toHaveValue(mockExistingItem.href);
      expect(screen.getByTestId('description-input')).toHaveValue(mockExistingItem.description || '');
      expect(screen.getByTestId('enabled-checkbox')).toBeChecked();
      expect(screen.getByTestId('save-button')).toHaveTextContent('Update');
    });

    it('should update menu item successfully', async () => {
      const updatedItem = { ...mockExistingItem, label: 'Updated Label' };
      mockApi.updateMenuItem.mockResolvedValue(updatedItem);

      render(
        <MenuManagementForm 
          {...defaultProps} 
          menuItem={mockExistingItem}
        />
      );

      // Update the label
      await userEvent.clear(screen.getByTestId('label-input'));
      await userEvent.type(screen.getByTestId('label-input'), 'Updated Label');

      fireEvent.click(screen.getByTestId('save-button'));

      await waitFor(() => {
        expect(mockApi.updateMenuItem).toHaveBeenCalledWith({
          id: mockExistingItem.id,
          label: 'Updated Label',
          href: mockExistingItem.href,
          description: mockExistingItem.description,
          parent_id: mockExistingItem.parent_id,
          icon: mockExistingItem.icon,
          feature_flag: mockExistingItem.feature_flag,
          is_enabled: mockExistingItem.is_enabled,
          order_index: mockExistingItem.order_index,
        });
      });

      expect(mockToast.success).toHaveBeenCalledWith('Menu item updated successfully');
      expect(mockOnSave).toHaveBeenCalledWith(updatedItem);
    });

    it('should handle update errors', async () => {
      const errorMessage = 'Update failed';
      mockApi.updateMenuItem.mockRejectedValue(new Error(errorMessage));

      render(
        <MenuManagementForm 
          {...defaultProps} 
          menuItem={mockExistingItem}
        />
      );

      await userEvent.clear(screen.getByTestId('label-input'));
      await userEvent.type(screen.getByTestId('label-input'), 'New Label');
      
      fireEvent.click(screen.getByTestId('save-button'));

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(errorMessage);
      });

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should prevent self-parenting in parent options', () => {
      render(
        <MenuManagementForm 
          {...defaultProps} 
          menuItem={mockExistingItem}
          parentOptions={mockMenuItems} // Include the item being edited
        />
      );

      const parentSelect = screen.getByTestId('parent-select');
      const options = Array.from(parentSelect.querySelectorAll('option'));
      const selfOption = options.find(option => option.getAttribute('value') === mockExistingItem.id);

      expect(selfOption).toBeUndefined();
    });
  });

  describe('Form Interactions', () => {
    it('should handle cancel button correctly', async () => {
      render(<MenuManagementForm {...defaultProps} />);

      // Fill out some fields
      await userEvent.type(screen.getByTestId('label-input'), 'Test');
      await userEvent.type(screen.getByTestId('href-input'), '/test');

      // Click cancel
      fireEvent.click(screen.getByTestId('cancel-button'));

      expect(mockOnCancel).toHaveBeenCalled();
      
      // Fields should be reset (though this depends on implementation)
      expect(screen.getByTestId('label-input')).toHaveValue('');
      expect(screen.getByTestId('href-input')).toHaveValue('');
    });

    it('should disable form during submission', async () => {
      // Mock a slow API call
      mockApi.createMenuItem.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(createMockMenuItem()), 100))
      );

      render(<MenuManagementForm {...defaultProps} />);

      await userEvent.type(screen.getByTestId('label-input'), 'Test');
      await userEvent.type(screen.getByTestId('href-input'), '/test');

      fireEvent.click(screen.getByTestId('save-button'));

      // Buttons should be disabled during loading
      expect(screen.getByTestId('save-button')).toBeDisabled();
      expect(screen.getByTestId('cancel-button')).toBeDisabled();
      expect(screen.getByTestId('save-button')).toHaveTextContent('Saving...');

      // Wait for completion
      await waitFor(() => {
        expect(screen.getByTestId('save-button')).not.toBeDisabled();
      });
    });

    it('should handle parent selection correctly', async () => {
      render(<MenuManagementForm {...defaultProps} />);

      const parentSelect = screen.getByTestId('parent-select');
      
      // Should have "None" option plus parent options
      expect(parentSelect.children).toHaveLength(mockParentOptions.length + 1);

      // Select a parent
      await userEvent.selectOptions(parentSelect, mockParentOptions[0].id);
      
      expect(parentSelect).toHaveValue(mockParentOptions[0].id);
    });

    it('should handle feature flag selection', async () => {
      render(<MenuManagementForm {...defaultProps} />);

      const flagSelect = screen.getByTestId('feature-flag-select');
      
      // Select a feature flag
      await userEvent.selectOptions(flagSelect, 'events_system');
      
      expect(flagSelect).toHaveValue('events_system');
    });

    it('should handle icon selection', async () => {
      render(<MenuManagementForm {...defaultProps} />);

      const iconSelect = screen.getByTestId('icon-select');
      
      // Select an icon
      await userEvent.selectOptions(iconSelect, 'users');
      
      expect(iconSelect).toHaveValue('users');
    });

    it('should handle enabled checkbox toggle', async () => {
      render(<MenuManagementForm {...defaultProps} />);

      const enabledCheckbox = screen.getByTestId('enabled-checkbox');
      
      // Should be enabled by default
      expect(enabledCheckbox).toBeChecked();
      
      // Toggle it off
      await userEvent.click(enabledCheckbox);
      expect(enabledCheckbox).not.toBeChecked();
      
      // Toggle it back on
      await userEvent.click(enabledCheckbox);
      expect(enabledCheckbox).toBeChecked();
    });

    it('should validate order index', async () => {
      render(<MenuManagementForm {...defaultProps} />);

      // Try negative order index
      await userEvent.clear(screen.getByTestId('order-input'));
      await userEvent.type(screen.getByTestId('order-input'), '-1');
      
      fireEvent.blur(screen.getByTestId('order-input'));

      await waitFor(() => {
        expect(screen.getByTestId('order-error')).toHaveTextContent(
          'Order index must be 0 or greater'
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels and ARIA attributes', () => {
      render(<MenuManagementForm {...defaultProps} />);

      // Check that form controls have proper labels
      expect(screen.getByLabelText(/label/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/url\/path/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/parent menu/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/icon/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/feature flag/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/order index/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/enabled/i)).toBeInTheDocument();
    });

    it('should associate error messages with form fields', async () => {
      render(<MenuManagementForm {...defaultProps} />);

      fireEvent.click(screen.getByTestId('save-button'));

      await waitFor(() => {
        const labelError = screen.getByTestId('label-error');
        const hrefError = screen.getByTestId('href-error');

        expect(labelError).toHaveAttribute('data-testid', 'label-error');
        expect(hrefError).toHaveAttribute('data-testid', 'href-error');
      });
    });
  });
});