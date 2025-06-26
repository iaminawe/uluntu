import { Link } from 'react-router-dom';
import { NewsArticle } from '@/features/news/components/NewsArticlesList/types';
import { formatDate, truncateExcerpt } from '@/features/news/components/NewsArticlesList/utils';
import { LikeButton } from '@/components/interactions';
import { MessageCircle } from 'lucide-react';

interface ArticleCardProps {
  article: NewsArticle;
}

const ArticleCard = ({ article }: ArticleCardProps) => {
  return (
    <Link
      to={`/news/${article.id}`}
      className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full group"
    >
      <div className="h-48 overflow-hidden relative">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {article.featured && (
          <span className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 text-xs font-medium rounded">
            Featured
          </span>
        )}
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex flex-wrap gap-2 mb-3">
          {article.tags?.map((tag: string) => (
            <span
              key={tag}
              className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-orange-500 transition-colors">
          {article.title}
        </h3>
        <p className="text-slate-600 dark:text-slate-300 mb-4 flex-1">
          {truncateExcerpt(article.excerpt)}
        </p>
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <img
                src={article.author.image}
                alt={article.author.name}
                className="w-8 h-8 rounded-full mr-2 object-cover"
              />
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {article.author.name}
              </span>
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {formatDate(article.date)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4" onClick={(e) => e.preventDefault()}>
              <LikeButton
                entityType="news"
                entityId={article.id}
                initialLikeCount={article.like_count || 0}
                size="sm"
              />
              <button className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                <MessageCircle className="h-4 w-4" />
                <span>{article.comment_count || 0}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;
