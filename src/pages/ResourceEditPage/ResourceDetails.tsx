import { ResourceDetailsProps } from './types';

const ResourceDetails: React.FC<ResourceDetailsProps> = ({ formData, handleChange }) => {
  return (
    <>
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Resource Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                   bg-white dark:bg-slate-800 text-slate-900 dark:text-white 
                   focus:ring-2 focus:ring-orange-500"
          placeholder="Enter resource title"
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                   bg-white dark:bg-slate-800 text-slate-900 dark:text-white 
                   focus:ring-2 focus:ring-orange-500"
          placeholder="Describe this resource"
        ></textarea>
      </div>
    </>
  );
};

export default ResourceDetails;
