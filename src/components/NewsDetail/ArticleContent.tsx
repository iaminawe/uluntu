import { NewsArticle } from '@/features/news/components/NewsDetail/types';

interface ArticleContentProps {
  article: NewsArticle;
}

const ArticleContent = ({ article }: ArticleContentProps) => {
  // Function to render paragraphs from content
  const renderContent = () => {
    return article.content.split('\n\n').map((paragraph, index) => {
      // Handle bullet points
      if (paragraph.startsWith('- ')) {
        const items = paragraph.split('\n- ').map(item => item.replace('- ', ''));
        return (
          <ul key={index} className="list-disc pl-5 mb-6 text-slate-700 dark:text-slate-300">
            {items.map((item, itemIndex) => (
              <li key={itemIndex} className="mb-1">{item}</li>
            ))}
          </ul>
        );
      }
      
      // Handle regular paragraphs
      return (
        <p key={index} className="mb-6 text-slate-700 dark:text-slate-300 leading-relaxed">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <div className="article-content max-w-3xl mx-auto">
      {/* Featured image */}
      {article.image && (
        <div className="mb-8">
          <img 
            src={article.image}
            alt={article.title}
            className="w-full h-auto rounded-lg object-cover max-h-[500px]"
          />
        </div>
      )}
      
      {/* Article content */}
      <div className="prose lg:prose-lg prose-orange dark:prose-invert max-w-none">
        {renderContent()}
      </div>
    </div>
  );
};

export default ArticleContent;
