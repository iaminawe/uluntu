import { Star } from 'lucide-react';
import { FormSelect, FormCheckbox } from '../../components/ui/Form';
import { StatusOptionsProps } from './types';
import { ContentStatus } from '../../data/mock/types';

const StatusOptions: React.FC<StatusOptionsProps> = ({ 
  formData, 
  setFormData 
}) => {
  // Create a custom handler for the status change
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, status: e.target.value as ContentStatus }));
  };
  
  // We're using our custom handlers, so we can remove the handleChange parameter from the props
  
  // Create a custom handler for the featured checkbox
  const handleFeaturedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, featured: e.target.checked }));
  };
  
  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' }
  ] as { value: ContentStatus, label: string }[];
  
  return (
    <div className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4">
      <FormSelect
        id="status"
        name="status"
        label="Status"
        value={formData.status}
        onChange={handleStatusChange}
        options={statusOptions}
        helperText="Draft resources are only visible to you"
      />
      
      <FormCheckbox
        id="featured"
        name="featured"
        label="Feature this resource"
        checked={formData.featured}
        onChange={handleFeaturedChange}
        icon={<Star className="h-4 w-4 text-amber-400" />}
      />
    </div>
  );
};

export default StatusOptions;
