/**
 * Gallery Components Integration Tests
 * Tests the React components and user interactions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import userEvent from '@testing-library/user-event';

import PhotoUpload from '../components/PhotoUpload';
import { PhotoCard } from '../components/PhotoCard';
import { PhotoLightbox } from '../components/PhotoLightbox';
import galleryReducer from '../store/gallerySlice';
import { Photo, Gallery } from '../types';

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    storage: {
      from: jest.fn()
    }
  }
}));

jest.mock('../utils', () => ({
  validateImageFile: jest.fn(() => ({ valid: true })),
  generateThumbnail: jest.fn(() => Promise.resolve('blob:thumbnail-url')),
  formatFileSize: jest.fn((size) => `${Math.round(size / 1024)} KB`)
}));

// Mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      gallery: galleryReducer
    },
    preloadedState: {
      gallery: {
        galleries: [],
        currentGallery: null,
        selectedPhotos: [],
        uploadProgress: {},
        filters: {},
        status: 'idle',
        error: null,
        ...initialState
      }
    }
  });
};

// Mock data
const mockPhoto: Photo = {
  id: 'photo-1',
  gallery_id: 'gallery-1',
  user_id: 'user-1',
  file_name: 'test-photo.jpg',
  original_file_name: 'test-photo.jpg',
  file_size: 1024000,
  mime_type: 'image/jpeg',
  storage_path: 'gallery/test-photo.jpg',
  thumbnail_path: 'gallery/thumbnails/test-photo.jpg',
  title: 'Test Photo',
  description: 'A beautiful test photo',
  alt_text: 'Test photo alt text',
  tags: ['test', 'photo'],
  width: 1920,
  height: 1080,
  sort_order: 0,
  visibility: 'visible',
  created_at: new Date().toISOString()
};

const mockGallery: Gallery = {
  id: 'gallery-1',
  user_id: 'user-1',
  title: 'Test Gallery',
  description: 'A test gallery',
  slug: 'test-gallery',
  privacy_level: 'public',
  visibility: 'visible',
  sort_order: 0,
  photo_count: 1,
  view_count: 0,
  is_featured: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  photos: [mockPhoto]
};

// Helper to render with Redux store
const renderWithStore = (component: React.ReactElement, storeState = {}) => {
  const store = createMockStore(storeState);
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('Gallery Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PhotoUpload Component', () => {
    test('renders upload interface', () => {
      const mockOnUpload = jest.fn();
      
      renderWithStore(
        <PhotoUpload 
          galleryId="test-gallery" 
          onUpload={mockOnUpload} 
        />
      );

      expect(screen.getByText(/drag and drop photos here/i)).toBeInTheDocument();
      expect(screen.getByText(/select photos/i)).toBeInTheDocument();
    });

    test('handles file selection', async () => {
      const user = userEvent.setup();
      const mockOnUpload = jest.fn();
      
      renderWithStore(
        <PhotoUpload 
          galleryId="test-gallery" 
          onUpload={mockOnUpload} 
        />
      );

      const fileInput = screen.getByRole('button', { name: /select photos/i });
      
      // Create mock files
      const files = [
        new File(['content1'], 'photo1.jpg', { type: 'image/jpeg' }),
        new File(['content2'], 'photo2.jpg', { type: 'image/jpeg' })
      ];

      // Mock the file input change
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (input) {
        Object.defineProperty(input, 'files', {
          value: files,
          writable: false,
        });
        
        fireEvent.change(input);
      }

      await waitFor(() => {
        expect(screen.getByText(/ready to upload/i)).toBeInTheDocument();
      });
    });

    test('validates file types during upload', async () => {
      const mockOnUpload = jest.fn();
      const { validateImageFile } = require('../utils');
      
      // Mock validation failure
      validateImageFile.mockReturnValue({
        valid: false,
        error: 'Invalid file type'
      });
      
      renderWithStore(
        <PhotoUpload 
          galleryId="test-gallery" 
          onUpload={mockOnUpload} 
        />
      );

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const invalidFile = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      
      if (input) {
        Object.defineProperty(input, 'files', {
          value: [invalidFile],
          writable: false,
        });
        
        fireEvent.change(input);
      }

      await waitFor(() => {
        expect(screen.getByText(/invalid file type/i)).toBeInTheDocument();
      });
    });

    test('shows upload progress', () => {
      const mockOnUpload = jest.fn();
      const storeWithProgress = {
        uploadProgress: {
          'photo-1': {
            photoId: 'photo-1',
            fileName: 'test.jpg',
            progress: 50,
            status: 'uploading' as const
          }
        }
      };
      
      renderWithStore(
        <PhotoUpload 
          galleryId="test-gallery" 
          onUpload={mockOnUpload}
          isUploading={true}
        />,
        storeWithProgress
      );

      expect(screen.getByText(/uploading/i)).toBeInTheDocument();
    });

    test('handles drag and drop', async () => {
      const mockOnUpload = jest.fn();
      
      renderWithStore(
        <PhotoUpload 
          galleryId="test-gallery" 
          onUpload={mockOnUpload} 
        />
      );

      const dropZone = screen.getByText(/drag and drop photos here/i).closest('div');
      
      const files = [
        new File(['content'], 'dropped.jpg', { type: 'image/jpeg' })
      ];

      if (dropZone) {
        fireEvent.dragOver(dropZone);
        expect(screen.getByText(/drop photos here/i)).toBeInTheDocument();

        fireEvent.drop(dropZone, {
          dataTransfer: {
            files,
            types: ['Files']
          }
        });
      }

      await waitFor(() => {
        expect(screen.getByText(/ready to upload/i)).toBeInTheDocument();
      });
    });
  });

  describe('PhotoCard Component', () => {
    test('renders photo information', () => {
      const mockOnSelect = jest.fn();
      
      render(
        <PhotoCard 
          photo={mockPhoto}
          isSelected={false}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText(mockPhoto.title!)).toBeInTheDocument();
      expect(screen.getByText(mockPhoto.description!)).toBeInTheDocument();
      expect(screen.getByAltText(mockPhoto.alt_text!)).toBeInTheDocument();
    });

    test('handles photo selection', async () => {
      const user = userEvent.setup();
      const mockOnSelect = jest.fn();
      
      render(
        <PhotoCard 
          photo={mockPhoto}
          isSelected={false}
          onSelect={mockOnSelect}
        />
      );

      const selectButton = screen.getByRole('button', { name: /select/i });
      await user.click(selectButton);

      expect(mockOnSelect).toHaveBeenCalledWith(mockPhoto.id);
    });

    test('shows selected state', () => {
      const mockOnSelect = jest.fn();
      
      render(
        <PhotoCard 
          photo={mockPhoto}
          isSelected={true}
          onSelect={mockOnSelect}
        />
      );

      const card = screen.getByRole('article');
      expect(card).toHaveClass(/selected/i);
    });

    test('displays photo metadata', () => {
      const photoWithMetadata = {
        ...mockPhoto,
        width: 1920,
        height: 1080,
        file_size: 2048000
      };

      render(
        <PhotoCard 
          photo={photoWithMetadata}
          isSelected={false}
          onSelect={() => {}}
        />
      );

      expect(screen.getByText(/1920 × 1080/)).toBeInTheDocument();
      expect(screen.getByText(/2 MB/i)).toBeInTheDocument();
    });
  });

  describe('PhotoLightbox Component', () => {
    const mockLightboxState = {
      isOpen: true,
      currentPhotoIndex: 0,
      photos: [mockPhoto]
    };

    test('renders when open', () => {
      const mockOnClose = jest.fn();
      const mockOnNext = jest.fn();
      const mockOnPrev = jest.fn();
      
      render(
        <PhotoLightbox 
          {...mockLightboxState}
          onClose={mockOnClose}
          onNext={mockOnNext}
          onPrevious={mockOnPrev}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByAltText(mockPhoto.alt_text!)).toBeInTheDocument();
    });

    test('handles navigation between photos', async () => {
      const user = userEvent.setup();
      const mockOnNext = jest.fn();
      const mockOnPrev = jest.fn();
      
      const multiPhotoState = {
        ...mockLightboxState,
        photos: [mockPhoto, { ...mockPhoto, id: 'photo-2', title: 'Photo 2' }]
      };
      
      render(
        <PhotoLightbox 
          {...multiPhotoState}
          onClose={() => {}}
          onNext={mockOnNext}
          onPrevious={mockOnPrev}
        />
      );

      const nextButton = screen.getByRole('button', { name: /next/i });
      const prevButton = screen.getByRole('button', { name: /previous/i });

      await user.click(nextButton);
      expect(mockOnNext).toHaveBeenCalled();

      await user.click(prevButton);
      expect(mockOnPrev).toHaveBeenCalled();
    });

    test('closes on escape key', async () => {
      const user = userEvent.setup();
      const mockOnClose = jest.fn();
      
      render(
        <PhotoLightbox 
          {...mockLightboxState}
          onClose={mockOnClose}
          onNext={() => {}}
          onPrevious={() => {}}
        />
      );

      await user.keyboard('{Escape}');
      expect(mockOnClose).toHaveBeenCalled();
    });

    test('closes on backdrop click', async () => {
      const user = userEvent.setup();
      const mockOnClose = jest.fn();
      
      render(
        <PhotoLightbox 
          {...mockLightboxState}
          onClose={mockOnClose}
          onNext={() => {}}
          onPrevious={() => {}}
        />
      );

      const backdrop = screen.getByRole('dialog');
      await user.click(backdrop);
      expect(mockOnClose).toHaveBeenCalled();
    });

    test('does not render when closed', () => {
      const closedState = { ...mockLightboxState, isOpen: false };
      
      render(
        <PhotoLightbox 
          {...closedState}
          onClose={() => {}}
          onNext={() => {}}
          onPrevious={() => {}}
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    test('upload component integrates with gallery state', () => {
      const mockOnUpload = jest.fn();
      const storeWithGallery = {
        currentGallery: mockGallery
      };
      
      renderWithStore(
        <PhotoUpload 
          galleryId={mockGallery.id} 
          onUpload={mockOnUpload} 
        />,
        storeWithGallery
      );

      // Should render upload interface for existing gallery
      expect(screen.getByText(/select photos/i)).toBeInTheDocument();
    });

    test('photo cards display correctly in gallery context', () => {
      const storeWithPhotos = {
        currentGallery: mockGallery,
        selectedPhotos: [mockPhoto.id]
      };
      
      renderWithStore(
        <PhotoCard 
          photo={mockPhoto}
          isSelected={true}
          onSelect={() => {}}
        />,
        storeWithPhotos
      );

      expect(screen.getByText(mockPhoto.title!)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('upload component has proper ARIA labels', () => {
      const mockOnUpload = jest.fn();
      
      renderWithStore(
        <PhotoUpload 
          galleryId="test-gallery" 
          onUpload={mockOnUpload} 
        />
      );

      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toHaveAttribute('accept', 'image/*');
      expect(fileInput).toHaveAttribute('multiple');
    });

    test('photo cards are keyboard accessible', async () => {
      const user = userEvent.setup();
      const mockOnSelect = jest.fn();
      
      render(
        <PhotoCard 
          photo={mockPhoto}
          isSelected={false}
          onSelect={mockOnSelect}
        />
      );

      const selectButton = screen.getByRole('button');
      selectButton.focus();
      
      await user.keyboard('{Enter}');
      expect(mockOnSelect).toHaveBeenCalled();
    });

    test('lightbox has proper focus management', () => {
      const mockOnClose = jest.fn();
      
      render(
        <PhotoLightbox 
          {...{
            isOpen: true,
            currentPhotoIndex: 0,
            photos: [mockPhoto]
          }}
          onClose={mockOnClose}
          onNext={() => {}}
          onPrevious={() => {}}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });
  });

  describe('Error States', () => {
    test('upload component shows error for failed uploads', () => {
      const mockOnUpload = jest.fn();
      const storeWithError = {
        uploadProgress: {
          'photo-1': {
            photoId: 'photo-1',
            fileName: 'failed.jpg',
            progress: 0,
            status: 'error' as const,
            error: 'Upload failed'
          }
        }
      };
      
      renderWithStore(
        <PhotoUpload 
          galleryId="test-gallery" 
          onUpload={mockOnUpload} 
        />,
        storeWithError
      );

      expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
    });

    test('photo card handles missing image gracefully', () => {
      const photoWithoutImage = {
        ...mockPhoto,
        thumbnail_path: undefined,
        storage_path: ''
      };
      
      render(
        <PhotoCard 
          photo={photoWithoutImage}
          isSelected={false}
          onSelect={() => {}}
        />
      );

      // Should still render card content
      expect(screen.getByText(mockPhoto.title!)).toBeInTheDocument();
    });
  });
});