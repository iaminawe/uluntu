import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useNewsArticleBySlugRedux, useRelatedNewsArticlesRedux } from '../../hooks/useNewsRedux';
import { ContentContainer } from '@/shared/components/ui/PageLayout';
import { Card } from '@/shared/components/ui/Card';
import ArticleHeader from './ArticleHeader';
import ArticleContent from './ArticleContent';
import AuthorInfo from './AuthorInfo';
import RelatedArticles from './RelatedArticles';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

export default function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  // Call hooks unconditionally at the top level using Redux
  const { 
    article, 
    isLoading: articleLoading, 
    isError: articleIsError,
    error: articleError 
  } = useNewsArticleBySlugRedux(slug);
  
  // Then use the article's id for related articles
  const { 
    relatedArticles = [], 
    isLoading: relatedLoading 
  } = useRelatedNewsArticlesRedux(article?.id, 3)

  if (!slug) {
    // Handle the case where slug is not available after hooks have been called
    return <ErrorState />;
  }

  if (articleLoading) {
    return <LoadingState />;
  }

  if (articleIsError || !article) {
    return <ErrorState />;
  }

  return (
    <>
      <Helmet>
        <title>{article.title} - Kootenay Tech Community</title>
        <meta name="description" content={article.excerpt} />
      </Helmet>
      
      <ContentContainer maxWidth="3xl">
        <Card className="mb-6">
          <ArticleHeader article={article} id={article.id || ''} />
          <ArticleContent article={article} />
          <AuthorInfo author={article.author} />
        </Card>
        
        <Card>
          <RelatedArticles 
            relatedArticles={relatedArticles} 
            isLoading={relatedLoading} 
          />
        </Card>
      </ContentContainer>
    </>
  );
}
