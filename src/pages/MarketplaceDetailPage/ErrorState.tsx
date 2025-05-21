import { ErrorStateProps } from './types';
import { NotFoundError } from '../../components/ui/ErrorDisplay';

const ErrorState: React.FC<ErrorStateProps> = () => {
  return (
    <NotFoundError
      resourceType="marketplace listing"
      message="We couldn't find the marketplace listing you're looking for."
      backLink={{
        to: '/marketplace',
        text: 'Back to Marketplace'
      }}
    />
  );
};

export default ErrorState;
