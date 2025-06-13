import { Link } from 'react-router-dom';
import { NewsArticle } from '@/features/news/components/NewsList/types';
import { formatDate } from '@/features/news/components/NewsList/utils';

interface ArticleCardProps {
  article: NewsArticle;
}

const ArticleCard = ({ article }: ArticleCardProps) => {
  return (
    <article className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link to={`/news/${article.slug}`} className="block">
        {article.image && (
          <div className="aspect-video overflow-hidden">
            <img 
              src={article.image} 
              alt={article.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        
        <div className="p-6">
          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {article.tags.slice(0, 3).map(tag => (
                <span 
                  key={tag}
                  className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 
                           text-blue-800 dark:text-blue-200 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {/* Title */}
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2 
                         hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {article.title}
          </h2>
          
          {/* Excerpt */}
          <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
            {article.excerpt}
          </p>
          
          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center">
              {article.author?.image && (
                <img 
                  src={article.author.image} 
                  alt={article.author.name}
                  className="w-8 h-8 rounded-full mr-2 object-cover"
                />
              )}
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {article.author?.name || 'Anonymous'}
              </span>
            </div>
            <time className="text-sm text-slate-500 dark:text-slate-400">
              {formatDate(article.publishedAt)}
            </time>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default ArticleCard;
