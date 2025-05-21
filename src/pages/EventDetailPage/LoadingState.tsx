import { LoadingStateProps } from './types';
import { ContentContainer } from '../../components/ui/PageLayout';
import { SkeletonContainer, SkeletonImage, SkeletonText } from '../../components/ui/Skeleton';
import { Card } from '../../components/ui/Card';

const LoadingState: React.FC<LoadingStateProps> = () => {
  return (
    <ContentContainer>
      <SkeletonContainer>
        {/* Back link */}
        <div className="mb-4">
          <SkeletonText width="w-24" height="h-4" />
        </div>
        
        <Card className="overflow-hidden">
          {/* Event hero image */}
          <SkeletonImage height="h-64" className="rounded-t-lg" />
          
          {/* Event title and date */}
          <div className="p-8">
            <SkeletonText width="w-3/4" height="h-8" className="mb-2" />
            <SkeletonText width="w-1/2" height="h-4" className="mb-8" />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main content */}
              <div className="lg:col-span-2">
                <SkeletonText lines={10} className="mb-2" />
              </div>
              
              {/* Sidebar */}
              <div>
                <div className="mb-6">
                  <SkeletonText height="h-10" className="mb-3" />
                  <SkeletonText lines={3} className="mb-2" />
                </div>
                
                <div>
                  <SkeletonText lines={4} className="mb-2" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </SkeletonContainer>
    </ContentContainer>
  );
};

export default LoadingState;
