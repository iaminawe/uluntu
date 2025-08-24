import { ArticleContentProps } from './types';
import DOMPurify from 'dompurify';

const ArticleContent: React.FC<ArticleContentProps> = ({ article }) => {
  // Sanitize the HTML content to prevent XSS attacks
  const sanitizedContent = DOMPurify.sanitize(article.content, {
    ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'strong', 'em', 'a', 'code', 'pre', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
  });

  return (
    <>
      {article.image && (
        <div className="mb-8 rounded-lg overflow-hidden shadow-md">
          <img 
            src={article.image} 
            alt={article.title}
            className="w-full h-auto object-cover" 
          />
        </div>
      )}
      
      <div 
        className="prose prose-slate dark:prose-invert prose-lg max-w-none mb-12 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    </>
  );
};

export default ArticleContent;
