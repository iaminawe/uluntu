import { FileText, Video, BookOpen, Wrench, FileText as ArticleIcon } from 'lucide-react';
import { ResourceTypeSelectProps } from './types';
import { FormRadioCardGroup } from '../../components/ui/Form';

const ResourceTypeSelect: React.FC<ResourceTypeSelectProps> = ({ formData, handleChange }) => {
  const resourceTypeOptions = [
    {
      value: 'document',
      label: 'Document',
      icon: <FileText className="h-6 w-6" />,
      iconColor: 'text-blue-500'
    },
    {
      value: 'video',
      label: 'Video',
      icon: <Video className="h-6 w-6" />,
      iconColor: 'text-red-500'
    },
    {
      value: 'guide',
      label: 'Guide',
      icon: <BookOpen className="h-6 w-6" />,
      iconColor: 'text-green-500'
    },
    {
      value: 'tool',
      label: 'Tool',
      icon: <Wrench className="h-6 w-6" />,
      iconColor: 'text-purple-500'
    },
    {
      value: 'article',
      label: 'Article',
      icon: <ArticleIcon className="h-6 w-6" />,
      iconColor: 'text-amber-500'
    }
  ];
  
  return (
    <FormRadioCardGroup
      id="resource-type"
      name="type"
      label="Resource Type"
      value={formData.type}
      onChange={handleChange}
      options={resourceTypeOptions}
      columns={{ sm: 2, md: 5 }}
      compact
    />
  );
};

export default ResourceTypeSelect;
