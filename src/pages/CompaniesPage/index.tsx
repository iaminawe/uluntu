import { Helmet } from 'react-helmet-async';
import CompaniesList from '../../components/CompaniesList';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';

export default function CompaniesPage() {
  return (
    <>
      <Helmet>
        <title>Tech Companies - Kootenay Tech Community</title>
        <meta name="description" content="Explore tech companies and startups in the Kootenay region" />
      </Helmet>
      
      <PageHeader />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <ActionBar />
          <CompaniesList />
        </div>
      </div>
    </>
  );
}
