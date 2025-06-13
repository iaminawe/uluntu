import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';

import ArticleHeader from './ArticleHeader';
import ArticleContent from './ArticleContent';
import CommentsSection from './CommentsSection';
import CommentModal from './CommentModal';
import ShareModal from './ShareModal';
import { NewsArticle, SAMPLE_ARTICLE, NewsComment, adaptMainNewsArticleToLocal } from './types';
import { useNewsArticle } from '../../hooks/useQueries';

interface NewsDetailProps {
  articleId?: string;
  isPreview?: boolean;
}

const NewsDetail = ({ articleId, isPreview = false }: NewsDetailProps) => {
  const navigate = useNavigate();
  
  // If in preview mode or no articleId, use sample data, otherwise fetch from API
  const { data: fetchedArticle } = useNewsArticle(articleId || '');
  
  // Convert fetched article to local format or use sample data if in preview/no data
  const [article, setArticle] = useState<NewsArticle>(SAMPLE_ARTICLE);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Update article state when fetched data changes
  useEffect(() => {
    if (fetchedArticle && !isPreview) {
      setArticle(adaptMainNewsArticleToLocal(fetchedArticle));
    }
  }, [fetchedArticle, isPreview]);

  // Handle adding a new comment
  const handleAddComment = (content: string) => {
    if (!content.trim()) return;
    
    const newComment: NewsComment = {
      id: Date.now(), // In a real app, this would come from the server
      content,
      createdAt: new Date().toISOString(),
      author: {
        id: 999, // This would be the current user's ID
        name: 'Current User', // This would be the current user's name
        image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg' // This would be the current user's image
      }
    };
    
    setArticle({
      ...article,
      comments: [newComment, ...article.comments]
    });
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <>
      <Helmet>
        <title>{article.title} | Kootenay Tech Directory</title>
        <meta name="description" content={article.content.substring(0, 155)} />
      </Helmet>
      
      {/* We could show loading state here if needed */}

      <div className="max-w-4xl mx-auto px-4 py-8">
        {!isPreview && (
          <button 
            onClick={goBack} 
            className="flex items-center text-slate-600 dark:text-slate-400 hover:text-orange-500 
                     dark:hover:text-orange-400 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to News
          </button>
        )}

        <ArticleHeader 
          article={article} 
          onShare={() => setShowShareModal(true)} 
          isEditable={!isPreview}
        />
        
        <ArticleContent article={article} />
        
        {!isPreview && (
          <CommentsSection 
            article={article} 
            onAddComment={() => setShowCommentModal(true)} 
          />
        )}

        {showCommentModal && (
          <CommentModal 
            onClose={() => setShowCommentModal(false)} 
            onSubmit={handleAddComment}
          />
        )}

        {showShareModal && (
          <ShareModal 
            article={article} 
            onClose={() => setShowShareModal(false)}
          />
        )}
      </div>
    </>
  );
};

export default NewsDetail;
