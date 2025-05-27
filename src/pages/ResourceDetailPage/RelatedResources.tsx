import { Link } from 'react-router-dom';
import { Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { Resource } from '../../types';

interface RelatedResourcesProps {
  relatedResources: Resource[];
  getTypeIcon: (type: Resource['type']) => JSX.Element;
}

const RelatedResources: React.FC<RelatedResourcesProps> = ({ 
  relatedResources, 
  getTypeIcon 
}) => {
  if (!relatedResources || relatedResources.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
        Related Resources
      </h2>
      <div className="space-y-4">
        {relatedResources.map(relatedResource => (
          <Link 
            key={relatedResource.id}
            to={`/resources/${relatedResource.id}`}
            className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 
                      flex items-start gap-4
                      hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg">
              {getTypeIcon(relatedResource.type)}
            </div>
            <div>
              <h3 className="font-medium text-slate-900 dark:text-white mb-1">
                {relatedResource.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                {relatedResource.description}
              </p>
              <div className="flex items-center text-xs text-slate-500 dark:text-slate-500">
                <Calendar className="h-3 w-3 mr-1" />
                {format(new Date(relatedResource.dateAdded), 'MMM d, yyyy')}
                <span className="mx-2">•</span>
                <User className="h-3 w-3 mr-1" />
                {relatedResource.contributor.name}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedResources;
