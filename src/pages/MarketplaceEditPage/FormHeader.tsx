import { FormHeader as SharedFormHeader } from '../../components/ui/Form';
import { FormHeaderProps } from './types';

const FormHeader: React.FC<FormHeaderProps> = ({ isEditing }) => {
  return (
    <SharedFormHeader
      title={isEditing ? 'Edit Marketplace Listing' : 'Create New Listing'}
      backUrl="/marketplace"
      backText="Back to Marketplace"
    />
  );
};

export default FormHeader;
