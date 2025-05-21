import { Link } from 'react-router-dom';
import { NewsArticle } from './types';
import { formatDate } from './utils';

interface ArticleCardProps {
  article: NewsArticle;
}

const ArticleCard = ({ article }: ArticleCardProps) => {
  return (
    <Link
      to={`/news/${article.id}`}
      className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full"
    >
      <div className="h-48 overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex flex-wrap gap-2 mb-3">
          {article.tags.map(tag => (
            <span
              key={tag}
              className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          {article.title}
        </h3>
        <p className="text-slate-600 dark:text-slate-300 mb-4 flex-1">
          {article.excerpt}
        </p>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center">
            <img
              src={article.author.image}
              alt={article.author.name}
              className="w-8 h-8 rounded-full mr-2 object-cover"
            />
            <span className="text-sm text-slate-600 dark:text-slate-300">
              By {article.author.name}
            </span>
          </div>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {formatDate(article.publishedAt)}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;
