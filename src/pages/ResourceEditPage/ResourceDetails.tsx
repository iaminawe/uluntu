import { ResourceDetailsProps } from './types';
import { FormInput, FormTextarea } from '@/shared/components/ui/Form';

const ResourceDetails: React.FC<ResourceDetailsProps> = ({ formData, handleChange }) => {
  return (
    <>
      <FormInput
        id="title"
        name="title"
        label="Resource Title"
        value={formData.title}
        onChange={handleChange}
        required
        placeholder="Enter resource title"
      />
      
      <FormTextarea
        id="description"
        name="description"
        label="Description"
        value={formData.description}
        onChange={handleChange}
        required
        rows={4}
        placeholder="Describe this resource"
      />
    </>
  );
};

export default ResourceDetails;
