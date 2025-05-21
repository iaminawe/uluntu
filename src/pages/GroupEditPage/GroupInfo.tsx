import { GroupInfoProps } from './types';
import { FormInput, FormTextarea } from '../../components/ui/Form';

const GroupInfo: React.FC<GroupInfoProps> = ({ 
  formData, 
  handleChange, 
  errors 
}) => {
  return (
    <>
      <FormInput
        id="name"
        name="name"
        label="Group Name *"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        placeholder="Enter group name"
        required
      />
      
      <FormInput
        id="description"
        name="description"
        label="Short Description *"
        value={formData.description}
        onChange={handleChange}
        error={errors.description}
        placeholder="Brief description (160 characters or less)"
        maxLength={160}
        helperText="This appears in search results and listings"
        required
      />
      
      <FormTextarea
        id="longDescription"
        name="longDescription"
        label="Detailed Description"
        value={formData.longDescription || ''}
        onChange={handleChange}
        rows={6}
        placeholder="Provide a detailed description of your group"
      />
    </>
  );
};

export default GroupInfo;
