import { Package, DollarSign, MapPin } from 'lucide-react';
import CustomSelect from '../../components/CustomSelect';
import RichTextEditor from '../../components/RichTextEditor';
import { BasicInfoSectionProps, ListingType } from './types';

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
  const handleDescriptionChange = (data: string) => {
    const syntheticEvent = {
      target: { name: 'description', value: data }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    
    handleChange(syntheticEvent);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Listing Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          disabled={isSubmitting}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                    bg-white dark:bg-slate-800 text-slate-900 dark:text-white 
                    focus:ring-2 focus:ring-orange-500"
          placeholder="Enter a descriptive title"
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <RichTextEditor
          id="description"
          value={formData.description}
          onChange={handleDescriptionChange}
          placeholder="Provide details about your listing..."
          height="200px"
          disabled={isSubmitting}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Listing Type <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <CustomSelect
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              options={typeOptions}
              disabled={isSubmitting}
            />
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              {getTypeIcon(formData.type as ListingType)}
            </div>
          </div>
        </div>
        
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Price <span className="text-red-500">*</span>
          </label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              name="price"
              id="price"
              value={formData.price}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="pl-10 w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                        bg-white dark:bg-slate-800 text-slate-900 dark:text-white 
                        focus:ring-2 focus:ring-orange-500"
              placeholder="0.00"
            />
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Enter 0 for free items or services.
          </p>
        </div>
        
        {formData.type !== 'service' && (
          <div>
            <label htmlFor="condition" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Condition {formData.type === 'product' && <span className="text-red-500">*</span>}
            </label>
            <CustomSelect
              id="condition"
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              options={conditionOptions}
              disabled={isSubmitting}
            />
          </div>
        )}
        
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Location <span className="text-red-500">*</span>
          </label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              name="location"
              id="location"
              value={formData.location}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="pl-10 w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                        bg-white dark:bg-slate-800 text-slate-900 dark:text-white 
                        focus:ring-2 focus:ring-orange-500"
              placeholder="City, State/Province"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Status <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={statusOptions}
            disabled={isSubmitting}
          />
        </div>
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="featured"
          name="featured"
          checked={formData.featured}
          onChange={(e) => {
            const syntheticEvent = {
              target: {
                name: 'featured',
                value: e.target.checked
              }
            } as unknown as React.ChangeEvent<HTMLInputElement>;
            handleChange(syntheticEvent);
          }}
          disabled={isSubmitting}
          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-slate-300 rounded"
        />
        <label htmlFor="featured" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
          Feature this listing on marketplace homepage
        </label>
      </div>
    </div>
  );
};

export default BasicInfoSection;
