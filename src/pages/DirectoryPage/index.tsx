import { Helmet } from 'react-helmet-async';
import MembersList from '../../components/MembersList';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';

export default function DirectoryPage() {
  return (
    <>
      <Helmet>
        <title>Member Directory - Kootenay Tech Community</title>
        <meta name="description" content="Connect with tech professionals in the Kootenay region" />
      </Helmet>
      
      <PageHeader />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <ActionBar />
          <MembersList />
        </div>
      </div>
    </>
  );
}
