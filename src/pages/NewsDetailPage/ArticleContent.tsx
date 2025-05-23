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
      
      <div className="prose prose-slate dark:prose-invert prose-lg max-w-none mb-12 leading-relaxed">
        {article.content.split('\n\n').map((paragraph, index) => (
          <p key={index} className="mb-6">{paragraph}</p>
        ))}
      </div>
    </>
  );
};

export default ArticleContent;
