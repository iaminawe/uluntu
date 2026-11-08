import { Helmet } from 'react-helmet-async';
import SignInForm from '@/features/auth/components/SignInForm';

export default function SignInPage() {
  return (
    <>
      <Helmet>
        <title>Sign In - Uluntu</title>
        <meta name="description" content="Sign in to your Uluntu account" />
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-900">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Uluntu</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Sign in to your account</p>
          </div>
          
          <SignInForm />
        </div>
      </div>
    </>
  );
}