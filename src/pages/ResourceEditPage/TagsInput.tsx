import { TagsInputProps, FormData } from './types';
import { TagsInput as SharedTagsInput } from '../../components/ui/Form';

const TagsInput: React.FC<TagsInputProps> = ({
  formData,
  setFormData
}) => {
  // Create a handler that will update formData with the new tags array
  const handleTagsChange = (newTags: string[]) => {
    setFormData((prev: FormData) => ({
      ...prev,
      tags: newTags,
      // We no longer need newTag field as the shared component manages its own input state
      newTag: ''
    }));
  };

  return (
    <SharedTagsInput
      tags={formData.tags}
      onChange={handleTagsChange}
      label="Tags"
      helperText="Tags help users find your resource"
      placeholder="Add a tag"
    />
  );
};

export default TagsInput;
