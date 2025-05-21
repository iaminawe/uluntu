import { Helmet } from 'react-helmet-async';
import GroupsList from '../../components/GroupsList';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';

export default function GroupsPage() {
  return (
    <>
      <Helmet>
        <title>Tech Groups - Kootenay Tech Community</title>
        <meta name="description" content="Tech groups and communities in the Kootenay region" />
      </Helmet>
      
      <PageHeader />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <ActionBar />
          <GroupsList />
        </div>
      </div>
    </>
  );
}
