import SharedTagsInput from '../../components/ui/Form/TagsInput';
import { TagsInputProps } from './types';

const TagsInput: React.FC<TagsInputProps> = ({ 
  tags, 
  setNewTag, 
  handleAddTag,
  handleRemoveTag,
  errors
}) => {
  // Create a wrapper around our shared component with a custom onChange handler
  // that integrates with the parent component's tag management
  const handleChange = (newTags: string[]) => {
    // Our existing components expect separate handlers for adding and removing tags
    // rather than a single onChange handler, so we need to determine what action
    // was performed by comparing the old and new tag arrays
    
    if (newTags.length > tags.length) {
      // A tag was added - find which one
      const addedTag = newTags.find(tag => !tags.includes(tag));
      if (addedTag) {
        // Set the new tag value to empty and call handleAddTag
        setNewTag('');
        handleAddTag();
      }
    } else if (newTags.length < tags.length) {
      // A tag was removed - find which one
      const removedTag = tags.find(tag => !newTags.includes(tag));
      if (removedTag) {
        handleRemoveTag(removedTag);
      }
    }
  };
  
  // We don't actually need to track input state here as the shared component handles that internally
  
  return (
    <SharedTagsInput
      label="Tags"
      tags={tags}
      onChange={handleChange}
      helperText={errors.tags ? (Array.isArray(errors.tags) ? errors.tags[0] : errors.tags) : "Press Enter or comma to add a tag"}
      placeholder="Add a tag..."
      className="mb-6"
    />
  );
};

export default TagsInput;
