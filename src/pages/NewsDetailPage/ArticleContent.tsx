import { ArticleContentProps } from './types';

const ArticleContent: React.FC<ArticleContentProps> = ({ article }) => {
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
      
      <div className="prose prose-slate dark:prose-invert max-w-none mb-12">
        {article.content.split('\n\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </>
  );
};

export default ArticleContent;
