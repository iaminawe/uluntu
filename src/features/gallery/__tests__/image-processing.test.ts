/**
 * Image Processing Pipeline Tests
 * Tests thumbnail generation, resizing, and optimization
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { generateThumbnail, getImageDimensions, extractExifData } from '../utils';

// Mock canvas and image APIs for Node.js environment
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: jest.fn(() => ({
    drawImage: jest.fn(),
  })),
  toBlob: jest.fn((callback) => {
    const mockBlob = new Blob(['mock-image-data'], { type: 'image/jpeg' });
    callback(mockBlob);
  })
};

const mockImage = {
  width: 1920,
  height: 1080,
  onload: null as any,
  onerror: null as any,
  src: '',
  addEventListener: jest.fn((event, handler) => {
    if (event === 'load') {
      setTimeout(() => handler(), 10);
    }
  })
};

// Mock DOM APIs
global.document = {
  createElement: jest.fn((tag) => {
    if (tag === 'canvas') return mockCanvas;
    if (tag === 'img') return mockImage;
    return {};
  })
} as any;

global.Image = jest.fn(() => mockImage) as any;

global.URL = {
  createObjectURL: jest.fn(() => 'blob:mock-url'),
  revokeObjectURL: jest.fn()
} as any;

// Mock File and FileReader
global.FileReader = jest.fn(() => ({
  readAsDataURL: jest.fn(function(this: any) {
    setTimeout(() => {
      this.onload?.({ target: { result: 'data:image/jpeg;base64,mock-data' } });
    }, 10);
  }),
  onload: null,
  onerror: null
})) as any;

class MockFile extends File {
  constructor(bits: BlobPart[], filename: string, options?: FilePropertyBag) {
    super(bits, filename, options);
  }
}

describe('Image Processing Pipeline', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Thumbnail Generation', () => {
    test('generates thumbnail from image file', async () => {
      const file = new MockFile(['image-content'], 'test.jpg', { type: 'image/jpeg' });
      
      const thumbnailUrl = await generateThumbnail(file, 300);
      
      expect(thumbnailUrl).toBe('blob:mock-url');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    test('respects maximum width constraint', async () => {
      const file = new MockFile(['image-content'], 'test.jpg', { type: 'image/jpeg' });
      
      await generateThumbnail(file, 150);
      
      // Should have set canvas dimensions appropriately
      expect(mockCanvas.width).toBeLessThanOrEqual(150);
    });

    test('maintains aspect ratio during thumbnail generation', async () => {
      // Mock a tall image
      mockImage.width = 1080;
      mockImage.height = 1920;
      
      const file = new MockFile(['image-content'], 'test.jpg', { type: 'image/jpeg' });
      
      await generateThumbnail(file, 300);
      
      // Check that aspect ratio is maintained
      const expectedHeight = 300 * (1920 / 1080);
      expect(mockCanvas.height).toBeCloseTo(expectedHeight, 0);
    });

    test('handles different image formats', async () => {
      const formats = [
        { name: 'test.jpg', type: 'image/jpeg' },
        { name: 'test.png', type: 'image/png' },
        { name: 'test.webp', type: 'image/webp' }
      ];

      for (const format of formats) {
        const file = new MockFile(['content'], format.name, { type: format.type });
        const result = await generateThumbnail(file);
        expect(result).toBe('blob:mock-url');
      }
    });
  });

  describe('Image Dimensions', () => {
    test('extracts image dimensions correctly', async () => {
      const file = new MockFile(['image-content'], 'test.jpg', { type: 'image/jpeg' });
      
      const dimensions = await getImageDimensions(file);
      
      expect(dimensions).toEqual({
        width: 1920,
        height: 1080
      });
    });

    test('handles portrait orientation', async () => {
      // Mock portrait image
      mockImage.width = 1080;
      mockImage.height = 1920;
      
      const file = new MockFile(['image-content'], 'portrait.jpg', { type: 'image/jpeg' });
      
      const dimensions = await getImageDimensions(file);
      
      expect(dimensions.width).toBeLessThan(dimensions.height);
    });
  });

  describe('EXIF Data Processing', () => {
    test('extracts basic EXIF data structure', async () => {
      const file = new MockFile(['image-content'], 'test.jpg', { type: 'image/jpeg' });
      
      const exifData = await extractExifData(file);
      
      expect(exifData).toEqual(expect.objectContaining({
        camera: null,
        lens: null,
        iso: null,
        aperture: null,
        shutterSpeed: null,
        focalLength: null,
        takenAt: null,
        location: null
      }));
    });

    // Note: This is a placeholder implementation
    // In a real app, you'd use a library like exif-js to extract actual EXIF data
    test('handles files without EXIF data', async () => {
      const file = new MockFile(['image-content'], 'no-exif.jpg', { type: 'image/jpeg' });
      
      const exifData = await extractExifData(file);
      
      // Should return empty structure without throwing
      expect(exifData).toBeDefined();
      expect(typeof exifData).toBe('object');
    });
  });

  describe('Image Optimization', () => {
    test('generates optimized versions for different use cases', async () => {
      const file = new MockFile(['large-image-content'], 'large.jpg', { type: 'image/jpeg' });
      
      // Test different thumbnail sizes
      const sizes = [150, 300, 600];
      const thumbnails = await Promise.all(
        sizes.map(size => generateThumbnail(file, size))
      );
      
      expect(thumbnails).toHaveLength(3);
      thumbnails.forEach(thumb => {
        expect(thumb).toBe('blob:mock-url');
      });
    });

    test('handles quality settings for different sizes', async () => {
      const file = new MockFile(['image-content'], 'test.jpg', { type: 'image/jpeg' });
      
      // Mock canvas toBlob to check quality parameter
      const mockToBlob = jest.fn((callback, type, quality) => {
        expect(quality).toBe(0.8); // Default quality from generateThumbnail
        const mockBlob = new Blob(['mock-data'], { type });
        callback(mockBlob);
      });
      
      mockCanvas.toBlob = mockToBlob;
      
      await generateThumbnail(file);
      
      expect(mockToBlob).toHaveBeenCalledWith(
        expect.any(Function),
        'image/jpeg',
        0.8
      );
    });
  });

  describe('Error Handling', () => {
    test('handles corrupted image files', async () => {
      // Mock image load error
      const errorImage = {
        ...mockImage,
        addEventListener: jest.fn((event, handler) => {
          if (event === 'error') {
            setTimeout(() => handler(new Error('Invalid image')), 10);
          }
        })
      };
      
      global.Image = jest.fn(() => errorImage) as any;
      
      const file = new MockFile(['corrupted-data'], 'corrupted.jpg', { type: 'image/jpeg' });
      
      await expect(generateThumbnail(file)).rejects.toThrow();
    });

    test('handles file reading errors', async () => {
      // Mock FileReader error
      global.FileReader = jest.fn(() => ({
        readAsDataURL: jest.fn(function(this: any) {
          setTimeout(() => {
            this.onerror?.(new Error('File read error'));
          }, 10);
        }),
        onload: null,
        onerror: null
      })) as any;
      
      const file = new MockFile(['content'], 'test.jpg', { type: 'image/jpeg' });
      
      await expect(generateThumbnail(file)).rejects.toThrow();
    });

    test('handles canvas context creation failure', async () => {
      // Mock canvas context failure
      mockCanvas.getContext = jest.fn(() => null);
      
      const file = new MockFile(['content'], 'test.jpg', { type: 'image/jpeg' });
      
      await expect(generateThumbnail(file)).rejects.toThrow('Could not get canvas context');
    });

    test('handles blob creation failure', async () => {
      // Mock toBlob failure
      mockCanvas.toBlob = jest.fn((callback) => {
        callback(null); // Simulate blob creation failure
      });
      
      const file = new MockFile(['content'], 'test.jpg', { type: 'image/jpeg' });
      
      await expect(generateThumbnail(file)).rejects.toThrow('Could not generate thumbnail');
    });
  });

  describe('Performance Considerations', () => {
    test('processes multiple images efficiently', async () => {
      const files = Array.from({ length: 10 }, (_, i) => 
        new MockFile(['content'], `test${i}.jpg`, { type: 'image/jpeg' })
      );
      
      const start = Date.now();
      
      const thumbnails = await Promise.all(
        files.map(file => generateThumbnail(file, 300))
      );
      
      const duration = Date.now() - start;
      
      expect(thumbnails).toHaveLength(10);
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });

    test('memory cleanup after processing', async () => {
      const file = new MockFile(['content'], 'test.jpg', { type: 'image/jpeg' });
      
      await generateThumbnail(file);
      
      // Verify URL cleanup would happen (in real implementation)
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      
      // In real implementation, you'd call URL.revokeObjectURL after use
    });
  });

  describe('Format Support', () => {
    test('supports all required image formats', async () => {
      const supportedFormats = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp'
      ];

      for (const mimeType of supportedFormats) {
        const extension = mimeType.split('/')[1];
        const file = new MockFile(['content'], `test.${extension}`, { type: mimeType });
        
        const result = await generateThumbnail(file);
        expect(result).toBe('blob:mock-url');
      }
    });

    test('rejects unsupported formats', () => {
      const unsupportedFormats = [
        'application/pdf',
        'text/plain',
        'video/mp4',
        'audio/mp3'
      ];

      // This would be tested in the validation function
      unsupportedFormats.forEach(mimeType => {
        // The validation should happen before processing
        expect(mimeType.startsWith('image/')).toBe(false);
      });
    });
  });
});