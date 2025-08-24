import { EnhancedContentAIEditor } from '@/components/content/EnhancedContentAIEditor';
import { FormInput, FormSelect, FormCheckbox, FormTextarea, FormImageUpload } from '@/shared/components/ui/Form';
import { FormInputsProps } from './types';
import { useState } from 'react';
import { ContentStatus } from '../../types/common';

const FormInputs: React.FC<FormInputsProps> = ({ 
  formData, 
  handleChange, 
  setFormData, 
  onImageChange,
  errors 
}) => {
  const [enableImageInsertion, setEnableImageInsertion] = useState(true);
  return (
    <div className="space-y-6">
      {/* Title */}
      <FormInput
        id="title"
        name="title"
        label="Title *"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        required
      />
      
      {/* Slug */}
      <FormInput
        id="slug"
        name="slug"
        label="URL Slug *"
        value={formData.slug}
        onChange={handleChange}
        error={errors.slug}
        required
        helperText={`This will be used in the URL: /news/${formData.slug || 'your-slug'}`}
      />
      
      {/* Excerpt */}
      <FormTextarea
        id="excerpt"
        name="excerpt"
        label="Excerpt/Summary *"
        value={formData.excerpt}
        onChange={handleChange}
        error={errors.excerpt}
        rows={3}
        required
      />
      
      {/* Content */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Article Content *
          </label>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={enableImageInsertion}
                onChange={(e) => setEnableImageInsertion(e.target.checked)}
                className="mr-1"
              />
              Enable AI image insertion
            </label>
          </div>
        </div>
        
        <EnhancedContentAIEditor
          value={formData.content}
          onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
          placeholder="Write your news article here. Use the AI tools to generate content, improve writing, or insert relevant images..."
          contentType="news"
          includeImages={enableImageInsertion}
          height="500px"
          className="min-h-[500px]"
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content}</p>
        )}
        
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          💡 Tip: Select text to access AI editing options, or use the toolbar buttons to generate content and enhance your writing.
        </div>
      </div>
      
      {/* Featured Image */}
      <FormImageUpload
        id="news-image"
        name="image"
        label="Featured Image"
        currentImage={formData.image}
        onChange={onImageChange}
        placeholder="Upload an engaging news article image"
        helperText="Upload an image that represents your article. JPG, PNG, or WebP formats supported."
        maxSize={5 * 1024 * 1024} // 5MB limit
        acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
      />
      
      {/* Status */}
      <FormSelect
        id="status"
        name="status"
        label="Status"
        value={formData.status}
        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ContentStatus }))}
        options={[
          { value: 'draft', label: 'Draft' },
          { value: 'published', label: 'Published' },
          { value: 'archived', label: 'Archived' }
        ]}
      />
      
      {/* Featured Checkbox */}
      <FormCheckbox
        id="featured"
        name="featured"
        label="Feature this article (promotes to home page and top of listings)"
        checked={formData.featured}
        onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
      />
    </div>
  );
};

export default FormInputs;
