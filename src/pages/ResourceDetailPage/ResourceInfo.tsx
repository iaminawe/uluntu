import { Calendar, User, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ResourceInfoProps } from './types';

const ResourceInfo: React.FC<ResourceInfoProps> = ({ resource, getTypeIcon }) => {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg">
          {getTypeIcon(resource.type)}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          {resource.title}
        </h1>
      </div>
      
      {resource.tags && resource.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {resource.tags.map(tag => (
            <span 
              key={tag}
              className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-700 
                        text-slate-700 dark:text-slate-300 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      
      <p className="text-slate-700 dark:text-slate-300 mb-8 leading-relaxed">
        {resource.description}
      </p>
      
      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-6">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-1 text-slate-500 dark:text-slate-500" />
          Added {format(new Date(resource.createdAt), 'MMM d, yyyy')}
        </div>
        
        <div className="flex items-center">
          <User className="h-4 w-4 mr-1 text-slate-500 dark:text-slate-500" />
          By {resource.createdBy.name}
        </div>
        
        {resource.group && (
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1 text-slate-500 dark:text-slate-500" />
            In {resource.group.name}
          </div>
        )}
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Submitted By
        </h2>
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6">
          <div className="flex items-center">
            <img 
              src={resource.createdBy.image} 
              alt={resource.createdBy.name}
              className="h-16 w-16 rounded-full mr-6 object-cover" 
            />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                {resource.createdBy.name}
              </h3>
              {resource.createdBy.title && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  {resource.createdBy.title}
                </p>
              )}
              <p className="text-slate-700 dark:text-slate-300">
                {resource.createdBy.bio}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceInfo;
