import { LoadingStateProps } from './types';
import {
  SkeletonContainer,
  SkeletonText,
  SkeletonImage,
  SkeletonCard
} from '../../components/ui/Skeleton';
import { ContentContainer } from '../../components/ui/PageLayout';
import { Card } from '../../components/ui/Card';

const LoadingState: React.FC<LoadingStateProps> = () => {
  return (
    <ContentContainer>
      <SkeletonContainer>
        {/* Header with back navigation and title */}
        <div className="mb-6">
          <SkeletonText width="w-1/4" className="mb-2" />
          <SkeletonText height="h-8" width="w-2/3" className="mb-8" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Main listing image */}
            <Card className="mb-6 overflow-hidden">
              <SkeletonImage height="h-80" className="w-full" />
            </Card>
            
            {/* Title and price */}
            <Card className="p-6 mb-6">
              <SkeletonText height="h-6" width="w-1/2" className="mb-4" />
              <SkeletonText lines={3} className="mb-4" />
              <SkeletonText height="h-8" width="w-1/3" className="mt-6" />
            </Card>
            
            {/* Seller info */}
            <Card className="p-6 mb-6">
              <div className="flex items-center mb-4">
                <SkeletonImage className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <SkeletonText width="w-32" className="mb-1" />
                  <SkeletonText width="w-24" height="h-3" />
                </div>
              </div>
              <SkeletonText width="w-full" className="mt-4" />
            </Card>
          </div>
          
          {/* Sidebar */}
          <div>
            <Card className="p-6 mb-6">
              <SkeletonText height="h-6" width="w-2/3" className="mb-4" />
              <SkeletonText lines={2} className="mb-4" />
              <SkeletonText height="h-10" width="w-full" className="mt-4" />
            </Card>
            
            <Card className="p-6">
              <SkeletonText height="h-6" width="w-1/2" className="mb-4" />
              <SkeletonCard hasImage={true} hasFooter={false} className="mb-4" />
              <SkeletonCard hasImage={true} hasFooter={false} />
            </Card>
          </div>
        </div>
      </SkeletonContainer>
    </ContentContainer>
  );
};

export default LoadingState;
