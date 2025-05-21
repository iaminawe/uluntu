import { Helmet } from 'react-helmet-async';
import MarketplaceList from '../../components/MarketplaceList';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';

export default function MarketplacePage() {
  return (
    <>
      <Helmet>
        <title>Marketplace - Kootenay Tech Community</title>
        <meta name="description" content="Tech marketplace for services, products, and equipment in the Kootenay region" />
      </Helmet>
      
      <PageHeader />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <ActionBar />
          <MarketplaceList />
        </div>
      </div>
    </>
  );
}
