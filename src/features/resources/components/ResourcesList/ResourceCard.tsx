import { Link } from 'react-router-dom';
import { Resource } from '../../types';
import { getTypeIcon } from './utils';

interface ResourceCardProps {
  resource: Resource;
}

const ResourceCard = ({ resource }: ResourceCardProps) => {
  return (
    <Link 
      to={`/resources/${resource.id}`}
      className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden block hover:shadow-lg transition-shadow"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg mr-4">
              {getTypeIcon(resource.type)}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                {resource.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-300">{resource.description}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center mb-4">
          <span className="text-sm text-slate-600 dark:text-slate-300">
            {resource.contributor?.name || 'Unknown'} - {
              resource.dateAdded ? 
                new Date(resource.dateAdded).toLocaleDateString() : 
                'Unknown date'
            }
          </span>
        </div>

        <div className="inline-flex items-center text-orange-500 hover:text-orange-600 font-medium">
          View Details
          <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </Link>
  );
};

export default ResourceCard;
