import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ContentContainer } from '../../components/ui/PageLayout';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import { QueryError } from '../../components/ui/ErrorDisplay';
import MembersList from '../../components/MembersList';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';
import { useMembers } from '../../hooks/useQueries';
import { FilterOptions } from '../../components/MembersList/types';

// Member type is already defined in the types.ts file

export default function DirectoryPage() {
  // Use the useMembers hook to fetch members data
  const { data: members = [], isLoading, error } = useMembers();
  const hasMembers = members.length > 0;
  
  // State for search and filters that will be passed to ActionBar
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    skills: undefined
  });
  
  useEffect(() => {
    console.log('DirectoryPage - Members:', members);
    console.log('DirectoryPage - Loading:', isLoading);
    console.log('DirectoryPage - Error:', error);
  }, [members, isLoading, error]);
  
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
          setFilters={setFilters}
        />
        
        {isLoading ? (
          <SkeletonGrid count={8} columns={{ sm: 1, md: 2, lg: 4 }} />
        ) : error ? (
          <QueryError 
            error={error} 
            retry={() => console.log('Retrying members query')} 
            message="We couldn't load the directory. Please try again."
          />
        ) : !hasMembers ? (
          <div className="py-12 text-center">
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">No members yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Be the first to join the community directory!</p>
            <a href="/directory/create" className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
              Add Your Profile
            </a>
          </div>
        ) : (
          <div className="mt-6">
            <MembersList 
              members={members} 
              loading={isLoading} 
              error={error} 
              initialSearch={filters.search}
              initialSkills={filters.skills}
            />
          </div>
        )}
      </ContentContainer>
    </>
  );
}
