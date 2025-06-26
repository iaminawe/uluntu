import { Building, MapPin, Calendar, Globe, UploadCloud, Link } from 'lucide-react';
import { BasicInfoSectionProps } from './types';

const BasicInfoSection = ({
  formData,
  errors,
  onChange,
  isSubmitting,
  logoFile,
  coverImageFile,
  onLogoFileChange,
  onCoverImageFileChange
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
        <label htmlFor="slug" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          URL Slug <span className="text-red-500">*</span>
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Link className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={onChange}
            disabled={isSubmitting}
            className={`block w-full pl-10 pr-4 py-2 border ${
              errors.slug ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
            } rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500`}
            placeholder="company-url-slug"
          />
        </div>
        {errors.slug && <p className="mt-1 text-sm text-red-500">{errors.slug}</p>}
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          This will be used in the URL: /companies/{formData.slug || 'your-slug'}
        </p>
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

      {/* Status and Featured */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={onChange}
            disabled={isSubmitting}
            className={`w-full px-3 py-2 border ${errors.status ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white`}
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            {/* Add other statuses if needed, e.g., 'archived' */}
          </select>
          {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status}</p>}
        </div>

        <div className="flex items-center mt-2 md:mt-7"> {/* Adjusted margin for alignment */}
          <input
            id="featured"
            name="featured"
            type="checkbox"
            checked={formData.featured}
            onChange={onChange}
            disabled={isSubmitting}
            className="h-5 w-5 text-orange-600 border-slate-300 dark:border-slate-600 rounded focus:ring-orange-500 bg-white dark:bg-slate-800 cursor-pointer"
          />
          <label htmlFor="featured" className="ml-3 block text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
            Feature this company?
          </label>
          {/* Error display for checkbox if needed, though less common */}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="logoFile" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Logo <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 flex items-center space-x-4">
            {(formData.logo || logoFile) && (
              <div className="shrink-0">
                <img 
                  src={logoFile ? URL.createObjectURL(logoFile) : formData.logo} 
                  alt="Logo preview" 
                  className="h-16 w-16 object-cover rounded-full border border-slate-300 dark:border-slate-600 p-0.5"
                />
              </div>
            )}
            <label htmlFor="logoFile" className={`flex-grow block w-full px-3 py-2 border ${errors.logo ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus-within:ring-2 focus-within:ring-orange-500 cursor-pointer hover:border-orange-400`}>
              <div className="flex items-center justify-center">
                <UploadCloud className="h-5 w-5 text-slate-400 mr-2" />
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {logoFile ? logoFile.name : 'Upload logo image'}
                </span>
              </div>
              <input
                type="file"
                id="logoFile"
                name="logoFile"
                accept="image/*"
                onChange={onLogoFileChange}
                disabled={isSubmitting}
                className="sr-only"
              />
            </label>
          </div>
          {errors.logo && <p className="mt-1 text-sm text-red-500">{errors.logo}</p>}
        </div>

        <div>
          <label htmlFor="coverImageFile" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Cover Image
          </label>
          <div className="mt-1 flex items-center space-x-4">
            {(formData.coverImage || coverImageFile) && (
              <div className="shrink-0">
                <img 
                  src={coverImageFile ? URL.createObjectURL(coverImageFile) : formData.coverImage} 
                  alt="Cover image preview" 
                  className="h-20 w-32 object-cover rounded border border-slate-300 dark:border-slate-600 p-0.5"
                />
              </div>
            )}
            <label htmlFor="coverImageFile" className={`flex-grow block w-full px-3 py-2 border ${errors.coverImage ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus-within:ring-2 focus-within:ring-orange-500 cursor-pointer hover:border-orange-400`}>
              <div className="flex items-center justify-center">
                <UploadCloud className="h-5 w-5 text-slate-400 mr-2" />
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {coverImageFile ? coverImageFile.name : 'Upload cover image'}
                </span>
              </div>
              <input
                type="file"
                id="coverImageFile"
                name="coverImageFile"
                accept="image/*"
                onChange={onCoverImageFileChange}
                disabled={isSubmitting}
                className="sr-only"
              />
            </label>
          </div>
          {errors.coverImage && <p className="mt-1 text-sm text-red-500">{errors.coverImage}</p>}
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
          {/* Error display for website if needed */}
        </div>
      </div> {/* Closes the grid for Size, Founded, Location, Website */}
    </div> /* Closes the main wrapping div with className space-y-6 */
  );
};

export default BasicInfoSection;
