import { ImageProcessingService, IMAGE_SIZES } from '../imageProcessingService';

// Mock File API for testing
class MockFile extends File {
  constructor(bits: BlobPart[], filename: string, options?: FilePropertyBag) {
    super(bits, filename, options);
  }
}

// Mock Image for testing
class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  naturalWidth = 1920;
  naturalHeight = 1080;
  
  set src(value: string) {
    setTimeout(() => {
      if (this.onload) {
        this.onload();
      }
    }, 100);
  }
}

// Mock Canvas API
class MockCanvas {
  width = 0;
  height = 0;
  
  getContext() {
    return {
      drawImage: jest.fn(),
      filter: ''
    };
  }
  
  toBlob(callback: BlobCallback, type?: string, quality?: number) {
    const mockBlob = new Blob(['mock image data'], { type: type || 'image/jpeg' });
    setTimeout(() => callback(mockBlob), 50);
  }
  
  toDataURL(type?: string, quality?: number) {
    return 'data:image/jpeg;base64,mockdataurl';
  }
}

// Mock URL.createObjectURL and revokeObjectURL
const mockCreateObjectURL = jest.fn(() => 'mock-object-url');
const mockRevokeObjectURL = jest.fn();

// Setup mocks before tests
beforeAll(() => {
  // Mock browser APIs
  global.Image = MockImage as any;
  global.HTMLCanvasElement = MockCanvas as any;
  global.URL.createObjectURL = mockCreateObjectURL;
  global.URL.revokeObjectURL = mockRevokeObjectURL;
  
  // Mock document.createElement for canvas
  const originalCreateElement = document.createElement;
  document.createElement = jest.fn((tagName: string) => {
    if (tagName === 'canvas') {
      return new MockCanvas() as any;
    }
    return originalCreateElement.call(document, tagName);
  });
});

