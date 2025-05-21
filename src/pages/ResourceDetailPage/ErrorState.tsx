import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ErrorStateProps } from './types';

const ErrorState: React.FC<ErrorStateProps> = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Resource Not Found</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          We couldn't find the resource you're looking for.
        </p>
        <Link 
          to="/resources" 
          className="inline-flex items-center text-orange-500 hover:text-orange-600"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Resources
        </Link>
      </div>
    </div>
  );
};

export default ErrorState;
