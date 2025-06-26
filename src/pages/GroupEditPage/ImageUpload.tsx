import { ImageUploadProps } from './types';
import { FormImageUpload } from '@/shared/components/ui/Form';

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  formData, 
  handleChange, 
  onHeroImageChange,
  onCoverImageChange,
  errors,
  isSubmitting
}) => {
  return (
    <div className="space-y-6">
      <FormImageUpload
        id="hero-image"
        name="heroImage"
        label="Hero Image *"
        currentImage={formData.heroImage}
        onChange={onHeroImageChange}
        disabled={isSubmitting}
        error={errors.heroImage}
        placeholder="Upload the main group image"
        helperText="This image will be displayed in group listings and as the primary visual. JPG, PNG, or WebP formats supported."
        maxSize={5 * 1024 * 1024} // 5MB limit
        acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
        required
      />
      
      <FormImageUpload
        id="cover-image"
        name="coverImage"
        label="Cover Image (Optional)"
        currentImage={formData.coverImage}
        onChange={onCoverImageChange}
        disabled={isSubmitting}
        placeholder="Upload a banner image for the group"
        helperText="Banner image displayed on the group detail page. This is optional but recommended for better visual appeal."
        maxSize={5 * 1024 * 1024} // 5MB limit
        acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
      />
    </div>
  );
};

export default ImageUpload;
