import { FormHeader as SharedFormHeader } from '@/shared/components/ui/Form';
import { FormHeaderProps } from './types';

const FormHeader: React.FC<FormHeaderProps> = ({ isEditMode, title }) => {
  return (
    <SharedFormHeader
      title={isEditMode ? `Edit Event: ${title}` : 'Create New Event'}
      backUrl="/events"
      backText="Back to Events"
    />
  );
};

export default FormHeader;
