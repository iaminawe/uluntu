import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ContentContainer, EmptyState } from '../../components/ui/PageLayout';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import { QueryError } from '../../components/ui/ErrorDisplay';
import NewsList from '../../components/NewsList';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';
// Temporarily use mock data instead of Supabase data
import { useNewsArticlesWithFilters } from '../../hooks/useQueries';

export default function NewsPage() {
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Use the useNewsArticlesWithFilters hook to fetch filtered news articles
  const { data, isLoading, error } = useNewsArticlesWithFilters({
    search: searchTerm,
    tag: selectedTags.length > 0 ? selectedTags[0] : undefined
  });
  
  // Properly extract articles from the data structure
  const articles = data || [];
  const hasArticles = articles.length > 0;
  console.log('News articles:', articles);
  
  return (
    <>
      <Helmet>
        <title>Tech News - Kootenay Tech Community</title>
        <meta name="description" content="Latest tech news from the Kootenay region and beyond." />
      </Helmet>
      
      <PageHeader />
      
      <ContentContainer>
        <ActionBar 
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
        />
        
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
          <NewsList 
            initialSearch={searchTerm}
            initialTag={selectedTags.length > 0 ? selectedTags[0] : ''}
          />
        )}
      </ContentContainer>
    </>
  );
}
