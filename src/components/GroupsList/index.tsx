import { useState, useEffect, useMemo } from 'react';
import { useGroupsWithFilters } from '@/hooks/useGroupQueries';
import { Group, GroupsListProps } from '@/features/groups/components/GroupsList/types';
import GroupCard from '@/features/groups/components/GroupsList/GroupCard';
import JoinModal from '@/features/groups/components/JoinModal'; // Reusing the existing JoinModal component
import Pagination from '@/components/Pagination';
import { useGroupsHybrid } from '@/features/groups/hooks/useGroupsHybrid';

const GROUPS_PER_PAGE = 8;

const GroupsList = ({ searchTerm, visibilityFilter, groups: passedGroups }: GroupsListProps) => {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Use hybrid hook for data if no groups are passed
  const { groups: hybridGroups, isLoading, error } = useGroupsHybrid();
  
  // Filter groups based on search and visibility
  const filteredGroups = useMemo(() => {
    const sourceGroups = passedGroups || hybridGroups;
    return sourceGroups.filter((group) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          group.name?.toLowerCase().includes(searchLower) ||
          group.description?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      // Visibility filter
      if (visibilityFilter.length > 0) {
        if (!visibilityFilter.includes(group.visibility)) return false;
      }
      
      return true;
    });
  }, [passedGroups, hybridGroups, searchTerm, visibilityFilter]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, visibilityFilter]);

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
        <div className="text-center py-12" data-testid="groups-loading">
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
          <p>Error loading groups</p>
          {error && typeof error === 'object' && 'message' in error && (
            <p>{(error as unknown).message}</p>
          )}
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
                ? 'No groups match your search criteria'
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
