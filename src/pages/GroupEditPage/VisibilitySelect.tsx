import { Globe, Lock, EyeOff } from 'lucide-react';
import { VisibilitySelectProps } from './types';
import { FormRadioCardGroup } from '../../components/ui/Form';

const VisibilitySelect: React.FC<VisibilitySelectProps> = ({ formData, handleChange }) => {
  const visibilityOptions = [
    {
      value: 'open',
      label: 'Open',
      icon: <Globe className="h-8 w-8" />,
      description: 'Anyone can see and join',
      iconColor: 'text-green-500',
    },
    {
      value: 'closed',
      label: 'Closed',
      icon: <Lock className="h-8 w-8" />,
      description: 'Visible but requires approval to join',
      iconColor: 'text-amber-500',
    },
    {
      value: 'secret',
      label: 'Secret',
      icon: <EyeOff className="h-8 w-8" />,
      description: 'Only visible to members',
      iconColor: 'text-red-500',
    },
  ];

  return (
    <FormRadioCardGroup
      id="visibility"
      name="visibility"
      label="Group Visibility"
      value={formData.visibility}
      onChange={handleChange}
      options={visibilityOptions}
      columns={{ sm: 1, md: 3 }}
    />
  );
};

export default VisibilitySelect;
