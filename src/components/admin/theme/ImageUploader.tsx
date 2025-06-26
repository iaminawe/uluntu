import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Download,
  Eye,
  Trash2,
  AlertCircle,
  Check,
  Loader2,
  Link
} from 'lucide-react';
import { Theme, UploadedImage } from './types';

interface ImageUploaderProps {
  images: Theme['images'];
  onChange: (images: Partial<Theme['images']>) => void;
}

interface ImageUploadZoneProps {
  label: string;
  description: string;
  currentImage: string | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
  acceptedFormats?: string;
  maxSize?: number;
  recommendedSize?: string;
}

const ImageUploadZone: React.FC<ImageUploadZoneProps> = ({
  label,
  description,
  currentImage,
  onUpload,
  onRemove,
  acceptedFormats = 'image/png, image/jpeg, image/svg+xml',
  maxSize = 5 * 1024 * 1024, // 5MB
  recommendedSize
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    setUploadError(null);

    // Validate file type
    const validTypes = acceptedFormats.split(', ').map(type => type.trim());
    if (!validTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please upload a supported image format.');
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      setUploadError(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    // Simulate upload (in real implementation, this would upload to server/storage)
    setIsUploading(true);
    setTimeout(() => {
      onUpload(file);
      setIsUploading(false);
    }, 1000);
  }, [acceptedFormats, maxSize, onUpload]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <p className="text-xs text-gray-500">{description}</p>
      
      {currentImage ? (
        <div className="relative group">
          <div className="relative rounded-lg overflow-hidden border border-gray-200">
            <img 
              src={currentImage} 
              alt={label}
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
              <div className="hidden group-hover:flex space-x-2">
                <button
                  onClick={() => window.open(currentImage, '_blank')}
                  className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  title="View full size"
                >
                  <Eye className="h-5 w-5" />
                </button>
                <button
                  onClick={onRemove}
                  className="p-2 bg-white rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  title="Remove image"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          {recommendedSize && (
            <p className="text-xs text-gray-500 mt-1">Recommended size: {recommendedSize}</p>
          )}
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats}
            onChange={handleFileInputChange}
            className="hidden"
          />
          
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600 mb-2" />
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                {isDragging ? 'Drop image here' : 'Click or drag image to upload'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {acceptedFormats.replace(/image\//g, '').replace(/,/g, ' •')} • Max {maxSize / (1024 * 1024)}MB
              </p>
              {recommendedSize && (
                <p className="text-xs text-gray-500 mt-1">Recommended: {recommendedSize}</p>
              )}
            </>
          )}
        </div>
      )}
      
      {uploadError && (
        <div className="flex items-center text-sm text-red-600 mt-2">
          <AlertCircle className="h-4 w-4 mr-1" />
          {uploadError}
        </div>
      )}
    </div>
  );
};

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [activeTab, setActiveTab] = useState<'logos' | 'backgrounds'>('logos');

  const handleImageUpload = useCallback((type: keyof Theme['images'], file: File) => {
    // In a real implementation, this would upload to server/storage
    // For now, we'll create a local URL
    const url = URL.createObjectURL(file);
    onChange({ [type]: url });
  }, [onChange]);

  const handleImageRemove = useCallback((type: keyof Theme['images']) => {
    onChange({ [type]: null });
  }, [onChange]);

  const handleUrlInput = useCallback((type: keyof Theme['images'], url: string) => {
    onChange({ [type]: url });
  }, [onChange]);

  const backgroundPatterns = [
    { name: 'Dots', url: '/patterns/dots.svg' },
    { name: 'Grid', url: '/patterns/grid.svg' },
    { name: 'Waves', url: '/patterns/waves.svg' },
    { name: 'Circles', url: '/patterns/circles.svg' },
    { name: 'Hexagons', url: '/patterns/hexagons.svg' },
    { name: 'Stripes', url: '/patterns/stripes.svg' }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('logos')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'logos'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Logos & Icons
          </button>
          <button
            onClick={() => setActiveTab('backgrounds')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'backgrounds'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Backgrounds
          </button>
        </nav>
      </div>

      {/* Logos Tab */}
      {activeTab === 'logos' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="font-medium text-gray-900 mb-6">Brand Assets</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUploadZone
                label="Logo"
                description="Main logo displayed in header and other prominent locations"
                currentImage={images.logo}
                onUpload={(file) => handleImageUpload('logo', file)}
                onRemove={() => handleImageRemove('logo')}
                acceptedFormats="image/png, image/jpeg, image/svg+xml"
                recommendedSize="200x60px"
              />
              
              <ImageUploadZone
                label="Favicon"
                description="Small icon displayed in browser tabs and bookmarks"
                currentImage={images.favicon}
                onUpload={(file) => handleImageUpload('favicon', file)}
                onRemove={() => handleImageRemove('favicon')}
                acceptedFormats="image/png, image/x-icon, image/svg+xml"
                recommendedSize="32x32px or 16x16px"
                maxSize={1 * 1024 * 1024} // 1MB
              />
            </div>
          </div>

          {/* URL Input Option */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="font-medium text-gray-900 mb-4">External Image URLs</h4>
            <p className="text-sm text-gray-500 mb-4">
              Alternatively, you can provide direct URLs to hosted images
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo URL
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="url"
                    value={images.logo || ''}
                    onChange={(e) => handleUrlInput('logo', e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                  <Link className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Favicon URL
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="url"
                    value={images.favicon || ''}
                    onChange={(e) => handleUrlInput('favicon', e.target.value)}
                    placeholder="https://example.com/favicon.ico"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                  <Link className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backgrounds Tab */}
      {activeTab === 'backgrounds' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="font-medium text-gray-900 mb-6">Background Images</h4>
            
            <ImageUploadZone
              label="Hero Background"
              description="Background image for hero sections and page headers"
              currentImage={images.backgroundImage}
              onUpload={(file) => handleImageUpload('backgroundImage', file)}
              onRemove={() => handleImageRemove('backgroundImage')}
              acceptedFormats="image/png, image/jpeg"
              recommendedSize="1920x1080px or larger"
              maxSize={10 * 1024 * 1024} // 10MB
            />
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="font-medium text-gray-900 mb-4">Background Patterns</h4>
            <p className="text-sm text-gray-500 mb-4">
              Choose a subtle pattern for background decoration
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <button
                onClick={() => handleImageRemove('backgroundPattern')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  !images.backgroundPattern
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <X className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">None</p>
              </button>
              
              {backgroundPatterns.map((pattern) => (
                <button
                  key={pattern.name}
                  onClick={() => handleUrlInput('backgroundPattern', pattern.url)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    images.backgroundPattern === pattern.url
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="h-16 w-full bg-gray-100 rounded mb-2 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600">{pattern.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Pattern Upload */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="font-medium text-gray-900 mb-4">Custom Pattern</h4>
            
            <ImageUploadZone
              label="Upload Pattern"
              description="Upload your own background pattern (SVG recommended for best quality)"
              currentImage={images.backgroundPattern}
              onUpload={(file) => handleImageUpload('backgroundPattern', file)}
              onRemove={() => handleImageRemove('backgroundPattern')}
              acceptedFormats="image/svg+xml, image/png"
              recommendedSize="Seamless pattern, 100x100px to 500x500px"
              maxSize={2 * 1024 * 1024} // 2MB
            />
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Image Optimization Tips:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Use SVG format for logos and icons when possible for crisp display at any size</li>
              <li>Optimize images before uploading to reduce loading times</li>
              <li>Use transparent backgrounds for logos (PNG or SVG)</li>
              <li>For favicons, provide multiple sizes or use an ICO file with multiple resolutions</li>
              <li>Background images should be at least 1920px wide for desktop displays</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}