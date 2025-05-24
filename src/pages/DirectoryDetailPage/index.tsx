import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useMember } from '../../hooks/useSupabaseQueries';
import { ContentContainer } from '../../components/ui/PageLayout';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import MemberProfile from '../../components/MemberProfile';

export default function DirectoryDetailPage() {
  const { id } = useParams();
  const memberId = id ? parseInt(id) : 0;
  
  const { data: member, isLoading, error } = useMember(memberId);
  
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
