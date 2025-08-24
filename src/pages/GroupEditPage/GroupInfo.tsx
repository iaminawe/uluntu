import { GroupInfoProps } from './types';
import { FormInput, FormTextarea } from '@/shared/components/ui/Form';
import { SlugField } from '@/shared/components/ui/Form/StandardFormComponents';
import { EnhancedContentAIEditor } from '@/components/content/EnhancedContentAIEditor';

const GroupInfo: React.FC<GroupInfoProps> = ({ 
  formData, 
  handleChange, 
  errors 
}) => {
  
  const handleLongDescriptionChange = (content: string) => {
    handleChange({
      target: { name: 'longDescription', value: content }
    } as React.ChangeEvent<HTMLTextAreaElement>);
  };
  return (
    <>
      <FormInput
        id="name"
        name="name"
        label="Group Name *"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        placeholder="Enter group name"
        required
      />
      
      <SlugField
        value={formData.slug}
        onChange={(value) => handleChange({ target: { name: 'slug', value } } as any)}
        sourceValue={formData.name}
        error={errors.slug}
        required
        baseUrl="/groups/"
      />
      
      <FormInput
        id="description"
        name="description"
        label="Short Description *"
        value={formData.description}
        onChange={handleChange}
        error={errors.description}
        placeholder="Brief description (160 characters or less)"
        maxLength={160}
        helperText="This appears in search results and listings"
        required
      />
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Detailed Description
        </label>
        <EnhancedContentAIEditor
          value={formData.longDescription || ''}
          onChange={handleLongDescriptionChange}
          placeholder="Provide a detailed description of your group. You can use AI assistance to generate engaging content that explains the group's purpose, activities, and benefits of joining."
          contentType="groups"
          includeImages={true}
          height="500px"
          className="w-full"
        />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Use the AI assistant to create compelling group descriptions. The AI can help explain your group's purpose, activities, and member benefits.
        </p>
      </div>
    </>
  );
};

export default GroupInfo;
