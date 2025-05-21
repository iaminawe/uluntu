import React from 'react';
import { Link } from 'react-router-dom';
import { ResourceCardProps } from './types';
import { FileText, Film, Tool, Book, File } from 'lucide-react';

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  // Function to get appropriate icon based on resource type
  const getResourceIcon = () => {
    switch (resource.type) {
      case 'article':
        return <FileText className="h-5 w-5" />;
      case 'video':
        return <Film className="h-5 w-5" />;
      case 'tool':
        return <Tool className="h-5 w-5" />;
      case 'guide':
        return <Book className="h-5 w-5" />;
      default:
        return <File className="h-5 w-5" />;
    }
  };

  return (
    <Link 
      to={`/resources/${resource.id}`}
      className="flex flex-col h-full bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow rounded-lg overflow-hidden"
    >
      <div className="p-5 flex-grow flex flex-col">
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-500 flex items-center justify-center mr-3">
            {getResourceIcon()}
          </div>
          <span className="text-xs text-orange-600 dark:text-orange-400 uppercase font-semibold">
            {resource.type}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          {resource.title}
        </h3>
        
        <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 flex-grow">
          {resource.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto text-xs text-slate-500 dark:text-slate-400">
          <span>Added by {resource.contributor.name}</span>
          <span>{new Date(resource.dateAdded).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  );
};

export default ResourceCard;