describe('ImageProcessingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateImageFile', () => {
    it('should accept valid image files', () => {
      const file = new MockFile(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = ImageProcessingService.validateImageFile(file);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject non-image files', () => {
      const file = new MockFile(['test'], 'test.txt', { type: 'text/plain' });
      const result = ImageProcessingService.validateImageFile(file);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid file type');
    });

    it('should reject files that are too large', () => {
      const largeFile = new MockFile(['x'.repeat(60 * 1024 * 1024)], 'large.jpg', { 
        type: 'image/jpeg' 
      });
      const result = ImageProcessingService.validateImageFile(largeFile);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('File too large');
    });
  });

  describe('getImageDimensions', () => {
    it('should return image dimensions', async () => {
      const file = new MockFile(['test'], 'test.jpg', { type: 'image/jpeg' });
      const dimensions = await ImageProcessingService.getImageDimensions(file);
      
      expect(dimensions.width).toBe(1920);
      expect(dimensions.height).toBe(1080);
      expect(dimensions.aspectRatio).toBe(1920 / 1080);
    });
  });

  describe('calculateSmartCrop', () => {
    it('should calculate center crop for wide images', () => {
      const crop = ImageProcessingService.calculateSmartCrop(1920, 1080, 800, 600);
      
      expect(crop.width).toBe(1440); // 1080 * (800/600)
      expect(crop.height).toBe(1080);
      expect(crop.x).toBe(240); // (1920 - 1440) / 2
      expect(crop.y).toBe(0);
    });

    it('should calculate center crop for tall images', () => {
      const crop = ImageProcessingService.calculateSmartCrop(800, 1200, 800, 600);
      
      expect(crop.width).toBe(800);
      expect(crop.height).toBe(600); // 800 / (800/600)
      expect(crop.x).toBe(0);
      expect(crop.y).toBe(300); // (1200 - 600) / 2
    });
  });

  describe('calculateCompressionRatio', () => {
    it('should calculate compression percentage correctly', () => {
      const ratio = ImageProcessingService.calculateCompressionRatio(1000000, 500000);
      expect(ratio).toBe(50);
    });

    it('should handle no compression', () => {
      const ratio = ImageProcessingService.calculateCompressionRatio(1000000, 1000000);
      expect(ratio).toBe(0);
    });
  });

  describe('fileToDataUrl', () => {
    it('should convert file to data URL', async () => {
      const file = new MockFile(['test content'], 'test.jpg', { type: 'image/jpeg' });
      
      // Mock FileReader
      const mockFileReader = {
        onload: null as any,
        onerror: null as any,
        result: 'data:image/jpeg;base64,dGVzdCBjb250ZW50', // base64 of "test content"
        readAsDataURL: jest.fn(function(this: any) {
          setTimeout(() => {
            if (this.onload) {
              this.onload();
            }
          }, 50);
        })
      };
      
      global.FileReader = jest.fn(() => mockFileReader) as any;
      
      const dataUrl = await ImageProcessingService.fileToDataUrl(file);
      expect(dataUrl).toBe('data:image/jpeg;base64,dGVzdCBjb250ZW50');
    });
  });

  describe('IMAGE_SIZES configuration', () => {
    it('should have all required size configurations', () => {
      expect(IMAGE_SIZES.thumbnail).toBeDefined();
      expect(IMAGE_SIZES.small).toBeDefined();
      expect(IMAGE_SIZES.medium).toBeDefined();
      expect(IMAGE_SIZES.large).toBeDefined();
      expect(IMAGE_SIZES.original).toBeDefined();
    });

    it('should have proper dimensions for thumbnail', () => {
      expect(IMAGE_SIZES.thumbnail.width).toBe(150);
      expect(IMAGE_SIZES.thumbnail.height).toBe(150);
      expect(IMAGE_SIZES.thumbnail.quality).toBe(0.7);
    });

    it('should have increasing quality for larger sizes', () => {
      expect(IMAGE_SIZES.thumbnail.quality).toBeLessThan(IMAGE_SIZES.small.quality);
      expect(IMAGE_SIZES.small.quality).toBeLessThan(IMAGE_SIZES.medium.quality);
      expect(IMAGE_SIZES.medium.quality).toBeLessThan(IMAGE_SIZES.large.quality);
      expect(IMAGE_SIZES.large.quality).toBeLessThan(IMAGE_SIZES.original.quality);
    });
  });

  describe('resizeAndCrop', () => {
    it('should process image with smart cropping', async () => {
      const file = new MockFile(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      const result = await ImageProcessingService.resizeAndCrop(
        file,
        800,
        600,
        0.8,
        true
      );
      
      expect(result.width).toBe(800);
      expect(result.height).toBe(600);
      expect(result.file).toBeInstanceOf(File);
      expect(result.dataUrl).toBe('data:image/jpeg;base64,mockdataurl');
    });
  });

  describe('Error handling', () => {
    it('should handle image load errors gracefully', async () => {
      // Create a mock that will trigger error
      class ErrorImage extends MockImage {
        set src(value: string) {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror();
            }
          }, 50);
        }
      }
      
      global.Image = ErrorImage as any;
      
      const file = new MockFile(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      await expect(ImageProcessingService.getImageDimensions(file))
        .rejects
        .toThrow('Failed to load image');
      
      // Reset Image mock for subsequent tests
      global.Image = MockImage as any;
    });
  });
});

describe('Integration tests', () => {
  beforeEach(() => {
    // Reset Image mock before each test
    global.Image = MockImage as any;
  });

  it('should handle the complete processing pipeline', async () => {
    const file = new MockFile(['test image data'], 'test.jpg', { type: 'image/jpeg' });
    
    // Test validation
    const validation = ImageProcessingService.validateImageFile(file);
    expect(validation.valid).toBe(true);
    
    // Test dimensions
    const dimensions = await ImageProcessingService.getImageDimensions(file);
    expect(dimensions.width).toBeGreaterThan(0);
    expect(dimensions.height).toBeGreaterThan(0);
    
    // Test thumbnail creation
    const thumbnail = await ImageProcessingService.createThumbnail(file, 150, 0.7);
    expect(thumbnail.width).toBe(150);
    expect(thumbnail.height).toBe(150);
    expect(thumbnail.sizeType).toBe('thumbnail');
  });

  it('should maintain aspect ratios in smart cropping', () => {
    // Test various aspect ratios
    const testCases = [
      { original: [1920, 1080], target: [800, 600] },
      { original: [800, 1200], target: [300, 300] },
      { original: [1000, 1000], target: [400, 600] }
    ];

    testCases.forEach(({ original, target }) => {
      const crop = ImageProcessingService.calculateSmartCrop(
        original[0], original[1],
        target[0], target[1]
      );
      
      expect(crop.x).toBeGreaterThanOrEqual(0);
      expect(crop.y).toBeGreaterThanOrEqual(0);
      expect(crop.width).toBeLessThanOrEqual(original[0]);
      expect(crop.height).toBeLessThanOrEqual(original[1]);
    });
  });
});