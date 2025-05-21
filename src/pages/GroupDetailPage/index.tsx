import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useGroup, useGroupEvents, useGroupMembers, useGroupResources, useGroupPosts } from '../../hooks/useQueries';
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
import { getVisibilityIcon, getVisibilityLabel } from './VisibilityHelper';
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
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
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
          </div>
        </div>
      </div>
      
      {/* Join Modal */}
      {showJoinModal && group && (
        <JoinModal
          group={group}
          onClose={() => setShowJoinModal(false)}
        />
      )}
    </>
  );
}
