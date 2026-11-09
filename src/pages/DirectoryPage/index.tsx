import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ContentContainer } from '@/shared/components/ui/PageLayout';
import { SkeletonGrid } from '@/shared/components/ui/Skeleton';
import { QueryError } from '@/shared/components/ui/ErrorDisplay';
import MembersList from '@/features/directory/components/MembersList';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';
import { useMembersHybrid } from '@/features/directory/hooks/useMembersHybrid';
import { type Member as QueryMember } from '@/hooks/useMemberQueries';
import { Member as UITypeMember } from '../../types';
import Pagination from '@/components/Pagination';

// Adapt between the Member type from React Query and the one in types.ts
const adaptMemberForUI = (queryMember: QueryMember): UITypeMember => {
  return {
    id: queryMember.id,
    slug: queryMember.slug, // Include slug field for proper URL generation
    name: queryMember.name,
    title: queryMember.role || '', // Map role to title field
    image: queryMember.image || '',
    bio: queryMember.bio,
    skills: queryMember.skills,
    joinDate: queryMember.joinDate || queryMember.joinedDate || queryMember.created_at || new Date().toISOString(),
    status: queryMember.status || 'published',
    featured: queryMember.featured,
    company: ''  // Not available in the query member type
  };
};

const ITEMS_PER_PAGE = 12; // Adjust as needed for the main directory

export default function DirectoryPage() {
  // Use hybrid approach: React Query for data, Redux for UI state
  const {
    members: allMembers = [],
    isLoading,
    error,
    refetch,
    filters,
    setSearchTerm,
    setSkills
  } = useMembersHybrid();
  
  // Local state for pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Convert all members to the UI type expected by MembersList
  const adaptedMembers = (allMembers || []).map(adaptMemberForUI);
  
  // Filtering is handled by useMembersHybrid hook which applies search and skills filters
  // The adaptedMembers list is already filtered based on the filters state from ActionBar
  // If ActionBar filter changes, the useMembersHybrid hook will refetch and filter the members
  // No additional filtering needed here - just paginate the pre-filtered results
  const filteredMembers = adaptedMembers; // Already filtered by useMembersHybrid hook

  const totalMembers = filteredMembers.length;
  const hasMembers = totalMembers > 0;
  const totalPages = Math.ceil(totalMembers / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentMembersToDisplay = filteredMembers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top on page change
  };
  
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters]); // Only reset when filters change, not on every data update

  // Debug logging to help troubleshoot intermittent loading
  useEffect(() => {
    console.log('DirectoryPage - Data state:', {
      membersCount: allMembers?.length || 0,
      isLoading,
      hasError: !!error,
      filtersActive: Object.keys(filters || {}).length > 0
    });
  }, [allMembers, isLoading, error, filters]);
  
  return (
    <>
      <Helmet>
        <title>Member Directory - Uluntu</title>
        <meta name="description" content="Connect with members of the Uluntu community" />
      </Helmet>
      
      <PageHeader />
      
      <ContentContainer>
        <ActionBar 
          filters={{
            search: filters.search || '',
            skills: filters.skills
          }}
          setFilters={(newFilters) => {
            if (typeof newFilters === 'function') {
              const currentFilters = { search: filters.search || '', skills: filters.skills };
              const updatedFilters = newFilters(currentFilters);
              setSearchTerm(updatedFilters.search);
              setSkills(updatedFilters.skills);
            } else {
              setSearchTerm(newFilters.search);
              setSkills(newFilters.skills);
            }
          }}
        />
        
        {isLoading ? (
          <SkeletonGrid count={ITEMS_PER_PAGE} columns={{ sm: 1, md: 2, lg: 4 }} />
        ) : error ? (
          <QueryError 
            error={error || new Error('Error loading members')} 
            retry={refetch} 
            message="We couldn't load the directory. Please try again."
          />
        ) : !hasMembers ? (
          <div className="py-12 text-center">
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">No members found</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Try adjusting your search or filters, or be the first to join!</p>
            <a href="/directory/create" className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
              Add Your Profile
            </a>
          </div>
        ) : (
          <div className="mt-6">
            <MembersList 
              members={currentMembersToDisplay} // Pass paginated members with the correct type
              loading={isLoading} // This might be redundant if skeleton handles it
              error={error} // This might be redundant if QueryError handles it
              initialSearch={filters.search} // These props might be for internal MembersList filtering
              initialSkills={filters.skills} // which could conflict with external pagination.
            />
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        )}
      </ContentContainer>
    </>
  );
}
