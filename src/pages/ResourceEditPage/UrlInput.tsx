import { UrlInputProps } from './types';
import { FormInput } from '../../components/ui/Form';

const UrlInput: React.FC<UrlInputProps> = ({ formData, handleChange }) => {
  return (
    <FormInput
      id="url"
      name="url"
      label="Resource URL"
      type="url"
      value={formData.url}
      onChange={handleChange}
      required
      placeholder="https://example.com/resource"
      helperText="Direct link to the resource"
    />
  );
};

export default UrlInput;
