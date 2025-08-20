import { Link } from 'react-router-dom';
import { Edit, Share, Clock } from 'lucide-react';
import { NewsArticle } from './types';
import { getAssociationIcon } from './utils';
import { getMemberProfileUrl } from '@/utils/memberSlugUtils';

interface ArticleHeaderProps {
  article: NewsArticle;
  onShare: () => void;
  isEditable?: boolean;
}

const ArticleHeader = ({ article, onShare, isEditable = false }: ArticleHeaderProps) => {
  const formattedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="mb-8">
      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
        {article.title}
      </h1>

      {/* Author and meta information */}
      <div className="flex flex-col sm:flex-row sm:items-center mb-4 space-y-3 sm:space-y-0">
        <div className="flex items-center mr-6">
          <img
            src={article.author.image}
            alt={article.author.name}
            className="w-10 h-10 rounded-full object-cover mr-3"
          />
          <div>
            <Link 
              to={getMemberProfileUrl(article.author)}
              className="font-medium text-slate-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400"
            >
              {article.author.name}
            </Link>
            {article.author.title && (
              <p className="text-sm text-slate-500 dark:text-slate-400">{article.author.title}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center text-slate-500 dark:text-slate-400 ml-0 sm:ml-auto">
          <Clock className="h-4 w-4 mr-1" />
          <span className="text-sm">{formattedDate}</span>
        </div>
      </div>

      {/* Tags and actions */}
      <div className="flex flex-wrap items-center justify-between">
        <div className="flex flex-wrap gap-2 mb-3 sm:mb-0">
          {article.tags?.map((tag) => (
            <Link
              key={tag}
              to={`/news?tag=${tag}`}
              className="inline-block px-3 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 
                      text-slate-700 dark:text-slate-300 rounded-full hover:bg-orange-100 
                      dark:hover:bg-orange-900 transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>

        <div className="flex space-x-2">
          <button
            onClick={onShare}
            className="flex items-center px-3 py-1 text-sm text-slate-600 dark:text-slate-300 
                     bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 
                     dark:hover:bg-slate-600 transition-colors"
          >
            <Share className="h-4 w-4 mr-1" />
            Share
          </button>
          
          {isEditable && (
            <Link
              to={`/news/${article.id}/edit`}
              className="flex items-center px-3 py-1 text-sm text-slate-600 dark:text-slate-300 
                       bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 
                       dark:hover:bg-slate-600 transition-colors"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Link>
          )}
        </div>
      </div>

      {/* Associations */}
      {article.associations && article.associations.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Related to:</p>
          <div className="flex flex-wrap gap-3">
            {article.associations.map((association) => (
              <Link
                key={`${association.type}-${association.id}`}
                to={`/${association.type}s/${association.id}`}
                className="flex items-center px-3 py-1 text-sm bg-slate-100 dark:bg-slate-700 
                        text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-200 
                        dark:hover:bg-slate-600 transition-colors"
              >
                {getAssociationIcon(association.type)}
                {association.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleHeader;
