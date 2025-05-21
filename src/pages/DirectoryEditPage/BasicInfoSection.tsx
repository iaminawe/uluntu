import { User, Briefcase, MapPin, Calendar } from 'lucide-react';
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
          Full Name <span className="text-red-500">*</span>
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <User className="h-5 w-5 text-slate-400" />
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
            placeholder="Jane Smith"
          />
        </div>
        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            } rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500`}
            placeholder="Full Stack Developer"
          />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="company" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Company
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Briefcase className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={onChange}
              disabled={isSubmitting}
              className="block w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              placeholder="Acme Inc."
            />
          </div>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Location
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
              className="block w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              placeholder="Nelson, BC"
            />
          </div>
        </div>

        <div>
          <label htmlFor="joinDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Join Date <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Calendar className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="date"
              id="joinDate"
              name="joinDate"
              value={formData.joinDate}
              onChange={onChange}
              disabled={isSubmitting}
              className={`block w-full pl-10 pr-4 py-2 border ${
                errors.joinDate ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
              } rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500`}
            />
          </div>
          {errors.joinDate && <p className="mt-1 text-sm text-red-500">{errors.joinDate}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="image" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Profile Image URL <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          id="image"
          name="image"
          value={formData.image}
          onChange={onChange}
          disabled={isSubmitting}
          className={`mt-1 block w-full px-3 py-2 border ${
            errors.image ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
          } rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500`}
          placeholder="https://example.com/image.jpg"
        />
        {errors.image && <p className="mt-1 text-sm text-red-500">{errors.image}</p>}
        {formData.image && (
          <div className="mt-2 p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
            <img 
              src={formData.image} 
              alt="Profile preview" 
              className="h-24 w-24 rounded-full object-cover mx-auto"
            />
          </div>
        )}
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Bio <span className="text-red-500">*</span>
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={onChange}
          rows={5}
          disabled={isSubmitting}
          className={`mt-1 block w-full px-3 py-2 border ${
            errors.bio ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
          } rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500`}
          placeholder="Tell us about yourself..."
        />
        {errors.bio && <p className="mt-1 text-sm text-red-500">{errors.bio}</p>}
      </div>
    </div>
  );
};

export default BasicInfoSection;
