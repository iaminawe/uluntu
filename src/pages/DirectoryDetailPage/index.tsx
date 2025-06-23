import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useMemberHybrid } from '@/features/directory/hooks/useMembersHybrid';
import { ContentContainer } from '@/shared/components/ui/PageLayout';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import MemberProfile from '@/features/directory/components/MemberProfile';

export default function DirectoryDetailPage() {
  const { id } = useParams();
  
  // Use hybrid approach for data fetching
  const { member, isLoading, error } = useMemberHybrid(id);
  
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
