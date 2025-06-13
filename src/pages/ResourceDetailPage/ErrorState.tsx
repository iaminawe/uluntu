import { ErrorStateProps } from './types';
import { NotFoundError } from '@/shared/components/ui/ErrorDisplay';

const ErrorState: React.FC<ErrorStateProps> = () => {
  return (
    <NotFoundError
      resourceType="resource"
      message="We couldn't find the resource you're looking for."
      backLink={{
        to: '/resources',
        text: 'Back to Resources'
      }}
    />
  );
};

export default ErrorState;
