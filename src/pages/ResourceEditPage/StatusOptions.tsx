import { Star } from 'lucide-react';
import CustomSelect from '../../components/CustomSelect';
import { StatusOptionsProps } from './types';

const StatusOptions: React.FC<StatusOptionsProps> = ({ 
  formData, 
  handleChange, 
  setFormData 
}) => {
  return (
    <div className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4">
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Status
        </label>
        <CustomSelect
          id="status"
          name="status"
          value={formData.status}
          onChange={(value) => {
            setFormData(prev => ({ ...prev, status: value }));
          }}
          options={[
            { value: 'draft', label: 'Draft' },
            { value: 'published', label: 'Published' },
            { value: 'archived', label: 'Archived' }
          ]}
        />
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Draft resources are only visible to you
        </p>
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="featured"
          name="featured"
          checked={formData.featured}
          onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
          className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-slate-300 rounded"
        />
        <label htmlFor="featured" className="ml-2 flex items-center text-sm text-slate-700 dark:text-slate-300">
          <Star className="h-4 w-4 text-amber-400 mr-1" />
          Feature this resource
        </label>
      </div>
    </div>
  );
};

export default StatusOptions;
