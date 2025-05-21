import { LoadingStateProps } from './types';

const LoadingState: React.FC<LoadingStateProps> = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="flex justify-between items-center mb-8">
            <div className="h-8 w-40 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Placeholder */}
                <div className="lg:col-span-2">
                  <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-8"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-3 w-full"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-3 w-full"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-3 w-5/6"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-3 w-4/6"></div>
                </div>
                
                {/* Sidebar Placeholder */}
                <div>
                  <div className="bg-slate-200 dark:bg-slate-700 rounded-lg h-64 mb-6"></div>
                  <div className="bg-slate-200 dark:bg-slate-700 rounded-lg h-12"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
