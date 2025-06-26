import { EventImageProps } from './types';
import { FormImageUpload } from '@/shared/components/ui/Form';

const EventImage: React.FC<EventImageProps> = ({ 
  formData, 
  handleChange, 
  onImageChange, 
  isSubmitting 
}) => {
  return (
    <FormImageUpload
      id="event-image"
      name="image"
      label="Featured Image"
      currentImage={formData.image}
      onChange={onImageChange}
      disabled={isSubmitting}
      placeholder="Upload a high-quality event image"
      helperText="Upload an engaging image that represents your event. JPG, PNG, or WebP formats supported."
      maxSize={5 * 1024 * 1024} // 5MB limit
      acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
    />
  );
};

export default EventImage;
