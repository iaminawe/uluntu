import { TagsInput } from '../../components/ui/Form';
import { TagsSectionProps } from './types';

const TagsSection = ({
  tags,
  handleTagsChange,
  isSubmitting
}: TagsSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-slate-800 dark:text-white">
        Tags
      </h3>
      
      <TagsInput
        tags={tags}
        onChange={handleTagsChange}
        disabled={isSubmitting}
        placeholder="Add tags (e.g., laptop, furniture, design)"
        helperText="Add tags to help buyers find your listing."
      />
    </div>
  );
};

export default TagsSection;
