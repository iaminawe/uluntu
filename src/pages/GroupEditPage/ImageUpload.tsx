import { ImageUploadProps } from './types';
import { FormImageUpload } from '../../components/ui/Form/FormImageUpload';

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  formData, 
  handleChange, 
  onHeroImageChange,
  onCoverImageChange,
  errors,
  isSubmitting = false
}) => {
  return (
    <>
      <FormImageUpload
        id="heroImage"
        name="heroImage"
        label="Hero Image"
        currentImage={formData.heroImage}
        onChange={onHeroImageChange}
        disabled={isSubmitting}
        helperText="Main image for the group (displayed in listings)"
        maxSize={5 * 1024 * 1024}
        acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
        error={errors.heroImage}
        required
      />
      
      <FormImageUpload
        id="coverImage"
        name="coverImage"
        label="Cover Image (Optional)"
        currentImage={formData.coverImage}
        onChange={onCoverImageChange}
        disabled={isSubmitting}
        helperText="Banner image for the group detail page (optional)"
        maxSize={5 * 1024 * 1024}
        acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
        error={errors.coverImage}
      />
    </>
  );
};

export default ImageUpload;
