import { Helmet } from 'react-helmet-async';
import ResourcesList from '../../components/ResourcesList';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';

export default function ResourcesPage() {
  return (
    <>
      <Helmet>
        <title>Resources - Kootenay Tech Community</title>
        <meta name="description" content="Tech resources and learning materials for the Kootenay tech community" />
      </Helmet>
      
      <PageHeader />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <ActionBar />
          <ResourcesList />
        </div>
      </div>
    </>
  );
}
