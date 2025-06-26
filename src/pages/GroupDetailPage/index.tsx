import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Shield, Globe, Lock } from 'lucide-react';
import { ContentContainer } from '@/shared/components/ui/PageLayout';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import PageHeader from './PageHeader';
import Tabs from './Tabs';
import AboutTab from './AboutTab';
import EventsTab from './EventsTab';
import MembersTab from './MembersTab';
import ResourcesTab from './ResourcesTab';
import PostsTab from './PostsTab';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import JoinModal from '@/features/groups/components/JoinModal';
import { useGroupsHybrid } from '@/features/groups/hooks/useGroupsHybrid';
import { useGroupMembers, useGroupEvents, useGroupResources, useGroupPosts } from '@/hooks/useGroupQueries';
import { TabType } from './types';

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedTab, setSelectedTab] = useState<TabType>('about');
  const [showJoinModal, setShowJoinModal] = useState(false);
  
  // Use the hybrid hook to fetch group data
  const { getGroup } = useGroupsHybrid();
  const { data: group, isLoading, error } = getGroup(id || '');
  
  // Fetch associations
  const { data: members = [], isLoading: membersLoading } = useGroupMembers(id);
  const { data: events = [], isLoading: eventsLoading } = useGroupEvents(id);
  const { data: resources = [], isLoading: resourcesLoading } = useGroupResources(id);
  const { data: posts = [], isLoading: postsLoading } = useGroupPosts(id);
  
  
  const getVisibilityIcon = (visibility?: 'open' | 'closed' | 'secret') => {
    switch (visibility) {
      case 'open':
        return <Globe className="h-4 w-4" />;
      case 'closed':
        return <Shield className="h-4 w-4" />;
      case 'secret':
        return <Lock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getVisibilityLabel = (visibility?: 'open' | 'closed' | 'secret') => {
    switch (visibility) {
      case 'open':
        return 'Open Group';
      case 'closed':
        return 'Closed Group';
      case 'secret':
        return 'Secret Group';
      default:
        return 'Unknown';
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !group) {
    return <ErrorState />;
  }

  return (
    <>
      <Helmet>
        <title>{group.name} - Kootenay Tech Community</title>
        <meta name="description" content={group.description?.substring(0, 160)} />
      </Helmet>
      
      <PageHeader group={group as any} setShowJoinModal={setShowJoinModal} />
      
      <ContentContainer>
        <Card className="overflow-hidden">
          <div className="p-8">
            <Tabs 
              selectedTab={selectedTab} 
              setSelectedTab={setSelectedTab} 
              group={{
                ...group,
                memberCount: members.length,
                eventCount: events.length,
                resourceCount: resources.length,
                postCount: posts.length
              } as any}
            />
            
            <div className="mt-6">
              {selectedTab === 'about' && (
                <AboutTab group={group as any} />
              )}
              {selectedTab === 'events' && (
                <EventsTab 
                  events={events} 
                  isLoading={eventsLoading}
                />
              )}
              {selectedTab === 'members' && (
                <MembersTab 
                  members={members} 
                  isLoading={membersLoading}
                  groupId={group.id}
                  groupName={group.name}
                />
              )}
              {selectedTab === 'resources' && (
                <ResourcesTab 
                  resources={resources} 
                  isLoading={resourcesLoading}
                  groupId={group.id}
                />
              )}
              {selectedTab === 'posts' && (
                <PostsTab 
                  posts={posts} 
                  isLoading={postsLoading}
                />
              )}
            </div>
          </div>
        </Card>
      </ContentContainer>
      
      {showJoinModal && group && (
        <JoinModal
          group={group}
          onClose={() => setShowJoinModal(false)}
        />
      )}
    </>
  );
}