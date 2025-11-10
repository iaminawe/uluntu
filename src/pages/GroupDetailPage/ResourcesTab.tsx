import { ResourcesTabProps } from './types';
import { Plus, ExternalLink, Trash2 } from 'lucide-react';
import { useIsGroupAdmin } from '@/hooks/useEntityPermissions';
import { useCurrentMember } from '@/hooks/useCurrentMember';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resourcesApi } from '@/features/resources/api/resourcesApi';
import { toast } from 'react-hot-toast';

const ResourcesTab: React.FC<ResourcesTabProps> = ({ resources, isLoading, groupId }) => {
  const { data: isAdmin = false } = useIsGroupAdmin(groupId);
  const { data: currentMember } = useCurrentMember();
  const [removingResource, setRemovingResource] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const deleteResourceMutation = useMutation({
    mutationFn: (resourceId: string) => resourcesApi.delete(resourceId),
    onSuccess: () => {
      toast.success('Resource removed from group');
      queryClient.invalidateQueries({ queryKey: ['group-resources', groupId] });
    },
    onError: (error) => {
      toast.error('Failed to remove resource');
      console.error('Error removing resource:', error);
    }
  });

  const handleRemoveResource = async (resourceId: string) => {
    if (window.confirm('Remove this resource from the group?')) {
      setRemovingResource(resourceId);
      try {
        await deleteResourceMutation.mutateAsync(resourceId);
      } finally {
        setRemovingResource(null);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Group Resources</h2>
        {isAdmin && (
          <Link
            to={`/resources/new?groupId=${groupId}`}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Resource
          </Link>
        )}
      </div>
      
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
                    Added on {new Date(resource.dateAdded).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition-colors flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View
                  </a>
                  {isAdmin && currentMember && resource.contributor.id === currentMember.id && (
                    <button
                      onClick={() => handleRemoveResource(resource.id)}
                      disabled={removingResource === resource.id}
                      className="p-1 text-red-500 hover:text-red-700 disabled:opacity-50"
                      title="Remove this resource from the group"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourcesTab;
