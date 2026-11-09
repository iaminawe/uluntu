import { GroupSelectProps } from './types';
import { FormSelect } from '@/shared/components/ui/Form';

const GroupSelect: React.FC<GroupSelectProps> = ({ formData, handleChange }) => {
  // This would normally be fetched from API or context
  const groups = [
    { id: '1', name: 'AI Enthusiasts Uluntu' },
    { id: '2', name: 'Web Developers Guild' },
    { id: '3', name: 'Data Science Network' },
    { id: '4', name: 'UX/UI Design Group' }
  ];
  
  // Transform groups data to the format expected by FormSelect
  const groupOptions = [
    { value: '', label: 'Select a group (optional)' },
    ...groups.map(group => ({
      value: group.id,
      label: group.name
    }))
  ];

  return (
    <FormSelect
      id="groupId"
      name="groupId"
      label="Associated Group"
      value={formData.groupId}
      onChange={handleChange}
      options={groupOptions}
      helperText="Attach this resource to a group"
    />
  );
};

export default GroupSelect;
