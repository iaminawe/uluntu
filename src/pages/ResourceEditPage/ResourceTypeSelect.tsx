import { FileText, Video, Image, Link as LinkIcon, Presentation } from 'lucide-react';
import { ResourceTypeSelectProps } from './types';

const ResourceTypeSelect: React.FC<ResourceTypeSelectProps> = ({ formData, handleChange }) => {
  return (
    <div>
      <label htmlFor="type" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        Resource Type
      </label>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <label
          className={`relative p-4 border rounded-md cursor-pointer flex flex-col items-center text-center gap-2
                      transition-colors
                      ${formData.type === 'document' 
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                        : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
        >
          <input 
            type="radio" 
            name="type" 
            value="document" 
            checked={formData.type === 'document'} 
            onChange={handleChange}
            className="sr-only"
          />
          <FileText className="h-6 w-6 text-blue-500" />
          <span className="text-sm">Document</span>
        </label>
        
        <label
          className={`relative p-4 border rounded-md cursor-pointer flex flex-col items-center text-center gap-2
                      transition-colors
                      ${formData.type === 'video' 
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                        : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
        >
          <input 
            type="radio" 
            name="type" 
            value="video" 
            checked={formData.type === 'video'} 
            onChange={handleChange}
            className="sr-only"
          />
          <Video className="h-6 w-6 text-red-500" />
          <span className="text-sm">Video</span>
        </label>
        
        <label
          className={`relative p-4 border rounded-md cursor-pointer flex flex-col items-center text-center gap-2
                      transition-colors
                      ${formData.type === 'image' 
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                        : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
        >
          <input 
            type="radio" 
            name="type" 
            value="image" 
            checked={formData.type === 'image'} 
            onChange={handleChange}
            className="sr-only"
          />
          <Image className="h-6 w-6 text-green-500" />
          <span className="text-sm">Image</span>
        </label>
        
        <label
          className={`relative p-4 border rounded-md cursor-pointer flex flex-col items-center text-center gap-2
                      transition-colors
                      ${formData.type === 'link' 
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                        : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
        >
          <input 
            type="radio" 
            name="type" 
            value="link" 
            checked={formData.type === 'link'} 
            onChange={handleChange}
            className="sr-only"
          />
          <LinkIcon className="h-6 w-6 text-purple-500" />
          <span className="text-sm">Link</span>
        </label>
        
        <label
          className={`relative p-4 border rounded-md cursor-pointer flex flex-col items-center text-center gap-2
                      transition-colors
                      ${formData.type === 'presentation' 
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                        : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
        >
          <input 
            type="radio" 
            name="type" 
            value="presentation" 
            checked={formData.type === 'presentation'} 
            onChange={handleChange}
            className="sr-only"
          />
          <Presentation className="h-6 w-6 text-amber-500" />
          <span className="text-sm">Presentation</span>
        </label>
      </div>
    </div>
  );
};

export default ResourceTypeSelect;
