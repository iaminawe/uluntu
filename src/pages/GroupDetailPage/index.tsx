import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useGroupRedux } from '../../hooks/useGroupsRedux';
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
import type { Group, Resource, Event, ContentStatus } from '../../types';
import type { GroupEvent } from '../../data/mock/groups';
import type { TabType } from './types';

// Mock data
import allMockData from '../../data/mock/mockData';

// Adapter function to convert GroupEvent to Event
const adaptGroupEventToEvent = (groupEvent: GroupEvent): Event => ({
  id: groupEvent.id,
  title: groupEvent.title,
  date: groupEvent.date,
  description: groupEvent.description,
  image: groupEvent.image,
  location: 'Nelson, BC', // Default location
  organizer: {
    id: '1',
    name: 'Group Organizer',
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg'
  },
  type: 'in-person' as const, // Default type
  status: 'published',
  attendees: 0
});

// Define a type for database resources
type DBResource = {
  id: string;
  title: string;
  description: string;
  type: string;
  url: string;
  image: string | null;
  status: string;
  featured: boolean | null;
  contributor_id: string;
  group_id: string | null;
  created_at: string | null;
};

// Helper function to convert DBResource to FrontendResource
const convertDBToFrontendResource = (dbResource: DBResource): Resource => {
  // Validate and set resource type
  const validTypes: Resource['type'][] = ['guide', 'tool', 'article', 'video', 'document', 'link'];
  const resourceType = validTypes.includes(dbResource.type as Resource['type']) 
    ? dbResource.type as Resource['type'] 
    : 'link';
  
  // Validate and set status
  const validStatuses: ContentStatus[] = ['draft', 'published', 'archived'];
  const status = validStatuses.includes(dbResource.status as ContentStatus)
    ? dbResource.status as ContentStatus
    : 'draft';
    
  return {
    id: dbResource.id,
    title: dbResource.title,
    description: dbResource.description,
    type: resourceType,
    url: dbResource.url,
    image: dbResource.image || undefined,
    dateAdded: dbResource.created_at || new Date().toISOString(),
    contributor: {
      id: dbResource.contributor_id || '0',
      name: 'Unknown Contributor'
    },
    status: status,
    featured: dbResource.featured || false,
    tags: [],
    groupId: dbResource.group_id || undefined,
    created_at: dbResource.created_at || new Date().toISOString()
  };
};

