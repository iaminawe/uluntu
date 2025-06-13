import { FormSkeleton } from '@/shared/components/ui/Skeleton';

export interface LoadingStateProps {
  /**
   * Optional additional class names
   */
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ className = '' }) => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 ${className}`}>
          <FormSkeleton 
            fields={6}
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
