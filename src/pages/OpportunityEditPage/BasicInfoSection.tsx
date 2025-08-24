import { MapPin, Calendar, Building, Globe, Mail, DollarSign, Link } from 'lucide-react';
import { EnhancedContentAIEditor } from '@/components/content/EnhancedContentAIEditor';
import CustomSelect from '@/shared/components/ui/CustomSelect';
import { FormImageUpload } from '@/shared/components/ui/Form';
import { FormSectionProps } from './types';
import { useState } from 'react';

const OpportunityTypeOptions = [
  { value: 'job', label: 'Job Posting' },
  { value: 'volunteer', label: 'Volunteer Opportunity' },
  { value: 'funding', label: 'Funding Opportunity' },
  { value: 'community', label: 'Community Project' }
];

const StatusOptions = [
  { value: 'draft', label: 'Save as Draft' },
  { value: 'published', label: 'Publish Now' },
  { value: 'archived', label: 'Archive' }
];

const BasicInfoSection = ({
  formData,
  errors,
  onChange,
  onDescriptionChange,
  onImageChange,
  isSubmitting
}: FormSectionProps) => {
  const [enableImages, setEnableImages] = useState(true);
  return (
    <>
      {/* Basic Information */}
      <div className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={onChange}
            disabled={isSubmitting}
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.title ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
            } rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500
              bg-white dark:bg-slate-800 text-slate-900 dark:text-white`}
            placeholder="e.g., Senior Full Stack Developer"
          />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            URL Slug <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Link className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={onChange}
              disabled={isSubmitting}
              className={`block w-full pl-10 pr-3 py-2 border ${
                errors.slug ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
              } rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500
                bg-white dark:bg-slate-800 text-slate-900 dark:text-white`}
              placeholder="senior-full-stack-developer"
            />
          </div>
          {errors.slug && <p className="mt-1 text-sm text-red-500">{errors.slug}</p>}
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            This will be used in the URL: /opportunities/{formData.slug || 'your-slug'}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Description <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enable-images"
                checked={enableImages}
                onChange={(e) => setEnableImages(e.target.checked)}
                disabled={isSubmitting}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-slate-300 rounded"
              />
              <label htmlFor="enable-images" className="text-sm text-slate-600 dark:text-slate-400">
                Enable AI image insertion
              </label>
            </div>
          </div>
          <EnhancedContentAIEditor
            value={formData.description}
            onChange={onDescriptionChange}
            placeholder="Enter a detailed description of the opportunity..."
            contentType="opportunities"
            includeImages={enableImages}
            disabled={isSubmitting}
            height="500px"
            className={errors.description ? 'border-red-500' : ''}
          />
          {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Use the AI assistant to generate compelling opportunity descriptions, improve writing quality, or get content suggestions specific to job postings and volunteer opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Opportunity Type <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              id="type"
              name="type"
              value={formData.type}
              onChange={onChange}
              options={OpportunityTypeOptions}
              disabled={isSubmitting}
              className={errors.type ? 'border-red-500' : ''}
            />
            {errors.type && <p className="mt-1 text-sm text-red-500">{errors.type}</p>}
          </div>

          <div>
            <label htmlFor="organization" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Organization <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                id="organization"
                name="organization"
                value={formData.organization}
                onChange={onChange}
                disabled={isSubmitting}
                className={`block w-full pl-10 px-3 py-2 border ${
                  errors.organization ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                } rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500
                  bg-white dark:bg-slate-800 text-slate-900 dark:text-white`}
                placeholder="Company or organization name"
              />
            </div>
            {errors.organization && <p className="mt-1 text-sm text-red-500">{errors.organization}</p>}
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Location <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={onChange}
                disabled={isSubmitting}
                className={`block w-full pl-10 px-3 py-2 border ${
                  errors.location ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                } rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500
                  bg-white dark:bg-slate-800 text-slate-900 dark:text-white`}
                placeholder="City, State or Remote"
              />
            </div>
            {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
          </div>

          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Application Deadline
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={onChange}
                disabled={isSubmitting}
                className={`block w-full pl-10 px-3 py-2 border ${
                  errors.deadline ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                } rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500
                  bg-white dark:bg-slate-800 text-slate-900 dark:text-white`}
              />
            </div>
            {errors.deadline && <p className="mt-1 text-sm text-red-500">{errors.deadline}</p>}
          </div>

          <div>
            <label htmlFor="compensation" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Compensation
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                id="compensation"
                name="compensation"
                value={formData.compensation}
                onChange={onChange}
                disabled={isSubmitting}
                className="block w-full pl-10 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="e.g., $50-70k/year or Volunteer"
              />
            </div>
          </div>

          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Contact Email <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={onChange}
                disabled={isSubmitting}
                className={`block w-full pl-10 px-3 py-2 border ${
                  errors.contactEmail ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                } rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500
                  bg-white dark:bg-slate-800 text-slate-900 dark:text-white`}
                placeholder="contact@example.com"
              />
            </div>
            {errors.contactEmail && <p className="mt-1 text-sm text-red-500">{errors.contactEmail}</p>}
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Website
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Globe className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={onChange}
                disabled={isSubmitting}
                className="block w-full pl-10 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <FormImageUpload
              id="opportunity-image"
              name="image"
              label="Featured Image"
              currentImage={formData.image}
              onChange={onImageChange}
              disabled={isSubmitting}
              placeholder="Upload an image for this opportunity"
              helperText="Upload an image that represents the opportunity or organization. JPG, PNG, or WebP formats supported."
              maxSize={5 * 1024 * 1024} // 5MB limit
              acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Status <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              id="status"
              name="status"
              value={formData.status}
              onChange={onChange}
              options={StatusOptions}
              disabled={isSubmitting}
              className={errors.status ? 'border-red-500' : ''}
            />
            {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status}</p>}
          </div>
        </div>
        
        <div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              name="featured"
              checked={formData.featured}
              onChange={(e) => {
                const syntheticEvent = {
                  target: {
                    name: e.target.name,
                    value: e.target.checked
                  }
                } as unknown as React.ChangeEvent<HTMLInputElement>;
                onChange(syntheticEvent);
              }}
              disabled={isSubmitting}
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-slate-300 rounded"
            />
            <label htmlFor="featured" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
              Feature this opportunity on homepage
            </label>
          </div>
        </div>
      </div>
    </>
  );
};

export default BasicInfoSection;
