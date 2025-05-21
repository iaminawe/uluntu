import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useMember } from '../../hooks/useQueries';
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
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <ProfileHeader id={id as string} member={member} />
          
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
            {/* Profile Information */}
            <div className="mt-16 p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <ProfileInfo member={member} />
                <ContactSidebar member={member} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
