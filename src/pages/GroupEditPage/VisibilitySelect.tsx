import { Globe, Lock, EyeOff } from 'lucide-react';
import { VisibilitySelectProps } from './types';

const VisibilitySelect: React.FC<VisibilitySelectProps> = ({ formData, handleChange }) => {
  return (
    <div>
      <label htmlFor="visibility" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        Group Visibility
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label
          className={`relative p-4 border rounded-lg cursor-pointer flex flex-col items-center text-center gap-3
                      transition-colors
                      ${formData.visibility === 'open' 
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                        : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
        >
          <input 
            type="radio" 
            name="visibility" 
            value="open" 
            checked={formData.visibility === 'open'} 
            onChange={handleChange}
            className="sr-only"
          />
          <Globe className="h-8 w-8 text-green-500" />
          <div>
            <span className="block text-slate-900 dark:text-white font-medium">Open</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Anyone can see and join
            </span>
          </div>
        </label>
        
        <label
          className={`relative p-4 border rounded-lg cursor-pointer flex flex-col items-center text-center gap-3
                      transition-colors
                      ${formData.visibility === 'closed' 
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                        : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
        >
          <input 
            type="radio" 
            name="visibility" 
            value="closed" 
            checked={formData.visibility === 'closed'} 
            onChange={handleChange}
            className="sr-only"
          />
          <Lock className="h-8 w-8 text-amber-500" />
          <div>
            <span className="block text-slate-900 dark:text-white font-medium">Closed</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Visible but requires approval to join
            </span>
          </div>
        </label>
        
        <label
          className={`relative p-4 border rounded-lg cursor-pointer flex flex-col items-center text-center gap-3
                      transition-colors
                      ${formData.visibility === 'secret' 
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                        : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
        >
          <input 
            type="radio" 
            name="visibility" 
            value="secret" 
            checked={formData.visibility === 'secret'} 
            onChange={handleChange}
            className="sr-only"
          />
          <EyeOff className="h-8 w-8 text-red-500" />
          <div>
            <span className="block text-slate-900 dark:text-white font-medium">Secret</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Only visible to members
            </span>
          </div>
        </label>
      </div>
    </div>
  );
};

export default VisibilitySelect;
