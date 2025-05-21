import { LoadingStateProps } from './types';
import {
  SkeletonContainer,
  SkeletonText,
  SkeletonCard
} from '../../components/ui/Skeleton';
import { ContentContainer } from '../../components/ui/PageLayout';

const LoadingState: React.FC<LoadingStateProps> = () => {
  return (
    <ContentContainer>
      <SkeletonContainer>
        {/* Header section */}
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 w-40 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Placeholder */}
              <div className="lg:col-span-2">
                {/* Resource title and type */}
                <SkeletonText height="h-8" width="w-3/4" className="mb-4" />
                <SkeletonText height="h-4" width="w-1/2" className="mb-8" />
                
                {/* Resource description */}
                <SkeletonText lines={4} varyWidth className="mb-6" />
                
                {/* Related resources */}
                <div className="mt-8">
                  <SkeletonText height="h-6" width="w-1/3" className="mb-4" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SkeletonCard hasImage={false} lines={2} />
                    <SkeletonCard hasImage={false} lines={2} />
                  </div>
                </div>
              </div>
              
              {/* Sidebar Placeholder */}
              <div>
                <SkeletonCard hasImage={false} hasFooter={false} className="mb-6" />
                <SkeletonText height="h-12" className="mt-4" />
              </div>
            </div>
          </div>
        </div>
      </SkeletonContainer>
    </ContentContainer>
  );
};

export default LoadingState;
