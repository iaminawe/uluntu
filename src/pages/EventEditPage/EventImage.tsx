import { EventImageProps } from './types';
import { FormInput } from '@/shared/components/ui/Form';

const EventImage: React.FC<EventImageProps> = ({ formData, handleChange }) => {
  // For demo purposes, we're using the URL input
  // In a real application, we'd use FormImageUpload and handle file uploads
  // Note: In a real implementation, we would use FormImageUpload component instead
  // of a simple URL input field to handle actual file uploads
  return (
    <FormInput
      id="image"
      name="image"
      label="Featured Image URL"
      value={formData.image}
      onChange={handleChange}
      placeholder="https://example.com/image.jpg"
      helperText="For this demo, please use an external image URL. In a real application, this would be an image upload."
    />
  );
};

export default EventImage;
