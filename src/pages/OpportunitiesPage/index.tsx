import { Helmet } from 'react-helmet-async';
import OpportunitiesList from '../../components/OpportunitiesList';
import PageHeader from './PageHeader';
import FilterTabs from './FilterTabs';
import ActionBar from './ActionBar';

export default function OpportunitiesPage() {
  return (
    <>
      <Helmet>
        <title>Opportunities - Kootenay Tech Community</title>
        <meta name="description" content="Tech opportunities, jobs, and volunteer positions in the Kootenay region" />
      </Helmet>
      
      <PageHeader />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <FilterTabs />
          <ActionBar />
          <OpportunitiesList />
        </div>
      </div>
    </>
  );
}
