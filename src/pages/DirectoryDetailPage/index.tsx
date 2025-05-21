import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useMember } from '../../hooks/useQueries';
import { ContentContainer } from '../../components/ui/PageLayout';
import { Card } from '../../components/ui/Card';
import ProfileHeader from './ProfileHeader';
import ProfileInfo from './ProfileInfo';
import ContactSidebar from './ContactSidebar';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

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
          <ProfileHeader id={id as string} member={member} />
          
          <Card className="overflow-hidden">
            {/* Profile Information */}
            <div className="mt-16 p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <ProfileInfo member={member} />
                <ContactSidebar member={member} />
              </div>
            </div>
          </Card>
      </ContentContainer>
    </>
  );
}
