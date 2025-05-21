import { Upload } from 'lucide-react';
import { ImageUploadProps } from './types';

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  formData, 
  handleChange, 
  errors 
}) => {
  return (
    <>
      <div>
        <label htmlFor="heroImage" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Hero Image URL *
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="heroImage"
            name="heroImage"
            value={formData.heroImage}
            onChange={handleChange}
            className={`flex-1 px-4 py-2 border rounded-lg 
                      bg-white dark:bg-slate-800 text-slate-900 dark:text-white 
                      focus:ring-2 focus:ring-orange-500
                      ${errors.heroImage ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
            placeholder="https://example.com/image.jpg"
          />
          <button
            type="button"
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 
                      rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            <Upload className="h-5 w-5" />
          </button>
        </div>
        {errors.heroImage && (
          <p className="mt-1 text-sm text-red-500">{errors.heroImage}</p>
        )}
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Main image for the group (displayed in listings)
        </p>
      </div>
      
      <div>
        <label htmlFor="coverImage" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Cover Image URL (Optional)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="coverImage"
            name="coverImage"
            value={formData.coverImage}
            onChange={handleChange}
            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                      bg-white dark:bg-slate-800 text-slate-900 dark:text-white 
                      focus:ring-2 focus:ring-orange-500"
            placeholder="https://example.com/cover.jpg"
          />
          <button
            type="button"
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 
                      rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            <Upload className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Banner image for the group detail page (optional)
        </p>
      </div>
    </>
  );
};

export default ImageUpload;
