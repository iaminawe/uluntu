import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { RelatedArticlesProps } from './types';

const RelatedArticles: React.FC<RelatedArticlesProps> = ({ relatedArticles, isLoading }) => {
  if (isLoading) {
    return (
      <div className="border-t border-slate-200 dark:border-slate-700 pt-8 mt-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Related Articles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse flex items-start gap-4 p-4">
              <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="flex-1">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (relatedArticles.length === 0) {
    return null;
  }
  
  return (
    <div className="border-t border-slate-200 dark:border-slate-700 pt-8 mt-8">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        Related Articles
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {relatedArticles.map(relatedArticle => (
          <Link 
            key={relatedArticle.id} 
            to={`/news/${relatedArticle.id}`}
            className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg 
                      hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            {relatedArticle.image && (
              <img 
                src={relatedArticle.image} 
                alt={relatedArticle.title}
                className="w-16 h-16 object-cover rounded" 
              />
            )}
            <div>
              <h3 className="font-medium text-slate-900 dark:text-white mb-1">
                {relatedArticle.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {format(new Date(relatedArticle.date), 'MMM d, yyyy')}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedArticles;
