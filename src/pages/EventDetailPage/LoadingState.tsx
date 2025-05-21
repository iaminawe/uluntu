import { LoadingStateProps } from './types';

const LoadingState: React.FC<LoadingStateProps> = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl mb-8"></div>
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-8"></div>
          <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
