import { UrlInputProps } from './types';

const UrlInput: React.FC<UrlInputProps> = ({ formData, handleChange }) => {
  return (
    <div>
      <label htmlFor="url" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        Resource URL *
      </label>
      <input
        type="url"
        id="url"
        name="url"
        value={formData.url}
        onChange={handleChange}
        required
        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                 bg-white dark:bg-slate-800 text-slate-900 dark:text-white 
                 focus:ring-2 focus:ring-orange-500"
        placeholder="https://example.com/resource"
      />
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Direct link to the resource
      </p>
    </div>
  );
};

export default UrlInput;
