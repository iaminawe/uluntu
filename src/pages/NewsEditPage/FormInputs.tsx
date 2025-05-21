import { Upload } from 'lucide-react';
import RichTextEditor from '../../components/RichTextEditor';
import CustomSelect from '../../components/CustomSelect';
import { FormInputsProps } from './types';

const FormInputs: React.FC<FormInputsProps> = ({ 
  formData, 
  handleChange, 
  setFormData, 
  errors 
}) => {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`block w-full rounded-lg border-slate-300 dark:border-slate-600 
                    dark:bg-slate-800 dark:text-white shadow-sm focus:border-orange-500 
                    focus:ring-orange-500 sm:text-sm ${errors.title ? 'border-red-500' : ''}`}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>
      
      {/* Excerpt */}
      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Excerpt/Summary *
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={3}
          value={formData.excerpt}
          onChange={handleChange}
          className={`block w-full rounded-lg border-slate-300 dark:border-slate-600 
                    dark:bg-slate-800 dark:text-white shadow-sm focus:border-orange-500 
                    focus:ring-orange-500 sm:text-sm ${errors.excerpt ? 'border-red-500' : ''}`}
        />
        {errors.excerpt && (
          <p className="mt-1 text-sm text-red-600">{errors.excerpt}</p>
        )}
      </div>
      
      {/* Content */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Article Content *
        </label>
        <RichTextEditor
          value={formData.content}
          onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
          placeholder="Write your article here..."
          error={errors.content}
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content}</p>
        )}
      </div>
      
      {/* Image URL */}
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Featured Image URL
        </label>
        <div className="flex">
          <input
            type="text"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            className="flex-1 block w-full rounded-l-lg border-slate-300 dark:border-slate-600 
                      dark:bg-slate-800 dark:text-white shadow-sm focus:border-orange-500 
                      focus:ring-orange-500 sm:text-sm"
          />
          <button
            type="button"
            className="inline-flex items-center justify-center px-4 py-2 bg-slate-200 
                      text-slate-700 dark:bg-slate-700 dark:text-slate-200 rounded-r-lg 
                      hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            <Upload className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Upload or enter a URL to your featured image
        </p>
      </div>
      
      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Status
        </label>
        <CustomSelect
          id="status"
          name="status"
          value={formData.status}
          onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
          options={[
            { value: 'draft', label: 'Draft' },
            { value: 'published', label: 'Published' },
            { value: 'archived', label: 'Archived' }
          ]}
        />
      </div>
      
      {/* Featured Checkbox */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="featured"
          name="featured"
          checked={formData.featured}
          onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
          className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-slate-300 rounded"
        />
        <label htmlFor="featured" className="ml-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Feature this article (promotes to home page and top of listings)
        </label>
      </div>
    </div>
  );
};

export default FormInputs;
