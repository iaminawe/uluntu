import { ErrorStateProps } from './types';
import { ContentContainer } from '@/shared/components/ui/PageLayout';
import { NotFoundError } from '@/shared/components/ui/ErrorDisplay';

const ErrorState: React.FC<ErrorStateProps> = () => {
  return (
    <ContentContainer>
      <NotFoundError
        resourceType="Event"
        message="We couldn't find the event you're looking for."
        backLink={{
          to: "/events",
          text: "Back to Events"
        }}
      />
    </ContentContainer>
  );
};

export default ErrorState;
