import { AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

interface ErrorStateProps {
  message?: string;
}

export default function ErrorState({ message = 'An error occurred' }: ErrorStateProps) {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 text-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Something went wrong
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {message}
        </p>
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/marketplace')}
          >
            Back to Marketplace
          </Button>
          <Button
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
