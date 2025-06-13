import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ContentContainer, EmptyState } from '@/shared/components/ui/PageLayout';
import { SkeletonGrid } from '@/shared/components/ui/Skeleton';
import { QueryError } from '@/shared/components/ui/ErrorDisplay';
import NewsList from '@/features/news/components/NewsList';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';
import { useFilteredNewsArticlesRedux } from '../../hooks/useNewsRedux';
import { NewsFilters } from '../../types/news';

export default function NewsPage() {
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Fetch news articles with the current filters using Redux
  const { 
    filteredArticles: articles = [], 
    isLoading, 
    isError, 
    error,
    updateFilters 
  } = useFilteredNewsArticlesRedux();

  // Update filters when search term or tags change
  useEffect(() => {
    updateFilters({
      search: searchTerm,
      tags: selectedTags
    });
  }, [searchTerm, selectedTags, updateFilters]);
  
  const hasArticles = articles.length > 0;
  
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
        ) : isError ? (
          <QueryError 
            error={error ? new Error(String(error)) : new Error('Failed to load news articles')} 
            retry={() => updateFilters({
              search: searchTerm,
              tags: selectedTags
            })} 
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
            initialTag={selectedTags.length > 0 ? selectedTags[0] : 'all'}
            articles={articles}
            useRedux={true}
          />
        )}
      </ContentContainer>
    </>
  );
}
