import { ResourcesTabProps } from './types';

const ResourcesTab: React.FC<ResourcesTabProps> = ({ resources, isLoading }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Group Resources</h2>
      
      {isLoading ? (
        <div className="animate-pulse space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-slate-200 dark:bg-slate-700 h-24 rounded-lg"></div>
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 text-center">
          <p className="text-slate-600 dark:text-slate-400">No resources have been shared in this group yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {resources.map(resource => (
            <div 
              key={resource.id}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                    {resource.title}
                  </h3>
                  <span className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded-full mb-2">
                    {resource.type}
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 mb-2">
                    {resource.description}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    Added on {new Date(resource.addedDate).toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition-colors"
                >
                  View
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourcesTab;
