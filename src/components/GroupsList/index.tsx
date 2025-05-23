import { useState } from 'react';
import { useGroupsWithFilters } from '../../hooks/useQueries';
import { Group, GroupsListProps } from './types';
import GroupCard from './GroupCard';
import JoinModal from '../JoinModal'; // Reusing the existing JoinModal component

const GroupsList = ({ searchTerm, visibilityFilter }: GroupsListProps) => {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // Use the filter hook with search term and visibility filters
  const { data: groups = [], isLoading, error } = useGroupsWithFilters({
    search: searchTerm,
    visibility: visibilityFilter.length > 0 ? visibilityFilter : undefined
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <div className="text-center py-12">
          <div className="animate-pulse flex flex-col items-center space-y-4">
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded w-64"></div>
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-slate-200 dark:bg-slate-700 h-48 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <div className="text-center py-12 text-red-500">
          <p>Error loading groups. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8">
        
        {/* Group list content */}
        
        {groups.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-8 text-center shadow-md">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No groups found</h3>
            <p className="text-slate-600 dark:text-slate-300">
              {searchTerm || visibilityFilter.length > 0 
                ? 'Try adjusting your search or filters'
                : 'There are no groups to display yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {groups.map(group => (
              <GroupCard 
                key={group.id} 
                group={group} 
                onJoinClick={setSelectedGroup} 
              />
            ))}
          </div>
        )}
      </div>

      {selectedGroup && (
        <JoinModal
          group={selectedGroup}
          onClose={() => setSelectedGroup(null)}
        />
      )}
    </div>
  );
};

export default GroupsList;
