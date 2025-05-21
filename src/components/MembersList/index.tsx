import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

import MemberCard from './MemberCard';
import MembersFilter from './MembersFilter';
import { Member, MembersListProps, FilterOptions, SAMPLE_MEMBERS } from './types';
import { filterMembers, sortMembersByName } from './utils';

const MembersList = ({ initialSearch = '', companyId }: MembersListProps) => {
  // State for search and filters
  const [filters, setFilters] = useState<FilterOptions>({
    search: initialSearch,
    skills: undefined
  });
  
  // State for debounced search input
  const [debouncedFilters, setDebouncedFilters] = useState<FilterOptions>(filters);
  
  // State for members data
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtered members based on current filters
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  
  // Debounce filter changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 300);
    
    return () => {
      clearTimeout(handler);
    };
  }, [filters]);
  
  // Fetch members data (simulated)
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // In a real app, this would be an API call
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Set members from sample data
        setMembers(SAMPLE_MEMBERS);
        setLoading(false);
      } catch (err) {
        setError('Failed to load members. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchMembers();
  }, []);
  
  // Apply filters when members or debounced filters change
  useEffect(() => {
    if (!members.length) return;
    
    // Apply filters and sort by name
    const filtered = filterMembers(members, debouncedFilters, companyId);
    const sorted = sortMembersByName(filtered);
    
    setFilteredMembers(sorted);
  }, [members, debouncedFilters, companyId]);
  
  // Reset all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      skills: undefined
    });
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="space-y-8">
        <MembersFilter 
          filters={filters} 
          setFilters={setFilters} 
          clearFilters={clearFilters} 
        />
        
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
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 
                    rounded-lg p-6 text-center">
        <AlertTriangle className="h-10 w-10 text-red-500 dark:text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">Error Loading Members</h3>
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Filter component */}
      <MembersFilter 
        filters={filters} 
        setFilters={setFilters} 
        clearFilters={clearFilters} 
      />
      
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
          {(debouncedFilters.search || debouncedFilters.skills?.length) ? ' matching your filters' : ''}
        </div>
      )}
    </div>
  );
};

export default MembersList;
