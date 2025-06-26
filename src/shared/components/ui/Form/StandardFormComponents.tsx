/**
 * Standardized Form Components for Consistent Implementation
 * These components provide a unified form design pattern with 80% width containers,
 * consistent spacing, and reusable patterns across all entity forms.
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save, Eye, EyeOff, Trash2, Globe, RefreshCw } from 'lucide-react';
import { generateSlug } from '@/features/companies/utils/slugUtils';
import { FormActionsProps } from './types';

// =====================
// FORM CONTAINER - Standard 80% width wrapper
// =====================
interface FormContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const FormContainer: React.FC<FormContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`w-4/5 mx-auto space-y-6 ${className}`}>
      {children}
    </div>
  );
};

// =====================
// FORM PAGE WRAPPER - Full page structure with container
// =====================
interface FormPageWrapperProps {
  children: React.ReactNode;
  title: string;
  backUrl: string;
  isLoading?: boolean;
  loadingMessage?: string;
}

export const FormPageWrapper: React.FC<FormPageWrapperProps> = ({ 
  children, 
  title, 
  backUrl,
  isLoading = false,
  loadingMessage = 'Loading...'
}) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <FormContainer>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600 flex items-center">
            <Link 
              to={backUrl} 
              className="mr-3 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </Link>
            <h1 className="text-xl font-semibold text-slate-800 dark:text-white">
              {title}
            </h1>
          </div>
          
          {isLoading ? (
            <div className="p-8">
              <div className="animate-pulse space-y-4">
                <div className="text-center text-slate-600 dark:text-slate-400">{loadingMessage}</div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              {children}
            </div>
          )}
        </div>
      </FormContainer>
    </div>
  );
};

// =====================
// SLUG FIELD COMPONENT - Auto-generation with validation
// =====================
interface SlugFieldProps {
  value: string;
  onChange: (value: string) => void;
  sourceValue?: string; // Value to generate slug from (e.g., title)
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  helpText?: string;
  showPreview?: boolean;
  baseUrl?: string; // For URL preview (e.g., "/companies/")
}

export const SlugField: React.FC<SlugFieldProps> = ({
  value,
  onChange,
  sourceValue,
  label = 'URL Slug',
  error,
  disabled = false,
  required = false,
  helpText = 'This will be used in the URL',
  showPreview = true,
  baseUrl = ''
}) => {
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Auto-generate slug from source value
  useEffect(() => {
    if (sourceValue && !value && !isEditing && !disabled) {
      setIsAutoGenerating(true);
      const generatedSlug = generateSlug(sourceValue);
      onChange(generatedSlug);
      setTimeout(() => setIsAutoGenerating(false), 500);
    }
  }, [sourceValue, value, isEditing, disabled, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsEditing(true);
    // Only allow lowercase letters, numbers, and hyphens
    const cleanedValue = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');
    onChange(cleanedValue);
  };

  const handleRegenerate = () => {
    if (sourceValue) {
      setIsAutoGenerating(true);
      const generatedSlug = generateSlug(sourceValue);
      onChange(generatedSlug);
      setIsEditing(false);
      setTimeout(() => setIsAutoGenerating(false), 500);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={value}
            onChange={handleChange}
            disabled={disabled || isAutoGenerating}
            className={`flex-1 px-4 py-2 border rounded-lg transition-colors
              ${error 
                ? 'border-red-300 dark:border-red-700 focus:ring-red-500' 
                : 'border-slate-300 dark:border-slate-600 focus:ring-orange-500'
              }
              bg-white dark:bg-slate-900 text-slate-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            placeholder="url-friendly-slug"
          />
          
          {sourceValue && !disabled && (
            <button
              type="button"
              onClick={handleRegenerate}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-orange-600 
                       dark:hover:text-orange-400 transition-colors"
              title="Regenerate slug from title"
            >
              <RefreshCw className={`h-5 w-5 ${isAutoGenerating ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
        
        {helpText && !error && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{helpText}</p>
        )}
        
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        
        {showPreview && value && baseUrl && (
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Globe className="h-4 w-4" />
            <span className="font-mono">
              {window.location.origin}{baseUrl}{value}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// =====================
// SEO FIELDS COMPONENT - Meta title and description
// =====================
interface SeoFieldsProps {
  metaTitle: string;
  metaDescription: string;
  onMetaTitleChange: (value: string) => void;
  onMetaDescriptionChange: (value: string) => void;
  titlePlaceholder?: string;
  descriptionPlaceholder?: string;
  errors?: {
    metaTitle?: string;
    metaDescription?: string;
  };
}

export const SeoFields: React.FC<SeoFieldsProps> = ({
  metaTitle,
  metaDescription,
  onMetaTitleChange,
  onMetaDescriptionChange,
  titlePlaceholder = 'SEO title (defaults to page title)',
  descriptionPlaceholder = 'SEO description (defaults to excerpt)',
  errors = {}
}) => {
  const titleLength = metaTitle.length;
  const descriptionLength = metaDescription.length;
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
        SEO Settings
      </h3>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Meta Title
          <span className="ml-2 text-xs text-slate-500">
            ({titleLength}/60 characters)
          </span>
        </label>
        <input
          type="text"
          value={metaTitle}
          onChange={(e) => onMetaTitleChange(e.target.value)}
          maxLength={60}
          className={`w-full px-4 py-2 border rounded-lg transition-colors
            ${errors.metaTitle 
              ? 'border-red-300 dark:border-red-700' 
              : 'border-slate-300 dark:border-slate-600'
            }
            bg-white dark:bg-slate-900 text-slate-900 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
          `}
          placeholder={titlePlaceholder}
        />
        {errors.metaTitle && (
          <p className="mt-1 text-sm text-red-600">{errors.metaTitle}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Meta Description
          <span className="ml-2 text-xs text-slate-500">
            ({descriptionLength}/160 characters)
          </span>
        </label>
        <textarea
          value={metaDescription}
          onChange={(e) => onMetaDescriptionChange(e.target.value)}
          maxLength={160}
          rows={3}
          className={`w-full px-4 py-2 border rounded-lg transition-colors
            ${errors.metaDescription 
              ? 'border-red-300 dark:border-red-700' 
              : 'border-slate-300 dark:border-slate-600'
            }
            bg-white dark:bg-slate-900 text-slate-900 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
          `}
          placeholder={descriptionPlaceholder}
        />
        {errors.metaDescription && (
          <p className="mt-1 text-sm text-red-600">{errors.metaDescription}</p>
        )}
      </div>
    </div>
  );
};

// =====================
// STANDARD FORM ACTIONS - Save, Publish/Unpublish, Delete
// =====================
interface StandardFormActionsProps extends FormActionsProps {
  isPublished?: boolean;
  onPublishToggle?: () => void;
  publishText?: string;
  unpublishText?: string;
  showPublishToggle?: boolean;
}

export const StandardFormActions: React.FC<StandardFormActionsProps> = ({
  onSubmit,
  onCancel,
  onDelete,
  onPublishToggle,
  submitText = 'Save Changes',
  cancelText = 'Cancel',
  deleteText = 'Delete',
  publishText = 'Publish',
  unpublishText = 'Unpublish',
  isSubmitting = false,
  isNew = false,
  isPublished = false,
  showPublishToggle = false,
  className = '',
  align = 'between',
}) => {
  const alignmentClass = {
    'left': 'justify-start',
    'center': 'justify-center',
    'right': 'justify-end',
    'between': 'justify-between',
  }[align];

  return (
    <div className={`flex flex-wrap items-center gap-4 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 ${alignmentClass} ${className}`}>
      {/* Delete button - only shown for existing entities */}
      {!isNew && onDelete && (
        <button
          type="button"
          onClick={onDelete}
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-700 
                    text-red-600 dark:text-red-400 bg-white dark:bg-slate-800 rounded-lg 
                    hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 
                    focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors"
        >
          <Trash2 className="h-5 w-5 mr-2" />
          {deleteText}
        </button>
      )}
      
      <div className="flex items-center gap-4 ml-auto">
        {/* Cancel button */}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 
                     text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-lg 
                     hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 
                     focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
          >
            {cancelText}
          </button>
        )}
        
        {/* Publish/Unpublish toggle */}
        {showPublishToggle && onPublishToggle && !isNew && (
          <button
            type="button"
            onClick={onPublishToggle}
            disabled={isSubmitting}
            className={`inline-flex items-center px-4 py-2 border rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-offset-2 
                      disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                      ${isPublished 
                        ? 'border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-900/20 focus:ring-amber-500'
                        : 'border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 bg-white dark:bg-slate-800 hover:bg-green-50 dark:hover:bg-green-900/20 focus:ring-green-500'
                      }`}
          >
            {isPublished ? <EyeOff className="h-5 w-5 mr-2" /> : <Eye className="h-5 w-5 mr-2" />}
            {isPublished ? unpublishText : publishText}
          </button>
        )}
        
        {/* Submit button */}
        {onSubmit && (
          <button
            type="submit"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-5 w-5 mr-2" />
            {isSubmitting ? 'Saving...' : submitText}
          </button>
        )}
      </div>
    </div>
  );
};

// =====================
// FORM SECTION DIVIDER - Consistent section separation
// =====================
export const FormSectionDivider: React.FC = () => {
  return <hr className="border-t border-slate-200 dark:border-slate-700 my-8" />;
};

// =====================
// SUCCESS MESSAGE - Consistent success feedback
// =====================
interface SuccessMessageProps {
  title: string;
  message: string;
  className?: string;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({ 
  title, 
  message, 
  className = '' 
}) => {
  return (
    <div className={`p-8 text-center ${className}`}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
        <svg
          className="h-6 w-6 text-green-600 dark:text-green-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        {message}
      </p>
    </div>
  );
};

// =====================
// ERROR MESSAGE - Consistent error feedback
// =====================
interface ErrorMessageProps {
  error: string;
  onDismiss?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  error, 
  onDismiss,
  className = '' 
}) => {
  return (
    <div className={`bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-1">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-3 text-red-500 hover:text-red-600 dark:hover:text-red-400"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};