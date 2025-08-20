import { Link } from 'react-router-dom';
import { NewsArticle } from '@/features/news/components/NewsArticlesList/types';
import { formatDate, truncateExcerpt } from '@/features/news/components/NewsArticlesList/utils';
import { getNewsArticleUrl } from '@/utils/contentUrlUtils';

interface FeaturedArticleCardProps {
  article: NewsArticle;
}

const FeaturedArticleCard = ({ article }: FeaturedArticleCardProps) => {
  // For featured articles, show the actual article content instead of just the excerpt
  // Get the first few paragraphs of the article content
  const paragraphs = article.content.split('\n\n');
  const firstParagraphs = paragraphs.slice(0, 3).join('\n\n');
  const displayContent = truncateExcerpt(firstParagraphs, 1000);

  return (
    <Link
      to={getNewsArticleUrl(article)}
      className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex h-full group w-full"
    >
      {/* Left side image (40% width) */}
      <div className="w-2/5 overflow-hidden relative">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 text-xs font-medium rounded">
          Featured
        </span>
      </div>
      
      {/* Right side content (60% width) */}
      <div className="p-6 w-3/5 flex flex-col">
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
        
        <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3 group-hover:text-orange-500 transition-colors">
          {article.title}
        </h3>
        
        <div className="text-slate-600 dark:text-slate-300 mb-4 flex-1 text-base leading-relaxed">
          {displayContent.split('\n\n').map((paragraph, index) => (
            <p key={index} className="mb-4">{paragraph}</p>
          ))}
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center">
            <img
              src={article.author.image}
              alt={article.author.name}
              className="w-10 h-10 rounded-full mr-3 object-cover"
            />
            <div>
              <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {article.author.name}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Contributor
              </div>
            </div>
          </div>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {formatDate(article.date)}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default FeaturedArticleCard;
