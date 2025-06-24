// Temporary ErrorDisplay component for marketplace
interface ErrorDisplayProps {
  error: Error | string;
  retry?: () => void;
}

export const ErrorDisplay = ({ error, retry }: ErrorDisplayProps) => {
  const message = typeof error === 'string' ? error : error.message;
  
  return (
    <div className="text-center py-8">
      <p className="text-red-600 mb-4">{message}</p>
      {retry && (
        <button 
          onClick={retry}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      )}
    </div>
  );
};