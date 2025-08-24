import { DollarSign, MapPin, Settings } from 'lucide-react';
import { EnhancedContentAIEditor } from '@/components/content/EnhancedContentAIEditor';
import { FormInput, FormSelect, FormCheckbox } from '@/shared/components/ui/Form';
import { SlugField } from '@/shared/components/ui/Form/StandardFormComponents';
import { BasicInfoSectionProps, ListingType } from './types';
import { useState } from 'react';

const typeOptions = [
  { value: 'product', label: 'Product' },
  { value: 'service', label: 'Service' },
  { value: 'equipment', label: 'Equipment' }
];

const conditionOptions = [
  { value: '', label: 'Select condition' },
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' }
];

const statusOptions = [
  { value: 'draft', label: 'Save as Draft' },
  { value: 'published', label: 'Publish Now' },
  { value: 'archived', label: 'Archive' }
];

const BasicInfoSection = ({
  formData,
  handleChange,
  getTypeIcon,
  isSubmitting
}: BasicInfoSectionProps) => {
  const [includeImages, setIncludeImages] = useState(true);
  
  const handleDescriptionChange = (content: string) => {
    const syntheticEvent = {
      target: { name: 'description', value: content }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    
    handleChange(syntheticEvent);
  };
  
  // Custom handler for featured checkbox
  const handleFeaturedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const syntheticEvent = {
      target: {
        name: 'featured',
        value: e.target.checked
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleChange(syntheticEvent);
  };
  
  return (
    <div className="space-y-6">
      <FormInput
        id="title"
        name="title"
        label="Listing Title"
        value={formData.title}
        onChange={handleChange}
        required
        disabled={isSubmitting}
        placeholder="Enter a descriptive title"
      />
      
      <SlugField
        value={formData.slug}
        onChange={(value) => handleChange({ target: { name: 'slug', value } } as any)}
        sourceValue={formData.title}
        required
        baseUrl="/marketplace/"
        disabled={isSubmitting}
      />
      
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Description <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIncludeImages(!includeImages)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-600 rounded transition-colors"
              disabled={isSubmitting}
            >
              <Settings className="h-3 w-3" />
              {includeImages ? 'Images On' : 'Images Off'}
            </button>
          </div>
        </div>
        <EnhancedContentAIEditor
          value={formData.description}
          onChange={handleDescriptionChange}
          placeholder="Provide details about your listing..."
          contentType="marketplace"
          includeImages={includeImages}
          height="500px"
          disabled={isSubmitting}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative">
          <FormSelect
            id="type"
            name="type"
            label="Listing Type"
            value={formData.type}
            onChange={handleChange}
            options={typeOptions}
            required
            disabled={isSubmitting}
            className="pl-9" // Add padding to make room for the icon
          />
          <div className="absolute top-9 left-3 flex items-center pointer-events-none z-10">
            {getTypeIcon(formData.type as ListingType)}
          </div>
        </div>
        
        <div className="relative">
          <FormInput
            id="price"
            name="price"
            label="Price"
            value={formData.price}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            placeholder="0.00"
            helperText="Enter 0 for free items or services."
            className="pl-9" // Add padding to make room for the icon
            containerClassName="relative"
          />
          <div className="absolute top-9 left-3 flex items-center pointer-events-none z-10">
            <DollarSign className="h-5 w-5 text-slate-400" />
          </div>
        </div>
        
        {formData.type !== 'service' && (
          <FormSelect
            id="condition"
            name="condition"
            label={`Condition ${formData.type === 'product' ? '*' : ''}`}
            value={formData.condition}
            onChange={handleChange}
            options={conditionOptions}
            required={formData.type === 'product'}
            disabled={isSubmitting}
          />
        )}
        
        <div className="relative">
          <FormInput
            id="location"
            name="location"
            label="Location"
            value={formData.location}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            placeholder="City, State/Province"
            className="pl-9" // Add padding to make room for the icon
            containerClassName="relative"
          />
          <div className="absolute top-9 left-3 flex items-center pointer-events-none z-10">
            <MapPin className="h-5 w-5 text-slate-400" />
          </div>
        </div>
        
        <FormSelect
          id="status"
          name="status"
          label="Status"
          value={formData.status}
          onChange={handleChange}
          options={statusOptions}
          required
          disabled={isSubmitting}
        />
      </div>
      
      <FormCheckbox
        id="featured"
        name="featured"
        label="Feature this listing on marketplace homepage"
        checked={formData.featured}
        onChange={handleFeaturedChange}
        disabled={isSubmitting}
      />
    </div>
  );
};

export default BasicInfoSection;
