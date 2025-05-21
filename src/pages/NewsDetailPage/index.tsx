import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useNewsArticle, useRelatedNewsArticles } from '../../hooks/useQueries';
import ArticleHeader from './ArticleHeader';
import ArticleContent from './ArticleContent';
import AuthorInfo from './AuthorInfo';
import RelatedArticles from './RelatedArticles';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const articleId = id ? parseInt(id) : undefined;
  
  const { 
    data: article, 
    isLoading: articleLoading, 
    error: articleError 
  } = useNewsArticle(articleId);
  
  const { 
    data: relatedArticles = [], 
    isLoading: relatedLoading 
  } = useRelatedNewsArticles(articleId);

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
      
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <ArticleHeader article={article} id={id || ''} />
          <ArticleContent article={article} />
          <AuthorInfo author={article.author} />
          <RelatedArticles 
            relatedArticles={relatedArticles} 
            isLoading={relatedLoading} 
          />
        </div>
      </div>
    </>
  );
}
