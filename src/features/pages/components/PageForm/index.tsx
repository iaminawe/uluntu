import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { PageEditor } from '../PageEditor';
import { Page, CreatePageData, UpdatePageData } from '../../types';
import { createPage, updatePage } from '../../store/pagesSlice';
import { pagesApi } from '../../api/pagesApi';
import { generateExcerpt, isContentEmpty } from '../../utils/editorUtils';

interface PageFormProps {
  page?: Page | null;
  mode: 'create' | 'edit';
  onSuccess?: (page: Page) => void;
  onCancel?: () => void;
}

interface FormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  hero_image: string;
  status: 'draft' | 'published';
  meta_title: string;
  meta_description: string;
  is_featured: boolean;
}

export const PageForm: React.FC<PageFormProps> = ({
  page,
  mode,
  onSuccess,
  onCancel,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.pages);

  const [formData, setFormData] = useState<FormData>({
    title: page?.title || '',
    slug: page?.slug || '',
    content: page?.content || '',
    excerpt: page?.excerpt || '',
    hero_image: page?.hero_image || '',
    status: page?.status || 'draft',
    meta_title: page?.meta_title || '',
    meta_description: page?.meta_description || '',
    is_featured: page?.is_featured || false,
  });

  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Partial<FormData>>({});

  // Auto-generate slug when title changes (only in create mode)
  useEffect(() => {
    if (mode === 'create' && formData.title && !formData.slug) {
      generateSlug(formData.title);
    }
  }, [formData.title, mode]);

  // Auto-generate excerpt when content changes
  useEffect(() => {
    if (formData.content && !formData.excerpt) {
      const autoExcerpt = generateExcerpt(formData.content, 160);
      setFormData((prev) => ({ ...prev, excerpt: autoExcerpt }));
    }
  }, [formData.content]);

  const generateSlug = async (title: string) => {
    if (!title.trim()) return;

    setIsGeneratingSlug(true);
    try {
      const slug = await pagesApi.generateSlug(title);
      setFormData((prev) => ({ ...prev, slug }));
    } catch (error) {
      console.error('Failed to generate slug:', error);
    } finally {
      setIsGeneratingSlug(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleContentChange = (content: string) => {
    handleInputChange('content', content);
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const { url } = await pagesApi.uploadImage(file);
      handleInputChange('hero_image', url);
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<FormData> = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.slug.trim()) {
      errors.slug = 'Slug is required';
    }

    if (!formData.content.trim() || isContentEmpty(formData.content)) {
      errors.content = 'Content is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (mode === 'create') {
        const pageData: CreatePageData = {
          title: formData.title,
          slug: formData.slug,
          content: formData.content,
          excerpt: formData.excerpt || generateExcerpt(formData.content),
          hero_image: formData.hero_image || undefined,
          status: formData.status,
          meta_title: formData.meta_title || undefined,
          meta_description: formData.meta_description || undefined,
          is_featured: formData.is_featured,
        };

        const resultAction = await dispatch(createPage(pageData));
        if (createPage.fulfilled.match(resultAction)) {
          onSuccess?.(resultAction.payload);
        }
      } else if (page) {
        const pageData: UpdatePageData = {
          id: page.id,
          title: formData.title,
          slug: formData.slug,
          content: formData.content,
          excerpt: formData.excerpt || generateExcerpt(formData.content),
          hero_image: formData.hero_image || undefined,
          status: formData.status,
          meta_title: formData.meta_title || undefined,
          meta_description: formData.meta_description || undefined,
          is_featured: formData.is_featured,
        };

        const resultAction = await dispatch(updatePage(pageData));
        if (updatePage.fulfilled.match(resultAction)) {
          onSuccess?.(resultAction.payload);
        }
      }
    } catch (error) {
      console.error('Failed to save page:', error);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/admin/pages');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter page title"
            />
            {validationErrors.title && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
              Slug *
              {isGeneratingSlug && <span className="text-blue-600 ml-2">Generating...</span>}
            </label>
            <input
              type="text"
              id="slug"
              value={formData.slug}
              onChange={(e) => handleInputChange('slug', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.slug ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="page-slug"
            />
            {validationErrors.slug && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.slug}</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
            Excerpt
          </label>
          <textarea
            id="excerpt"
            rows={3}
            value={formData.excerpt}
            onChange={(e) => handleInputChange('excerpt', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Brief description of the page (auto-generated from content if left empty)"
          />
        </div>
      </div>

      {/* Content Editor */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Content *</h3>
        
        <div className="mb-4">
          <PageEditor
            content={formData.content}
            onChange={handleContentChange}
            placeholder="Start writing your page content..."
            className="min-h-96"
          />
          {validationErrors.content && (
            <p className="mt-2 text-sm text-red-600">{validationErrors.content}</p>
          )}
        </div>
      </div>

      {/* Hero Image */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Hero Image</h3>
        
        <div className="space-y-4">
          {formData.hero_image && (
            <div className="relative">
              <img
                src={formData.hero_image}
                alt="Hero"
                className="max-w-md h-48 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={() => handleInputChange('hero_image', '')}
                className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
              >
                ×
              </button>
            </div>
          )}
          
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleImageUpload(file);
                }
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={isUploading}
            />
            {isUploading && <p className="text-sm text-blue-600 mt-1">Uploading...</p>}
          </div>
        </div>
      </div>

      {/* Publishing Options */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Publishing Options</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value as 'draft' | 'published')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_featured"
              checked={formData.is_featured}
              onChange={(e) => handleInputChange('is_featured', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-900">
              Featured page
            </label>
          </div>
        </div>
      </div>

      {/* SEO Options */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Options</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700 mb-2">
              Meta Title
            </label>
            <input
              type="text"
              id="meta_title"
              value={formData.meta_title}
              onChange={(e) => handleInputChange('meta_title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="SEO title (defaults to page title)"
            />
          </div>

          <div>
            <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 mb-2">
              Meta Description
            </label>
            <textarea
              id="meta_description"
              rows={3}
              value={formData.meta_description}
              onChange={(e) => handleInputChange('meta_description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="SEO description (defaults to excerpt)"
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-3 pt-6">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        
        <button
          type="submit"
          disabled={loading || isUploading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create Page' : 'Update Page'}
        </button>
      </div>
    </form>
  );
};

export default PageForm;