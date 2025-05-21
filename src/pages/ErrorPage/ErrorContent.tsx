import { ErrorContentProps } from './types';

const ErrorContent: React.FC<ErrorContentProps> = ({ errorMessage }) => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Oops!</h1>
      <p className="text-xl mb-8 text-slate-800 dark:text-slate-200">
        Sorry, an unexpected error has occurred.
      </p>
      <p className="text-slate-600 dark:text-slate-400 mb-8">
        {errorMessage}
      </p>
      <a
        href="/"
        className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
      >
        Go back to homepage
      </a>
    </div>
  );
};

export default ErrorContent;
