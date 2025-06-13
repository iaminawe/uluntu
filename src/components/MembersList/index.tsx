import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

import MemberCard from '@/features/directory/components/MembersList/MemberCard';
import { Member, MembersListProps, FilterOptions } from '@/features/directory/components/MembersList/types';
import { filterMembers, sortMembersByName } from '@/features/directory/components/MembersList/utils';
import { useFilteredMembersRedux } from '../../hooks/useMembersRedux';

const MembersList = ({ 
  initialSearch = '', 
  initialSkills,
  companyId, 
  members: parentMembers = [],
  loading: parentLoading,
  error: parentError
}: MembersListProps) => {
  // State for search and filters
  const [filters, setFilters] = useState<FilterOptions>({
    search: initialSearch,
    skills: initialSkills
  });
  
  // Use Redux for filtered members if no parent members are provided
  const { 
    members: reduxMembers = [], 
    applyFilters,
    clearAllFilters
  } = useFilteredMembersRedux();
  
  // Determine if we should use parent props or Redux state
  const useParentData = parentMembers.length > 0 || parentLoading !== undefined;
  
  // State logic handled through useParentData and individual selectors
  
  // Filtered members based on current filters (for parent members mode)
  const [localFilteredMembers, setLocalFilteredMembers] = useState<Member[]>([]);
  
  // Apply Redux filters when they change
  useEffect(() => {
    if (!useParentData) {
      applyFilters({
        search: filters.search,
        skills: filters.skills
      });
    }
  }, [filters, applyFilters, useParentData]);
  
  // Apply local filters when parent members or filters change
  useEffect(() => {
    if (useParentData && parentMembers.length) {
      // Apply filters and sort by name
      const filtered = filterMembers(parentMembers, filters, companyId);
      const sorted = sortMembersByName(filtered);
      
      setLocalFilteredMembers(sorted);
    }
  }, [parentMembers, filters, companyId, useParentData]);
  
  // Determine which filtered members to use
  const filteredMembers = useParentData ? localFilteredMembers : reduxMembers;
  
  // Reset all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      skills: undefined
    });
    
    // If using Redux, also clear filters there
    if (!useParentData) {
      clearAllFilters();
    }
  };
  
  // Render loading state
  if (parentLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="animate-pulse bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-slate-200 dark:bg-slate-700 h-12 w-12"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mt-2"></div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                <div className="flex gap-2 mt-3">
                  <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                  <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Render error state
  if (parentError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 
                    rounded-lg p-6 text-center">
        <AlertTriangle className="h-10 w-10 text-red-500 dark:text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">Error Loading Members</h3>
        <p className="text-red-600 dark:text-red-400">{parentError.message || 'Failed to load members. Please try again later.'}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">      
      {/* Results */}
      {filteredMembers.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            No members found matching your criteria.
          </p>
          <button 
            onClick={clearFilters}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map(member => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      )}
      
      {/* Results summary */}
      {filteredMembers.length > 0 && (
        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
          Showing {filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'}
          {(filters.search || filters.skills?.length) ? ' matching your filters' : ''}
        </div>
      )}
    </div>
  );
};

export default MembersList;
