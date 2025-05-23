import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ContentContainer, EmptyState } from '../../components/ui/PageLayout';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import { QueryError } from '../../components/ui/ErrorDisplay';
import GroupsList from '../../components/GroupsList';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';
import { useGroups } from '../../hooks/useQueries';
import { GroupVisibility } from '../../components/GroupsList/types';

export default function GroupsPage() {
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<GroupVisibility[]>([]);

  // Filter state is managed by the ActionBar component

  // Use the useGroups hook to fetch groups data
  const { data: groups = [], isLoading, error } = useGroups();
  const hasGroups = groups.length > 0;

  return (
    <>
      <Helmet>
        <title>Tech Groups - Kootenay Tech Community</title>
        <meta name="description" content="Tech groups and communities in the Kootenay region" />
      </Helmet>
      
      <PageHeader />
      
      <ContentContainer>
        {/* ActionBar will handle the page actions */}

        <ActionBar 
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          visibilityFilter={visibilityFilter}
          onVisibilityChange={setVisibilityFilter}
        />
        
        {isLoading ? (
          <SkeletonGrid count={6} columns={{ sm: 1, md: 2, lg: 3 }} />
        ) : error ? (
          <QueryError 
            error={error} 
            retry={() => console.log('Retrying groups query')} 
            message="We couldn't load the groups. Please try again."
          />
        ) : !hasGroups ? (
          <EmptyState
            title="No Groups Found"
            description="There are no tech groups in the directory yet."
            primaryActionUrl="/groups/create"
            primaryAction={{
              text: "Create a Group",
              onClick: () => console.log('Navigate to create group')
            }}
          />
        ) : (
          <GroupsList 
            searchTerm={searchTerm} 
            visibilityFilter={visibilityFilter} 
          />
        )}
      </ContentContainer>
    </>
  );
}
