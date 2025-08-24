import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-hot-toast';
import { ThemeManager } from '../ThemeManager';
import { themePresets } from '@/lib/themes/presets';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock file reader
const mockFileReader = {
  readAsText: jest.fn(),
  addEventListener: jest.fn(),
  result: '',
};

global.FileReader = jest.fn(() => mockFileReader) as any;

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

describe('ThemeManager', () => {
  const mockOnThemeChange = jest.fn();
  const mockOnSave = jest.fn().mockResolvedValue(undefined);
  const defaultTheme = themePresets[0];

  beforeEach(() => {
    jest.clearAllMocks();
    mockFileReader.readAsText.mockClear();
    mockFileReader.addEventListener.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render theme manager with all sections', () => {
      render(
        <ThemeManager
          currentTheme={defaultTheme}
          onThemeChange={mockOnThemeChange}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByText('Theme Manager')).toBeInTheDocument();
      expect(screen.getByText('Preset Themes')).toBeInTheDocument();
      expect(screen.getByText('Color Palette')).toBeInTheDocument();
      expect(screen.getByText('Live Preview')).toBeInTheDocument();
    });

    it('should display all preset themes', () => {
      render(
        <ThemeManager
          currentTheme={defaultTheme}
          onThemeChange={mockOnThemeChange}
          onSave={mockOnSave}
        />
      );

      themePresets.forEach(preset => {
        expect(screen.getByText(preset.name)).toBeInTheDocument();
        expect(screen.getByText(preset.description)).toBeInTheDocument();
      });
    });

    it('should highlight the selected theme', () => {
      render(
        <ThemeManager
          currentTheme={defaultTheme}
          onThemeChange={mockOnThemeChange}
          onSave={mockOnSave}
        />
      );

      const selectedThemeButton = screen.getByText(defaultTheme.name).closest('button');
      expect(selectedThemeButton).toHaveClass('border-blue-500');
    });
  });

  describe('Theme Selection', () => {
    it('should change theme when preset is clicked', async () => {
      const user = userEvent.setup();
      render(
        <ThemeManager
          currentTheme={defaultTheme}
          onThemeChange={mockOnThemeChange}
          onSave={mockOnSave}
        />
      );

      const darkTheme = themePresets.find(t => t.slug === 'dark-professional')!;
      await user.click(screen.getByText(darkTheme.name));

      expect(mockOnThemeChange).toHaveBeenCalledWith(darkTheme);
    });

    it('should display theme colors in preview', () => {
      render(
        <ThemeManager
          currentTheme={defaultTheme}
          onThemeChange={mockOnThemeChange}
          onSave={mockOnSave}
        />
      );

      const colorPreview = screen.getByText(defaultTheme.name).closest('button');
      const colorSwatches = within(colorPreview!).getAllByRole('presentation');
      
      expect(colorSwatches.length).toBeGreaterThan(0);
    });
  });

  describe('Color Editing', () => {
    it('should enable color editing when Edit Colors is clicked', async () => {
      const user = userEvent.setup();
      render(
        <ThemeManager
          currentTheme={defaultTheme}
          onThemeChange={mockOnThemeChange}
          onSave={mockOnSave}
        />
      );

      const editButton = screen.getByText('Edit Colors');
      await user.click(editButton);

      const colorInputs = screen.getAllByDisplayValue(/^#[0-9a-fA-F]{6}$/);
      expect(colorInputs[0]).not.toBeDisabled();
    });

    it('should update theme when color is changed', async () => {
      const user = userEvent.setup();
      render(
        <ThemeManager
          currentTheme={defaultTheme}
          onThemeChange={mockOnThemeChange}
          onSave={mockOnSave}
        />
      );

      // Enable editing
      await user.click(screen.getByText('Edit Colors'));

      // Change primary color
      const primaryColorInput = screen.getAllByDisplayValue(defaultTheme.configurations.colors.primary)[0];
      fireEvent.change(primaryColorInput, { target: { value: '#FF0000' } });

      expect(mockOnThemeChange).toHaveBeenCalledWith(
        expect.objectContaining({
          colors: expect.objectContaining({
            primary: '#FF0000',
          }),
        })
      );
    });

    it('should validate hex color input', async () => {
      const user = userEvent.setup();
      render(
        <ThemeManager
          currentTheme={defaultTheme}
          onThemeChange={mockOnThemeChange}
          onSave={mockOnSave}
        />
      );

      await user.click(screen.getByText('Edit Colors'));

      const textInputs = screen.getAllByDisplayValue(/^#[0-9A-Fa-f]{6}$/);
      expect(textInputs.length).toBeGreaterThan(0);
    });
  });

  describe('Theme Import/Export', () => {
    it('should export theme when export button is clicked', async () => {
      const user = userEvent.setup();
      const mockLink = document.createElement('a');
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink);
      jest.spyOn(mockLink, 'click');

      render(
        <ThemeManager
          currentTheme={defaultTheme}
          onThemeChange={mockOnThemeChange}
          onSave={mockOnSave}
        />
      );

      const exportButton = screen.getByLabelText('Export theme');
      await user.click(exportButton);

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.download).toContain('theme-');
      expect(mockLink.click).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Theme exported successfully');
    });

    it('should import valid theme file', async () => {
      const user = userEvent.setup();
      const importedTheme = {
        ...defaultTheme,
        id: 'imported-theme',
        name: 'Imported Theme',
      };

      render(
        <ThemeManager
          currentTheme={defaultTheme}
          onThemeChange={mockOnThemeChange}
          onSave={mockOnSave}
        />
      );

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File([JSON.stringify(importedTheme)], 'theme.json', {
        type: 'application/json',
      });

      // Simulate file selection
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      // Mock FileReader
      mockFileReader.addEventListener.mockImplementation((event, handler) => {
        if (event === 'load') {
          mockFileReader.result = JSON.stringify(importedTheme);
          handler({ target: { result: mockFileReader.result } });
        }
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(mockOnThemeChange).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Imported Theme (Imported)',
          })
        );
      });

      expect(toast.success).toHaveBeenCalledWith('Theme imported successfully');
    });

    it('should handle invalid theme file', async () => {
      render(
        <ThemeManager
          currentTheme={defaultTheme}
          onThemeChange={mockOnThemeChange}
          onSave={mockOnSave}
        />
      );

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['invalid json'], 'theme.json', {
        type: 'application/json',
      });

      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      mockFileReader.addEventListener.mockImplementation((event, handler) => {
        if (event === 'load') {
          mockFileReader.result = 'invalid json';
          handler({ target: { result: mockFileReader.result } });
        }
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to import theme file');
      });
    });
  });

  describe('Theme Saving', () => {
    it('should save theme when save button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <ThemeManager
          currentTheme={defaultTheme}
          onThemeChange={mockOnThemeChange}
          onSave={mockOnSave}
        />
      );

      await user.click(screen.getByText('Save Theme'));

      expect(mockOnSave).toHaveBeenCalledWith(defaultTheme);
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Theme saved successfully');
      });
    });

    it('should show loading state while saving', async () => {
      const user = userEvent.setup();
      mockOnSave.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <ThemeManager
          currentTheme={defaultTheme}
          onThemeChange={mockOnThemeChange}
          onSave={mockOnSave}
        />
      );

      const saveButton = screen.getByText('Save Theme');
      await user.click(saveButton);

      expect(saveButton).toBeDisabled();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

      await waitFor(() => {
        expect(saveButton).not.toBeDisabled();
      });
    });

    it('should handle save errors', async () => {
      const user = userEvent.setup();
      mockOnSave.mockRejectedValueOnce(new Error('Save failed'));

      render(
        <ThemeManager
          currentTheme={defaultTheme}
          onThemeChange={mockOnThemeChange}
          onSave={mockOnSave}
        />
      );

      await user.click(screen.getByText('Save Theme'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to save theme');
      });
    });
  });

  describe('Preview Functionality', () => {
    it('should toggle preview visibility', async () => {
      const user = userEvent.setup();
      render(
        <ThemeManager
          currentTheme={defaultTheme}
          onThemeChange={mockOnThemeChange}
          onSave={mockOnSave}
        />
      );

      const previewToggle = screen.getByLabelText('Hide preview');
      await user.click(previewToggle);

      expect(screen.queryByText('Live Preview')).not.toBeInTheDocument();
      
      await user.click(screen.getByLabelText('Show preview'));
      expect(screen.getByText('Live Preview')).toBeInTheDocument();
    });

    it('should switch between device previews', async () => {
      const user = userEvent.setup();
      render(
        <ThemeManager
          currentTheme={defaultTheme}
          onThemeChange={mockOnThemeChange}
          onSave={mockOnSave}
        />
      );

      await user.click(screen.getByLabelText('Mobile preview'));
      expect(screen.getByLabelText('Mobile preview')).toHaveClass('bg-white');

      await user.click(screen.getByLabelText('Tablet preview'));
      expect(screen.getByLabelText('Tablet preview')).toHaveClass('bg-white');

      await user.click(screen.getByLabelText('Desktop preview'));
      expect(screen.getByLabelText('Desktop preview')).toHaveClass('bg-white');
    });
  });

  describe('Accessibility', () => {
    it('should show accessibility warnings for poor contrast', () => {
      const poorContrastTheme = {
        ...defaultTheme,
        configurations: {
          ...defaultTheme.configurations,
          colors: {
            ...defaultTheme.configurations.colors,
            text: '#CCCCCC', // Poor contrast on white background
          },
        },
      };

      render(
        <ThemeManager
          currentTheme={poorContrastTheme}
          onThemeChange={mockOnThemeChange}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByText('Accessibility Issues')).toBeInTheDocument();
      expect(screen.getByText(/contrast ratio.*below WCAG/)).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(
        <ThemeManager
          currentTheme={defaultTheme}
          onThemeChange={mockOnThemeChange}
          onSave={mockOnSave}
        />
      );

      // Tab through interactive elements
      await user.tab();
      expect(document.activeElement).toHaveAttribute('aria-label');

      // Select theme with Enter key
      const themeButton = screen.getByText('Dark Professional').closest('button');
      themeButton?.focus();
      await user.keyboard('{Enter}');

      expect(mockOnThemeChange).toHaveBeenCalled();
    });

    it('should have proper ARIA labels', () => {
      render(
        <ThemeManager
          currentTheme={defaultTheme}
          onThemeChange={mockOnThemeChange}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByLabelText('Import theme')).toBeInTheDocument();
      expect(screen.getByLabelText('Export theme')).toBeInTheDocument();
      expect(screen.getByLabelText('Copy CSS variables')).toBeInTheDocument();
      expect(screen.getByLabelText('Reset to default')).toBeInTheDocument();
    });
  });

  describe('CSS Copy Functionality', () => {
    it('should copy CSS variables to clipboard', async () => {
      const user = userEvent.setup();
      const mockClipboard = {
        writeText: jest.fn().mockResolvedValue(undefined),
      };
      Object.assign(navigator, { clipboard: mockClipboard });

      render(
        <ThemeManager
          currentTheme={defaultTheme}
          onThemeChange={mockOnThemeChange}
          onSave={mockOnSave}
        />
      );

      await user.click(screen.getByLabelText('Copy CSS variables'));

      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining(':root {')
      );
      expect(toast.success).toHaveBeenCalledWith('CSS variables copied to clipboard');
    });
  });
});