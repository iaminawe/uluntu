import { EventImageProps } from './types';
import { FormImageUpload } from '../../components/ui/Form/FormImageUpload';

const EventImage: React.FC<EventImageProps> = ({ 
  formData, 
  handleChange, 
  onImageChange,
  isSubmitting = false
}) => {
  return (
    <FormImageUpload
      id="image"
      name="image"
      label="Featured Image"
      currentImage={formData.image}
      onChange={onImageChange}
      disabled={isSubmitting}
      helperText="Upload a featured image for this event"
      maxSize={5 * 1024 * 1024}
      acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
    />
  );
};

export default EventImage;
