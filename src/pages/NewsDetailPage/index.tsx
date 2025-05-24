import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useNewsArticle, useRelatedNewsArticles } from '../../hooks/useSupabaseQueries';
import { ContentContainer } from '../../components/ui/PageLayout';
import { Card } from '../../components/ui/Card';
import ArticleHeader from './ArticleHeader';
import ArticleContent from './ArticleContent';
import AuthorInfo from './AuthorInfo';
import RelatedArticles from './RelatedArticles';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const articleId = id ? parseInt(id) : undefined;

  // Call hooks unconditionally at the top level
  const { 
    data: article, 
    isLoading: articleLoading, 
    error: articleError 
  } = useNewsArticle(articleId ?? 0); // Pass 0 if articleId is undefined
  
  const { 
    data: relatedArticles = [], 
    isLoading: relatedLoading 
  } = useRelatedNewsArticles(articleId ?? 0); // Pass 0 if articleId is undefined

  if (!articleId) {
    // Handle the case where articleId is not available after hooks have been called
    return <ErrorState />;
  }

  if (articleLoading) {
    return <LoadingState />;
  }

  if (articleError || !article) {
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
          <ArticleHeader article={article} id={id || ''} />
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
