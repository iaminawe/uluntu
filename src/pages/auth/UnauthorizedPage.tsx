import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <>
      <Helmet>
        <title>Unauthorized - Uluntu</title>
        <meta name="description" content="You don't have permission to access this page" />
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <ShieldAlert className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md">
            You don't have permission to access this page. Please contact an administrator if you believe this is an error.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium 
                     text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 
                     focus:ring-orange-500"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </>
  );
}