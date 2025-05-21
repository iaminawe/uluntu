import { GroupInfoProps } from './types';

const GroupInfo: React.FC<GroupInfoProps> = ({ 
  formData, 
  handleChange, 
  errors 
}) => {
  return (
    <>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Group Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg 
                    bg-white dark:bg-slate-800 text-slate-900 dark:text-white 
                    focus:ring-2 focus:ring-orange-500
                    ${errors.name ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
          placeholder="Enter group name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Short Description *
        </label>
        <input
          type="text"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg 
                    bg-white dark:bg-slate-800 text-slate-900 dark:text-white 
                    focus:ring-2 focus:ring-orange-500
                    ${errors.description ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
          placeholder="Brief description (160 characters or less)"
          maxLength={160}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description}</p>
        )}
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          This appears in search results and listings
        </p>
      </div>
      
      <div>
        <label htmlFor="longDescription" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Detailed Description
        </label>
        <textarea
          id="longDescription"
          name="longDescription"
          value={formData.longDescription}
          onChange={handleChange}
          rows={6}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                    bg-white dark:bg-slate-800 text-slate-900 dark:text-white 
                    focus:ring-2 focus:ring-orange-500"
          placeholder="Provide a detailed description of your group"
        ></textarea>
      </div>
    </>
  );
};

export default GroupInfo;
