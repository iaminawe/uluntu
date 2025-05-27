import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ContentContainer } from '../../components/ui/PageLayout';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import { QueryError } from '../../components/ui/ErrorDisplay';
import MembersList from '../../components/MembersList';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';
import { useMembersRedux } from '../../hooks/useMembersRedux';
import { Member as ReduxMember } from '../../redux/slices/membersSlice';
import { FilterOptions } from '../../components/MembersList/types';
import { Member as UITypeMember } from '../../types';
import Pagination from '../../components/Pagination'; // Import Pagination

// We need to adapt between the Member type from Redux and the one in types.ts
const adaptMemberForUI = (reduxMember: ReduxMember): UITypeMember => {
  return {
    id: reduxMember.id,
    name: reduxMember.name,
    title: reduxMember.title || reduxMember.role || '', // Map title or role to title field
    image: reduxMember.image || '',
    bio: reduxMember.bio,
    skills: reduxMember.skills,
    joinDate: reduxMember.joinDate || reduxMember.joinedDate || reduxMember.created_at || new Date().toISOString(),
    status: reduxMember.status || 'published',
    featured: reduxMember.featured,
    company: reduxMember.company
  };
};

const ITEMS_PER_PAGE = 12; // Adjust as needed for the main directory

export default function DirectoryPage() {
  // Use the Redux-based hook to fetch members data
  const { members: allMembers = [], isLoading, error, getAllMembers } = useMembersRedux();
  
  // Fetch members when component mounts
  useEffect(() => {
    getAllMembers();
  }, [getAllMembers]);
  
  // State for search and filters that will be passed to ActionBar
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    skills: undefined
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Convert all members to the UI type expected by MembersList
  const adaptedMembers = allMembers.map(adaptMemberForUI);
  
  // TODO: Implement filtering logic here if ActionBar doesn't handle it before pagination
  // For now, we assume 'adaptedMembers' is the list to be paginated.
  // If MembersList applies filters internally and returns a filtered list, that would be better.
  // Or, filters from ActionBar should be applied here to 'adaptedMembers' before pagination.
  const filteredMembers = adaptedMembers; // Placeholder for actual filtering if needed

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
    console.log('DirectoryPage - All Members:', allMembers);
    console.log('DirectoryPage - Loading:', isLoading);
    console.log('DirectoryPage - Error:', error);
    setCurrentPage(1); // Reset to first page when filters/data change
  }, [allMembers, isLoading, error, filters]); // Consider if filters should reset page
  
  return (
    <>
      <Helmet>
        <title>Member Directory - Kootenay Tech Community</title>
        <meta name="description" content="Connect with tech professionals in the Kootenay region" />
      </Helmet>
      
      <PageHeader />
      
      <ContentContainer>
        <ActionBar 
          filters={filters}
          setFilters={setFilters} // This might need to interact with pagination state if filters change
        />
        
        {isLoading ? (
          <SkeletonGrid count={ITEMS_PER_PAGE} columns={{ sm: 1, md: 2, lg: 4 }} />
        ) : error ? (
          <QueryError 
            error={error || 'Error loading members'} 
            retry={() => getAllMembers()} 
            message="We couldn't load the directory. Please try again."
          />
        ) : !hasMembers && !isLoading ? (
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
