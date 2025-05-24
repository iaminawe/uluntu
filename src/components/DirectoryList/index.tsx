import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

import MemberCard from './MemberCard';
import DirectoryFilters from './DirectoryFilters';
import { DirectoryListProps, FilterOptions } from './types';
import { extractUniqueSkills } from './utils';
import { useMembersWithFilters } from '../../hooks/useSupabaseQueries';

const DirectoryList = ({ 
  initialSearch = '',
  initialSkill = '' 
}: DirectoryListProps) => {
  // Initialize filters
  const [filters, setFilters] = useState<FilterOptions>({
    search: initialSearch,
    skills: initialSkill ? [initialSkill] : []
  });

  const { data: displayedMembers = [], isLoading, error, refetch } = useMembersWithFilters({
    search: filters.search,
    skills: filters.skills.length > 0 ? filters.skills : undefined
  });
  
  // Extract all unique skills
  const allSkills = extractUniqueSkills(displayedMembers || []);


  // Loading state
  if (isLoading) {
    return (
      <div>
        <DirectoryFilters 
          filters={filters} 
          setFilters={setFilters} 
          availableSkills={[]}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="h-48 bg-slate-200 dark:bg-slate-700"></div>
              <div className="p-6">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4"></div>
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                </div>
                <div className="flex gap-2 pt-4">
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 
                    rounded-lg p-6 text-center">
        <AlertTriangle className="h-10 w-10 text-red-500 dark:text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">Error Loading Directory</h3>
        <p className="text-red-600 dark:text-red-400">{error instanceof Error ? error.message : String(error)}</p>
        {displayedMembers && displayedMembers.length === 0 && !isLoading && (
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800/30 text-red-700 dark:text-red-300 
                     rounded-md hover:bg-red-200 dark:hover:bg-red-700/30 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Member Directory</h2>
      
      {/* Filters */}
      <DirectoryFilters 
        filters={filters} 
        setFilters={setFilters} 
        availableSkills={allSkills}
      />
      
      {/* Empty state */}
      {displayedMembers.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full 
                        flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No members found</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            {filters.search || filters.skills.length > 0 
              ? 'Try adjusting your filters or search terms.' 
              : 'The directory is currently empty.'}
          </p>
          {(filters.search || filters.skills.length > 0) && (
            <button
              onClick={() => setFilters({
                search: '',
                skills: []
              })}
              className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 
                       text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 
                       dark:hover:bg-slate-700 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Members grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedMembers.map((member: any) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
          
          {/* Results count */}
          <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Showing {displayedMembers.length} {displayedMembers.length === 1 ? 'member' : 'members'}
            {(filters.search || filters.skills.length > 0) && ' matching your filters'}
          </div>
        </>
      )}
    </div>
  );
};

export default DirectoryList;
