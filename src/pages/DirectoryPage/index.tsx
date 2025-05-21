import { Helmet } from 'react-helmet-async';
import { ContentContainer } from '../../components/ui/PageLayout';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import { QueryError } from '../../components/ui/ErrorDisplay';
import MembersList from '../../components/MembersList';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';

// Define Member type based on migration plan
interface Member {
  id: number;
  name: string;
  title: string;
  company?: string;
  location?: string;
  image: string;
  bio?: string;
  skills?: string[];
  joinDate: string;
}

export default function DirectoryPage() {
  // These would normally come from a Tanstack Query hook like useMembers()
  const isLoading = false;
  const error = null;
  const members: Member[] = []; // Would be populated from Tanstack Query
  const hasMembers = members.length > 0;
  
  return (
    <>
      <Helmet>
        <title>Member Directory - Kootenay Tech Community</title>
        <meta name="description" content="Connect with tech professionals in the Kootenay region" />
      </Helmet>
      
      <PageHeader />
      
      <ContentContainer>
        <ActionBar />
        
        {isLoading ? (
          <SkeletonGrid count={8} columns={{ sm: 1, md: 2, lg: 4 }} />
        ) : error ? (
          <QueryError 
            error={error} 
            retry={() => console.log('Retrying members query')} 
            message="We couldn't load the directory. Please try again."
          />
        ) : !hasMembers ? (
          <div className="py-12 text-center">
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">No members yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Be the first to join the community directory!</p>
            <a href="/directory/create" className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
              Add Your Profile
            </a>
          </div>
        ) : (
          <MembersList />
        )}
      </ContentContainer>
    </>
  );
}
