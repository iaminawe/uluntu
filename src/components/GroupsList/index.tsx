import { useState } from 'react';
import { Search } from 'lucide-react';
import { useGroupsWithFilters } from '../../hooks/useQueries';
import { Group, GroupVisibility } from './types';
import { getVisibilityIcon } from './utils';
import GroupCard from './GroupCard';
import JoinModal from '../JoinModal'; // Reusing the existing JoinModal component

const GroupsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [visibilityFilter, setVisibilityFilter] = useState<GroupVisibility[]>([]);

  // Use the filter hook with search term and visibility filters
  const { data: groups = [], isLoading, error } = useGroupsWithFilters({
    search: searchTerm,
    visibility: visibilityFilter.length > 0 ? visibilityFilter : undefined
  });

  const toggleVisibilityFilter = (visibility: GroupVisibility) => {
    setVisibilityFilter(prev => {
      if (prev.includes(visibility)) {
        return prev.filter(v => v !== visibility);
      } else {
        return [...prev, visibility];
      }
    });
  };

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-80 px-4 py-2 pl-10 border border-slate-300 dark:border-slate-600 rounded-lg 
                       bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-400 self-center mr-2">Filter by:</span>
            <button
              onClick={() => toggleVisibilityFilter('open')}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-full transition-colors ${
                visibilityFilter.includes('open')
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {getVisibilityIcon('open')}
              <span>Open</span>
            </button>
            
            <button
              onClick={() => toggleVisibilityFilter('closed')}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-full transition-colors ${
                visibilityFilter.includes('closed')
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                  : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {getVisibilityIcon('closed')}
              <span>Closed</span>
            </button>
            
            <button
              onClick={() => toggleVisibilityFilter('secret')}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-full transition-colors ${
                visibilityFilter.includes('secret')
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {getVisibilityIcon('secret')}
              <span>Secret</span>
            </button>
          </div>
        </div>
        
        <div className="text-slate-600 dark:text-slate-300 mb-4">
          Showing {groups.length} {groups.length === 1 ? 'group' : 'groups'}
          {(searchTerm || visibilityFilter.length > 0) && ' matching your filters'}
        </div>
        
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
