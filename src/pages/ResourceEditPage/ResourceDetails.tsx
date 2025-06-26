import { ResourceDetailsProps } from './types';
import { FormInput, FormTextarea } from '@/shared/components/ui/Form';
import { SlugField } from '@/shared/components/ui/Form/StandardFormComponents';

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
      
      <SlugField
        value={formData.slug}
        onChange={(value) => handleChange({ target: { name: 'slug', value } } as any)}
        sourceValue={formData.title}
        required
        baseUrl="/resources/"
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
