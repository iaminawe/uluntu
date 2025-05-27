import { useState, useEffect } from 'react';
import { useGroupsWithFilters } from '../../hooks/useQueries';
import { Group, GroupsListProps } from './types';
import GroupCard from './GroupCard';
import JoinModal from '../JoinModal'; // Reusing the existing JoinModal component
import Pagination from '../Pagination'; // Import Pagination
import { useFilteredGroupsRedux } from '../../hooks/useGroupsRedux';
import { GroupFilters } from '../../redux/slices/groupsSlice';

const GROUPS_PER_PAGE = 8;

const GroupsList = ({ searchTerm, visibilityFilter, useRedux = false }: GroupsListProps & { useRedux?: boolean }) => {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Connect to Redux if useRedux is true
  const {
    groups: reduxGroups,
    filters,
    updateFilters,
    isLoading: reduxLoading,
    error: reduxError
  } = useFilteredGroupsRedux();

  // Traditional React Query approach if not using Redux
  const { data: queryFilteredGroups = [], isLoading: queryLoading, error: queryError } = useGroupsWithFilters({
    search: searchTerm,
    visibility: visibilityFilter.length > 0 ? visibilityFilter : undefined
  });
  
  // Choose which data source to use
  const filteredGroups = useRedux ? reduxGroups : queryFilteredGroups;
  const isLoading = useRedux ? reduxLoading : queryLoading;
  const error = useRedux ? reduxError : queryError;

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    
    // Update Redux filters if using Redux
    if (useRedux) {
      const reduxFilters: GroupFilters = {};
      
      if (searchTerm) {
        reduxFilters.search = searchTerm;
      }
      
      if (visibilityFilter.length > 0) {
        reduxFilters.visibility = visibilityFilter;
      }
      
      updateFilters(reduxFilters);
    }
  }, [searchTerm, visibilityFilter, useRedux]);

  // Pagination logic
  const totalGroups = filteredGroups.length;
  const totalPages = Math.ceil(totalGroups / GROUPS_PER_PAGE);
  const startIndex = (currentPage - 1) * GROUPS_PER_PAGE;
  const endIndex = startIndex + GROUPS_PER_PAGE;
  const currentGroupsToDisplay = filteredGroups.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Optional: Scroll to top of list
    // window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <div className="text-center py-12">
          <div className="animate-pulse flex flex-col items-center space-y-4">
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded w-64"></div>
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
              {Array(GROUPS_PER_PAGE).fill(0).map((_, i) => (
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
        {currentGroupsToDisplay.length === 0 && !isLoading ? (
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
            {currentGroupsToDisplay.map(group => (
              <GroupCard 
                key={group.id} 
                group={group} 
                onJoinClick={setSelectedGroup} 
              />
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

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
