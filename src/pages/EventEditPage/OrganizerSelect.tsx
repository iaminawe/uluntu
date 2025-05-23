import { OrganizerSelectProps } from './types';
import { FormSelect } from '../../components/ui/Form';

const OrganizerSelect: React.FC<OrganizerSelectProps> = ({ organizer, onOrganizerChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value);
    onOrganizerChange({ 
      id,
      name: getOrganizerName(id),
      image: ''
    });
  };

  const getOrganizerName = (id: number): string => {
    const organizers = [
      { id: 1, name: 'Sarah Johnson' },
      { id: 2, name: 'Michael Chen' },
      { id: 3, name: 'Emma Wilson' }
    ];
    return organizers.find(o => o.id === id)?.name || '';
  };
  
  return (
    <FormSelect
      id="organizerId"
      name="organizerId"
      label="Organizer"
      value={organizer.id.toString()}
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
