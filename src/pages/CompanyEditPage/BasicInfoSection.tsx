import { Building, MapPin, Calendar, Globe } from 'lucide-react';
import { BasicInfoSectionProps } from './types';

const BasicInfoSection = ({
  formData,
  errors,
  onChange,
  isSubmitting
}: BasicInfoSectionProps) => {
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Company Name <span className="text-red-500">*</span>
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Building className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={onChange}
            disabled={isSubmitting}
            className={`block w-full pl-10 pr-4 py-2 border ${
              errors.name ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
            } rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500`}
            placeholder="Company Name"
          />
        </div>
        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={onChange}
          rows={5}
          disabled={isSubmitting}
          className={`mt-1 block w-full px-3 py-2 border ${
            errors.description ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
          } rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500`}
          placeholder="Brief description of the company"
        />
        {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="logo" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Logo URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            id="logo"
            name="logo"
            value={formData.logo}
            onChange={onChange}
            disabled={isSubmitting}
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.logo ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
            } rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500`}
            placeholder="https://example.com/logo.png"
          />
          {errors.logo && <p className="mt-1 text-sm text-red-500">{errors.logo}</p>}
          {formData.logo && (
            <div className="mt-2 p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
              <img 
                src={formData.logo} 
                alt="Logo preview" 
                className="h-12 w-auto object-contain mx-auto"
              />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="coverImage" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Cover Image URL
          </label>
          <input
            type="url"
            id="coverImage"
            name="coverImage"
            value={formData.coverImage}
            onChange={onChange}
            disabled={isSubmitting}
            className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500"
            placeholder="https://example.com/cover.jpg"
          />
          {formData.coverImage && (
            <div className="mt-2 p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
              <img 
                src={formData.coverImage} 
                alt="Cover image preview" 
                className="h-24 w-full object-cover rounded"
              />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="size" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Company Size <span className="text-red-500">*</span>
          </label>
          <select
            id="size"
            name="size"
            value={formData.size}
            onChange={onChange}
            disabled={isSubmitting}
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.size ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
            } rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500`}
          >
            <option value="">Select size</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-1000">201-1000 employees</option>
            <option value="1001+">1001+ employees</option>
          </select>
          {errors.size && <p className="mt-1 text-sm text-red-500">{errors.size}</p>}
        </div>

        <div>
          <label htmlFor="founded" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Founded Year <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Calendar className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              id="founded"
              name="founded"
              value={formData.founded}
              onChange={onChange}
              disabled={isSubmitting}
              className={`block w-full pl-10 pr-4 py-2 border ${
                errors.founded ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
              } rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500`}
              placeholder="2023"
            />
          </div>
          {errors.founded && <p className="mt-1 text-sm text-red-500">{errors.founded}</p>}
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Location <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MapPin className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={onChange}
              disabled={isSubmitting}
              className={`block w-full pl-10 pr-4 py-2 border ${
                errors.location ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
              } rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500`}
              placeholder="City, Country"
            />
          </div>
          {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Website URL
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Globe className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={onChange}
              disabled={isSubmitting}
              className="block w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              placeholder="https://example.com"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoSection;
