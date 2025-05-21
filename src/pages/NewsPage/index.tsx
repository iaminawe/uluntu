import { Helmet } from 'react-helmet-async';
import NewsArticlesList from '../../components/NewsArticlesList';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';

export default function NewsPage() {
  return (
    <>
      <Helmet>
        <title>Tech News - Kootenay Tech Community</title>
        <meta name="description" content="Latest tech news from the Kootenay region and beyond." />
      </Helmet>
      
      <PageHeader />
      
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <ActionBar />
          <NewsArticlesList />
        </div>
      </div>
    </>
  );
}
