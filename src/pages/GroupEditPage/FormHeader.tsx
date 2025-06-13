import { FormHeader as SharedFormHeader } from '@/shared/components/ui/Form';
import { FormHeaderProps } from './types';

const FormHeader: React.FC<FormHeaderProps> = ({ isEditMode, groupName }) => {
  return (
    <SharedFormHeader
      title={isEditMode ? `Edit Group: ${groupName}` : 'Create New Group'}
      backUrl="/groups"
      backText="Back to Groups"
    />
  );
};

export default FormHeader;
