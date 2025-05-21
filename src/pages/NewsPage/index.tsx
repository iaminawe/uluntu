import { Helmet } from 'react-helmet-async';
import { ContentContainer, EmptyState } from '../../components/ui/PageLayout';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import { QueryError } from '../../components/ui/ErrorDisplay';
import NewsArticlesList from '../../components/NewsArticlesList';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';

export default function NewsPage() {
  // These would normally come from a hook like useNewsArticles()
  const isLoading = false;
  const error = null;
  const articles: any[] = []; // Would be populated from API
  const hasArticles = articles.length > 0;
  
  return (
    <>
      <Helmet>
        <title>Tech News - Kootenay Tech Community</title>
        <meta name="description" content="Latest tech news from the Kootenay region and beyond." />
      </Helmet>
      
      <PageHeader />
      
      <ContentContainer>
        <ActionBar />
        
        {isLoading ? (
          <SkeletonGrid count={4} columns={{ sm: 1, md: 2, lg: 2 }} />
        ) : error ? (
          <QueryError 
            error={error} 
            retry={() => console.log('Retrying news query')} 
            message="We couldn't load the news articles. Please try again."
          />
        ) : !hasArticles ? (
          <EmptyState
            title="No News Articles Found"
            description="There are no news articles published yet."
            primaryActionUrl="/news/create"
            primaryAction={{
              text: "Create an Article",
              onClick: () => console.log('Navigate to create article')
            }}
          />
        ) : (
          <NewsArticlesList />
        )}
      </ContentContainer>
    </>
  );
}
