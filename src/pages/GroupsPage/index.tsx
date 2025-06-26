import { useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { ContentContainer, EmptyState } from '@/shared/components/ui/PageLayout';
import { SkeletonGrid } from '@/shared/components/ui/Skeleton';
import { QueryError } from '@/shared/components/ui/ErrorDisplay';
import GroupsList from '@/features/groups/components/GroupsList';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';
import { useGroupsHybrid } from '@/features/groups/hooks/useGroupsHybrid';
import { GroupVisibility } from '@/features/groups/components/GroupsList/types';

export default function GroupsPage() {
  const navigate = useNavigate();
  
  // Use hybrid hook for groups data and filter management
  const { 
    groups, 
    isLoading, 
    error, 
    refetch,
    filters,
    setSearchTerm,
    setVisibilityFilter 
  } = useGroupsHybrid();
  
  // Convert visibility filter from hybrid hook to array format expected by ActionBar
  const visibilityFilterArray: GroupVisibility[] = (() => {
    if (!filters.visibility || filters.visibility === 'all') {
      return [];
    }
    if (Array.isArray(filters.visibility)) {
      return filters.visibility as GroupVisibility[];
    }
    return [filters.visibility as GroupVisibility];
  })();
  
  // Handle visibility filter changes from ActionBar
  const handleVisibilityChange = useCallback((visibilities: GroupVisibility[]) => {
    if (visibilities.length === 0) {
      setVisibilityFilter('all');
    } else {
      // Use the first selected visibility (since the hybrid hook only supports one)
      setVisibilityFilter(visibilities[0] as 'open' | 'closed' | 'all');
    }
  }, [setVisibilityFilter]);
  
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
          searchTerm={filters.search || ''}
          onSearch={setSearchTerm}
          visibilityFilter={visibilityFilterArray}
          onVisibilityChange={handleVisibilityChange}
        />
        
        {isLoading ? (
          <SkeletonGrid count={6} columns={{ sm: 1, md: 2, lg: 3 }} />
        ) : error ? (
          <QueryError 
            error={error} 
            retry={refetch} 
            message="We couldn't load the groups. Please try again."
          />
        ) : !hasGroups ? (
          <EmptyState
            title="No Groups Found"
            description="There are no tech groups in the directory yet."
            primaryActionUrl="/groups/create"
            primaryAction={{
              text: "Create a Group",
              onClick: () => navigate('/groups/create')
            }}
          />
        ) : (
          <GroupsList 
            groups={groups}
            searchTerm={filters.search || ''}
            visibilityFilter={visibilityFilterArray}
          />
        )}
      </ContentContainer>
    </>
  );
}
