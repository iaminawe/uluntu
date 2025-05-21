import { Upload } from 'lucide-react';
import { EventImageProps } from './types';

const EventImage: React.FC<EventImageProps> = ({ formData, handleChange }) => {
  return (
    <div>
      <label htmlFor="image" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        Featured Image URL
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          id="image"
          name="image"
          value={formData.image}
          onChange={handleChange}
          className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                    bg-white dark:bg-slate-800 text-slate-900 dark:text-white 
                    focus:ring-2 focus:ring-orange-500"
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
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        For this demo, please use an external image URL. In a real application, this would be an image upload.
      </p>
    </div>
  );
};

export default EventImage;
