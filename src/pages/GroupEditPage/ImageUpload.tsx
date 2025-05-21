import { ImageUploadProps } from './types';
import { FormInput } from '../../components/ui/Form';

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  formData, 
  handleChange, 
  errors 
}) => {
  return (
    <>
      <FormInput
        id="heroImage"
        name="heroImage"
        label="Hero Image URL *"
        value={formData.heroImage}
        onChange={handleChange}
        error={errors.heroImage}
        placeholder="https://example.com/image.jpg"
        helperText="Main image for the group (displayed in listings)"
        required
      />
      
      <FormInput
        id="coverImage"
        name="coverImage"
        label="Cover Image URL (Optional)"
        value={formData.coverImage || ''}
        onChange={handleChange}
        placeholder="https://example.com/cover.jpg"
        helperText="Banner image for the group detail page (optional)"
      />
    </>
  );
};

export default ImageUpload;
