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
      
      {/* Tags would go here if the Resource type had them */}
      
      <p className="text-slate-700 dark:text-slate-300 mb-8 leading-relaxed">
        {resource.description}
      </p>
      
      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-6">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-1 text-slate-500 dark:text-slate-500" />
          Added {format(new Date(resource.dateAdded), 'MMM d, yyyy')}
        </div>
        
        <div className="flex items-center">
          <User className="h-4 w-4 mr-1 text-slate-500 dark:text-slate-500" />
          By {resource.contributor.name}
        </div>
        
        {resource.groupId && (
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1 text-slate-500 dark:text-slate-500" />
            Group ID: {resource.groupId}
          </div>
        )}
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Submitted By
        </h2>
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6">
          <div className="flex items-center">
            {/* Using a placeholder image since contributor doesn't have an image property */}
            <img 
              src={`https://ui-avatars.com/api/?name=${resource.contributor.name}&background=random`} 
              alt={resource.contributor.name}
              className="h-16 w-16 rounded-full mr-6 object-cover" 
            />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                {resource.contributor.name}
              </h3>
              {/* Contributor ID */}
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                ID: {resource.contributor.id}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceInfo;
