import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useMemberRedux } from '../../hooks/useMembersRedux';
import { ContentContainer } from '@/shared/components/ui/PageLayout';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import MemberProfile from '@/features/directory/components/MemberProfile';

export default function DirectoryDetailPage() {
  const { id } = useParams();
  // Store the original ID string - useMemberRedux expects a string ID
  const memberIdString = id || '';
  
  // Use Redux-based hook for a single member
  const { member, isLoading, error, getMember } = useMemberRedux(memberIdString);
  
  // Fetch member when component mounts or ID changes
  useEffect(() => {
    getMember();
  }, [getMember, memberIdString]);
  
  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !member) {
    return <ErrorState />;
  }

  return (
    <>
      <Helmet>
        <title>{member.name} - Kootenay Tech Community</title>
        <meta name="description" content={`${member.name} - ${member.title}${member.company ? ` at ${member.company}` : ''}`} />
      </Helmet>
      
      <ContentContainer>
        {/* Use our enhanced MemberProfile component that shows all contributions */}
        <MemberProfile memberId={id as string} />
      </ContentContainer>
    </>
  );
}
