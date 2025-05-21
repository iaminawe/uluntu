import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Edit, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { ArticleHeaderProps } from './types';

const ArticleHeader: React.FC<ArticleHeaderProps> = ({ article, id }) => {
  return (
    <div className="mb-6">
      <Link 
        to="/news" 
        className="inline-flex items-center text-orange-500 hover:text-orange-600 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to News
      </Link>
      
      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
        {article.title}
      </h1>
      
      <div className="flex flex-wrap items-center text-sm text-slate-600 dark:text-slate-400 mb-6 gap-4">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          {format(new Date(article.date), 'MMMM d, yyyy')}
        </div>
        
        <div className="flex items-center">
          <img 
            src={article.author.image} 
            alt={article.author.name}
            className="h-6 w-6 rounded-full mr-2" 
          />
          By {article.author.name}
        </div>
        
        <Link 
          to={`/news/${id}/edit`}
          className="inline-flex items-center text-orange-500 hover:text-orange-600 ml-auto"
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit Article
        </Link>
      </div>
      
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {article.tags.map(tag => (
            <Link 
              key={tag} 
              to={`/news?tag=${tag}`}
              className="inline-flex items-center px-3 py-1 bg-slate-100 dark:bg-slate-700 
                        text-slate-700 dark:text-slate-300 rounded-full text-sm"
            >
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArticleHeader;
