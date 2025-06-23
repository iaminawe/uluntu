import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ContentContainer, EmptyState } from '@/shared/components/ui/PageLayout';
import { SkeletonGrid } from '@/shared/components/ui/Skeleton';
import { QueryError } from '@/shared/components/ui/ErrorDisplay';
import NewsList from '@/features/news/components/NewsList';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';
import { useNewsHybrid } from '@/features/news/hooks/useNewsHybrid';

export default function NewsPage() {
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Use hybrid hook for news data
  const { articles, isLoading, error, refetch, setSearchTerm: setFilterSearch } = useNewsHybrid();
  
  const hasArticles = articles && articles.length > 0;
  
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
          onSearch={(term) => {
            setSearchTerm(term);
            setFilterSearch(term);
          }}
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
        />
        
        {isLoading ? (
          <SkeletonGrid count={4} columns={{ sm: 1, md: 2, lg: 2 }} />
        ) : error ? (
          <QueryError 
            error={error instanceof Error ? error : new Error('Failed to load news articles')} 
            retry={() => refetch()} 
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
            articles={articles}
            initialSearch={searchTerm}
            initialTag={selectedTags.length > 0 ? selectedTags[0] : 'all'}
          />
        )}
      </ContentContainer>
    </>
  );
}
