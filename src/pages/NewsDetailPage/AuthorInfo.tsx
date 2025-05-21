import { AuthorInfoProps } from './types';

const AuthorInfo: React.FC<AuthorInfoProps> = ({ author }) => {
  return (
    <div className="border-t border-slate-200 dark:border-slate-700 pt-8 mt-8">
      <div className="flex items-center mb-6">
        <img 
          src={author.image} 
          alt={author.name}
          className="h-12 w-12 rounded-full mr-4" 
        />
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {author.name}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Author
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthorInfo;
