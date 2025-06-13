import { FormHeaderProps } from './types';
import { FormHeader as SharedFormHeader } from '@/shared/components/ui/Form';

const FormHeader: React.FC<FormHeaderProps> = ({ isEditing }) => {
  return (
    <SharedFormHeader
      title={isEditing ? 'Edit Resource' : 'Add New Resource'}
      backUrl="/resources"
      backText="Back to Resources"
    />
  );
};

export default FormHeader;
