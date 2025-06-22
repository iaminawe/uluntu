import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { ContentContainer, EmptyState } from '@/shared/components/ui/PageLayout';
import { SkeletonGrid } from '@/shared/components/ui/Skeleton';
import { QueryError } from '@/shared/components/ui/ErrorDisplay';
import GroupsList from '@/features/groups/components/GroupsList';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';
import { useGroupsRedux } from '@/features/groups/hooks/useGroupsRedux';
import { GroupVisibility } from '@/features/groups/components/GroupsList/types';

export default function GroupsPage() {
  const navigate = useNavigate();
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<GroupVisibility[]>([]);
  
  // Use Redux for groups data
  const { groups, isLoading, isError, error, loadGroups } = useGroupsRedux();
  
  // Load groups on mount
  useEffect(() => {
    console.log('[GroupsPage] Loading groups via Redux...');
    loadGroups();
  }, [loadGroups]);
  
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
        ) : isError ? (
          <QueryError 
            error={error ? new Error(String(error)) : new Error('Failed to load groups')} 
            retry={loadGroups} 
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
            searchTerm={searchTerm} 
            visibilityFilter={visibilityFilter}
          />
        )}
      </ContentContainer>
    </>
  );
}