export default function GroupDetailPage() {
  const { id } = useParams();
  // Use string ID consistently throughout the component
  const groupIdString = id || '';
  const [selectedTab, setSelectedTab] = useState<TabType>('about');
  const [showJoinModal, setShowJoinModal] = useState(false);
  
  // Use the Redux hook to fetch group data, which includes events and members
  const { group: groupData, isLoading: groupLoading, isError: groupIsError, error: groupError } = useGroupRedux(groupIdString);
  
  // Extract events and members from the enriched group data
  const groupEvents = groupData?.events || [];
  const groupMembersData = groupData?.members || [];
  const eventsLoading = groupLoading;
  const membersLoading = groupLoading;
  // Local implementation of useGroupResources hook
  const useGroupResources = (groupIdParam: string): UseQueryResult<DBResource[]> => {
    return useQuery({
      queryKey: ['groupResources', groupIdParam],
      queryFn: async () => {
        // Define a more specific type for the mock resources to avoid casting issues
        type MockResource = {
          id: string | number;
          title: string;
          description: string;
          type: string;
          url: string;
          image?: string | null;
          status?: string;
          featured?: boolean | null;
          contributor?: {id: string | number; name?: string} | null;
          groupId?: string | number | null;
          group_id?: string | number | null;
          created_at?: string | null;
          dateAdded?: string | null;
          [key: string]: unknown;
        };
        
        // Mock implementation with improved type safety - use double type assertion for safety
        return (allMockData.resources as unknown as MockResource[])
          .filter((r) => String(r.groupId) === groupIdParam || String(r.group_id) === groupIdParam)
          .map((r) => ({
            id: String(r.id),
            title: r.title || '',
            description: r.description || '',
            type: r.type || '',
            url: r.url || '',
            image: r.image || null,
            status: r.status || 'published',
            featured: r.featured === null ? false : Boolean(r.featured),
            contributor_id: String(r.contributor?.id || '0'),
            group_id: String(r.groupId || r.group_id || groupIdParam),
            created_at: r.created_at || r.dateAdded || new Date().toISOString()
          })) as DBResource[];
      }
    });
  };
  
  const { data: groupResources = [], isLoading: resourcesLoading } = useGroupResources(groupIdString);
  
  // Define a type for the raw group member data that may have different property names
  type RawGroupMember = {
    id: string | number;
    name: string;
    avatar?: string;
    profileImage?: string;
    image?: string;
    joinDate?: string;
    joinedDate?: string; // Alternate property name
    role?: string;
    title?: string;
    [key: string]: unknown;
  };
  
  // Convert to proper GroupMember type expected by the component
  // GroupMember from the types.ts import requires:
  // - id as string
  // - name as string
  // - image as string
  // - role as 'admin' | 'member'
  // - joinedDate as string
  // Use a type assertion to tell TypeScript that the input data is compatible with our RawGroupMember type
  const groupMembers = (groupMembersData as unknown as RawGroupMember[]).map((member) => {
    // Create a component-compatible member object that matches the expected interface
    return {
      id: String(member.id), // Ensure ID is a string for type.ts compatibility
      name: member.name,
      image: member.image || member.avatar || member.profileImage || '',
      role: (member.role === 'admin' || member.role === 'member') ? 
            member.role as 'admin' | 'member' : 'member',
      joinedDate: member.joinedDate || member.joinDate || new Date().toISOString(),
      title: member.title
    } as unknown as Group['members'][0]; // Cast to the expected member type
  });

  // Mock posts data since useGroupPosts was removed
  const postsLoading = false;
  // Define a compatible GroupPost type that matches what the component expects
  const posts = [] as Array<{
    id: string;
    title: string;
    content: string;
    excerpt: string;
    date: string;
    author: {id: string; name: string; image: string};
  }>;

  // Convert GroupEvent[] to Event[]
  const events: Event[] = groupEvents.map(adaptGroupEventToEvent);
  
  // Convert DBResource to FrontendResource
  const resources: Resource[] = groupResources.map(convertDBToFrontendResource);

  if (groupLoading) {
    return <LoadingState />;
  }

  if (groupIsError || !groupData) {
    return <ErrorState />;
  }

  // The group data from Redux is already properly structured
  const group: Group = groupData as Group;

  return (
    <>
      <Helmet>
        <title>{group.name} - Kootenay Tech Community</title>
        <meta name="description" content={group.description} />
      </Helmet>
      
      {/* Hero Section */}
      <PageHeader group={group} setShowJoinModal={setShowJoinModal} />
      
      <ContentContainer>
        {/* Announcements Section */}
        <AnnouncementsSection announcements={announcements} isLoading={false} />
        
        {/* Admin announcement button */}
        {isAdmin && (
          <div className="mb-6">
            <button
              onClick={() => setShowAnnouncementModal(true)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
            >
              <Megaphone className="h-4 w-4" />
              Create Announcement
            </button>
          </div>
        )}
        
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
              {selectedTab === 'members' && <MembersTab members={groupMembers} isLoading={membersLoading} groupId={group.id} />}
              {selectedTab === 'resources' && <ResourcesTab resources={resources} isLoading={resourcesLoading} groupId={group.id} />}
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
      
      {/* Create Announcement Modal */}
      {showAnnouncementModal && (
        <CreateAnnouncementModal
          isOpen={showAnnouncementModal}
          onClose={() => setShowAnnouncementModal(false)}
          groupId={id!}
          onSuccess={() => {
            refetchAnnouncements();
            setShowAnnouncementModal(false);
          }}
        />
      )}
    </>
  );
}
