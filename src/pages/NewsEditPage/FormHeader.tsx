import { FormHeader as SharedFormHeader } from '../../components/ui/Form';
import { FormHeaderProps } from './types';

const FormHeader: React.FC<FormHeaderProps> = ({ isEditMode, title }) => {
  return (
    <SharedFormHeader
      title={isEditMode ? `Edit Article: ${title}` : 'Create New Article'}
      backUrl="/news"
      backText="Back to News"
    />
  );
};

export default FormHeader;
