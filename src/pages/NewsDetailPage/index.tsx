import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useNewsHybrid } from '@/features/news/hooks/useNewsHybrid';
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
  const { getArticleBySlug, getRelatedArticles } = useNewsHybrid();

  // Get article by slug
  const { 
    data: article, 
    isLoading: articleLoading, 
    error: articleError 
  } = getArticleBySlug(slug || '');
  
  // Get related articles using the article's id
  const { 
    data: relatedArticles = [], 
    isLoading: relatedLoading 
  } = getRelatedArticles(article?.id || '', 3);

  if (!slug) {
    // Handle the case where slug is not available after hooks have been called
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
