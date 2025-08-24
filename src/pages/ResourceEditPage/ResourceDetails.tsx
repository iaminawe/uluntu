import { ResourceDetailsProps } from './types';
import { FormInput } from '@/shared/components/ui/Form';
import { SlugField } from '@/shared/components/ui/Form/StandardFormComponents';
import { EnhancedContentAIEditor } from '@/components/content/EnhancedContentAIEditor';
import { useState } from 'react';

const ResourceDetails: React.FC<ResourceDetailsProps> = ({ formData, handleChange }) => {
  const [enableImageInsertion, setEnableImageInsertion] = useState(true);

  const handleDescriptionChange = (content: string) => {
    handleChange({ target: { name: 'description', value: content } } as any);
  };

  return (
    <>
      <FormInput
        id="title"
        name="title"
        label="Resource Title"
        value={formData.title}
        onChange={handleChange}
        required
        placeholder="Enter resource title"
      />
      
      <SlugField
        value={formData.slug}
        onChange={(value) => handleChange({ target: { name: 'slug', value } } as any)}
        sourceValue={formData.title}
        required
        baseUrl="/resources/"
      />
      
      {/* AI-Enhanced Description Editor */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description *
          </label>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enable-images"
              checked={enableImageInsertion}
              onChange={(e) => setEnableImageInsertion(e.target.checked)}
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
            />
            <label htmlFor="enable-images" className="text-sm text-gray-600 dark:text-gray-400">
              Enable image insertion
            </label>
          </div>
        </div>
        
        <EnhancedContentAIEditor
          value={formData.description}
          onChange={handleDescriptionChange}
          placeholder="Describe this resource. Use AI assistance to create comprehensive, engaging content..."
          contentType="resources"
          includeImages={enableImageInsertion}
          height="500px"
          className="w-full"
        />
        
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Use the AI assistant to generate comprehensive resource descriptions, guides, and tutorials. 
          Select text to get contextual AI suggestions.
        </p>
      </div>
    </>
  );
};

export default ResourceDetails;
