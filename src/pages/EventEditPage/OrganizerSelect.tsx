import { OrganizerSelectProps } from './types';
import { FormSelect } from '../../components/ui/Form';

const OrganizerSelect: React.FC<OrganizerSelectProps> = ({ formData, handleChange }) => {
  return (
    <FormSelect
      id="organizerId"
      name="organizerId"
      label="Organizer"
      value={formData.organizerId.toString()}
      onChange={handleChange}
      options={[
        { value: '1', label: 'Sarah Johnson' },
        { value: '2', label: 'Michael Chen' },
        { value: '3', label: 'Emma Wilson' }
      ]}
    />
  );
};

export default OrganizerSelect;
