import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useGroup, useGroupEvents, useGroupMembers, useGroupResources, useGroupPosts } from '../../hooks/useSupabaseQueries';
import { ContentContainer } from '../../components/ui/PageLayout';
import { Card } from '../../components/ui/Card';
import JoinModal from '../../components/JoinModal';
import PageHeader from './PageHeader';
import Tabs from './Tabs';
import AboutTab from './AboutTab';
import EventsTab from './EventsTab';
import MembersTab from './MembersTab';
import ResourcesTab from './ResourcesTab';
import PostsTab from './PostsTab';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
// These helpers are imported elsewhere but removed the direct import to fix linting
import { TabType } from './types';

export default function GroupDetailPage() {
  const { id } = useParams();
  const groupId = id ? parseInt(id) : 0;
  const [selectedTab, setSelectedTab] = useState<TabType>('about');
  const [showJoinModal, setShowJoinModal] = useState(false);
  
  const { data: group, isLoading: groupLoading, error: groupError } = useGroup(groupId);
  const { data: events = [], isLoading: eventsLoading } = useGroupEvents(groupId);
  const { data: members = [], isLoading: membersLoading } = useGroupMembers(groupId);
  const { data: resources = [], isLoading: resourcesLoading } = useGroupResources(groupId);
  const { data: posts = [], isLoading: postsLoading } = useGroupPosts(groupId);

  if (groupLoading) {
    return <LoadingState />;
  }

  if (groupError || !group) {
    return <ErrorState />;
  }

  return (
    <>
      <Helmet>
        <title>{group.name} - Kootenay Tech Community</title>
        <meta name="description" content={group.description} />
      </Helmet>
      
      {/* Hero Section */}
      <PageHeader group={group} setShowJoinModal={setShowJoinModal} />
      
      <ContentContainer>
        <Card className="overflow-hidden">
            {/* Tabs Section */}
            <Tabs 
              selectedTab={selectedTab} 
              setSelectedTab={setSelectedTab} 
              group={group} 
            />
            
            {/* Tab Content */}
            <div className="p-6">
              {selectedTab === 'about' && <AboutTab group={group} />}
              {selectedTab === 'events' && <EventsTab events={events} isLoading={eventsLoading} />}
              {selectedTab === 'members' && <MembersTab members={members} isLoading={membersLoading} />}
              {selectedTab === 'resources' && <ResourcesTab resources={resources} isLoading={resourcesLoading} />}
              {selectedTab === 'posts' && <PostsTab posts={posts} isLoading={postsLoading} />}
            </div>
        </Card>
      </ContentContainer>
      
      {/* Join Modal */}
      {showJoinModal && (
        <JoinModal
          group={group} // group is guaranteed to be defined here due to the conditional rendering above
          onClose={() => setShowJoinModal(false)}
        />
      )}
    </>
  );
}
