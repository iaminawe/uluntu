import React from 'react';
import { render, screen, fireEvent, waitFor, createLegacySettingFormat } from '@/test/utils/testUtils';
import { ImprovedGeneralSettingsSection } from '../ImprovedGeneralSettingsSection';
import { toast } from 'react-hot-toast';
import type { ApplicationSetting } from '@/types/settings';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock ImageUploader component
jest.mock('@/components/ui/ImageUploader', () => ({
  __esModule: true,
  default: ({ onUpload, currentImage, label }: any) => (
    <div data-testid="image-uploader">
      <label>{label}</label>
      {currentImage && <img src={currentImage} alt="Current" />}
      <button onClick={() => onUpload('/new-image.png')}>Upload Image</button>
    </div>
  ),
}));

describe('ImprovedGeneralSettingsSection', () => {
  const mockSettings: ApplicationSetting[] = [
    {
      id: '1',
      category: 'general',
      setting_key: 'site_title',
      setting_value: 'Test Site',
      data_type: 'string',
      is_public: true,
      is_system: false,
      validation_rules: null,
      description: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      category: 'general',
      setting_key: 'site_description',
      setting_value: 'A test site description',
      data_type: 'string',
      is_public: true,
      is_system: false,
      validation_rules: null,
      description: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '3',
      category: 'general',
      setting_key: 'site_logo',
      setting_value: '/logo.png',
      data_type: 'string',
      is_public: true,
      is_system: false,
      validation_rules: null,
      description: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '4',
      category: 'appearance',
      setting_key: 'primary_color',
      setting_value: '#3B82F6',
      data_type: 'string',
      is_public: true,
      is_system: false,
      validation_rules: null,
      description: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '5',
      category: 'appearance',
      setting_key: 'dark_mode_enabled',
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
      id: '6',
      category: 'appearance',
      setting_key: 'font_family',
      setting_value: 'Inter',
      data_type: 'string',
      is_public: true,
      is_system: false,
      validation_rules: null,
      description: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
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
    it('renders all sections correctly', () => {
      render(<ImprovedGeneralSettingsSection {...defaultProps} />);

      // Check section headers
      expect(screen.getByText('Site Information')).toBeInTheDocument();
      expect(screen.getByText('Appearance & Theme')).toBeInTheDocument();
      expect(screen.getByText('Typography')).toBeInTheDocument();

      // Check form fields
      expect(screen.getByLabelText('Site Title')).toBeInTheDocument();
      expect(screen.getByLabelText('Site Description')).toBeInTheDocument();
      expect(screen.getByText('Site Logo')).toBeInTheDocument();
    });

    it('displays current values in form fields', () => {
      render(<ImprovedGeneralSettingsSection {...defaultProps} />);

      expect(screen.getByDisplayValue('Test Site')).toBeInTheDocument();
      expect(screen.getByDisplayValue('A test site description')).toBeInTheDocument();
      expect(screen.getByDisplayValue('#3B82F6')).toBeInTheDocument();
    });

    it('shows loading state', () => {
      render(<ImprovedGeneralSettingsSection {...defaultProps} isLoading={true} />);

      expect(screen.getByText('Processing...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save changes/i })).toBeDisabled();
    });
  });

  describe('Form Interactions', () => {
    it('tracks changes when form fields are modified', async () => {
      render(<ImprovedGeneralSettingsSection {...defaultProps} />);

      const titleInput = screen.getByLabelText('Site Title');
      fireEvent.change(titleInput, { target: { value: 'New Site Title' } });

      await waitFor(() => {
        expect(titleInput).toHaveValue('New Site Title');
      });

      // Save button should indicate unsaved changes
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      expect(saveButton).toHaveTextContent('Save Changes (1)');
    });

    it('handles color picker changes', async () => {
      render(<ImprovedGeneralSettingsSection {...defaultProps} />);

      const colorInput = screen.getByLabelText('Primary Brand Color');
      fireEvent.change(colorInput, { target: { value: '#FF0000' } });

      await waitFor(() => {
        expect(colorInput).toHaveValue('#FF0000');
      });
    });

    it('handles toggle switches', async () => {
      render(<ImprovedGeneralSettingsSection {...defaultProps} />);

      const darkModeSwitch = screen.getByRole('switch', { name: /enable dark mode/i });
      expect(darkModeSwitch).toBeChecked();

      fireEvent.click(darkModeSwitch);

      await waitFor(() => {
        expect(darkModeSwitch).not.toBeChecked();
      });
    });

    it('handles image uploads', async () => {
      render(<ImprovedGeneralSettingsSection {...defaultProps} />);

      const uploadButtons = screen.getAllByText('Upload Image');
      fireEvent.click(uploadButtons[0]); // Click first upload button (site logo)

      await waitFor(() => {
        expect(screen.getByAltText('Current')).toHaveAttribute('src', '/new-image.png');
      });
    });
  });

  describe('Save Functionality', () => {
    it('saves only changed fields', async () => {
      render(<ImprovedGeneralSettingsSection {...defaultProps} />);

      // Change site title
      const titleInput = screen.getByLabelText('Site Title');
      fireEvent.change(titleInput, { target: { value: 'Updated Title' } });

      // Change primary color
      const colorInput = screen.getByLabelText('Primary Brand Color');
      fireEvent.change(colorInput, { target: { value: '#00FF00' } });

      // Click save
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(defaultProps.onUpdateSetting).toHaveBeenCalledTimes(2);
        expect(defaultProps.onUpdateSetting).toHaveBeenCalledWith({
          category: 'general',
          setting_key: 'site_title',
          setting_value: 'Updated Title',
          data_type: 'string',
        });
        expect(defaultProps.onUpdateSetting).toHaveBeenCalledWith({
          category: 'appearance',
          setting_key: 'primary_color',
          setting_value: '#00FF00',
          data_type: 'string',
        });
      });

      expect(toast.success).toHaveBeenCalledWith('Settings saved successfully');
    });

    it('handles save errors gracefully', async () => {
      const errorProps = {
        ...defaultProps,
        onUpdateSetting: jest.fn().mockRejectedValue(new Error('Save failed')),
      };

      render(<ImprovedGeneralSettingsSection {...errorProps} />);

      // Change a field
      const titleInput = screen.getByLabelText('Site Title');
      fireEvent.change(titleInput, { target: { value: 'New Title' } });

      // Try to save
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to save settings');
      });
    });

    it('resets form after successful save', async () => {
      render(<ImprovedGeneralSettingsSection {...defaultProps} />);

      // Change a field
      const titleInput = screen.getByLabelText('Site Title');
      fireEvent.change(titleInput, { target: { value: 'New Title' } });

      // Save
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(saveButton).toHaveTextContent('Save Changes');
        expect(saveButton).not.toHaveTextContent('Save Changes (1)');
      });
    });
  });

  describe('Reset Functionality', () => {
    it('resets form to original values', async () => {
      render(<ImprovedGeneralSettingsSection {...defaultProps} />);

      // Change multiple fields
      const titleInput = screen.getByLabelText('Site Title');
      fireEvent.change(titleInput, { target: { value: 'Changed Title' } });

      const colorInput = screen.getByLabelText('Primary Brand Color');
      fireEvent.change(colorInput, { target: { value: '#123456' } });

      // Click reset
      const resetButton = screen.getByRole('button', { name: /reset/i });
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(titleInput).toHaveValue('Test Site');
        expect(colorInput).toHaveValue('#3B82F6');
      });
    });
  });

  describe('Validation', () => {
    it('validates required fields', async () => {
      render(<ImprovedGeneralSettingsSection {...defaultProps} />);

      // Clear a required field
      const titleInput = screen.getByLabelText('Site Title');
      fireEvent.change(titleInput, { target: { value: '' } });

      // Try to save
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(defaultProps.onUpdateSetting).not.toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalledWith('Site title is required');
      });
    });

    it('validates field lengths', async () => {
      render(<ImprovedGeneralSettingsSection {...defaultProps} />);

      // Enter text exceeding max length
      const titleInput = screen.getByLabelText('Site Title');
      const longTitle = 'a'.repeat(101); // Max length is 100
      fireEvent.change(titleInput, { target: { value: longTitle } });

      await waitFor(() => {
        expect(titleInput).toHaveValue('a'.repeat(100)); // Should be truncated
      });
    });
  });

  describe('Live Preview', () => {
    it('shows preview when in preview mode', async () => {
      render(<ImprovedGeneralSettingsSection {...defaultProps} />);

      // Click preview button
      const previewButton = screen.getByRole('button', { name: /preview/i });
      fireEvent.click(previewButton);

      await waitFor(() => {
        expect(screen.getByText('Preview Mode')).toBeInTheDocument();
        expect(screen.getByText('Exit Preview')).toBeInTheDocument();
      });
    });

    it('updates preview in real-time', async () => {
      render(<ImprovedGeneralSettingsSection {...defaultProps} />);

      // Enter preview mode
      const previewButton = screen.getByRole('button', { name: /preview/i });
      fireEvent.click(previewButton);

      // Change title
      const titleInput = screen.getByLabelText('Site Title');
      fireEvent.change(titleInput, { target: { value: 'Preview Title' } });

      await waitFor(() => {
        // Check if preview updates
        const previewElements = screen.getAllByText('Preview Title');
        expect(previewElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Typography Settings', () => {
    it('handles font family selection', async () => {
      render(<ImprovedGeneralSettingsSection {...defaultProps} />);

      const fontSelect = screen.getByLabelText('Font Family');
      fireEvent.change(fontSelect, { target: { value: 'Roboto' } });

      await waitFor(() => {
        expect(fontSelect).toHaveValue('Roboto');
      });
    });

    it('handles font size adjustments', async () => {
      render(<ImprovedGeneralSettingsSection {...defaultProps} />);

      const baseFontSize = screen.getByLabelText('Base Font Size');
      fireEvent.change(baseFontSize, { target: { value: '18' } });

      await waitFor(() => {
        expect(baseFontSize).toHaveValue('18');
      });
    });
  });
});