import { FormHeader as SharedFormHeader } from '../../components/ui/Form';

export interface FormHeaderProps {
  /**
   * Whether the form is in edit mode
   */
  isEditMode: boolean;
  /**
   * Title of the opportunity when in edit mode
   */
  opportunityTitle?: string;
}

const FormHeader: React.FC<FormHeaderProps> = ({ isEditMode, opportunityTitle }) => {
  return (
    <SharedFormHeader
      title={isEditMode ? `Edit Opportunity: ${opportunityTitle}` : 'Create New Opportunity'}
      backUrl="/opportunities"
      backText="Back to Opportunities"
    />
  );
};

export default FormHeader;
