import RichTextEditor from '@/shared/components/ui/RichTextEditor';
import { FormInput, FormSelect, FormCheckbox, FormTextarea, FormImageUpload } from '@/shared/components/ui/Form';
import { FormInputsProps } from './types';
import { ContentStatus } from '../../types/common';

const FormInputs: React.FC<FormInputsProps> = ({ 
  formData, 
  handleChange, 
  setFormData, 
  onImageChange,
  errors 
}) => {
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
        <label htmlFor="content" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Article Content *
        </label>
        
        <RichTextEditor
          id="content"
          value={formData.content}
          onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
          placeholder="Write your article here..."
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content}</p>
        )}
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
