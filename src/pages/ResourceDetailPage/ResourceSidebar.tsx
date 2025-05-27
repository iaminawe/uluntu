import { ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ResourceSidebarProps } from './types';

const ResourceSidebar: React.FC<ResourceSidebarProps> = ({ resource, getTypeIcon }) => {
  return (
    <div>
      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
          Resource Details
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</h4>
            <p className="text-slate-600 dark:text-slate-400 capitalize flex items-center">
              {getTypeIcon(resource.type)}
              <span className="ml-2">{resource.type}</span>
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Added On</h4>
            <p className="text-slate-600 dark:text-slate-400">
              {format(new Date(resource.dateAdded), 'MMMM d, yyyy')}
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Added By</h4>
            <div className="flex items-center">
              {/* Using a placeholder image since contributor might not have an image */}
              <img 
                src={`https://ui-avatars.com/api/?name=${resource.contributor.name}&background=random`} 
                alt={resource.contributor.name}
                className="w-6 h-6 rounded-full mr-2" 
              />
              <span className="text-slate-600 dark:text-slate-400">
                {resource.contributor.name}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors 
                  font-medium text-center inline-flex items-center justify-center"
      >
        <ExternalLink className="h-5 w-5 mr-2" />
        Access Resource
      </a>
    </div>
  );
};

export default ResourceSidebar;
