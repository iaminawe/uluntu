import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ErrorContent from './ErrorContent';

export default function ErrorPage() {
  const error = useRouteError();
  
  let errorMessage: string;
  
  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data?.message || 'Unknown error';
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    errorMessage = 'Unknown error occurred';
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4">
      <Helmet>
        <title>Error - Kootenay Tech Community</title>
      </Helmet>
      <ErrorContent errorMessage={errorMessage} />
    </div>
  );
}
