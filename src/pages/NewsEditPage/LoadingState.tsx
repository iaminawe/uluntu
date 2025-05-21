import { FormSkeleton } from '../../components/ui/Skeleton';
import { LoadingStateProps } from './types';

const LoadingState: React.FC<LoadingStateProps> = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <FormSkeleton 
            fields={5}
            hasHeader={true}
            hasSubmitButton={true}
            hasCancelButton={true}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
