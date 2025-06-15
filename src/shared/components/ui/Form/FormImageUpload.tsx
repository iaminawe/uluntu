import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

export interface FormImageUploadProps {
  /**
   * Current image URL
   */
  currentImage?: string;
  /**
   * Placeholder text when no image is selected
   */
  placeholder?: string;
  /**
   * Handler for image change
   */
  onChange: (file: File | null) => void;
  /**
   * ID for the input field
   */
  id?: string;
  /**
   * Name for the input field
   */
  name?: string;
  /**
   * Label for the component
   */
  label?: string;
  /**
   * Helper text to display
   */
  helperText?: string;
  /**
   * Error message to display
   */
  error?: string;
  /**
   * Maximum file size in bytes
   */
  maxSize?: number;
  /**
   * Allowed file types
   */
  acceptedTypes?: string[];
  /**
   * Whether the field is required
   */
  required?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Whether the component is disabled
   */
  disabled?: boolean;
}

/**
 * Image upload component with preview, drag-and-drop, and file validation
 */
export const FormImageUpload: React.FC<FormImageUploadProps> = ({
  currentImage,
  placeholder = 'Drag and drop an image, or click to select',
  onChange,
  id = 'image-upload',
  name = 'image',
  label,
  helperText,
  error,
  maxSize = 5 * 1024 * 1024, // 5MB default max size
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  required = false,
  className = '',
  disabled = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [localError, setLocalError] = useState<string>('');
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Update preview when currentImage prop changes
  useEffect(() => {
    setPreview(currentImage || null);
  }, [currentImage]);
  
  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const validateFile = (file: File): boolean => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      setLocalError(`File type not supported. Please upload: ${acceptedTypes.join(', ')}`);
      return false;
    }
    
    // Check file size
    if (file.size > maxSize) {
      setLocalError(`File is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
      return false;
    }
    
    setLocalError('');
    return true;
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      if (validateFile(file)) {
        handleFile(file);
      }
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      if (validateFile(file)) {
        handleFile(file);
      }
    }
  };
  
  const handleFile = (file: File) => {
    // Create a preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    
    // Call the onChange handler with the file
    onChange(file);
  };
  
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onChange(null);
  };
  
  const effectiveError = error || localError;
  
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center
                  transition-colors
                  ${dragActive ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10' : 'border-slate-300 dark:border-slate-600'}
                  ${effectiveError ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : ''}
                  ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="file"
          className="hidden"
          accept={acceptedTypes.join(',')}
          onChange={handleChange}
          disabled={disabled}
        />
        
        {preview ? (
          <div className="relative">
            <img 
              src={preview} 
              alt="Preview" 
              className="max-h-48 mx-auto rounded-md object-contain" 
            />
            
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="py-4 flex flex-col items-center text-slate-500 dark:text-slate-400">
            <ImageIcon className="h-10 w-10 mb-2" />
            <p className="text-sm">{placeholder}</p>
            <p className="text-xs mt-1">
              {acceptedTypes.map(type => type.replace('image/', '.')).join(', ')} • Max {maxSize / (1024 * 1024)}MB
            </p>
            <div className="mt-3">
              <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                <Upload className="h-3.5 w-3.5 mr-1" />
                Browse Files
              </span>
            </div>
          </div>
        )}
      </div>
      
      {helperText && !effectiveError && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
      
      {effectiveError && (
        <p className="mt-1 text-xs text-red-500">{effectiveError}</p>
      )}
    </div>
  );
};

export default FormImageUpload;
