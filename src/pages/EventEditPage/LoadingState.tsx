import { LoadingStateProps } from './types';

const LoadingState: React.FC<LoadingStateProps> = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded mb-6"></div>
            
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded mb-6"></div>
            
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded mb-6"></div>
            
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-2"></div>
            <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded mb-6"></div>
            
            <div className="flex justify-end">
              <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
