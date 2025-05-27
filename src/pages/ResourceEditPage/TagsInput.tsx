import { TagsInputProps, FormData } from './types';
import { TagsInput as SharedTagsInput } from '../../components/ui/Form';

const TagsInput: React.FC<TagsInputProps> = ({
  formData,
  setFormData,
  handleAddTag,
  handleRemoveTag
}) => {
  // Create a handler that will update formData with the new tags array
  const handleTagsChange = (newTags: string[]) => {
    if (setFormData) {
      setFormData((prev: FormData) => ({
        ...prev,
        tags: newTags,
        // We no longer need newTag field as the shared component manages its own input state
        newTag: ''
      }));
    }
  };

  // Use the handleAddTag and handleRemoveTag props if provided
  // Otherwise, use the default behavior of the SharedTagsInput component
  const handleChange = (newTags: string[]) => {
    // Call the handleTagsChange function to update the formData
    handleTagsChange(newTags);
    
    // If we're adding a tag and handleAddTag is provided, call it
    if (newTags.length > formData.tags.length && handleAddTag) {
      handleAddTag();
    }
    
    // If we're removing a tag and handleRemoveTag is provided, call it
    if (newTags.length < formData.tags.length && handleRemoveTag) {
      const removedTag = formData.tags.find(tag => !newTags.includes(tag));
      if (removedTag) {
        handleRemoveTag(removedTag);
      }
    }
  };
  
  return (
    <SharedTagsInput
      tags={formData.tags}
      onChange={handleChange}
      label="Tags"
      helperText="Tags help users find your resource"
      placeholder="Add a tag"
    />
  );
};

export default TagsInput;
